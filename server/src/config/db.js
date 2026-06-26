import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from './logger.js';

export const connectDB = async () => {
  mongoose.set('strictQuery', true);
  const connection = await mongoose.connect(env.mongoUri);
  logger.info(`MongoDB connected: ${connection.connection.host}`);
  return connection;
};
