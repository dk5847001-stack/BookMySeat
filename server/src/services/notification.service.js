import { bookingRepository } from '../repositories/booking.repository.js';
import { notificationRepository } from '../repositories/notification.repository.js';
import { emitToAdmins, emitToUser } from '../socket/index.js';
import { mailService } from './mail.service.js';

class NotificationService {
  async createInApp({ userId, title, message, type = 'system', channel = 'in-app', metadata = {} }) {
    const notification = await notificationRepository.create({ userId, title, message, type, channel, metadata });
    try {
      emitToUser(userId, 'notification:new', notification);
    } catch {
      // Socket.io may not be initialized in isolated scripts.
    }
    return notification;
  }

  async listForUser(user, limit) {
    const [items, unread] = await Promise.all([
      notificationRepository.findForUser(user.id, limit),
      notificationRepository.unreadCount(user.id)
    ]);

    return { items, unread };
  }

  async markAllRead(user) {
    await notificationRepository.markAllRead(user.id);
    try {
      emitToUser(user.id, 'notification:read-all', { userId: user.id });
    } catch {
      // Socket.io may not be initialized in isolated scripts.
    }
    return { message: 'Notifications marked as read' };
  }

  async sendBookingConfirmation(booking) {
    const populated = await bookingRepository.findByBookingId(booking.bookingId);
    if (!populated) return;

    await this.createInApp({
      userId: populated.userId.id,
      title: 'Booking confirmed',
      message: `${populated.eventId.title} is confirmed for seats ${populated.seats.join(', ')}.`,
      type: 'booking',
      channel: 'both',
      metadata: { bookingId: populated.bookingId, eventId: populated.eventId.id }
    });

    await mailService.sendBookingConfirmation({
      user: populated.userId,
      booking: populated,
      event: populated.eventId
    });

    try {
      emitToUser(populated.userId.id, 'booking:confirmed', {
        bookingId: populated.bookingId,
        eventId: populated.eventId.id,
        eventTitle: populated.eventId.title,
        seats: populated.seats,
        totalAmount: populated.totalAmount
      });
      emitToAdmins('admin:booking', {
        bookingId: populated.bookingId,
        eventId: populated.eventId.id,
        eventTitle: populated.eventId.title,
        user: populated.userId.name,
        seats: populated.seats,
        totalAmount: populated.totalAmount,
        createdAt: populated.createdAt
      });
    } catch {
      // Socket.io may not be initialized in isolated scripts.
    }
  }

  async sendCancellation(booking) {
    const populated = typeof booking.populate === 'function'
      ? await booking.populate('eventId').then((doc) => doc.populate('userId', 'name email'))
      : await bookingRepository.findByBookingId(booking.bookingId);
    if (!populated) return;

    await this.createInApp({
      userId: populated.userId.id,
      title: 'Booking cancelled',
      message: `${populated.eventId.title} booking ${populated.bookingId} has been cancelled.`,
      type: 'cancellation',
      channel: 'both',
      metadata: { bookingId: populated.bookingId, eventId: populated.eventId.id }
    });

    await mailService.sendCancellationEmail({
      user: populated.userId,
      booking: populated,
      event: populated.eventId
    });

    try {
      emitToUser(populated.userId.id, 'booking:cancelled', {
        bookingId: populated.bookingId,
        eventId: populated.eventId.id,
        eventTitle: populated.eventId.title
      });
      emitToAdmins('admin:refund', {
        bookingId: populated.bookingId,
        eventId: populated.eventId.id,
        eventTitle: populated.eventId.title,
        user: populated.userId.name,
        seats: populated.seats,
        cancelledAt: new Date()
      });
    } catch {
      // Socket.io may not be initialized in isolated scripts.
    }
  }

  async sendDueReminders() {
    const now = new Date();
    const soon = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const bookings = await bookingRepository.model
      .find({ bookingStatus: 'confirmed', reminderSentAt: null })
      .populate({
        path: 'eventId',
        match: { date: { $gte: now, $lte: soon } }
      })
      .populate('userId', 'name email');

    const due = bookings.filter((booking) => booking.eventId);

    await Promise.all(due.map(async (booking) => {
      await this.createInApp({
        userId: booking.userId.id,
        title: 'Event reminder',
        message: `${booking.eventId.title} starts within 24 hours. Seats: ${booking.seats.join(', ')}.`,
        type: 'reminder',
        channel: 'both',
        metadata: { bookingId: booking.bookingId, eventId: booking.eventId.id }
      });
      await mailService.sendEventReminder({ user: booking.userId, booking, event: booking.eventId });
      booking.reminderSentAt = new Date();
      await booking.save({ validateBeforeSave: false });
    }));

    return { sent: due.length };
  }
}

export const notificationService = new NotificationService();

export const startNotificationReminderSweeper = () => {
  setInterval(() => {
    notificationService.sendDueReminders().catch(() => {});
  }, 60 * 60 * 1000);
};
