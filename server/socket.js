import { Server } from 'socket.io';
import { verifyToken } from '../utils/auth';

export default function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
    },
  });

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = await verifyToken(token);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log('User connected:', socket.user.userId);

    // Join the group chat room
    socket.join('group-chat');

    // Handle new messages
    socket.on('message', (message) => {
      io.to('group-chat').emit('message', message);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.user.userId);
    });
  });

  return io;
} 