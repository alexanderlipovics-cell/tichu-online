import { CLIENT_EVENTS, SERVER_EVENTS } from '../../../shared/events.js';

/**
 * Lobby Events Handler - Verwaltet Lobby & Room Management
 */
export class LobbyEventsHandler {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  /**
   * Registriert alle Lobby Event Handler
   */
  register(socket) {
    // Join Room
    socket.on(CLIENT_EVENTS.JOIN_ROOM, (data) => {
      this.handleJoinRoom(socket, data);
    });

    // Leave Room
    socket.on(CLIENT_EVENTS.LEAVE_ROOM, () => {
      this.handleLeaveRoom(socket);
    });

    // Quick Match (wird auch hier behandelt)
    socket.on('quick-match', (data) => {
      this.handleQuickMatch(socket, data);
    });

    // Get Room List
    socket.on('get-room-list', () => {
      this.handleGetRoomList(socket);
    });

    // Create Room
    socket.on('create-room', (data) => {
      this.handleCreateRoom(socket, data);
    });
  }

  handleJoinRoom(socket, { roomId, userId, username }) {
    try {
      const room = this.roomManager.getRoom(roomId);
      if (!room) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Raum nicht gefunden' });
        return;
      }

      if (room.getPlayerCount() >= 4) {
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Raum ist voll' });
        return;
      }

      // Speichere Room & User Info in Socket
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.username = username;

      // Join Socket Room
      socket.join(roomId);

      // Füge Spieler zu Room hinzu
      room.addPlayer(socket.id, userId, username);

      // Sende Bestätigung
      socket.emit(SERVER_EVENTS.ROOM_JOINED, {
        roomId,
        room: room.toLobbyJSON()
      });

      // Broadcast an andere Spieler
      socket.to(roomId).emit(SERVER_EVENTS.PLAYER_JOINED, {
        userId,
        username,
        playerCount: room.getPlayerCount()
      });

      // Wenn 4 Spieler: Sende Game State
      if (room.getPlayerCount() === 4) {
        this.broadcastGameState(room);
      }
    } catch (error) {
      socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
    }
  }

  handleLeaveRoom(socket) {
    try {
      const roomId = socket.data.roomId;
      if (!roomId) {
        return;
      }

      const room = this.roomManager.getRoom(roomId);
      if (room) {
        const userId = socket.data.userId;
        room.removePlayer(socket.id);

        socket.leave(roomId);
        socket.data.roomId = null;
        socket.data.userId = null;

        socket.emit(SERVER_EVENTS.ROOM_LEFT, { roomId });

        // Broadcast an andere Spieler
        socket.to(roomId).emit(SERVER_EVENTS.PLAYER_LEFT, {
          userId,
          playerCount: room.getPlayerCount()
        });

        // Wenn Raum leer: entferne ihn
        if (room.isEmpty()) {
          this.roomManager.removeRoom(roomId);
        }
      }
    } catch (error) {
      socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
    }
  }

  handleQuickMatch(socket, { userId, username }) {
    try {
      const result = this.roomManager.quickMatch(socket.id, userId, username);
      
      if (result.room) {
        // Join Room
        socket.data.roomId = result.room.id;
        socket.data.userId = userId;
        socket.data.username = username;
        socket.join(result.room.id);

        socket.emit(SERVER_EVENTS.ROOM_JOINED, {
          roomId: result.room.id,
          room: result.room.toLobbyJSON()
        });

        // Wenn 4 Spieler: Starte Spiel
        if (result.room.getPlayerCount() === 4) {
          this.broadcastGameState(result.room);
        }
      } else {
        socket.emit('quick-match-queued', {
          position: result.position || 0
        });
      }
    } catch (error) {
      socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
    }
  }

  handleGetRoomList(socket) {
    const rooms = this.roomManager.getPublicRooms();
    socket.emit('room-list', { rooms });
  }

  handleCreateRoom(socket, { userId, username, isPrivate = false, roomName = null }) {
    try {
      const room = this.roomManager.createRoom(isPrivate, userId, roomName);
      
      socket.data.roomId = room.id;
      socket.data.userId = userId;
      socket.data.username = username;
      socket.join(room.id);

      room.addPlayer(socket.id, userId, username);

      socket.emit(SERVER_EVENTS.ROOM_JOINED, {
        roomId: room.id,
        room: room.toLobbyJSON()
      });
    } catch (error) {
      socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
    }
  }

  /**
   * Broadcastet Game State an alle im Raum
   */
  broadcastGameState(room) {
    room.players.forEach((info, socketId) => {
      const gameState = room.gameEngine.getGameState(info.userId);
      this.io.to(socketId).emit(SERVER_EVENTS.GAME_STATE, gameState);
    });
  }
}

