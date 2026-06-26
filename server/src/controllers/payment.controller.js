import { paymentService } from '../services/payment.service.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createOrder = asyncHandler(async (req, res) => {
  const data = await paymentService.createOrder(req.body, req.user);
  res.status(201).json({ success: true, data });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const data = await paymentService.verifyPayment(req.body, req.user);
  res.status(200).json({ success: true, data });
});

export const myOrders = asyncHandler(async (req, res) => {
  const data = await paymentService.listMine(req.user);
  res.status(200).json({ success: true, data });
});

export const refundOrder = asyncHandler(async (req, res) => {
  const data = await paymentService.refund(req.params.orderId);
  res.status(200).json({ success: true, data });
});
