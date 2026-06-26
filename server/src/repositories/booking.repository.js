import { Booking } from '../models/booking.model.js';
import { BaseRepository } from './base.repository.js';

class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }

  findByBookingId(bookingId) {
    return this.model.findOne({ bookingId }).populate('eventId').populate('userId', 'name email');
  }

  findByTicketCode(ticketCode) {
    return this.model.findOne({ 'tickets.ticketCode': ticketCode }).populate('eventId').populate('userId', 'name email');
  }

  findUserBookings(userId) {
    return this.model.find({ userId }).populate('eventId').sort({ createdAt: -1 }).lean();
  }
}

export const bookingRepository = new BookingRepository();
