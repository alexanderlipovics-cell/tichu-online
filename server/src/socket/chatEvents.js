import { CLIENT_EVENTS } from '../../../shared/events.js';

/**
 * Chat Events Handler - Verwaltet Chat-Nachrichten
 */
export class ChatEventsHandler {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  /**
   * Registriert alle Chat Event Handler
   */
  register(socket) {
    socket.on(CLIENT_EVENTS.CHAT_MESSAGE, (data) => {
      this.handleChatMessage(socket, data);
    });
  }

  handleChatMessage(socket, { message }) {
    try {
      const roomId = socket.data.roomId;
      const userId = socket.data.userId;
      const username = socket.data.username;

      if (!roomId || !userId) {
        socket.emit('error', { message: 'Nicht in einem Raum' });
        return;
      }

      // Broadcast an alle im Raum
      this.io.to(roomId).emit('chat-message', {
        userId,
        username,
        message,
        timestamp: Date.now()
      });
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }
}

