import { Order } from '../models/order.model.js';
import { BaseRepository } from './base.repository.js';

class OrderRepository extends BaseRepository {
  constructor() {
    super(Order);
  }

  findByOrderId(orderId) {
    return this.model.findOne({ orderId }).populate('eventId').populate('userId', 'name email');
  }

  findUserOrders(userId) {
    return this.model.find({ userId }).populate('eventId').sort({ createdAt: -1 }).lean();
  }
}

export const orderRepository = new OrderRepository();
