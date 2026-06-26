import crypto from 'node:crypto';
import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { mailService } from './mail.service.js';

const buildAuthResponse = (user) => {
  const payload = { sub: user.id, role: user.role };
  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    },
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload)
  };
};

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

class AuthService {
  async register(input) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email is already registered', 409);
    }

    const user = await userRepository.create({ ...input, isEmailVerified: true });
    const auth = buildAuthResponse(user);
    user.refreshTokenHash = hashToken(auth.refreshToken);
    await user.save({ validateBeforeSave: false });
    return auth;
  }

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email, true);
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }

    if (!user.isActive) {
      throw new AppError('Account is disabled', 403);
    }

    if (!user.isEmailVerified) {
      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
    }

    const auth = buildAuthResponse(user);
    user.refreshTokenHash = hashToken(auth.refreshToken);
    await user.save({ validateBeforeSave: false });
    return auth;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token is required', 401);
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await userRepository.findByRefreshSubject(decoded.sub);

    if (!user || user.refreshTokenHash !== hashToken(refreshToken)) {
      throw new AppError('Invalid refresh token', 401);
    }

    const auth = buildAuthResponse(user);
    user.refreshTokenHash = hashToken(auth.refreshToken);
    await user.save({ validateBeforeSave: false });
    return auth;
  }

  async logout(userId) {
    if (!userId) return;
    await userRepository.updateById(userId, { refreshTokenHash: null });
  }

  async verifyEmail(_token) {
    return { message: 'Email verification is not required' };
  }

  async resendVerification(_email) {
    return { message: 'Email verification is not required' };
  }

  async forgotPassword(email) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });
    await mailService.sendPasswordResetEmail(user, token);
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(token, password) {
    const user = await userRepository.findByPasswordResetToken(hashToken(token));
    if (!user) {
      throw new AppError('Password reset token is invalid or expired', 400);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.refreshTokenHash = undefined;
    await user.save();

    return buildAuthResponse(user);
  }

  async googleLogin() {
    throw new AppError('Google OAuth is configured as an optional Phase 2 extension. Add a Google ID token verifier to enable it.', 501);
  }
}

export const authService = new AuthService();
