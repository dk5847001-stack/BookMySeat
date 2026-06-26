import { Server } from 'socket.io';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { userRepository } from '../repositories/user.repository.js';
import { verifyAccessToken } from '../utils/jwt.js';

let io;

const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    if (!token) return next();

    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.sub);
    if (user) {
      socket.user = {
        id: user.id,
        role: user.role,
        name: user.name
      };
    }
    next();
  } catch {
    next();
  }
};

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: env.clientUrls,
      credentials: true
    }
  });

  io.use(authenticateSocket);

  io.on('connection', (socket) => {
    logger.info('Socket connected', { socketId: socket.id, userId: socket.user?.id });

    if (socket.user?.id) {
      socket.join(`user:${socket.user.id}`);
    }

    if (socket.user?.role === 'admin') {
      socket.join('admin:dashboard');
    }

    socket.on('join:event', (eventId) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('leave:event', (eventId) => {
      socket.leave(`event:${eventId}`);
    });

    socket.on('disconnect', (reason) => {
      logger.info('Socket disconnected', { socketId: socket.id, reason });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) throw new Error('Socket.io has not been initialized');
  return io;
};

export const emitToUser = (userId, event, payload) => {
  getIO().to(`user:${userId.toString()}`).emit(event, payload);
};

export const emitToAdmins = (event, payload) => {
  getIO().to('admin:dashboard').emit(event, payload);
};

export const emitToEvent = (eventId, event, payload) => {
  getIO().to(`event:${eventId.toString()}`).emit(event, payload);
};
