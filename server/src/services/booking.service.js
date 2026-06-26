import crypto from 'node:crypto';
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { bookingRepository } from '../repositories/booking.repository.js';
import { eventRepository } from '../repositories/event.repository.js';
import { seatService } from './seat.service.js';
import { notificationService } from './notification.service.js';
import { AppError } from '../utils/AppError.js';

const createCode = (prefix) => `${prefix}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

class BookingService {
  async create({ eventId, seats }, user, payment = {}) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    const uniqueSeats = [...new Set(seats)];
    const bookingId = createCode('BMS');
    const bookingPayload = `${bookingId}:${eventId}:${uniqueSeats.join(',')}`;
    const qrCode = await QRCode.toDataURL(bookingPayload);
    const tickets = await Promise.all(
      uniqueSeats.map(async (seat) => {
        const ticketCode = createCode(`TKT-${seat}`);
        return {
          seat,
          ticketCode,
          qrCode: await QRCode.toDataURL(ticketCode)
        };
      })
    );

    await seatService.book(eventId, uniqueSeats, user);

    const booking = await bookingRepository.create({
      bookingId,
      userId: user.id,
      eventId,
      seats: uniqueSeats,
      qrCode,
      tickets,
      totalAmount: event.price * uniqueSeats.length,
      orderId: payment.orderId || '',
      paymentId: payment.paymentId || '',
      paymentStatus: payment.paymentId ? 'paid' : 'pending',
      bookingStatus: 'confirmed'
    });

    await notificationService.sendBookingConfirmation(booking);
    return booking;
  }

  async listMine(user) {
    return bookingRepository.findUserBookings(user.id);
  }

  async getByBookingId(bookingId, user) {
    const booking = await bookingRepository.findByBookingId(bookingId);
    if (!booking) throw new AppError('Booking not found', 404);

    if (user.role !== 'admin' && booking.userId.id !== user.id) {
      throw new AppError('You can view only your bookings', 403);
    }

    return booking;
  }

  async validateTicket(ticketCode) {
    const booking = await bookingRepository.findByTicketCode(ticketCode);
    if (!booking || booking.bookingStatus !== 'confirmed') {
      throw new AppError('Ticket is invalid', 404);
    }

    const ticket = booking.tickets.find((item) => item.ticketCode === ticketCode);
    if (!ticket || ticket.validationStatus !== 'valid') {
      throw new AppError('Ticket is not valid for entry', 409);
    }

    ticket.validationStatus = 'used';
    ticket.validatedAt = new Date();
    await booking.save({ validateBeforeSave: false });

    return {
      bookingId: booking.bookingId,
      ticketCode,
      seat: ticket.seat,
      status: ticket.validationStatus,
      event: {
        title: booking.eventId.title,
        date: booking.eventId.date,
        location: booking.eventId.location
      },
      attendee: {
        name: booking.userId.name,
        email: booking.userId.email
      }
    };
  }

  async buildTicketPdf(bookingId, user) {
    const booking = await this.getByBookingId(bookingId, user);
    const event = booking.eventId;

    return new Promise((resolve) => {
      const doc = new PDFDocument({ size: 'A4', margin: 48 });
      const chunks = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      doc.fontSize(24).text('EventX Ultra Ticket', { align: 'center' });
      doc.moveDown();
      doc.fontSize(14).text(`Booking ID: ${booking.bookingId}`);
      doc.text(`Event: ${event.title}`);
      doc.text(`Date: ${new Date(event.date).toLocaleString('en-IN')}`);
      doc.text(`Location: ${event.location}`);
      doc.text(`Seats: ${booking.seats.join(', ')}`);
      doc.text(`Total: INR ${booking.totalAmount}`);
      doc.moveDown();
      doc.fontSize(12).text('Ticket QR codes');

      booking.tickets.forEach((ticket, index) => {
        const qrBase64 = ticket.qrCode.replace(/^data:image\/png;base64,/, '');
        const y = 230 + index * 125;
        if (y > 680) doc.addPage();
        doc.fontSize(11).text(`Seat ${ticket.seat} | ${ticket.ticketCode}`, 48, y);
        doc.image(Buffer.from(qrBase64, 'base64'), 48, y + 18, { width: 90, height: 90 });
      });

      doc.end();
    });
  }
}

export const bookingService = new BookingService();
