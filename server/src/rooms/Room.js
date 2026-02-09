import { GameEngine } from '../game/GameEngine.js';
import { BotManager } from '../game/BotManager.js';

/**
 * Room - repräsentiert einen Spiel- oder Warteraum
 */
export class Room {
  constructor(id, isPrivate = false, hostId = null, roomName = null) {
    this.id = id;
    this.isPrivate = isPrivate;
    this.hostId = hostId;
    this.roomName = roomName || `Raum ${id.substr(-6)}`;
    this.players = new Map(); // socketId -> { userId, username }
    this.gameEngine = new GameEngine(id);
    this.botManager = new BotManager();
    this.createdAt = Date.now();
  }

  addPlayer(socketId, userId, username, isBot = false) {
    if (this.players.size >= 4) {
      throw new Error('Room ist voll');
    }
    
    if (isBot) {
      // Für Bots: socketId ist null, verwende bot-{userId} als Key
      const botSocketId = `bot-${userId}`;
      this.players.set(botSocketId, { userId, username, isBot: true });
      this.botManager.addBotToGame(this.gameEngine, username);
    } else {
      this.players.set(socketId, { userId, username, isBot: false });
      this.gameEngine.addPlayer(userId, username, socketId);
    }
  }

  removePlayer(socketId) {
    // Finde Player (kann auch Bot sein)
    let info = this.players.get(socketId);
    if (!info && socketId?.startsWith('bot-')) {
      // Bot Socket ID Format: bot-{userId}
      const botId = socketId.replace('bot-', '');
      for (const [key, value] of this.players.entries()) {
        if (value.userId === botId && value.isBot) {
          info = value;
          socketId = key;
          break;
        }
      }
    }
    
    if (!info) return;
    this.players.delete(socketId);
    
    if (info.isBot) {
      this.botManager.removeBot(info.userId);
    }
    this.gameEngine.removePlayer(info.userId);
  }

  /**
   * Behandelt Bot-Aktionen (wird von außen aufgerufen)
   */
  async handleBotActions() {
    if (this.gameEngine.state === 'WAITING_FOR_PLAYERS') return;
    
    const round = this.gameEngine.currentRound;
    if (!round) return;

    await this.botManager.handleBotAction(this.gameEngine, round);
  }

  getPlayerCount() {
    return this.players.size;
  }

  isEmpty() {
    return this.players.size === 0;
  }

  toLobbyJSON() {
    return {
      id: this.id,
      name: this.roomName,
      isPrivate: this.isPrivate,
      hostId: this.hostId,
      playerCount: this.getPlayerCount(),
      createdAt: this.createdAt
    };
  }
}
