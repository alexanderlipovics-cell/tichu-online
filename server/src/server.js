import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { RoomManager } from './rooms/RoomManager.js';
import { SocketHandler } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Room Manager
const roomManager = new RoomManager();

// Socket Handler
const socketHandler = new SocketHandler(io, roomManager);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API: Get Room List
app.get('/api/rooms', (req, res) => {
  const rooms = roomManager.getPublicRooms();
  res.json({ rooms });
});

// Socket.IO Connection
io.on('connection', (socket) => {
  socketHandler.handleConnection(socket);
});

const PORT = process.env.PORT || 3001;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO ready for connections`);
});

