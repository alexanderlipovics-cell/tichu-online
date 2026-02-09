import { SPECIAL_CARDS, VALUES } from '../../../shared/constants.js';

/**
 * WishSystem - Verwaltet Mah Jong Wunsch-System
 */
export class WishSystem {
  constructor() {
    this.activeWish = null; // { playerId, value, fulfilled }
  }

  /**
   * Setzt einen Wunsch (von Mah Jong Spieler)
   */
  makeWish(playerId, value) {
    // Validierung: Wert muss zwischen 2 und A sein
    if (value < VALUES.TWO || value > VALUES.ACE) {
      throw new Error('Ungültiger Wunsch-Wert');
    }

    this.activeWish = {
      playerId,
      value,
      fulfilled: false,
      fulfilledBy: null,
      timestamp: Date.now()
    };

    return this.activeWish;
  }

  /**
   * Prüft ob ein gespielter Wert den Wunsch erfüllt
   */
  checkWishFulfillment(playedCards) {
    if (!this.activeWish || this.activeWish.fulfilled) {
      return false;
    }

    // Prüfe ob eine der gespielten Karten den Wunsch-Wert hat
    const hasWishValue = playedCards.some(card => {
      // Phoenix kann jeden Wert erfüllen
      if (card.value === SPECIAL_CARDS.PHOENIX) {
        return true;
      }

      return card.value === this.activeWish.value;
    });

    if (hasWishValue) {
      this.activeWish.fulfilled = true;
      // fulfilledBy wird vom GameEngine gesetzt
      return true;
    }

    return false;
  }

  /**
   * Erfüllt den Wunsch (wird vom GameEngine aufgerufen)
   */
  fulfillWish(fulfilledByPlayerId) {
    if (this.activeWish && !this.activeWish.fulfilled) {
      this.activeWish.fulfilled = true;
      this.activeWish.fulfilledBy = fulfilledByPlayerId;
      return true;
    }
    return false;
  }

  /**
   * Prüft ob ein Wunsch aktiv ist
   */
  isWishActive() {
    return this.activeWish !== null && !this.activeWish.fulfilled;
  }

  /**
   * Gibt den aktiven Wunsch zurück
   */
  getActiveWish() {
    return this.activeWish;
  }

  /**
   * Reset für neue Runde
   */
  reset() {
    this.activeWish = null;
  }

  /**
   * Serialisiert Wish-System für JSON
   */
  toJSON() {
    return {
      activeWish: this.activeWish
    };
  }
}

