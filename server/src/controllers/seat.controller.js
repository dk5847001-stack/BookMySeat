import { seatService } from '../services/seat.service.js';
import { bookingService } from '../services/booking.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listSeats = asyncHandler(async (req, res) => {
  const data = await seatService.list(req.params.eventId);
  res.status(200).json({ success: true, data });
});

export const lockSeats = asyncHandler(async (req, res) => {
  const data = await seatService.lock(req.params.eventId, req.body.seats, req.user);
  res.status(200).json({ success: true, data });
});

export const releaseSeats = asyncHandler(async (req, res) => {
  const data = await seatService.release(req.params.eventId, req.body.seats, req.user);
  res.status(200).json({ success: true, data });
});

export const bookSeats = asyncHandler(async (req, res) => {
  const data = await bookingService.create({ eventId: req.params.eventId, seats: req.body.seats }, req.user);
  res.status(201).json({ success: true, data });
});
