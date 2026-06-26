import { Router } from 'express';
import {
  createBooking,
  downloadTicketPdf,
  getBooking,
  myBookings,
  validateTicket
} from '../../controllers/booking.controller.js';
import { authorize, protect } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { bookingIdSchema, createBookingSchema, ticketCodeSchema } from '../../validations/booking.validation.js';

const router = Router();

router.post('/', protect, validate(createBookingSchema), createBooking);
router.get('/mine', protect, myBookings);
router.get('/:bookingId', protect, validate(bookingIdSchema), getBooking);
router.get('/:bookingId/ticket.pdf', protect, validate(bookingIdSchema), downloadTicketPdf);
router.post('/validate/:ticketCode', protect, authorize('admin'), validate(ticketCodeSchema), validateTicket);

export default router;
