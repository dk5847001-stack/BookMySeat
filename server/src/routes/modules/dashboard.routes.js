import { Router } from 'express';
import {
  adminDashboard,
  exportBookingsCsv,
  exportRevenueCsv,
  updateProfile,
  userDashboard
} from '../../controllers/dashboard.controller.js';
import { authorize, protect } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { updateProfileSchema } from '../../validations/dashboard.validation.js';

const router = Router();

router.get('/me', protect, userDashboard);
router.patch('/profile', protect, validate(updateProfileSchema), updateProfile);
router.get('/admin', protect, authorize('admin'), adminDashboard);
router.get('/reports/bookings.csv', protect, exportBookingsCsv);
router.get('/reports/revenue.csv', protect, authorize('admin'), exportRevenueCsv);

export default router;
