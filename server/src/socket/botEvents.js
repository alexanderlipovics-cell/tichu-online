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
    console.log('🤖 [ADD-BOT] Event received:', { roomId, botName });
    try {
      const room = this.roomManager.getRoom(roomId);
      if (!room) {
        console.error('❌ [ADD-BOT] Room not found:', roomId);
        socket.emit('error', { message: 'Raum nicht gefunden' });
        return;
      }

      if (room.getPlayerCount() >= 4) {
        console.error('❌ [ADD-BOT] Room is full:', roomId);
        socket.emit('error', { message: 'Raum ist bereits voll' });
        return;
      }

      const name = botName || BotPlayer.generateBotName();
      const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      console.log(`🤖 [ADD-BOT] Adding bot: ${name} (${botId})`);
      // Füge Bot hinzu
      room.addPlayer(null, botId, name, true); // isBot = true
      console.log('✅ [ADD-BOT] Bot added. Player count:', room.getPlayerCount());

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
        console.log('🎮 [ADD-BOT] 4 players - starting game...');
        this.startGameForRoom(room);
      }
    } catch (error) {
      console.error('❌ [ADD-BOT] Error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  /**
   * Startet Spiel für Room
   */
  async startGameForRoom(room) {
    try {
      console.log('🎮 [START-GAME] Starting game for room:', room.id);
      
      if (room.gameEngine.state === 'WAITING_FOR_PLAYERS' && room.gameEngine.players.length === 4) {
        room.gameEngine.startGame();
        console.log('✅ [START-GAME] GameEngine started. State:', room.gameEngine.state);
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      this.broadcastGameState(room);
      console.log('📤 [START-GAME] Game state broadcasted');

      setTimeout(async () => {
        await room.handleBotActions();
        this.broadcastGameState(room);
      }, 500);
    } catch (error) {
      console.error('❌ [START-GAME] Error:', error);
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
    console.log('📤 [BROADCAST] Broadcasting game state');
    room.players.forEach((info, socketId) => {
      if (!info.isBot && socketId) {
        const gameState = room.gameEngine.getGameState(info.userId);
        console.log(`📤 [BROADCAST] Sending to ${info.username}:`, {
          state: gameState.state,
          players: gameState.players?.length
        });
        this.io.to(socketId).emit('game-state', gameState);
      }
    });
  }
}

