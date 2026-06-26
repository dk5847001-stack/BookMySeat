import { bookingService } from '../services/booking.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createBooking = asyncHandler(async (req, res) => {
  const data = await bookingService.create(req.body, req.user);
  res.status(201).json({ success: true, data });
});

export const myBookings = asyncHandler(async (req, res) => {
  const data = await bookingService.listMine(req.user);
  res.status(200).json({ success: true, data });
});

export const getBooking = asyncHandler(async (req, res) => {
  const data = await bookingService.getByBookingId(req.params.bookingId, req.user);
  res.status(200).json({ success: true, data });
});

export const downloadTicketPdf = asyncHandler(async (req, res) => {
  const pdf = await bookingService.buildTicketPdf(req.params.bookingId, req.user);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${req.params.bookingId}-ticket.pdf"`);
  res.send(pdf);
});

export const validateTicket = asyncHandler(async (req, res) => {
  const data = await bookingService.validateTicket(req.params.ticketCode);
  res.status(200).json({ success: true, data });
});
