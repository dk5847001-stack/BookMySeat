import { logger } from '../config/logger.js';
import { AppError } from '../utils/AppError.js';

export const notFoundHandler = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.originalUrl}`, 404));
};

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  logger.error(err.message, {
    statusCode,
    stack: err.stack,
    details: err.details
  });

  res.status(statusCode).json({
    success: false,
    message: isProduction && statusCode === 500 ? 'Internal server error' : err.message,
    details: isProduction ? undefined : err.details
  });
};
