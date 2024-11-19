import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('dist')); // Serve the built files

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

const waitingUsers = new Set();
const activeChats = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  const updateStats = () => {
    io.emit('stats', {
      onlineUsers: io.engine.clientsCount,
      activeChats: Math.floor(activeChats.size / 2)
    });
  };

  socket.on('findPartner', () => {
    if (waitingUsers.has(socket.id)) return;

    const partner = [...waitingUsers][0];
    if (partner) {
      waitingUsers.delete(partner);
      activeChats.set(socket.id, partner);
      activeChats.set(partner, socket.id);
      
      io.to(socket.id).emit('partnerFound', { initiator: true, partnerId: partner });
      io.to(partner).emit('partnerFound', { initiator: false, partnerId: socket.id });
    } else {
      waitingUsers.add(socket.id);
    }
    updateStats();
  });

  socket.on('signal', ({ signal, to }) => {
    io.to(to).emit('signal', { signal, from: socket.id });
  });

  socket.on('message', (message) => {
    const partner = activeChats.get(socket.id);
    if (partner) {
      io.to(partner).emit('message', message);
    }
  });

  socket.on('typing', () => {
    const partner = activeChats.get(socket.id);
    if (partner) {
      io.to(partner).emit('typing');
    }
  });

  socket.on('disconnect', () => {
    const partner = activeChats.get(socket.id);
    if (partner) {
      io.to(partner).emit('partnerDisconnected');
      activeChats.delete(partner);
      activeChats.delete(socket.id);
    }
    waitingUsers.delete(socket.id);
    updateStats();
    console.log('User disconnected:', socket.id);
  });

  updateStats();
});

// Handle all other routes by serving the index.html
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});