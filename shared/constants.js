/**
 * Tichu Game Constants
 * Geteilte Konstanten zwischen Client und Server
 */

// Karten-Farben (Suits)
export const SUITS = {
  JADE: 'jade',      // Jade (Grün)
  SWORD: 'sword',    // Schwert (Rot)
  PAGODA: 'pagoda',  // Pagode (Blau)
  STAR: 'star'       // Stern (Gelb)
};

// Karten-Werte
export const VALUES = {
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
  SIX: 6,
  SEVEN: 7,
  EIGHT: 8,
  NINE: 9,
  TEN: 10,
  JACK: 11,
  QUEEN: 12,
  KING: 13,
  ACE: 14
};

// Spezialkarten
export const SPECIAL_CARDS = {
  DRAGON: 'dragon',     // Drache (höchste Single)
  PHOENIX: 'phoenix',   // Phoenix (Joker)
  DOG: 'dog',           // Hund (gibt Lead an Partner)
  MAHJONG: 'mahjong'    // Mah Jong (Wert 1, kann Wunsch aussprechen)
};

// Kombinationstypen
export const COMBINATION_TYPES = {
  SINGLE: 'SINGLE',
  PAIR: 'PAIR',
  TRIPLE: 'TRIPLE',
  FULL_HOUSE: 'FULL_HOUSE',
  STRAIGHT: 'STRAIGHT',
  PAIR_SEQUENCE: 'PAIR_SEQUENCE',
  BOMB_4: 'BOMB_4',
  BOMB_STRAIGHT: 'BOMB_STRAIGHT'
};

// Karten-Punkte (für Scoring)
export const CARD_POINTS = {
  [VALUES.FIVE]: 5,
  [VALUES.TEN]: 10,
  [VALUES.KING]: 10,
  [SPECIAL_CARDS.DRAGON]: 25,
  [SPECIAL_CARDS.PHOENIX]: -25,
  [SPECIAL_CARDS.DOG]: 0,
  [SPECIAL_CARDS.MAHJONG]: 0
};

// Spiel-Konstanten
export const GAME_CONSTANTS = {
  TOTAL_CARDS: 56,
  CARDS_PER_PLAYER: 14,
  FIRST_DEAL: 8,
  SECOND_DEAL: 6,
  EXCHANGE_CARDS: 3,
  WINNING_SCORE: 1000,
  BOMB_WINDOW_SECONDS: 3
};

// Spieler-Positionen (im Uhrzeigersinn)
export const PLAYER_POSITIONS = {
  BOTTOM: 0,  // Eigener Spieler (unten)
  RIGHT: 1,   // Rechts
  TOP: 2,     // Partner (oben)
  LEFT: 3     // Links
};

// Team-Zuordnung
export const TEAMS = {
  TEAM_1: 1,
  TEAM_2: 2
};

