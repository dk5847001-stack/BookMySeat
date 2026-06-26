import { Seat } from '../models/seat.model.js';
import { BaseRepository } from './base.repository.js';

class SeatRepository extends BaseRepository {
  constructor() {
    super(Seat);
  }

  findByEvent(eventId) {
    return this.model.find({ event: eventId }).sort({ row: 1, number: 1 }).lean();
  }

  countByEvent(eventId) {
    return this.model.countDocuments({ event: eventId });
  }

  releaseExpired(now = new Date(), eventId = null) {
    const filter = {
      status: 'locked',
      lockExpiresAt: { $lte: now }
    };

    if (eventId) filter.event = eventId;

    return this.model.updateMany(filter, {
      $set: { status: 'available' },
      $unset: { lockedBy: '', lockExpiresAt: '' }
    });
  }

  async expiredEventIds(now = new Date()) {
    return this.model.distinct('event', {
      status: 'locked',
      lockExpiresAt: { $lte: now }
    });
  }

  findLockable(eventId, labels, now = new Date()) {
    return this.model
      .find({
        event: eventId,
        label: { $in: labels },
        status: 'available',
        $or: [{ lockExpiresAt: null }, { lockExpiresAt: { $lte: now } }]
      })
      .sort({ row: 1, number: 1 });
  }

  findUserLocked(eventId, labels, userId) {
    return this.model.find({
      event: eventId,
      label: { $in: labels },
      status: 'locked',
      lockedBy: userId,
      lockExpiresAt: { $gt: new Date() }
    });
  }
}

export const seatRepository = new SeatRepository();
