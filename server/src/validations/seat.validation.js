import { z } from 'zod';

const eventParam = z.object({
  eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event id')
});

const seatLabels = z.array(z.string().trim().min(1).max(12)).min(1).max(12);

export const eventSeatsSchema = z.object({
  params: eventParam
});

export const lockSeatsSchema = z.object({
  params: eventParam,
  body: z.object({
    seats: seatLabels
  })
});

export const releaseSeatsSchema = lockSeatsSchema;
export const bookSeatsSchema = lockSeatsSchema;
