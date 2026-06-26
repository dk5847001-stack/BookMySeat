import { authService } from '../services/auth.service.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: env.nodeEnv === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const sendAuth = (res, statusCode, data) => {
  res.cookie(env.jwt.refreshCookieName, data.refreshToken, cookieOptions);
  res.status(statusCode).json({ success: true, data });
};

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  sendAuth(res, 201, data);
});

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  sendAuth(res, 200, data);
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies[env.jwt.refreshCookieName] || req.body.refreshToken;
  const data = await authService.refresh(token);
  sendAuth(res, 200, data);
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user?.id);
  res.clearCookie(env.jwt.refreshCookieName, cookieOptions);
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      isEmailVerified: req.user.isEmailVerified
    }
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const data = await authService.verifyEmail(req.params.token);
  res.status(200).json({ success: true, data });
});

export const resendVerification = asyncHandler(async (req, res) => {
  const data = await authService.resendVerification(req.body.email);
  res.status(200).json({ success: true, data });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const data = await authService.forgotPassword(req.body.email);
  res.status(200).json({ success: true, data });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const data = await authService.resetPassword(req.params.token, req.body.password);
  sendAuth(res, 200, data);
});

export const googleLogin = asyncHandler(async (req, res) => {
  const data = await authService.googleLogin(req.body.idToken);
  sendAuth(res, 200, data);
});
