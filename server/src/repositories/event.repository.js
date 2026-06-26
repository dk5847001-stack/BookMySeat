import { Event } from '../models/event.model.js';
import { BaseRepository } from './base.repository.js';

class EventRepository extends BaseRepository {
  constructor() {
    super(Event);
  }

  async search({ filter, sort, page, limit, search }) {
    const skip = (page - 1) * limit;
    const query = search ? this.model.find(filter, { score: { $meta: 'textScore' } }) : this.model.find(filter);

    if (search) {
      query.sort({ score: { $meta: 'textScore' }, ...sort });
    } else {
      query.sort(sort);
    }

    const [items, total] = await Promise.all([
      query.skip(skip).limit(limit).lean(),
      this.model.countDocuments(filter)
    ]);

    return {
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1
      }
    };
  }

  trending(limit = 8) {
    return this.model
      .find({ date: { $gte: new Date() } })
      .sort({ bookingsCount: -1, views: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  featured(limit = 8) {
    return this.model
      .find({ isFeatured: true, date: { $gte: new Date() } })
      .sort({ date: 1, createdAt: -1 })
      .limit(limit)
      .lean();
  }
}

export const eventRepository = new EventRepository();
