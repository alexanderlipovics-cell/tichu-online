import { Room } from './Room.js';
import { MatchMaker } from './MatchMaker.js';

/**
 * RoomManager - Verwaltet alle Spielräume
 */
export class RoomManager {
  constructor() {
    this.rooms = new Map(); // roomId -> Room
    this.matchMaker = new MatchMaker(this);
  }

  /**
   * Erstellt einen neuen Raum
   */
  createRoom(isPrivate = false, hostId = null, roomName = null) {
    const roomId = this.generateRoomId();
    const room = new Room(roomId, isPrivate, hostId, roomName);
    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Generiert eine eindeutige Room-ID
   */
  generateRoomId() {
    return `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Holt einen Raum nach ID
   */
  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  /**
   * Entfernt einen Raum
   */
  removeRoom(roomId) {
    this.rooms.delete(roomId);
  }

  /**
   * Fügt Spieler zu Raum hinzu
   */
  addPlayerToRoom(roomId, socketId, userId, username) {
    const room = this.getRoom(roomId);
    if (!room) {
      throw new Error('Raum nicht gefunden');
    }

    room.addPlayer(socketId, userId, username);
    return room;
  }

  /**
   * Entfernt Spieler aus Raum
   */
  removePlayerFromRoom(roomId, socketId) {
    const room = this.getRoom(roomId);
    if (!room) {
      return;
    }

    room.removePlayer(socketId);

    // Wenn Raum leer: entferne ihn
    if (room.isEmpty()) {
      this.removeRoom(roomId);
    }
  }

  /**
   * Gibt Liste aller öffentlichen Räume zurück
   */
  getPublicRooms() {
    return Array.from(this.rooms.values())
      .filter(room => !room.isPrivate && room.getPlayerCount() < 4)
      .map(room => room.toLobbyJSON())
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Quick Match - Findet oder erstellt Raum für Spieler
   */
  async quickMatch(socketId, userId, username) {
    return this.matchMaker.findOrCreateMatch(socketId, userId, username);
  }

  /**
   * Gibt MatchMaker zurück
   */
  getMatchMaker() {
    return this.matchMaker;
  }
}

