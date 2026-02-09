import { BotManager } from '../game/BotManager.js';
import { BotPlayer } from '../game/BotPlayer.js';

/**
 * Bot Events Handler - Verwaltet Bot-bezogene Events
 */
export class BotEventsHandler {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  /**
   * Registriert Bot Event Handler
   */
  register(socket) {
    // Füge Bot zu Raum hinzu
    socket.on('add-bot', (data) => {
      this.handleAddBot(socket, data);
    });

    // Entferne Bot
    socket.on('remove-bot', (data) => {
      this.handleRemoveBot(socket, data);
    });
  }

  handleAddBot(socket, { roomId, botName = null }) {
    try {
      const room = this.roomManager.getRoom(roomId);
      if (!room) {
        socket.emit('error', { message: 'Raum nicht gefunden' });
        return;
      }

      if (room.getPlayerCount() >= 4) {
        socket.emit('error', { message: 'Raum ist bereits voll' });
        return;
      }

      const name = botName || BotPlayer.generateBotName();
      const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Füge Bot hinzu
      room.addPlayer(null, botId, name, true); // isBot = true

      socket.emit('bot-added', {
        botId,
        botName: name,
        playerCount: room.getPlayerCount()
      });

      // Broadcast an andere Spieler
      socket.to(roomId).emit('player-joined', {
        userId: botId,
        username: name,
        playerCount: room.getPlayerCount(),
        isBot: true
      });

      // Wenn 4 Spieler: Starte Spiel
      if (room.getPlayerCount() === 4) {
        this.broadcastGameState(room);
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  handleRemoveBot(socket, { roomId, botId }) {
    try {
      const room = this.roomManager.getRoom(roomId);
      if (!room) {
        socket.emit('error', { message: 'Raum nicht gefunden' });
        return;
      }

      // Finde Bot Socket ID
      let botSocketId = null;
      for (const [socketId, info] of room.players.entries()) {
        if (info.userId === botId && info.isBot) {
          botSocketId = socketId;
          break;
        }
      }

      if (botSocketId) {
        room.removePlayer(botSocketId);
        socket.emit('bot-removed', { botId });
      }
    } catch (error) {
      socket.emit('error', { message: error.message });
    }
  }

  /**
   * Broadcastet Game State
   */
  broadcastGameState(room) {
    room.players.forEach((info, socketId) => {
      if (!info.isBot && socketId) {
        const gameState = room.gameEngine.getGameState(info.userId);
        this.io.to(socketId).emit('game-state', gameState);
      }
    });
  }
}

