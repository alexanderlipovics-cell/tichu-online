import { Card } from './Card.js';

/**
 * Player Klasse - Repräsentiert einen Spieler
 */
export class Player {
  constructor(id, username, socketId) {
    this.id = id;
    this.username = username;
    this.socketId = socketId;
    this.hand = []; // Array von Card-Objekten
    this.team = null; // 1 oder 2
    this.position = null; // 0-3 (BOTTOM, RIGHT, TOP, LEFT)
    this.tichuCalled = false;
    this.grandTichuCalled = false;
    this.cardsExchanged = false;
    this.exchangeCards = []; // Karten die getauscht werden sollen
    this.tricksWon = []; // Array von Trick-Objekten
    this.isOut = false; // Ob Spieler alle Karten losgeworden ist
    this.points = 0; // Punkte aus gewonnenen Tricks
  }

  /**
   * Fügt Karten zur Hand hinzu
   */
  addCards(cards) {
    this.hand.push(...cards);
    this.sortHand();
  }

  /**
   * Sortiert die Hand nach Wert
   */
  sortHand() {
    this.hand.sort((a, b) => a.compare(b));
  }

  /**
   * Entfernt Karten aus der Hand
   */
  removeCards(cardIds) {
    this.hand = this.hand.filter(card => !cardIds.includes(card.id));
  }

  /**
   * Prüft ob Spieler eine bestimmte Karte hat
   */
  hasCard(cardId) {
    return this.hand.some(card => card.id === cardId);
  }

  /**
   * Prüft ob Spieler alle Karten losgeworden ist
   */
  checkIfOut() {
    if (this.hand.length === 0 && !this.isOut) {
      this.isOut = true;
      return true;
    }
    return false;
  }

  /**
   * Setzt Exchange-Karten
   */
  setExchangeCards(cardIds) {
    this.exchangeCards = cardIds;
  }

  /**
   * Führt Kartentausch durch
   */
  exchangeCardsWith(partner) {
    if (this.exchangeCards.length !== 3 || partner.exchangeCards.length !== 3) {
      return false;
    }

    // Hole Karten-Objekte
    const myCards = this.hand.filter(c => this.exchangeCards.includes(c.id));
    const partnerCards = partner.hand.filter(c => partner.exchangeCards.includes(c.id));

    // Entferne aus Händen
    this.removeCards(this.exchangeCards);
    partner.removeCards(partner.exchangeCards);

    // Füge hinzu
    this.addCards(partnerCards);
    partner.addCards(myCards);

    // Reset
    this.exchangeCards = [];
    partner.exchangeCards = [];
    this.cardsExchanged = true;
    partner.cardsExchanged = true;

    return true;
  }

  /**
   * Fügt gewonnenen Trick hinzu
   */
  addTrick(trick) {
    this.tricksWon.push(trick);
    // Berechne Punkte aus Trick
    this.points += trick.getPoints();
  }

  /**
   * Reset für neue Runde
   */
  resetForNewRound() {
    this.hand = [];
    this.tichuCalled = false;
    this.grandTichuCalled = false;
    this.cardsExchanged = false;
    this.exchangeCards = [];
    this.tricksWon = [];
    this.isOut = false;
    this.points = 0;
  }

  /**
   * Serialisiert Player für JSON
   */
  toJSON() {
    return {
      id: this.id,
      username: this.username,
      handSize: this.hand.length,
      hand: this.hand.map(c => c.toJSON()), // Nur für eigenen Spieler
      team: this.team,
      position: this.position,
      tichuCalled: this.tichuCalled,
      grandTichuCalled: this.grandTichuCalled,
      cardsExchanged: this.cardsExchanged,
      isOut: this.isOut,
      points: this.points,
      tricksWon: this.tricksWon.length
    };
  }

  /**
   * Serialisiert Player für andere Spieler (ohne Hand)
   */
  toPublicJSON() {
    return {
      id: this.id,
      username: this.username,
      handSize: this.hand.length,
      team: this.team,
      position: this.position,
      tichuCalled: this.tichuCalled,
      grandTichuCalled: this.grandTichuCalled,
      cardsExchanged: this.cardsExchanged,
      isOut: this.isOut,
      points: this.points,
      tricksWon: this.tricksWon.length
    };
  }
}

