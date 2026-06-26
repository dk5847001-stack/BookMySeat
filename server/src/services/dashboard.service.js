import { Booking } from '../models/booking.model.js';
import { Event } from '../models/event.model.js';
import { User } from '../models/user.model.js';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';

const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;

class DashboardService {
  async updateProfile(user, input) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing && existing.id !== user.id) {
      throw new AppError('Email is already used by another account', 409);
    }

    const updated = await userRepository.updateById(user.id, {
      name: input.name,
      email: input.email
    });

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isEmailVerified: updated.isEmailVerified
    };
  }

  async userDashboard(user) {
    const bookings = await Booking.find({ userId: user.id }).populate('eventId').sort({ createdAt: -1 }).lean();
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.paymentStatus === 'paid' ? booking.totalAmount : 0), 0);

    return {
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      stats: {
        bookings: bookings.length,
        totalSpent,
        upcoming: bookings.filter((booking) => booking.eventId?.date && new Date(booking.eventId.date) > new Date()).length
      },
      bookings
    };
  }

  async adminDashboard() {
    const [users, bookings, events, revenueByEvent, revenueByMonth] = await Promise.all([
      User.find().select('-password').sort({ createdAt: -1 }).limit(100).lean(),
      Booking.find().populate('eventId').populate('userId', 'name email role').sort({ createdAt: -1 }).limit(100).lean(),
      Event.find().sort({ createdAt: -1 }).limit(100).lean(),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid', bookingStatus: 'confirmed' } },
        { $group: { _id: '$eventId', revenue: { $sum: '$totalAmount' }, bookings: { $sum: 1 } } },
        { $lookup: { from: 'events', localField: '_id', foreignField: '_id', as: 'event' } },
        { $unwind: '$event' },
        { $project: { eventTitle: '$event.title', revenue: 1, bookings: 1 } },
        { $sort: { revenue: -1 } },
        { $limit: 8 }
      ]),
      Booking.aggregate([
        { $match: { paymentStatus: 'paid' } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$totalAmount' },
            bookings: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.paymentStatus === 'paid' ? booking.totalAmount : 0), 0);

    return {
      stats: {
        users: users.length,
        events: events.length,
        bookings: bookings.length,
        revenue: totalRevenue
      },
      users,
      bookings,
      events,
      analytics: {
        revenueByEvent,
        revenueByMonth
      }
    };
  }

  async exportBookingsCsv(user) {
    const filter = user.role === 'admin' ? {} : { userId: user.id };
    const bookings = await Booking.find(filter).populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 }).lean();
    const rows = [
      ['Booking ID', 'User', 'Email', 'Event', 'Seats', 'Amount', 'Payment', 'Status', 'Created At'],
      ...bookings.map((booking) => [
        booking.bookingId,
        booking.userId?.name,
        booking.userId?.email,
        booking.eventId?.title,
        booking.seats.join(' '),
        booking.totalAmount,
        booking.paymentStatus,
        booking.bookingStatus,
        booking.createdAt
      ])
    ];

    return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  }

  async exportRevenueCsv() {
    const dashboard = await this.adminDashboard();
    const rows = [
      ['Event', 'Bookings', 'Revenue'],
      ...dashboard.analytics.revenueByEvent.map((item) => [item.eventTitle, item.bookings, item.revenue])
    ];

    return rows.map((row) => row.map(escapeCsv).join(',')).join('\n');
  }
}

export const dashboardService = new DashboardService();
