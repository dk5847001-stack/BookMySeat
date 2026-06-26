import crypto from 'node:crypto';
import { env } from '../config/env.js';
import { bookingRepository } from '../repositories/booking.repository.js';
import { eventRepository } from '../repositories/event.repository.js';
import { orderRepository } from '../repositories/order.repository.js';
import { seatRepository } from '../repositories/seat.repository.js';
import { AppError } from '../utils/AppError.js';
import { bookingService } from './booking.service.js';
import { notificationService } from './notification.service.js';

const createCode = (prefix) => `${prefix}-${crypto.randomBytes(6).toString('hex').toUpperCase()}`;

const signPayment = (orderId, paymentId) =>
  crypto.createHmac('sha256', env.payment.secret).update(`${orderId}|${paymentId}`).digest('hex');

class PaymentService {
  async createOrder({ eventId, seats }, user) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    const uniqueSeats = [...new Set(seats)];
    const lockedSeats = await seatRepository.findUserLocked(eventId, uniqueSeats, user.id);
    if (lockedSeats.length !== uniqueSeats.length) {
      throw new AppError('Lock seats before creating a payment order', 409);
    }

    const orderId = createCode('ORD');
    const paymentId = createCode('PAY');
    const signature = signPayment(orderId, paymentId);
    const order = await orderRepository.create({
      orderId,
      paymentId,
      userId: user.id,
      eventId,
      seats: uniqueSeats,
      amount: event.price * uniqueSeats.length,
      provider: env.payment.provider,
      status: 'created'
    });

    return {
      orderId: order.orderId,
      paymentId,
      signature,
      amount: order.amount,
      currency: order.currency,
      provider: order.provider,
      status: order.status
    };
  }

  async verifyPayment({ orderId, paymentId, signature }, user) {
    const order = await orderRepository.findByOrderId(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.userId.id !== user.id) throw new AppError('You can verify only your own order', 403);
    if (order.status === 'paid') throw new AppError('Order is already paid', 409);
    if (order.status === 'refunded') throw new AppError('Refunded order cannot be verified', 409);
    if (order.paymentId !== paymentId || signPayment(orderId, paymentId) !== signature) {
      order.status = 'failed';
      await order.save({ validateBeforeSave: false });
      throw new AppError('Payment verification failed', 400);
    }

    const booking = await bookingService.create({ eventId: order.eventId.id, seats: order.seats }, user, {
      orderId: order.orderId,
      paymentId
    });

    order.status = 'paid';
    order.bookingId = booking.bookingId;
    await order.save({ validateBeforeSave: false });

    return { order, booking };
  }

  async listMine(user) {
    return orderRepository.findUserOrders(user.id);
  }

  async refund(orderId) {
    const order = await orderRepository.findByOrderId(orderId);
    if (!order) throw new AppError('Order not found', 404);
    if (order.status !== 'paid') throw new AppError('Only paid orders can be refunded', 409);

    const booking = await bookingRepository.findByBookingId(order.bookingId);
    if (booking && booking.bookingStatus !== 'cancelled') {
      booking.bookingStatus = 'cancelled';
      booking.paymentStatus = 'refunded';
      booking.tickets.forEach((ticket) => {
        ticket.validationStatus = 'cancelled';
      });
      await booking.save({ validateBeforeSave: false });
      await notificationService.sendCancellation(booking);
    }

    await seatRepository.model.updateMany(
      { event: order.eventId.id, label: { $in: order.seats }, status: 'booked' },
      {
        $set: { status: 'available' },
        $unset: { bookedBy: '', bookedAt: '' }
      }
    );

    const event = await eventRepository.findById(order.eventId.id);
    if (event) {
      event.availableSeats = Math.min(event.availableSeats + order.seats.length, event.totalSeats);
      event.bookingsCount = Math.max(event.bookingsCount - order.seats.length, 0);
      await event.save({ validateBeforeSave: false });
    }

    order.status = 'refunded';
    order.refundId = createCode('RFND');
    order.refundedAt = new Date();
    await order.save({ validateBeforeSave: false });

    return {
      orderId: order.orderId,
      refundId: order.refundId,
      status: order.status
    };
  }
}

export const paymentService = new PaymentService();
