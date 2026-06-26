import { Router } from 'express';
import {
  createEvent,
  deleteEvent,
  featuredEvents,
  getEvent,
  listEvents,
  trendingEvents,
  updateEvent
} from '../../controllers/event.controller.js';
import { authorize, protect } from '../../middlewares/auth.js';
import { upload } from '../../middlewares/upload.js';
import { validate } from '../../middlewares/validate.js';
import { createEventSchema, eventIdSchema, updateEventSchema } from '../../validations/event.validation.js';

const router = Router();

router.get('/', listEvents);
router.get('/featured', featuredEvents);
router.get('/trending', trendingEvents);
router.get('/:id', validate(eventIdSchema), getEvent);
router.post('/', protect, authorize('admin'), upload.single('image'), validate(createEventSchema), createEvent);
router.patch('/:id', protect, authorize('admin'), upload.single('image'), validate(updateEventSchema), updateEvent);
router.delete('/:id', protect, authorize('admin'), validate(eventIdSchema), deleteEvent);

export default router;
