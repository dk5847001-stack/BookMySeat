import { Router } from 'express';
import { bookSeats, listSeats, lockSeats, releaseSeats } from '../../controllers/seat.controller.js';
import { protect } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { bookSeatsSchema, eventSeatsSchema, lockSeatsSchema, releaseSeatsSchema } from '../../validations/seat.validation.js';

const router = Router();

router.get('/:eventId', validate(eventSeatsSchema), listSeats);
router.post('/:eventId/lock', protect, validate(lockSeatsSchema), lockSeats);
router.post('/:eventId/release', protect, validate(releaseSeatsSchema), releaseSeats);
router.post('/:eventId/book', protect, validate(bookSeatsSchema), bookSeats);

export default router;
