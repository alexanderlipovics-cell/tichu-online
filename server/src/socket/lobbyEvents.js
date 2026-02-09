import { CLIENT_EVENTS, SERVER_EVENTS } from '../../../shared/events.js';
import { BotPlayer } from '../../game/BotPlayer.js';

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
    console.log('🚪 [JOIN-ROOM] Event received:', { roomId, userId, username });
    try {
      const room = this.roomManager.getRoom(roomId);
      if (!room) {
        console.error('❌ [JOIN-ROOM] Room not found:', roomId);
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Raum nicht gefunden' });
        return;
      }

      if (room.getPlayerCount() >= 4) {
        console.error('❌ [JOIN-ROOM] Room is full:', roomId);
        socket.emit(SERVER_EVENTS.ERROR, { message: 'Raum ist voll' });
        return;
      }

      // Speichere Room & User Info in Socket
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.username = username;

      // Join Socket Room
      socket.join(roomId);
      console.log('✅ [JOIN-ROOM] Socket joined room:', roomId);

      // Füge Spieler zu Room hinzu
      room.addPlayer(socket.id, userId, username);
      console.log('✅ [JOIN-ROOM] Player added. Player count:', room.getPlayerCount());

      // Sende Bestätigung
      socket.emit(SERVER_EVENTS.ROOM_JOINED, {
        roomId,
        userId: userId, // Wichtig: userId mit senden
        room: room.toLobbyJSON()
      });
      console.log('📤 [JOIN-ROOM] ROOM_JOINED event sent with userId:', userId);

      // Broadcast an andere Spieler
      socket.to(roomId).emit(SERVER_EVENTS.PLAYER_JOINED, {
        userId,
        username,
        playerCount: room.getPlayerCount()
      });
      console.log('📤 [JOIN-ROOM] PLAYER_JOINED broadcasted');

      // Wenn 4 Spieler: Starte Spiel
      if (room.getPlayerCount() === 4) {
        console.log('🎮 [JOIN-ROOM] 4 players - starting game...');
        this.startGameForRoom(room);
      }
    } catch (error) {
      console.error('❌ [JOIN-ROOM] Error:', error);
      socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
    }
  }

  handleLeaveRoom(socket) {
    if (!socket.data.roomId) return;

    const room = this.roomManager.getRoom(socket.data.roomId);
    if (room) {
      room.removePlayer(socket.id);
      socket.to(socket.data.roomId).emit(SERVER_EVENTS.PLAYER_LEFT, {
        userId: socket.data.userId,
        playerCount: room.getPlayerCount()
      });
    }

    socket.leave(socket.data.roomId);
    socket.data.roomId = null;
    socket.emit(SERVER_EVENTS.ROOM_LEFT);
  }

  handleQuickMatch(socket, { userId, username }) {
    console.log('⚡ [QUICK-MATCH] Event received:', { userId, username });
    try {
      const result = this.roomManager.quickMatch(socket.id, userId, username);
      
      if (result.room) {
        console.log('✅ [QUICK-MATCH] Room found/created:', result.room.id);
        // Join Room
        socket.data.roomId = result.room.id;
        socket.data.userId = userId;
        socket.data.username = username;
        socket.join(result.room.id);

        socket.emit(SERVER_EVENTS.ROOM_JOINED, {
          roomId: result.room.id,
          userId: userId,
          room: result.room.toLobbyJSON()
        });
        console.log('📤 [QUICK-MATCH] ROOM_JOINED sent');

        // Wenn 4 Spieler: Starte Spiel
        if (result.room.getPlayerCount() === 4) {
          console.log('🎮 [QUICK-MATCH] 4 players - starting game...');
          this.startGameForRoom(result.room);
        }
      } else {
        console.log('⏳ [QUICK-MATCH] Queued, position:', result.position);
        socket.emit('quick-match-queued', {
          position: result.position || 0
        });
      }
    } catch (error) {
      console.error('❌ [QUICK-MATCH] Error:', error);
      socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
    }
  }

  handleGetRoomList(socket) {
    const rooms = this.roomManager.getPublicRooms();
    socket.emit('room-list', { rooms });
  }

  handleCreateRoom(socket, { userId, username, isPrivate = false, roomName = null, addBots = false }) {
    console.log('📝 [CREATE-ROOM] Event received:', { userId, username, roomName, addBots });
    try {
      const room = this.roomManager.createRoom(isPrivate, userId, roomName);
      console.log('✅ [CREATE-ROOM] Room created:', room.id);
      
      socket.data.roomId = room.id;
      socket.data.userId = userId;
      socket.data.username = username;
      socket.join(room.id);

      room.addPlayer(socket.id, userId, username);
      console.log('✅ [CREATE-ROOM] Human player added. Player count:', room.getPlayerCount());

      // Wenn addBots: Füge 3 Bots hinzu
      if (addBots && room.getPlayerCount() < 4) {
        console.log('🤖 [CREATE-ROOM] Adding bots...');
        const botsNeeded = 4 - room.getPlayerCount();
        for (let i = 0; i < botsNeeded; i++) {
          const botName = BotPlayer.generateBotName();
          const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`;
          room.addPlayer(null, botId, botName, true);
          console.log(`🤖 [CREATE-ROOM] Bot added: ${botName} (${botId})`);
        }
      }

      socket.emit(SERVER_EVENTS.ROOM_JOINED, {
        roomId: room.id,
        userId: userId, // Wichtig: userId mit senden
        room: room.toLobbyJSON()
      });
      console.log('📤 [CREATE-ROOM] ROOM_JOINED event sent to client with userId:', userId);

      // Wenn 4 Spieler: Starte Spiel automatisch
      if (room.getPlayerCount() === 4) {
        console.log('🎮 [CREATE-ROOM] 4 players - starting game...');
        this.startGameForRoom(room);
      }
    } catch (error) {
      console.error('❌ [CREATE-ROOM] Error:', error);
      socket.emit(SERVER_EVENTS.ERROR, { message: error.message });
    }
  }

  /**
   * Startet Spiel für Room und broadcastet Game State
   */
  async startGameForRoom(room) {
    try {
      console.log('🎮 [START-GAME] Starting game for room:', room.id);
      console.log('🎮 [START-GAME] GameEngine players:', room.gameEngine.players.length);
      console.log('🎮 [START-GAME] GameEngine state:', room.gameEngine.state);
      
      // GameEngine sollte bereits gestartet sein wenn 4 Spieler da sind
      // Aber sicherstellen dass es gestartet ist
      if (room.gameEngine.state === 'WAITING_FOR_PLAYERS' && room.gameEngine.players.length === 4) {
        console.log('🎮 [START-GAME] Starting GameEngine...');
        room.gameEngine.startGame();
        console.log('✅ [START-GAME] GameEngine started. State:', room.gameEngine.state);
        console.log('✅ [START-GAME] Round created:', !!room.gameEngine.currentRound);
        
        // Log alle Spieler-Hände
        room.gameEngine.players.forEach((p, idx) => {
          console.log(`🃏 [DEAL] Player ${idx} (${p.username}): ${p.hand.length} cards`);
        });
      }

      // Warte kurz damit Round initialisiert ist
      await new Promise(resolve => setTimeout(resolve, 200));

      // Broadcast Game State an alle
      console.log('📤 [START-GAME] Broadcasting game state...');
      this.broadcastGameState(room);
      console.log('✅ [START-GAME] Game state broadcasted to all players');

      // Handle Bot Actions (Grand Tichu, etc.)
      setTimeout(async () => {
        console.log('🤖 [START-GAME] Handling bot actions...');
        await room.handleBotActions();
        this.broadcastGameState(room);
      }, 500);
    } catch (error) {
      console.error('❌ [START-GAME] Error:', error);
      console.error(error.stack);
    }
  }

  /**
   * Broadcastet Game State an alle im Raum
   */
  broadcastGameState(room) {
    console.log('📤 [BROADCAST] Broadcasting game state to all players');
    console.log('📤 [BROADCAST] Room has', room.players.size, 'players');
    
    room.players.forEach((info, socketId) => {
      if (!info.isBot && socketId) {
        console.log(`📤 [BROADCAST] Preparing state for ${info.username} (${info.userId})`);
        const gameState = room.gameEngine.getGameState(info.userId);
        
        const myPlayer = gameState.players?.find(p => p.id === info.userId);
        const myHandSize = myPlayer?.hand?.length || 0;
        
        console.log(`📤 [SEND] Sending game state to ${info.username} (${socketId}):`, {
          state: gameState.state,
          roundNumber: gameState.roundNumber,
          players: gameState.players?.length,
          currentPlayer: gameState.round?.currentPlayerIndex,
          myHandSize: myHandSize
        });
        
        this.io.to(socketId).emit(SERVER_EVENTS.GAME_STATE, gameState);
        
        // Emit cards-dealt event wenn Karten vorhanden
        const player = room.gameEngine.players.find(p => p.id === info.userId);
        if (player && player.hand && player.hand.length > 0) {
          console.log(`📤 [SEND] Sending CARDS_DEALT to ${info.username}:`, player.hand.length, 'cards');
          this.io.to(socketId).emit(SERVER_EVENTS.CARDS_DEALT, {
            playerId: info.userId,
            hand: player.hand.map(c => c.toJSON()),
            roundNumber: room.gameEngine.roundNumber
          });
        }
      }
    });
  }
}
