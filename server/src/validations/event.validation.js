import { z } from 'zod';

const tags = z.preprocess((value) => {
  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
  }
  return value;
}, z.array(z.string().trim().min(1).max(32)).max(12).default([]));

const eventBody = z.object({
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().min(20).max(4000),
  category: z.string().trim().min(2).max(50).transform((value) => value.toLowerCase()),
  tags,
  date: z.coerce.date(),
  location: z.string().trim().min(2).max(160),
  price: z.coerce.number().min(0),
  totalSeats: z.coerce.number().int().min(1),
  availableSeats: z.coerce.number().int().min(0).optional(),
  image: z.string().url().optional(),
  isFeatured: z.coerce.boolean().optional()
});

export const createEventSchema = z.object({
  body: eventBody.refine((data) => (data.availableSeats ?? data.totalSeats) <= data.totalSeats, {
    message: 'Available seats cannot exceed total seats',
    path: ['availableSeats']
  })
});

export const updateEventSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event id')
  }),
  body: eventBody.partial().refine((data) => {
    if (data.availableSeats === undefined || data.totalSeats === undefined) return true;
    return data.availableSeats <= data.totalSeats;
  }, {
    message: 'Available seats cannot exceed total seats',
    path: ['availableSeats']
  })
});

export const eventIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid event id')
  })
});
