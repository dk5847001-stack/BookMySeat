import http from 'node:http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { startNotificationReminderSweeper } from './services/notification.service.js';
import { startSeatLockSweeper } from './services/seat.service.js';
import { initSocket } from './socket/index.js';

const server = http.createServer(app);
initSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    startNotificationReminderSweeper();
    startSeatLockSweeper();
    server.listen(env.port, () => {
      logger.info(`EventX Ultra API running on port ${env.port}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
};

startServer();

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message });
  process.exit(1);
});
