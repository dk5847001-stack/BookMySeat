import { notificationService } from '../services/notification.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const myNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.listForUser(req.user, Number(req.query.limit || 20));
  res.status(200).json({ success: true, data });
});

export const markNotificationsRead = asyncHandler(async (req, res) => {
  const data = await notificationService.markAllRead(req.user);
  res.status(200).json({ success: true, data });
});

export const triggerReminders = asyncHandler(async (_req, res) => {
  const data = await notificationService.sendDueReminders();
  res.status(200).json({ success: true, data });
});
