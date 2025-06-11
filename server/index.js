const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Map to track userId <-> socketId
const userSocketMap = new Map();

io.on('connection', (socket) => {
  // Expect userId and conversationIds in handshake query
  const { userId, conversationIds } = socket.handshake.query;
  if (userId) {
    userSocketMap.set(userId, socket.id);
  }
  // Join all conversation rooms
  if (conversationIds) {
    const convArr = Array.isArray(conversationIds)
      ? conversationIds
      : conversationIds.split(',');
    convArr.forEach((convId) => {
      socket.join(convId);
    });
  }

  socket.on('join-conversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('leave-conversation', (conversationId) => {
    socket.leave(conversationId);
  });

  socket.on('message', ({ conversationId, message }) => {
    // Emit to all users in the conversation room
    io.to(conversationId).emit('message', { conversationId, message });
  });

  socket.on('disconnect', () => {
    if (userId) {
      userSocketMap.delete(userId);
    }
  });
});

server.listen(3001, () => {
  console.log('Socket.IO server running on port 3001');
}); 