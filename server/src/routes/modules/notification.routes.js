import { Router } from 'express';
import { markNotificationsRead, myNotifications, triggerReminders } from '../../controllers/notification.controller.js';
import { authorize, protect } from '../../middlewares/auth.js';

const router = Router();

router.get('/', protect, myNotifications);
router.patch('/read-all', protect, markNotificationsRead);
router.post('/send-reminders', protect, authorize('admin'), triggerReminders);

export default router;
