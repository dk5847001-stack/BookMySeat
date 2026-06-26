import { z } from 'zod';

const email = z.string().trim().email().toLowerCase();
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[0-9]/, 'Password must include a number');

export const registerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    email,
    password,
    role: z.enum(['user']).optional()
  })
});

export const loginSchema = z.object({
  body: z.object({
    email,
    password: z.string().min(1)
  })
});

export const tokenParamSchema = z.object({
  params: z.object({
    token: z.string().min(32)
  })
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email
  })
});

export const resetPasswordSchema = z.object({
  params: z.object({
    token: z.string().min(32)
  }),
  body: z.object({
    password
  })
});

export const googleLoginSchema = z.object({
  body: z.object({
    idToken: z.string().min(20)
  })
});
