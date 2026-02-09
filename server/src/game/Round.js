import { Deck } from './Deck.js';
import { Trick } from './Trick.js';
import { Player } from './Player.js';
import { Team } from './Team.js';
import { BombHandler } from './BombHandler.js';
import { WishSystem } from './WishSystem.js';
import { SpecialCardsHandler } from './SpecialCards.js';
import { ScoreCalculator } from './ScoreCalculator.js';
import { CombinationValidator } from './CombinationValidator.js';
import { GAME_STATES } from '../../../shared/gameStates.js';
import { GAME_CONSTANTS as CONSTANTS, SPECIAL_CARDS } from '../../../shared/constants.js';

/**
 * Round Klasse - Verwaltet eine einzelne Runde
 */
export class Round {
  constructor(players, roundNumber = 1) {
    this.roundNumber = roundNumber;
    this.players = players; // Array von 4 Player-Objekten
    this.teams = this.createTeams();
    this.deck = new Deck();
    this.currentTrick = null;
    this.tricks = []; // Array von Trick-Objekten
    this.state = GAME_STATES.DEALING_FIRST_8;
    this.currentPlayerIndex = 0;
    this.leadPlayerIndex = 0;
    this.bombHandler = new BombHandler();
    this.wishSystem = new WishSystem();
    this.first8Dealt = false;
    this.grandTichuDecisions = {}; // { playerId: true/false }
    this.exchangeComplete = false;
  }

  /**
   * Erstellt Teams aus Spielern
   */
  createTeams() {
    const team1 = new Team(1);
    const team2 = new Team(2);

    // Spieler 0 und 2 = Team 1, Spieler 1 und 3 = Team 2
    team1.addPlayer(this.players[0]);
    team1.addPlayer(this.players[2]);
    team2.addPlayer(this.players[1]);
    team2.addPlayer(this.players[3]);

    // Setze Positionen
    this.players[0].position = 0; // BOTTOM
    this.players[1].position = 1; // RIGHT
    this.players[2].position = 2; // TOP (Partner)
    this.players[3].position = 3; // LEFT

    return [team1, team2];
  }

  /**
   * Teilt erste 8 Karten aus
   */
  dealFirst8() {
    if (this.state !== GAME_STATES.DEALING_FIRST_8) {
      throw new Error('Falscher State für First 8 Deal');
    }

    this.deck.shuffle();
    const hands = this.deck.deal(CONSTANTS.FIRST_DEAL, 4);

    hands.forEach((hand, index) => {
      this.players[index].addCards(hand);
    });

    this.first8Dealt = true;
    this.state = GAME_STATES.DEALING_REMAINING_6;
  }

  /**
   * Setzt Grand Tichu Entscheidung
   */
  setGrandTichu(playerId, called) {
    if (this.state !== GAME_STATES.DEALING_REMAINING_6) {
      throw new Error('Falscher State für Grand Tichu');
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Spieler nicht gefunden');
    }

    this.grandTichuDecisions[playerId] = called;
    player.grandTichuCalled = called;

    // Wenn alle 4 Entscheidungen getroffen: Deal Rest
    if (Object.keys(this.grandTichuDecisions).length === 4) {
      this.dealRemaining6();
    }
  }

  /**
   * Teilt restliche 6 Karten aus
   */
  dealRemaining6() {
    if (this.state !== GAME_STATES.DEALING_REMAINING_6) {
      throw new Error('Falscher State für Remaining 6 Deal');
    }

    const hands = this.deck.deal(CONSTANTS.SECOND_DEAL, 4);

    hands.forEach((hand, index) => {
      this.players[index].addCards(hand);
    });

    this.state = GAME_STATES.CARD_EXCHANGE;
  }

  /**
   * Setzt Exchange-Karten für einen Spieler
   */
  setExchangeCards(playerId, cardIds) {
    if (this.state !== GAME_STATES.CARD_EXCHANGE) {
      throw new Error('Falscher State für Card Exchange');
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Spieler nicht gefunden');
    }

    if (cardIds.length !== CONSTANTS.EXCHANGE_CARDS) {
      throw new Error('Genau 3 Karten müssen getauscht werden');
    }

    // Validiere dass Spieler diese Karten hat
    cardIds.forEach(cardId => {
      if (!player.hasCard(cardId)) {
        throw new Error(`Spieler hat Karte ${cardId} nicht`);
      }
    });

    player.setExchangeCards(cardIds);

    // Führe Tausch durch wenn beide Partner bereit sind
    const team = this.teams.find(t => t.players.some(p => p.id === playerId));
    const partner = team.getPartner(playerId);

    if (player.exchangeCards.length === 3 && partner.exchangeCards.length === 3) {
      player.exchangeCardsWith(partner);
      this.checkExchangeComplete();
    }
  }

  /**
   * Prüft ob Exchange abgeschlossen ist
   */
  checkExchangeComplete() {
    const allExchanged = this.players.every(p => p.cardsExchanged);
    if (allExchanged) {
      this.exchangeComplete = true;
      this.state = GAME_STATES.PLAYING;
      this.startPlaying();
    }
  }

  /**
   * Startet das Spielen (findet Mah Jong Spieler)
   */
  startPlaying() {
    // Finde Spieler mit Mah Jong
    const mahJongPlayer = this.players.find(p => 
      p.hand.some(c => c.value === SPECIAL_CARDS.MAHJONG)
    );

    if (mahJongPlayer) {
      this.currentPlayerIndex = this.players.indexOf(mahJongPlayer);
      this.leadPlayerIndex = this.currentPlayerIndex;
    } else {
      // Fallback: Erster Spieler
      this.currentPlayerIndex = 0;
      this.leadPlayerIndex = 0;
    }

    this.startNewTrick();
  }

  /**
   * Startet einen neuen Trick
   */
  startNewTrick() {
    const leadPlayer = this.players[this.leadPlayerIndex];
    this.currentTrick = new Trick(leadPlayer.id);
    this.currentPlayerIndex = this.leadPlayerIndex;
    this.state = GAME_STATES.PLAYER_TURN;
  }

  /**
   * Spielt Karten
   */
  playCards(playerId, cardIds) {
    if (this.state !== GAME_STATES.PLAYER_TURN && 
        this.state !== GAME_STATES.BOMB_WINDOW) {
      throw new Error('Falscher State für Play Cards');
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Spieler nicht gefunden');
    }

    if (this.players[this.currentPlayerIndex].id !== playerId) {
      throw new Error('Nicht am Zug');
    }

    // Hole Karten-Objekte
    const cards = player.hand.filter(c => cardIds.includes(c.id));
    if (cards.length !== cardIds.length) {
      throw new Error('Nicht alle Karten gefunden');
    }

    // Prüfe Spezialkarten
    const hasDog = cards.some(c => c.value === SPECIAL_CARDS.DOG);
    if (hasDog && this.currentTrick.plays.length > 0) {
      throw new Error('Dog kann nur als Lead gespielt werden');
    }

    // Validiere Kombination
    const combination = CombinationValidator.detectCombination(cards);
    if (!combination) {
      throw new Error('Ungültige Kombination');
    }

    // Prüfe ob spielbar (außer Bomben)
    if (!combination.isBomb && this.currentTrick.plays.length > 0) {
      const lastCombination = this.currentTrick.getLastCombination();
      if (lastCombination && !CombinationValidator.canBeat(combination, lastCombination)) {
        throw new Error('Kombination schlägt die letzte nicht');
      }
    }

    // Entferne Karten aus Hand
    player.removeCards(cardIds);

    // Füge Spielzug hinzu
    this.currentTrick.addPlay(playerId, cards);

    // Prüfe Wunsch-Erfüllung
    if (this.wishSystem.isWishActive()) {
      this.wishSystem.checkWishFulfillment(cards);
    }

    // Prüfe ob Spieler raus ist
    if (player.hand.length === 0) {
      player.checkIfOut();
    }

    // Prüfe ob Trick vollständig
    if (this.currentTrick.isComplete()) {
      this.endTrick();
    } else {
      this.nextPlayer();
    }

    // Öffne Bomb-Fenster nach Trick-Ende
    if (this.currentTrick.isComplete()) {
      this.bombHandler.openBombWindow(() => {
        this.closeBombWindow();
      });
    }
  }

  /**
   * Passt
   */
  pass(playerId) {
    if (this.state !== GAME_STATES.PLAYER_TURN) {
      throw new Error('Falscher State für Pass');
    }

    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Spieler nicht gefunden');
    }

    if (this.players[this.currentPlayerIndex].id !== playerId) {
      throw new Error('Nicht am Zug');
    }

    this.currentTrick.addPass(playerId);

    // Prüfe ob Trick vollständig
    if (this.currentTrick.isComplete()) {
      this.endTrick();
    } else {
      this.nextPlayer();
    }
  }

  /**
   * Spielt Bombe
   */
  playBomb(playerId, cardIds) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) {
      throw new Error('Spieler nicht gefunden');
    }

    const cards = player.hand.filter(c => cardIds.includes(c.id));
    const combination = CombinationValidator.detectCombination(cards);

    if (!combination || !combination.isBomb) {
      throw new Error('Keine gültige Bombe');
    }

    // Bomben können jederzeit gespielt werden
    // Entferne aus Hand
    player.removeCards(cardIds);

    // Erstelle neuen Trick für Bombe
    this.currentTrick = new Trick(playerId);
    this.currentTrick.addPlay(playerId, cards);
    this.leadPlayerIndex = this.players.indexOf(player);
    this.currentPlayerIndex = this.leadPlayerIndex;

    // Prüfe ob Spieler raus ist
    if (player.hand.length === 0) {
      player.checkIfOut();
    }

    this.nextPlayer();
  }

  /**
   * Nächster Spieler
   */
  nextPlayer() {
    this.currentPlayerIndex = (this.currentPlayerIndex + 1) % 4;
    this.state = GAME_STATES.PLAYER_TURN;
  }

  /**
   * Beendet einen Trick
   */
  endTrick() {
    if (!this.currentTrick.isComplete()) {
      return;
    }

    this.currentTrick.determineWinner();
    const winner = this.players.find(p => p.id === this.currentTrick.winnerId);
    
    if (winner) {
      winner.addTrick(this.currentTrick);
    }

    this.tricks.push(this.currentTrick);
    this.leadPlayerIndex = this.players.indexOf(winner);
    this.currentPlayerIndex = this.leadPlayerIndex;

    // Prüfe ob Runde vorbei (3 Spieler raus)
    const playersOut = this.players.filter(p => p.isOut).length;
    if (playersOut >= 3) {
      this.endRound();
    } else {
      // Öffne Bomb-Fenster
      this.bombHandler.openBombWindow(() => {
        this.closeBombWindow();
      });
      this.startNewTrick();
    }
  }

  /**
   * Schließt Bomb-Fenster
   */
  closeBombWindow() {
    this.bombHandler.closeBombWindow();
    if (this.state === GAME_STATES.BOMB_WINDOW) {
      this.state = GAME_STATES.PLAYER_TURN;
    }
  }

  /**
   * Beendet die Runde
   */
  endRound() {
    this.state = GAME_STATES.ROUND_END;

    // Berechne Scores
    const scores = ScoreCalculator.calculateFinalScores(this.teams[0], this.teams[1]);
    ScoreCalculator.updateTeamScores(this.teams[0], this.teams[1]);

    return {
      roundNumber: this.roundNumber,
      team1Score: scores.team1,
      team2Score: scores.team2,
      team1Total: this.teams[0].score,
      team2Total: this.teams[1].score,
      doubleWin: scores.doubleWin
    };
  }

  /**
   * Serialisiert Round für JSON
   */
  toJSON() {
    return {
      roundNumber: this.roundNumber,
      state: this.state,
      currentPlayerIndex: this.currentPlayerIndex,
      leadPlayerIndex: this.leadPlayerIndex,
      players: this.players.map(p => p.toPublicJSON()),
      teams: this.teams.map(t => t.toJSON()),
      currentTrick: this.currentTrick ? this.currentTrick.toJSON() : null,
      bombWindowOpen: this.bombHandler.isBombWindowOpen(),
      bombWindowRemaining: this.bombHandler.getRemainingTime(),
      wishSystem: this.wishSystem.toJSON()
    };
  }
}

