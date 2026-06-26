import { Router } from 'express';
import {
  forgotPassword,
  googleLogin,
  login,
  logout,
  me,
  refresh,
  register,
  resendVerification,
  resetPassword,
  verifyEmail
} from '../../controllers/auth.controller.js';
import { protect } from '../../middlewares/auth.js';
import { validate } from '../../middlewares/validate.js';
import {
  forgotPasswordSchema,
  googleLoginSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  tokenParamSchema
} from '../../validations/auth.validation.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, me);
router.get('/verify-email/:token', validate(tokenParamSchema), verifyEmail);
router.post('/resend-verification', validate(forgotPasswordSchema), resendVerification);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password/:token', validate(resetPasswordSchema), resetPassword);
router.post('/google', validate(googleLoginSchema), googleLogin);

export default router;
