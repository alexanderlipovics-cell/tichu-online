import { CLIENT_EVENTS, SERVER_EVENTS } from '../../../shared/events.js';

/**
 * Game Events Handler - Verwaltet alle Spiel-Events
 */
export class GameEventsHandler {
  constructor(io, roomManager) {
    this.io = io;
    this.roomManager = roomManager;
  }

  /**
   * Registriert alle Game Event Handler
   */
  register(socket) {
    // Grand Tichu Call
    socket.on(CLIENT_EVENTS.CALL_GRAND_TICHU, (data) => {
      this.handleGrandTichu(socket, data);
    });

    // Tichu Call
    socket.on(CLIENT_EVENTS.CALL_TICHU, (data) => {
      this.handleTichu(socket, data);
    });

    // Exchange Cards
    socket.on(CLIENT_EVENTS.EXCHANGE_CARDS, (data) => {
      this.handleExchangeCards(socket, data);
    });

    // Play Cards
    socket.on(CLIENT_EVENTS.PLAY_CARDS, (data) => {
      this.handlePlayCards(socket, data);
    });

    // Pass
    socket.on(CLIENT_EVENTS.PASS, (data) => {
      this.handlePass(socket, data);
    });

    // Play Bomb
    socket.on(CLIENT_EVENTS.PLAY_BOMB, (data) => {
      this.handlePlayBomb(socket, data);
    });

    // Make Wish
    socket.on(CLIENT_EVENTS.MAKE_WISH, (data) => {
      this.handleMakeWish(socket, data);
    });
  }

  /**
   * Holt Room und UserId für Socket
   */
  getRoomAndUser(socket) {
    const roomId = socket.data.roomId;
    const userId = socket.data.userId;
    
    if (!roomId || !userId) {
      throw new Error('Nicht in einem Raum');
    }

    const room = this.roomManager.getRoom(roomId);
    if (!room) {
      throw new Error('Raum nicht gefunden');
    }

    return { room, userId };
  }

  /**
   * Sendet Error an Client
   */
  sendError(socket, message) {
    socket.emit(SERVER_EVENTS.ERROR, { message });
  }

  /**
   * Broadcastet an alle im Raum
   */
  broadcastToRoom(room, event, data) {
    room.players.forEach((info, socketId) => {
      this.io.to(socketId).emit(event, data);
    });
  }

  handleGrandTichu(socket, { called }) {
    try {
      const { room, userId } = this.getRoomAndUser(socket);
      room.gameEngine.setGrandTichu(userId, called);
      
      this.broadcastToRoom(room, SERVER_EVENTS.GRAND_TICHU_CALLED, {
        playerId: userId,
        called
      });

      // Sende Game State Update
      this.broadcastGameState(room);
    } catch (error) {
      this.sendError(socket, error.message);
    }
  }

  handleTichu(socket, { called }) {
    try {
      const { room, userId } = this.getRoomAndUser(socket);
      const player = room.gameEngine.getPlayer(userId);
      if (!player) {
        throw new Error('Spieler nicht gefunden');
      }

      player.tichuCalled = called;
      
      this.broadcastToRoom(room, SERVER_EVENTS.TICHU_CALLED, {
        playerId: userId,
        called
      });

      this.broadcastGameState(room);
    } catch (error) {
      this.sendError(socket, error.message);
    }
  }

  handleExchangeCards(socket, { cardIds }) {
    try {
      const { room, userId } = this.getRoomAndUser(socket);
      room.gameEngine.setExchangeCards(userId, cardIds);
      
      this.broadcastGameState(room);
    } catch (error) {
      this.sendError(socket, error.message);
    }
  }

  handlePlayCards(socket, { cardIds }) {
    try {
      const { room, userId } = this.getRoomAndUser(socket);
      const result = room.gameEngine.playCards(userId, cardIds);
      
      this.broadcastToRoom(room, SERVER_EVENTS.PLAYER_PLAYED, {
        playerId: userId,
        cardIds
      });

      if (result && result.gameOver) {
        this.broadcastToRoom(room, SERVER_EVENTS.GAME_OVER, result);
      } else if (result && result.roundResult) {
        this.broadcastToRoom(room, SERVER_EVENTS.ROUND_END, result.roundResult);
      }

      this.broadcastGameState(room);
    } catch (error) {
      this.sendError(socket, error.message);
    }
  }

  handlePass(socket) {
    try {
      const { room, userId } = this.getRoomAndUser(socket);
      const result = room.gameEngine.pass(userId);
      
      this.broadcastToRoom(room, SERVER_EVENTS.PLAYER_PASSED, {
        playerId: userId
      });

      if (result && result.gameOver) {
        this.broadcastToRoom(room, SERVER_EVENTS.GAME_OVER, result);
      } else if (result && result.roundResult) {
        this.broadcastToRoom(room, SERVER_EVENTS.ROUND_END, result.roundResult);
      }

      this.broadcastGameState(room);
    } catch (error) {
      this.sendError(socket, error.message);
    }
  }

  handlePlayBomb(socket, { cardIds }) {
    try {
      const { room, userId } = this.getRoomAndUser(socket);
      room.gameEngine.playBomb(userId, cardIds);
      
      this.broadcastToRoom(room, SERVER_EVENTS.BOMB_PLAYED, {
        playerId: userId,
        cardIds
      });

      this.broadcastGameState(room);
    } catch (error) {
      this.sendError(socket, error.message);
    }
  }

  handleMakeWish(socket, { value }) {
    try {
      const { room, userId } = this.getRoomAndUser(socket);
      room.gameEngine.makeWish(userId, value);
      
      this.broadcastToRoom(room, SERVER_EVENTS.WISH_MADE, {
        playerId: userId,
        value
      });

      this.broadcastGameState(room);
    } catch (error) {
      this.sendError(socket, error.message);
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

    // Prüfe ob Bot am Zug ist und führe Aktion aus
    this.handleBotTurn(room);
  }

  /**
   * Behandelt Bot-Zug (asynchron)
   */
  async handleBotTurn(room) {
    // Warte kurz damit State aktualisiert ist
    setTimeout(async () => {
      try {
        await room.handleBotActions();
        // Broadcast State nach Bot-Aktion
        room.players.forEach((info, socketId) => {
          const gameState = room.gameEngine.getGameState(info.userId);
          this.io.to(socketId).emit(SERVER_EVENTS.GAME_STATE, gameState);
        });
      } catch (error) {
        console.error('Bot Turn Error:', error);
      }
    }, 500);
  }
}

