import { Server } from 'socket.io';

const ioHandler = (req, res) => {
  if (res.socket.server.io) {
    res.end();
    return;
  }

  // Set CORS headers for preflight requests
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', '*');
    res.setHeader('Access-Control-Allow-Origin', '*'); // Or specify your domain
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );
    res.status(200).end();
    return;
  }

  const io = new Server(res.socket.server, {
    path: '/api/socketio',
    cors: {
      origin: '*', // Or specify your domain
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });
  res.socket.server.io = io;

  io.on('connection', socket => {
    // Your socket events here
    socket.on('message', (data) => {
      io.emit('message', data);
    });
  });

  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default ioHandler;