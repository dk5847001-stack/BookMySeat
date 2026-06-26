import { z } from 'zod';

export const createOrderSchema = z.object({
  body: z.object({
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event id'),
    seats: z.array(z.string().trim().min(1).max(12)).min(1).max(12)
  })
});

export const verifyPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().trim().min(8).max(60),
    paymentId: z.string().trim().min(8).max(80),
    signature: z.string().trim().min(16).max(160)
  })
});

export const refundSchema = z.object({
  params: z.object({
    orderId: z.string().trim().min(8).max(60)
  })
});
