import { Router } from 'express';
import authRoutes from './modules/auth.routes.js';
import bookingRoutes from './modules/booking.routes.js';
import dashboardRoutes from './modules/dashboard.routes.js';
import eventRoutes from './modules/event.routes.js';
import healthRoutes from './modules/health.routes.js';
import notificationRoutes from './modules/notification.routes.js';
import paymentRoutes from './modules/payment.routes.js';
import seatRoutes from './modules/seat.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/bookings', bookingRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/events', eventRoutes);
router.use('/notifications', notificationRoutes);
router.use('/payments', paymentRoutes);
router.use('/seats', seatRoutes);

export default router;
