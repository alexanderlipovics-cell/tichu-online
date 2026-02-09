import { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext.jsx';
import { SERVER_EVENTS, CLIENT_EVENTS } from '../../../../shared/events.js';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const { socket, connected } = useSocket();
  const [gameState, setGameState] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [roundResult, setRoundResult] = useState(null);

  useEffect(() => {
    if (!socket) return;

    // Game State Updates
    socket.on(SERVER_EVENTS.GAME_STATE, (state) => {
      console.log('📊 Game State Update:', state);
      setGameState(state);
    });

    // Room Events
    socket.on(SERVER_EVENTS.ROOM_JOINED, (data) => {
      console.log('🚪 Room Joined:', data);
      setRoomId(data.roomId);
      if (data.room) {
        setGameState(data.room);
      }
    });

    socket.on(SERVER_EVENTS.ROOM_LEFT, () => {
      console.log('🚪 Room Left');
      setRoomId(null);
      setGameState(null);
    });

    // Player Actions
    socket.on(SERVER_EVENTS.PLAYER_PLAYED, (data) => {
      console.log('🎴 Player Played:', data);
    });

    socket.on(SERVER_EVENTS.PLAYER_PASSED, (data) => {
      console.log('⏭️ Player Passed:', data);
    });

    // Special Events
    socket.on(SERVER_EVENTS.BOMB_PLAYED, (data) => {
      console.log('💣 Bomb Played:', data);
    });

    socket.on(SERVER_EVENTS.BOMB_WINDOW_OPEN, () => {
      console.log('⏰ Bomb Window Open');
    });

    socket.on(SERVER_EVENTS.TICHU_CALLED, (data) => {
      console.log('📢 Tichu Called:', data);
    });

    // Game Flow
    socket.on(SERVER_EVENTS.ROUND_END, (data) => {
      console.log('🏁 Round End:', data);
      setRoundResult(data);
    });

    socket.on(SERVER_EVENTS.GAME_OVER, (data) => {
      console.log('🎉 Game Over:', data);
      setRoundResult(data);
    });

    // Errors
    socket.on(SERVER_EVENTS.ERROR, (error) => {
      console.error('❌ Game Error:', error);
    });

    return () => {
      socket.off(SERVER_EVENTS.GAME_STATE);
      socket.off(SERVER_EVENTS.ROOM_JOINED);
      socket.off(SERVER_EVENTS.ROOM_LEFT);
      socket.off(SERVER_EVENTS.PLAYER_PLAYED);
      socket.off(SERVER_EVENTS.PLAYER_PASSED);
      socket.off(SERVER_EVENTS.BOMB_PLAYED);
      socket.off(SERVER_EVENTS.BOMB_WINDOW_OPEN);
      socket.off(SERVER_EVENTS.TICHU_CALLED);
      socket.off(SERVER_EVENTS.ROUND_END);
      socket.off(SERVER_EVENTS.GAME_OVER);
      socket.off(SERVER_EVENTS.ERROR);
    };
  }, [socket]);

  // Game Actions
  const joinRoom = (roomId, userId, username) => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.JOIN_ROOM, { roomId, userId, username });
    setCurrentPlayerId(userId);
  };

  const leaveRoom = () => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.LEAVE_ROOM);
    setCurrentPlayerId(null);
    setRoomId(null);
  };

  const quickMatch = (userId, username) => {
    if (!socket) return;
    socket.emit('quick-match', { userId, username });
    setCurrentPlayerId(userId);
  };

  const playCards = (cardIds) => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.PLAY_CARDS, { cardIds });
  };

  const pass = () => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.PASS);
  };

  const playBomb = (cardIds) => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.PLAY_BOMB, { cardIds });
  };

  const callTichu = (called) => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.CALL_TICHU, { called });
  };

  const callGrandTichu = (called) => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.CALL_GRAND_TICHU, { called });
  };

  const exchangeCards = (cardIds) => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.EXCHANGE_CARDS, { cardIds });
  };

  const makeWish = (value) => {
    if (!socket) return;
    socket.emit(CLIENT_EVENTS.MAKE_WISH, { value });
  };

  const value = {
    gameState,
    currentPlayerId,
    roomId,
    connected,
    roundResult,
    joinRoom,
    leaveRoom,
    quickMatch,
    playCards,
    pass,
    playBomb,
    callTichu,
    callGrandTichu,
    exchangeCards,
    makeWish
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

