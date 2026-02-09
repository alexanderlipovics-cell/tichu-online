import { CombinationValidator } from './CombinationValidator.js';
import { COMBINATION_TYPES } from '../../../shared/constants.js';

/**
 * Trick Klasse - Repräsentiert einen Stich (Runde von 4 Spielzügen)
 */
export class Trick {
  constructor(leadPlayerId) {
    this.leadPlayerId = leadPlayerId; // Wer den Trick anfängt
    this.plays = []; // Array von { playerId, combination, cards }
    this.winnerId = null;
    this.points = 0; // Punkte aus Karten im Trick
  }

  /**
   * Fügt einen Spielzug hinzu
   */
  addPlay(playerId, cards) {
    const combination = CombinationValidator.detectCombination(cards);
    
    if (!combination) {
      throw new Error('Ungültige Kombination');
    }

    // Prüfe ob Kombination die letzte schlägt (außer beim Lead)
    if (this.plays.length > 0) {
      const lastPlay = this.plays[this.plays.length - 1];
      if (!CombinationValidator.canBeat(combination, lastPlay.combination)) {
        throw new Error('Kombination schlägt die letzte nicht');
      }
    }

    this.plays.push({
      playerId,
      combination,
      cards: [...cards],
      timestamp: Date.now()
    });

    // Berechne Punkte
    this.calculatePoints();

    // Wenn 4 Spielzüge: bestimme Gewinner
    if (this.plays.length === 4) {
      this.determineWinner();
    }
  }

  /**
   * Fügt ein Pass hinzu
   */
  addPass(playerId) {
    this.plays.push({
      playerId,
      combination: null,
      cards: [],
      passed: true,
      timestamp: Date.now()
    });
  }

  /**
   * Berechnet Punkte aus allen Karten im Trick
   */
  calculatePoints() {
    this.points = 0;
    this.plays.forEach(play => {
      if (play.cards && play.cards.length > 0) {
        play.cards.forEach(card => {
          this.points += card.getPointValue();
        });
      }
    });
  }

  /**
   * Bestimmt den Gewinner des Tricks (höchste Kombination)
   */
  determineWinner() {
    if (this.plays.length === 0) return;

    // Finde höchste Kombination (nicht gepasst)
    let winnerPlay = null;
    let highestValue = -1;

    this.plays.forEach(play => {
      if (!play.passed && play.combination) {
        const value = this.getCombinationValue(play.combination);
        if (value > highestValue) {
          highestValue = value;
          winnerPlay = play;
        }
      }
    });

    if (winnerPlay) {
      this.winnerId = winnerPlay.playerId;
    }
  }

  /**
   * Hilfsfunktion: Gibt Vergleichswert einer Kombination zurück
   */
  getCombinationValue(combination) {
    if (combination.isBomb) {
      // Bomben haben hohen Wert
      if (combination.type === COMBINATION_TYPES.BOMB_STRAIGHT) {
        return 10000 + (combination.length * 100) + combination.value;
      }
      if (combination.type === COMBINATION_TYPES.BOMB_4) {
        return 5000 + combination.value;
      }
    }

    // Normale Kombinationen
    return combination.value || 0;
  }

  /**
   * Prüft ob Trick vollständig ist (4 Spielzüge oder alle gepasst)
   */
  isComplete() {
    const activePlays = this.plays.filter(p => !p.passed);
    
    // Trick ist vollständig wenn:
    // 1. 4 aktive Spielzüge gemacht wurden, ODER
    // 2. 3 Spieler gepasst haben nach einem Lead
    if (activePlays.length === 4) return true;
    
    if (activePlays.length === 1 && this.plays.filter(p => p.passed).length === 3) {
      return true;
    }

    return false;
  }

  /**
   * Gibt die letzte gespielte Kombination zurück
   */
  getLastCombination() {
    const activePlays = this.plays.filter(p => !p.passed && p.combination);
    if (activePlays.length === 0) return null;
    return activePlays[activePlays.length - 1].combination;
  }

  /**
   * Serialisiert Trick für JSON
   */
  toJSON() {
    return {
      leadPlayerId: this.leadPlayerId,
      plays: this.plays.map(play => ({
        playerId: play.playerId,
        combination: play.combination ? {
          type: play.combination.type,
          value: play.combination.value
        } : null,
        passed: play.passed || false,
        cardsCount: play.cards ? play.cards.length : 0
      })),
      winnerId: this.winnerId,
      points: this.points,
      isComplete: this.isComplete()
    };
  }

  /**
   * Gibt Punkte zurück (für Player.addTrick)
   */
  getPoints() {
    return this.points;
  }
}

