import { Player } from './Player.js';

/**
 * Team Klasse - Repräsentiert ein Team (2 Spieler)
 */
export class Team {
  constructor(teamNumber) {
    this.teamNumber = teamNumber; // 1 oder 2
    this.players = []; // Array von 2 Player-Objekten
    this.score = 0; // Gesamtpunktestand
  }

  /**
   * Fügt Spieler zum Team hinzu
   */
  addPlayer(player) {
    if (this.players.length >= 2) {
      throw new Error('Team ist bereits voll');
    }
    this.players.push(player);
    player.team = this.teamNumber;
  }

  /**
   * Gibt den Partner eines Spielers zurück
   */
  getPartner(playerId) {
    return this.players.find(p => p.id !== playerId);
  }

  /**
   * Berechnet Team-Punkte aus allen Tricks
   */
  calculateRoundPoints() {
    let totalPoints = 0;
    this.players.forEach(player => {
      totalPoints += player.points;
    });
    return totalPoints;
  }

  /**
   * Prüft ob Team gewonnen hat (>= 1000 Punkte)
   */
  hasWon() {
    return this.score >= 1000;
  }

  /**
   * Serialisiert Team für JSON
   */
  toJSON() {
    return {
      teamNumber: this.teamNumber,
      score: this.score,
      players: this.players.map(p => p.toPublicJSON())
    };
  }
}

