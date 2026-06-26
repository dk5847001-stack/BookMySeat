import { eventRepository } from '../repositories/event.repository.js';
import { AppError } from '../utils/AppError.js';
import { mediaService } from './media.service.js';

const sortMap = {
  newest: { createdAt: -1 },
  dateAsc: { date: 1 },
  dateDesc: { date: -1 },
  priceAsc: { price: 1 },
  priceDesc: { price: -1 },
  seats: { availableSeats: -1 }
};

const normalizeEventInput = (body) => ({
  ...body,
  availableSeats: body.availableSeats ?? body.totalSeats
});

class EventService {
  buildQuery(query) {
    const filter = {};
    const search = query.search?.trim();

    if (search) filter.$text = { $search: search };
    if (query.category) filter.category = query.category.toLowerCase();
    if (query.featured === 'true') filter.isFeatured = true;
    if (query.location) filter.location = new RegExp(query.location, 'i');
    if (query.tag) filter.tags = query.tag.toLowerCase();
    if (query.minPrice || query.maxPrice) {
      filter.price = {};
      if (query.minPrice) filter.price.$gte = Number(query.minPrice);
      if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
    }
    if (query.from || query.to) {
      filter.date = {};
      if (query.from) filter.date.$gte = new Date(query.from);
      if (query.to) filter.date.$lte = new Date(query.to);
    }

    return {
      filter,
      search,
      sort: sortMap[query.sort] || sortMap.dateAsc,
      page: Math.max(Number(query.page || 1), 1),
      limit: Math.min(Math.max(Number(query.limit || 9), 1), 50)
    };
  }

  async list(query) {
    return eventRepository.search(this.buildQuery(query));
  }

  async getById(id) {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Event not found', 404);
    event.views += 1;
    await event.save({ validateBeforeSave: false });
    return event;
  }

  async create(body, file, user) {
    const image = file ? await mediaService.uploadImage(file) : body.image ? { url: body.image, publicId: '' } : undefined;
    return eventRepository.create({
      ...normalizeEventInput(body),
      image,
      createdBy: user.id
    });
  }

  async update(id, body, file, user) {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Event not found', 404);

    if (user.role !== 'admin' && event.createdBy.toString() !== user.id) {
      throw new AppError('You can update only events you created', 403);
    }

    const next = { ...body };
    if (file) {
      await mediaService.deleteImage(event.image?.publicId);
      next.image = await mediaService.uploadImage(file);
    } else if (body.image) {
      next.image = { url: body.image, publicId: event.image?.publicId || '' };
    }

    if (next.totalSeats !== undefined && next.availableSeats === undefined && event.availableSeats > next.totalSeats) {
      next.availableSeats = next.totalSeats;
    }

    Object.assign(event, next);
    return event.save();
  }

  async delete(id, user) {
    const event = await eventRepository.findById(id);
    if (!event) throw new AppError('Event not found', 404);

    if (user.role !== 'admin' && event.createdBy.toString() !== user.id) {
      throw new AppError('You can delete only events you created', 403);
    }

    await mediaService.deleteImage(event.image?.publicId);
    await event.deleteOne();
    return { message: 'Event deleted successfully' };
  }

  featured(limit) {
    return eventRepository.featured(limit);
  }

  trending(limit) {
    return eventRepository.trending(limit);
  }
}

export const eventService = new EventService();
