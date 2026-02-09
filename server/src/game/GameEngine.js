import { Round } from './Round.js';
import { Player } from './Player.js';
import { ScoreCalculator } from './ScoreCalculator.js';
import { GAME_STATES } from '../../../shared/gameStates.js';
import { GAME_CONSTANTS } from '../../../shared/constants.js';

/**
 * GameEngine - ⭐ KERNSTÜCK der Spiellogik
 * Verwaltet das komplette Spiel mit State Machine
 */
export class GameEngine {
  constructor(roomId) {
    this.roomId = roomId;
    this.players = []; // Array von Player-Objekten
    this.currentRound = null;
    this.roundNumber = 0;
    this.state = GAME_STATES.WAITING_FOR_PLAYERS;
    this.gameStartTime = null;
    this.gameEndTime = null;
  }

  /**
   * Fügt Spieler hinzu
   */
  addPlayer(playerId, username, socketId) {
    if (this.players.length >= 4) {
      throw new Error('Spiel ist bereits voll');
    }

    if (this.players.some(p => p.id === playerId)) {
      throw new Error('Spieler bereits im Spiel');
    }

    const player = new Player(playerId, username, socketId);
    this.players.push(player);

    // Wenn 4 Spieler: Starte Spiel
    if (this.players.length === 4) {
      this.startGame();
    }

    return player;
  }

  /**
   * Entfernt Spieler
   */
  removePlayer(playerId) {
    this.players = this.players.filter(p => p.id !== playerId);
    
    if (this.players.length < 4 && this.state !== GAME_STATES.GAME_OVER) {
      this.state = GAME_STATES.WAITING_FOR_PLAYERS;
    }
  }

  /**
   * Startet das Spiel
   */
  startGame() {
    console.log('🎮 [GAMEENGINE] startGame() called. Players:', this.players.length);
    if (this.players.length !== 4) {
      throw new Error('Nicht genug Spieler');
    }

    this.state = GAME_STATES.DEALING_FIRST_8;
    this.gameStartTime = Date.now();
    this.roundNumber = 1;
    console.log('✅ [GAMEENGINE] Game started. State:', this.state, 'Round:', this.roundNumber);
    this.startNewRound();
  }

  /**
   * Startet eine neue Runde
   */
  startNewRound() {
    console.log('🔄 [GAMEENGINE] startNewRound() called. Round:', this.roundNumber);
    // Reset Spieler für neue Runde
    this.players.forEach(player => {
      player.resetForNewRound();
    });

    this.currentRound = new Round(this.players, this.roundNumber);
    console.log('✅ [GAMEENGINE] Round created');
    this.currentRound.dealFirst8();
    console.log('✅ [GAMEENGINE] First 8 cards dealt. Players hands:', 
      this.players.map(p => ({ id: p.id, handSize: p.hand.length }))
    );
    this.state = this.currentRound.state;
    console.log('✅ [GAMEENGINE] Round state:', this.state);
  }

  /**
   * Setzt Grand Tichu Entscheidung
   */
  setGrandTichu(playerId, called) {
    if (!this.currentRound) {
      throw new Error('Keine aktive Runde');
    }

    this.currentRound.setGrandTichu(playerId, called);
    this.state = this.currentRound.state;
  }

  /**
   * Setzt Exchange-Karten
   */
  setExchangeCards(playerId, cardIds) {
    if (!this.currentRound) {
      throw new Error('Keine aktive Runde');
    }

    this.currentRound.setExchangeCards(playerId, cardIds);
    this.state = this.currentRound.state;
  }

  /**
   * Spielt Karten
   */
  playCards(playerId, cardIds) {
    if (!this.currentRound) {
      throw new Error('Keine aktive Runde');
    }

    this.currentRound.playCards(playerId, cardIds);
    this.state = this.currentRound.state;

    // Prüfe ob Runde vorbei
    if (this.currentRound.state === GAME_STATES.ROUND_END) {
      return this.handleRoundEnd();
    }
  }

  /**
   * Passt
   */
  pass(playerId) {
    if (!this.currentRound) {
      throw new Error('Keine aktive Runde');
    }

    this.currentRound.pass(playerId);
    this.state = this.currentRound.state;

    // Prüfe ob Runde vorbei
    if (this.currentRound.state === GAME_STATES.ROUND_END) {
      return this.handleRoundEnd();
    }
  }

  /**
   * Spielt Bombe
   */
  playBomb(playerId, cardIds) {
    if (!this.currentRound) {
      throw new Error('Keine aktive Runde');
    }

    this.currentRound.playBomb(playerId, cardIds);
    this.state = this.currentRound.state;
  }

  /**
   * Macht Wunsch (Mah Jong)
   */
  makeWish(playerId, value) {
    if (!this.currentRound) {
      throw new Error('Keine aktive Runde');
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player.hand.some(c => c.value === 'mahjong')) {
      throw new Error('Spieler hat kein Mah Jong');
    }

    this.currentRound.wishSystem.makeWish(playerId, value);
    this.state = GAME_STATES.WISH_ACTIVE;
  }

  /**
   * Behandelt Rundenende
   */
  handleRoundEnd() {
    const roundResult = this.currentRound.endRound();
    
    // Prüfe ob Spiel vorbei
    const gameOver = ScoreCalculator.checkGameOver(
      this.currentRound.teams[0],
      this.currentRound.teams[1]
    );

    if (gameOver.gameOver) {
      this.state = GAME_STATES.GAME_OVER;
      this.gameEndTime = Date.now();
      return {
        gameOver: true,
        winner: gameOver.winner,
        finalScores: {
          team1: this.currentRound.teams[0].score,
          team2: this.currentRound.teams[1].score
        },
        roundResult
      };
    }

    // Nächste Runde
    this.roundNumber++;
    this.startNewRound();

    return {
      gameOver: false,
      roundResult,
      newRound: true
    };
  }

  /**
   * Gibt Game State zurück (für Client)
   */
  getGameState(forPlayerId = null) {
    console.log('📊 [GAMEENGINE] getGameState() called for player:', forPlayerId);
    const baseState = {
      roomId: this.roomId,
      state: this.state,
      roundNumber: this.roundNumber,
      players: this.players.map(p => {
        // Zeige Hand nur für eigenen Spieler
        if (forPlayerId && p.id === forPlayerId) {
          const playerJSON = p.toJSON();
          console.log(`📊 [GAMEENGINE] Player ${p.username} (${p.id}): ${p.hand.length} cards in hand`);
          return playerJSON;
        }
        const publicJSON = p.toPublicJSON();
        console.log(`📊 [GAMEENGINE] Player ${p.username} (${p.id}): ${p.hand.length} cards (hidden)`);
        return publicJSON;
      })
    };

    if (this.currentRound) {
      baseState.round = this.currentRound.toJSON();
    }

    console.log('📊 [GAMEENGINE] Game state prepared:', {
      state: baseState.state,
      players: baseState.players.length,
      myHandSize: forPlayerId ? baseState.players.find(p => p.id === forPlayerId)?.hand?.length : 0
    });

    return baseState;
  }

  /**
   * Gibt Spieler nach ID zurück
   */
  getPlayer(playerId) {
    return this.players.find(p => p.id === playerId);
  }

  /**
   * Serialisiert GameEngine für JSON
   */
  toJSON() {
    return {
      roomId: this.roomId,
      state: this.state,
      roundNumber: this.roundNumber,
      players: this.players.map(p => p.toPublicJSON()),
      currentRound: this.currentRound ? this.currentRound.toJSON() : null,
      gameStartTime: this.gameStartTime,
      gameEndTime: this.gameEndTime
    };
  }
}

