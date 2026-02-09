import { COMBINATION_TYPES, GAME_CONSTANTS } from '../../../shared/constants.js';
import { CombinationValidator } from './CombinationValidator.js';

/**
 * BombHandler - Verwaltet Bomben-Logik und Timing
 */
export class BombHandler {
  constructor() {
    this.bombWindowOpen = false;
    this.bombWindowTimer = null;
    this.bombWindowEndTime = null;
  }

  /**
   * Öffnet das Bomb-Fenster (3 Sekunden nach Trick-Ende)
   */
  openBombWindow(callback) {
    if (this.bombWindowOpen) {
      return; // Fenster bereits offen
    }

    this.bombWindowOpen = true;
    this.bombWindowEndTime = Date.now() + (GAME_CONSTANTS.BOMB_WINDOW_SECONDS * 1000);

    // Timer für automatisches Schließen
    this.bombWindowTimer = setTimeout(() => {
      this.closeBombWindow();
      if (callback) callback();
    }, GAME_CONSTANTS.BOMB_WINDOW_SECONDS * 1000);
  }

  /**
   * Schließt das Bomb-Fenster
   */
  closeBombWindow() {
    this.bombWindowOpen = false;
    this.bombWindowEndTime = null;
    
    if (this.bombWindowTimer) {
      clearTimeout(this.bombWindowTimer);
      this.bombWindowTimer = null;
    }
  }

  /**
   * Prüft ob Bomb-Fenster offen ist
   */
  isBombWindowOpen() {
    if (!this.bombWindowOpen) return false;
    
    // Prüfe ob Zeit abgelaufen
    if (this.bombWindowEndTime && Date.now() >= this.bombWindowEndTime) {
      this.closeBombWindow();
      return false;
    }

    return true;
  }

  /**
   * Gibt verbleibende Zeit im Bomb-Fenster zurück (in Sekunden)
   */
  getRemainingTime() {
    if (!this.isBombWindowOpen()) {
      return 0;
    }

    const remaining = Math.ceil((this.bombWindowEndTime - Date.now()) / 1000);
    return Math.max(0, remaining);
  }

  /**
   * Prüft ob eine Kombination eine Bombe ist
   */
  static isBomb(combination) {
    if (!combination) return false;
    return combination.type === COMBINATION_TYPES.BOMB_4 || 
           combination.type === COMBINATION_TYPES.BOMB_STRAIGHT;
  }

  /**
   * Prüft ob Spieler eine Bombe auf der Hand hat
   */
  static hasBomb(hand) {
    if (!hand || hand.length < 4) return false;

    // Prüfe auf 4er-Bombe
    for (let i = 0; i <= hand.length - 4; i++) {
      const fourCards = hand.slice(i, i + 4);
      const combination = CombinationValidator.detectCombination(fourCards);
      if (combination && combination.type === COMBINATION_TYPES.BOMB_4) {
        return true;
      }
    }

    // Prüfe auf Straight-Bombe (min 5 Karten)
    if (hand.length >= 5) {
      for (let i = 0; i <= hand.length - 5; i++) {
        for (let len = 5; len <= hand.length - i; len++) {
          const cards = hand.slice(i, i + len);
          const combination = CombinationValidator.detectCombination(cards);
          if (combination && combination.type === COMBINATION_TYPES.BOMB_STRAIGHT) {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Findet alle Bomben in einer Hand
   */
  static findAllBombs(hand) {
    const bombs = [];

    // 4er-Bomben
    for (let i = 0; i <= hand.length - 4; i++) {
      const fourCards = hand.slice(i, i + 4);
      const combination = CombinationValidator.detectCombination(fourCards);
      if (combination && combination.type === COMBINATION_TYPES.BOMB_4) {
        bombs.push({
          type: COMBINATION_TYPES.BOMB_4,
          cards: fourCards,
          combination
        });
      }
    }

    // Straight-Bomben
    if (hand.length >= 5) {
      for (let i = 0; i <= hand.length - 5; i++) {
        for (let len = 5; len <= hand.length - i; len++) {
          const cards = hand.slice(i, i + len);
          const combination = CombinationValidator.detectCombination(cards);
          if (combination && combination.type === COMBINATION_TYPES.BOMB_STRAIGHT) {
            bombs.push({
              type: COMBINATION_TYPES.BOMB_STRAIGHT,
              cards: cards,
              combination
            });
          }
        }
      }
    }

    return bombs;
  }

  /**
   * Prüft ob eine Bombe zu einem bestimmten Zeitpunkt gespielt werden kann
   * Bomben können JEDERZEIT gespielt werden (auch außerhalb des Fensters)
   */
  static canPlayBomb(combination, currentTrick, bombWindowOpen) {
    if (!this.isBomb(combination)) {
      return false;
    }

    // Bomben können immer gespielt werden, wenn:
    // 1. Es ist ein neuer Trick (Lead), ODER
    // 2. Es ist das Bomb-Fenster offen, ODER
    // 3. Die Bombe schlägt die letzte Kombination

    if (!currentTrick || currentTrick.plays.length === 0) {
      return true; // Lead
    }

    if (bombWindowOpen) {
      return true; // Bomb-Fenster
    }

    // Prüfe ob Bombe die letzte Kombination schlägt
    const lastCombination = currentTrick.getLastCombination();
    if (lastCombination && CombinationValidator.canBeat(combination, lastCombination)) {
      return true;
    }

    return false;
  }

  /**
   * Reset für neue Runde
   */
  reset() {
    this.closeBombWindow();
  }
}

