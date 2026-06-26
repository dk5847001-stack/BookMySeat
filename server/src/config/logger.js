import winston from 'winston';
import { env } from './env.js';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: env.logLevel,
  format: combine(timestamp(), errors({ stack: true }), json()),
  defaultMeta: { service: 'eventx-ultra-api' },
  transports: [
    new winston.transports.Console({
      format: env.nodeEnv === 'production' ? json() : combine(colorize(), simple())
    })
  ]
});
