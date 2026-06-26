import { eventRepository } from '../repositories/event.repository.js';
import { seatRepository } from '../repositories/seat.repository.js';
import { emitToEvent } from '../socket/index.js';
import { AppError } from '../utils/AppError.js';

const LOCK_MINUTES = 5;

const buildSeat = (eventId, index) => {
  const rowIndex = Math.floor(index / 12);
  const row = String.fromCharCode(65 + (rowIndex % 26));
  const rowPrefix = rowIndex >= 26 ? `${Math.floor(rowIndex / 26) + 1}` : '';
  const number = (index % 12) + 1;

  return {
    event: eventId,
    row: `${rowPrefix}${row}`,
    number,
    label: `${rowPrefix}${row}${number}`
  };
};

const emitSeatUpdate = (eventId, payload) => {
  try {
    emitToEvent(eventId, 'seats:update', payload);
  } catch {
    // Socket.io may be unavailable during tests or one-off scripts.
  }
};

class SeatService {
  async ensureEventSeats(eventId) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    const existingCount = await seatRepository.countByEvent(eventId);
    if (existingCount >= event.totalSeats) return;

    const seats = [];
    for (let index = existingCount; index < event.totalSeats; index += 1) {
      seats.push(buildSeat(eventId, index));
    }

    if (seats.length) {
      await seatRepository.model.insertMany(seats, { ordered: false });
    }
  }

  async list(eventId) {
    await this.ensureEventSeats(eventId);
    await this.releaseExpired(eventId);
    return seatRepository.findByEvent(eventId);
  }

  async lock(eventId, labels, user) {
    await this.ensureEventSeats(eventId);
    await this.releaseExpired(eventId);

    const requested = [...new Set(labels)];
    const seats = await seatRepository.findLockable(eventId, requested);
    const found = new Set(seats.map((seat) => seat.label));
    const unavailable = requested.filter((label) => !found.has(label));

    if (unavailable.length) {
      throw new AppError('Some seats are no longer available', 409, unavailable);
    }

    const lockExpiresAt = new Date(Date.now() + LOCK_MINUTES * 60 * 1000);
    const result = await seatRepository.model.updateMany(
      { event: eventId, label: { $in: requested }, status: 'available' },
      {
        $set: {
          status: 'locked',
          lockedBy: user.id,
          lockExpiresAt
        }
      }
    );

    if (result.modifiedCount !== requested.length) {
      await this.release(eventId, requested, user);
      throw new AppError('Some seats were claimed before your lock completed', 409);
    }

    const updated = await seatRepository.findByEvent(eventId);
    emitSeatUpdate(eventId, { eventId, seats: updated, lockExpiresAt });

    return {
      lockExpiresAt,
      seats: requested
    };
  }

  async release(eventId, labels, user) {
    const requested = [...new Set(labels)];
    await seatRepository.model.updateMany(
      {
        event: eventId,
        label: { $in: requested },
        status: 'locked',
        lockedBy: user.id
      },
      {
        $set: { status: 'available' },
        $unset: { lockedBy: '', lockExpiresAt: '' }
      }
    );

    const updated = await seatRepository.findByEvent(eventId);
    emitSeatUpdate(eventId, { eventId, seats: updated });

    return { message: 'Seats released successfully' };
  }

  async book(eventId, labels, user) {
    const event = await eventRepository.findById(eventId);
    if (!event) throw new AppError('Event not found', 404);

    const requested = [...new Set(labels)];
    const locked = await seatRepository.findUserLocked(eventId, requested, user.id);

    if (locked.length !== requested.length) {
      throw new AppError('Only seats locked by you can be booked', 409);
    }

    await seatRepository.model.updateMany(
      { event: eventId, label: { $in: requested }, status: 'locked', lockedBy: user.id },
      {
        $set: {
          status: 'booked',
          bookedBy: user.id,
          bookedAt: new Date()
        },
        $unset: { lockedBy: '', lockExpiresAt: '' }
      }
    );

    event.availableSeats = Math.max(event.availableSeats - requested.length, 0);
    event.bookingsCount += requested.length;
    await event.save({ validateBeforeSave: false });

    const updated = await seatRepository.findByEvent(eventId);
    emitSeatUpdate(eventId, { eventId, seats: updated });

    return {
      message: 'Seats booked successfully',
      seats: requested
    };
  }

  async releaseExpired(eventId = null) {
    const now = new Date();
    const eventIds = eventId ? [eventId] : await seatRepository.expiredEventIds(now);
    const result = await seatRepository.releaseExpired(now, eventId);
    if (eventId && result.modifiedCount > 0) {
      const seats = await seatRepository.findByEvent(eventId);
      emitSeatUpdate(eventId, { eventId, seats });
    } else if (!eventId && result.modifiedCount > 0) {
      await Promise.all(
        eventIds.map(async (id) => {
          const seats = await seatRepository.findByEvent(id);
          emitSeatUpdate(id.toString(), { eventId: id.toString(), seats });
        })
      );
    }
    return result;
  }
}

export const seatService = new SeatService();

export const startSeatLockSweeper = () => {
  setInterval(() => {
    seatService.releaseExpired().catch(() => {});
  }, 30 * 1000);
};
