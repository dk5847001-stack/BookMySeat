import { Router } from 'express';
import { createOrder, myOrders, refundOrder, verifyPayment } from '../../controllers/payment.controller.js';
import { authorize, protect } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import { createOrderSchema, refundSchema, verifyPaymentSchema } from '../../validations/payment.validation.js';

const router = Router();

router.post('/orders', protect, validate(createOrderSchema), createOrder);
router.get('/orders/mine', protect, myOrders);
router.post('/verify', protect, validate(verifyPaymentSchema), verifyPayment);
router.post('/refund/:orderId', protect, authorize('admin'), validate(refundSchema), refundOrder);

export default router;
