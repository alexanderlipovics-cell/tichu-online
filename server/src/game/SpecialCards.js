import { SPECIAL_CARDS } from '../../../shared/constants.js';

/**
 * SpecialCards Handler - Verwaltet Spezialkarten-Logik
 */
export class SpecialCardsHandler {
  /**
   * Prüft ob eine Karte eine Spezialkarte ist
   */
  static isSpecial(card) {
    return Object.values(SPECIAL_CARDS).includes(card.value);
  }

  /**
   * DRAGON - Höchste Single, nur durch Bombe schlagbar
   * Gibt den Stich an den Gegner (nicht Partner!)
   */
  static handleDragon(card, trick, player, teams) {
    if (card.value !== SPECIAL_CARDS.DRAGON) {
      return null;
    }

    // Dragon kann nur als Single gespielt werden
    // Wenn gespielt: Trick geht an Gegner-Team
    const playerTeam = teams.find(t => t.players.some(p => p.id === player.id));
    const opponentTeam = teams.find(t => t.teamNumber !== playerTeam.teamNumber);

    return {
      type: 'dragon',
      message: 'Drache gespielt - Trick geht an Gegner',
      giveTrickTo: opponentTeam.teamNumber
    };
  }

  /**
   * PHOENIX - Joker in Kombis, als Single = 0.5 über letzter Karte
   */
  static handlePhoenix(card, lastPlayedCard) {
    if (card.value !== SPECIAL_CARDS.PHOENIX) {
      return null;
    }

    // Als Single: Wert ist 0.5 über der letzten gespielten Karte
    if (lastPlayedCard) {
      const lastValue = lastPlayedCard.getNumericValue();
      return {
        type: 'phoenix',
        value: lastValue + 0.5,
        message: 'Phoenix als Single gespielt'
      };
    }

    // Als Lead: Phoenix = 1.5 (über Mah Jong)
    return {
      type: 'phoenix',
      value: 1.5,
      message: 'Phoenix als Lead gespielt'
    };
  }

  /**
   * DOG - Gibt Lead an Partner, nur als Lead spielbar
   */
  static handleDog(card, player, teams) {
    if (card.value !== SPECIAL_CARDS.DOG) {
      return null;
    }

    // Dog kann nur als Lead gespielt werden (erste Karte im Trick)
    const playerTeam = teams.find(t => t.players.some(p => p.id === player.id));
    const partner = playerTeam.getPartner(player.id);

    return {
      type: 'dog',
      message: 'Hund gespielt - Lead geht an Partner',
      giveLeadTo: partner.id
    };
  }

  /**
   * MAHJONG - Wert 1, kann Wunsch aussprechen
   */
  static handleMahJong(card) {
    if (card.value !== SPECIAL_CARDS.MAHJONG) {
      return null;
    }

    return {
      type: 'mahjong',
      value: 1,
      canMakeWish: true,
      message: 'Mah Jong gespielt - Wunsch möglich'
    };
  }

  /**
   * Prüft ob Spezialkarte gespielt werden kann
   */
  static canPlaySpecialCard(card, isLead, trick) {
    if (card.value === SPECIAL_CARDS.DOG) {
      // Dog nur als Lead
      return isLead;
    }

    if (card.value === SPECIAL_CARDS.DRAGON) {
      // Dragon kann immer gespielt werden (als Single)
      return true;
    }

    if (card.value === SPECIAL_CARDS.PHOENIX) {
      // Phoenix kann in Kombis oder als Single gespielt werden
      return true;
    }

    if (card.value === SPECIAL_CARDS.MAHJONG) {
      // Mah Jong kann gespielt werden
      return true;
    }

    return false;
  }
}

