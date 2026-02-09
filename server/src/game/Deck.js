import { Card } from './Card.js';
import { VALUES, SPECIAL_CARDS, SUITS, GAME_CONSTANTS } from '../../../shared/constants.js';

/**
 * Deck Klasse - Repräsentiert ein vollständiges Tichu-Kartendeck (56 Karten)
 */
export class Deck {
  constructor() {
    this.cards = [];
    this.createDeck();
  }

  /**
   * Erstellt ein vollständiges Tichu-Deck
   * 52 normale Karten (4 Farben × 13 Werte) + 4 Spezialkarten
   */
  createDeck() {
    this.cards = [];

    // Normale Karten: 2-A in jeder Farbe
    Object.values(SUITS).forEach(suit => {
      for (let value = VALUES.TWO; value <= VALUES.ACE; value++) {
        this.cards.push(new Card(suit, value));
      }
    });

    // Spezialkarten
    this.cards.push(new Card(null, SPECIAL_CARDS.DRAGON));
    this.cards.push(new Card(null, SPECIAL_CARDS.PHOENIX));
    this.cards.push(new Card(null, SPECIAL_CARDS.DOG));
    this.cards.push(new Card(null, SPECIAL_CARDS.MAHJONG));

    // Validierung
    if (this.cards.length !== GAME_CONSTANTS.TOTAL_CARDS) {
      throw new Error(`Deck sollte ${GAME_CONSTANTS.TOTAL_CARDS} Karten haben, hat aber ${this.cards.length}`);
    }
  }

  /**
   * Mischt das Deck (Fisher-Yates Shuffle)
   */
  shuffle() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  /**
   * Teilt Karten an Spieler aus
   * @param {number} numCards - Anzahl der Karten pro Spieler
   * @param {number} numPlayers - Anzahl der Spieler (4)
   * @returns {Array<Array<Card>>} - Array von Hand-Arrays
   */
  deal(numCards, numPlayers = 4) {
    if (numCards * numPlayers > this.cards.length) {
      throw new Error('Nicht genug Karten im Deck');
    }

    const hands = Array(numPlayers).fill(null).map(() => []);
    
    for (let i = 0; i < numCards; i++) {
      for (let player = 0; player < numPlayers; player++) {
        if (this.cards.length > 0) {
          hands[player].push(this.cards.pop());
        }
      }
    }

    return hands;
  }

  /**
   * Zieht eine Karte vom Deck
   */
  draw() {
    return this.cards.pop();
  }

  /**
   * Gibt die Anzahl der verbleibenden Karten zurück
   */
  remaining() {
    return this.cards.length;
  }

  /**
   * Prüft ob das Deck leer ist
   */
  isEmpty() {
    return this.cards.length === 0;
  }

  /**
   * Gibt alle Karten zurück (für Debugging)
   */
  getCards() {
    return [...this.cards];
  }

  /**
   * Serialisiert das Deck für JSON
   */
  toJSON() {
    return {
      cards: this.cards.map(card => card.toJSON()),
      remaining: this.remaining()
    };
  }
}

