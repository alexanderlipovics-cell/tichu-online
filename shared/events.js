/**
 * Socket.IO Event Names
 * Geteilte Event-Namen zwischen Client und Server
 */

// Client → Server Events
export const CLIENT_EVENTS = {
  // Room Management
  JOIN_ROOM: 'join-room',
  LEAVE_ROOM: 'leave-room',
  
  // Game Actions
  CALL_GRAND_TICHU: 'call-grand-tichu',
  CALL_TICHU: 'call-tichu',
  EXCHANGE_CARDS: 'exchange-cards',
  PLAY_CARDS: 'play-cards',
  PASS: 'pass',
  PLAY_BOMB: 'play-bomb',
  MAKE_WISH: 'make-wish',
  GIVE_DRAGON_TRICK: 'give-dragon-trick',
  
  // Social
  CHAT_MESSAGE: 'chat-message'
};

// Server → Client Events
export const SERVER_EVENTS = {
  // Game State
  GAME_STATE: 'game-state',
  CARDS_DEALT: 'cards-dealt',
  
  // Player Actions
  PLAYER_PLAYED: 'player-played',
  PLAYER_PASSED: 'player-passed',
  TRICK_WON: 'trick-won',
  
  // Special Events
  BOMB_PLAYED: 'bomb-played',
  BOMB_WINDOW_OPEN: 'bomb-window-open',
  TICHU_CALLED: 'tichu-called',
  GRAND_TICHU_CALLED: 'grand-tichu-called',
  WISH_MADE: 'wish-made',
  WISH_FULFILLED: 'wish-fulfilled',
  
  // Game Flow
  ROUND_END: 'round-end',
  GAME_OVER: 'game-over',
  
  // Errors
  ERROR: 'error',
  
  // Room Events
  ROOM_JOINED: 'room-joined',
  ROOM_LEFT: 'room-left',
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left'
};

