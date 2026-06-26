import { userRepository } from '../repositories/user.repository.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { verifyAccessToken } from '../utils/jwt.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication token is required', 401);
  }

  const token = header.split(' ')[1];
  const decoded = verifyAccessToken(token);
  const user = await userRepository.findById(decoded.sub);

  if (!user) {
    throw new AppError('Authenticated user no longer exists', 401);
  }

  req.user = user;
  next();
});

export const authorize = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('You do not have permission to perform this action', 403));
  }
  next();
};

export const requireVerifiedEmail = (req, _res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new AppError('Please verify your email address before continuing', 403));
  }
  next();
};
