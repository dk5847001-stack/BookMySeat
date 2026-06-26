import { z } from 'zod';

export const createBookingSchema = z.object({
  body: z.object({
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event id'),
    seats: z.array(z.string().trim().min(1).max(12)).min(1).max(12)
  })
});

export const bookingIdSchema = z.object({
  params: z.object({
    bookingId: z.string().trim().min(8).max(40)
  })
});

export const ticketCodeSchema = z.object({
  params: z.object({
    ticketCode: z.string().trim().min(8).max(80)
  })
});
