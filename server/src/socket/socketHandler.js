import { GameEventsHandler } from './gameEvents.js';
import { LobbyEventsHandler } from './lobbyEvents.js';
import { ChatEventsHandler } from './chatEvents.js';

/**
 * Socket Handler - Hauptklasse für alle Socket.IO Events
 */
export class SocketHandler {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
    
    // Event Handler
    this.gameEvents = new GameEventsHandler(io, roomManager);
    this.lobbyEvents = new LobbyEventsHandler(io, roomManager);
    this.chatEvents = new ChatEventsHandler(io, roomManager);
  }

  /**
   * Registriert alle Event Handler für einen Socket
   */
  handleConnection(socket) {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Initialisiere Socket Data
    socket.data = {
      roomId: null,
      userId: null,
      username: null
    };

    // Registriere alle Event Handler
    this.lobbyEvents.register(socket);
    this.gameEvents.register(socket);
    this.chatEvents.register(socket);

    // Disconnect Handler
    socket.on('disconnect', () => {
      this.handleDisconnect(socket);
    });
  }

  /**
   * Behandelt Disconnect
   */
  handleDisconnect(socket) {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    
    // Entferne Spieler aus Room
    if (socket.data.roomId) {
      this.roomManager.removePlayerFromRoom(
        socket.data.roomId,
        socket.id
      );

      // Broadcast an andere Spieler
      const room = this.roomManager.getRoom(socket.data.roomId);
      if (room) {
        socket.to(socket.data.roomId).emit('player-left', {
          userId: socket.data.userId,
          playerCount: room.getPlayerCount()
        });
      }
    }
  }
}

