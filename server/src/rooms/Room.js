import { GameEngine } from '../game/GameEngine.js';

/**
 * Room - repräsentiert einen Spiel- oder Warteraum
 */
export class Room {
  constructor(id, isPrivate = false, hostId = null) {
    this.id = id;
    this.isPrivate = isPrivate;
    this.hostId = hostId;
    this.players = new Map(); // socketId -> { userId, username }
    this.gameEngine = new GameEngine(id);
    this.createdAt = Date.now();
  }

  addPlayer(socketId, userId, username) {
    if (this.players.size >= 4) {
      throw new Error('Room ist voll');
    }
    this.players.set(socketId, { userId, username });
    this.gameEngine.addPlayer(userId, username, socketId);
  }

  removePlayer(socketId) {
    const info = this.players.get(socketId);
    if (!info) return;
    this.players.delete(socketId);
    this.gameEngine.removePlayer(info.userId);
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
      isPrivate: this.isPrivate,
      hostId: this.hostId,
      playerCount: this.getPlayerCount(),
      createdAt: this.createdAt
    };
  }
}


