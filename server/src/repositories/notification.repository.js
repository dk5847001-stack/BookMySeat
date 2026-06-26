import { Notification } from '../models/notification.model.js';
import { BaseRepository } from './base.repository.js';

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  findForUser(userId, limit = 20) {
    return this.model.find({ userId }).sort({ createdAt: -1 }).limit(limit).lean();
  }

  unreadCount(userId) {
    return this.model.countDocuments({ userId, isRead: false });
  }

  markAllRead(userId) {
    return this.model.updateMany({ userId, isRead: false }, { $set: { isRead: true } });
  }
}

export const notificationRepository = new NotificationRepository();
