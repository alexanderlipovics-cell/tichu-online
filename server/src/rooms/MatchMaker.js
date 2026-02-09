import { Room } from './Room.js';

/**
 * MatchMaker - Auto-Matchmaking für Quick Match
 */
export class MatchMaker {
  constructor(roomManager) {
    this.roomManager = roomManager;
    this.waitingQueue = []; // Array von { socketId, userId, username, timestamp }
  }

  /**
   * Findet oder erstellt einen Match für Spieler
   */
  async findOrCreateMatch(socketId, userId, username) {
    // Entferne alte Einträge (älter als 5 Minuten)
    this.cleanQueue();

    // Prüfe ob Spieler bereits in Queue
    const existing = this.waitingQueue.find(w => w.userId === userId);
    if (existing) {
      return { room: null, message: 'Bereits in Warteschlange' };
    }

    // Suche nach offenem Raum
    const openRoomId = this.findOpenRoom();
    if (openRoomId) {
      const openRoom = this.roomManager.getRoom(openRoomId);
      if (openRoom) {
        // Füge Spieler zu existierendem Raum hinzu
        openRoom.addPlayer(socketId, userId, username);
        return { room: openRoom, joined: true };
      }
    }

    // Füge zu Warteschlange hinzu
    this.waitingQueue.push({
      socketId,
      userId,
      username,
      timestamp: Date.now()
    });

    // Wenn 4 Spieler in Queue: Erstelle neuen Raum
    if (this.waitingQueue.length >= 4) {
      return this.createMatchFromQueue();
    }

    return { room: null, queued: true, position: this.waitingQueue.length };
  }

  /**
   * Findet einen offenen öffentlichen Raum
   */
  findOpenRoom() {
    const publicRooms = this.roomManager.getPublicRooms();
    const openRoom = publicRooms.find(room => room.playerCount < 4 && room.playerCount > 0);
    return openRoom ? openRoom.id : null;
  }

  /**
   * Erstellt Match aus Warteschlange (4 Spieler)
   */
  createMatchFromQueue() {
    if (this.waitingQueue.length < 4) {
      return null;
    }

    // Nimm erste 4 Spieler
    const players = this.waitingQueue.splice(0, 4);
    const room = this.roomManager.createRoom(false, players[0].userId);

    // Füge alle Spieler hinzu
    players.forEach(player => {
      room.addPlayer(player.socketId, player.userId, player.username);
    });

    return { room, joined: true, players: players.map(p => p.userId) };
  }

  /**
   * Entfernt Spieler aus Warteschlange
   */
  removeFromQueue(userId) {
    this.waitingQueue = this.waitingQueue.filter(w => w.userId !== userId);
  }

  /**
   * Bereinigt alte Einträge aus Queue
   */
  cleanQueue() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    this.waitingQueue = this.waitingQueue.filter(w => w.timestamp > fiveMinutesAgo);
  }

  /**
   * Gibt Queue-Status zurück
   */
  getQueueStatus() {
    return {
      waiting: this.waitingQueue.length,
      estimatedWait: Math.max(0, 4 - this.waitingQueue.length)
    };
  }
}

