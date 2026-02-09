import { VALUES, SPECIAL_CARDS, SUITS, CARD_POINTS } from '../../../shared/constants.js';

/**
 * Card Klasse - Repräsentiert eine einzelne Tichu-Karte
 */
export class Card {
  constructor(suit, value) {
    this.suit = suit;
    this.value = value;
    this.id = this.generateId();
  }

  /**
   * Generiert eine eindeutige ID für die Karte
   */
  generateId() {
    if (this.isSpecial()) {
      return this.value;
    }
    return `${this.suit}-${this.value}`;
  }

  /**
   * Prüft ob es eine Spezialkarte ist
   */
  isSpecial() {
    return Object.values(SPECIAL_CARDS).includes(this.value);
  }

  /**
   * Prüft ob es eine normale Karte (mit Suit) ist
   */
  isNormal() {
    return !this.isSpecial() && this.suit !== null;
  }

  /**
   * Gibt den numerischen Wert der Karte zurück (für Vergleiche)
   */
  getNumericValue() {
    if (this.value === SPECIAL_CARDS.DRAGON) {
      return 15; // Höchste Single
    }
    if (this.value === SPECIAL_CARDS.PHOENIX) {
      return 0.5; // Wird dynamisch berechnet
    }
    if (this.value === SPECIAL_CARDS.DOG) {
      return 0; // Kein Wert
    }
    if (this.value === SPECIAL_CARDS.MAHJONG) {
      return 1;
    }
    return this.value;
  }

  /**
   * Gibt den Punktwert der Karte zurück (für Scoring)
   */
  getPointValue() {
    if (this.isSpecial()) {
      return CARD_POINTS[this.value] || 0;
    }
    return CARD_POINTS[this.value] || 0;
  }

  /**
   * Serialisiert die Karte für JSON
   */
  toJSON() {
    return {
      id: this.id,
      suit: this.suit,
      value: this.value,
      isSpecial: this.isSpecial()
    };
  }

  /**
   * Erstellt eine Card aus JSON
   */
  static fromJSON(json) {
    return new Card(json.suit, json.value);
  }

  /**
   * Vergleich zweier Karten (für Sortierung)
   */
  compare(other) {
    const thisValue = this.getNumericValue();
    const otherValue = other.getNumericValue();
    
    if (thisValue !== otherValue) {
      return thisValue - otherValue;
    }
    
    // Bei gleichem Wert: Suit-Vergleich (nur bei normalen Karten)
    if (this.isNormal() && other.isNormal()) {
      const suitOrder = [SUITS.JADE, SUITS.SWORD, SUITS.PAGODA, SUITS.STAR];
      return suitOrder.indexOf(this.suit) - suitOrder.indexOf(other.suit);
    }
    
    return 0;
  }
}

