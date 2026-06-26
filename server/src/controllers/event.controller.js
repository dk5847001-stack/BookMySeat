import { eventService } from '../services/event.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listEvents = asyncHandler(async (req, res) => {
  const data = await eventService.list(req.query);
  res.status(200).json({ success: true, data });
});

export const getEvent = asyncHandler(async (req, res) => {
  const data = await eventService.getById(req.params.id);
  res.status(200).json({ success: true, data });
});

export const createEvent = asyncHandler(async (req, res) => {
  const data = await eventService.create(req.body, req.file, req.user);
  res.status(201).json({ success: true, data });
});

export const updateEvent = asyncHandler(async (req, res) => {
  const data = await eventService.update(req.params.id, req.body, req.file, req.user);
  res.status(200).json({ success: true, data });
});

export const deleteEvent = asyncHandler(async (req, res) => {
  const data = await eventService.delete(req.params.id, req.user);
  res.status(200).json({ success: true, data });
});

export const featuredEvents = asyncHandler(async (req, res) => {
  const data = await eventService.featured(Number(req.query.limit || 8));
  res.status(200).json({ success: true, data });
});

export const trendingEvents = asyncHandler(async (req, res) => {
  const data = await eventService.trending(Number(req.query.limit || 8));
  res.status(200).json({ success: true, data });
});
