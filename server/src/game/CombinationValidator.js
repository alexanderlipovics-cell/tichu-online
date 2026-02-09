import { Card } from './Card.js';
import { COMBINATION_TYPES, SPECIAL_CARDS, VALUES, SUITS } from '../../../shared/constants.js';

/**
 * CombinationValidator - Validiert und erkennt Tichu-Kartenkombinationen
 * ⭐ KERNSTÜCK der Spiellogik
 */
export class CombinationValidator {
  /**
   * Erkennt den Typ einer Kombination aus einem Array von Karten
   * @param {Card[]} cards - Array von Karten
   * @returns {Object|null} - { type, cards, value } oder null wenn ungültig
   */
  static detectCombination(cards) {
    if (!cards || cards.length === 0) {
      return null;
    }

    // Sortiere Karten nach Wert
    const sortedCards = [...cards].sort((a, b) => a.compare(b));

    // Prüfe auf Bomben (höchste Priorität)
    const bomb4 = this.detectBomb4(sortedCards);
    if (bomb4) return bomb4;

    const bombStraight = this.detectBombStraight(sortedCards);
    if (bombStraight) return bombStraight;

    // Normale Kombinationen
    if (sortedCards.length === 1) {
      return this.detectSingle(sortedCards[0]);
    }

    if (sortedCards.length === 2) {
      return this.detectPair(sortedCards);
    }

    if (sortedCards.length === 3) {
      return this.detectTriple(sortedCards);
    }

    if (sortedCards.length === 5) {
      const fullHouse = this.detectFullHouse(sortedCards);
      if (fullHouse) return fullHouse;

      const straight = this.detectStraight(sortedCards);
      if (straight) return straight;
    }

    // Längere Sequenzen
    if (sortedCards.length >= 5) {
      const straight = this.detectStraight(sortedCards);
      if (straight) return straight;
    }

    if (sortedCards.length >= 4 && sortedCards.length % 2 === 0) {
      const pairSequence = this.detectPairSequence(sortedCards);
      if (pairSequence) return pairSequence;
    }

    return null;
  }

  /**
   * SINGLE - Eine Karte
   */
  static detectSingle(card) {
    // Dog kann nicht als Single gespielt werden (nur als Lead)
    if (card.value === SPECIAL_CARDS.DOG) {
      return null;
    }

    return {
      type: COMBINATION_TYPES.SINGLE,
      cards: [card],
      value: card.getNumericValue(),
      suit: card.isNormal() ? card.suit : null
    };
  }

  /**
   * PAIR - Zwei gleiche Karten
   */
  static detectPair(cards) {
    if (cards.length !== 2) return null;

    const [card1, card2] = cards;
    const phoenixCount = cards.filter(c => c.value === SPECIAL_CARDS.PHOENIX).length;

    // Zwei normale Karten mit gleichem Wert
    if (card1.isNormal() && card2.isNormal() && card1.value === card2.value) {
      return {
        type: COMBINATION_TYPES.PAIR,
        cards: cards,
        value: card1.value,
        suit: null
      };
    }

    // Phoenix + normale Karte (Phoenix wird zur zweiten Karte)
    if (phoenixCount === 1 && cards.some(c => c.isNormal())) {
      const normalCard = cards.find(c => c.isNormal());
      return {
        type: COMBINATION_TYPES.PAIR,
        cards: cards,
        value: normalCard.value,
        suit: null,
        phoenixUsed: true
      };
    }

    return null;
  }

  /**
   * TRIPLE - Drei gleiche Karten
   */
  static detectTriple(cards) {
    if (cards.length !== 3) return null;

    const values = cards.map(c => c.value).filter(v => v !== SPECIAL_CARDS.PHOENIX);
    const phoenixCount = cards.filter(c => c.value === SPECIAL_CARDS.PHOENIX).length;

    // Drei normale Karten mit gleichem Wert
    if (values.length === 3 && new Set(values).size === 1) {
      return {
        type: COMBINATION_TYPES.TRIPLE,
        cards: cards,
        value: values[0],
        suit: null
      };
    }

    // Phoenix als Joker (z.B. 2 normale + Phoenix)
    if (phoenixCount === 1 && values.length === 2 && values[0] === values[1]) {
      return {
        type: COMBINATION_TYPES.TRIPLE,
        cards: cards,
        value: values[0],
        suit: null,
        phoenixUsed: true
      };
    }

    return null;
  }

  /**
   * FULL_HOUSE - Triple + Pair (5 Karten)
   */
  static detectFullHouse(cards) {
    if (cards.length !== 5) return null;

    const values = cards.map(c => c.value).filter(v => v !== SPECIAL_CARDS.PHOENIX);
    const phoenixCount = cards.filter(c => c.value === SPECIAL_CARDS.PHOENIX).length;
    const valueCounts = {};

    values.forEach(v => {
      valueCounts[v] = (valueCounts[v] || 0) + 1;
    });

    const counts = Object.values(valueCounts).sort((a, b) => b - a);

    // Standard Full House: 3 + 2
    if (counts.length === 2 && counts[0] === 3 && counts[1] === 2) {
      const tripleValue = Object.keys(valueCounts).find(k => valueCounts[k] === 3);
      return {
        type: COMBINATION_TYPES.FULL_HOUSE,
        cards: cards,
        value: parseInt(tripleValue),
        suit: null
      };
    }

    // Mit Phoenix: z.B. 2+2+Phoenix oder 3+1+Phoenix
    if (phoenixCount === 1) {
      if (counts.length === 2 && counts[0] === 2 && counts[1] === 2) {
        // Phoenix wird zum Triple
        const pairValue = Math.max(...Object.keys(valueCounts).map(Number));
        return {
          type: COMBINATION_TYPES.FULL_HOUSE,
          cards: cards,
          value: pairValue,
          suit: null,
          phoenixUsed: true
        };
      }
      if (counts.length === 2 && counts[0] === 3 && counts[1] === 1) {
        // Phoenix wird zum Pair
        const tripleValue = Object.keys(valueCounts).find(k => valueCounts[k] === 3);
        return {
          type: COMBINATION_TYPES.FULL_HOUSE,
          cards: cards,
          value: parseInt(tripleValue),
          suit: null,
          phoenixUsed: true
        };
      }
    }

    return null;
  }

  /**
   * STRAIGHT - Aufeinanderfolgende Karten (min 5)
   */
  static detectStraight(cards) {
    if (cards.length < 5) return null;

    // Phoenix kann nicht in Straight verwendet werden (außer als Single)
    const hasPhoenix = cards.some(c => c.value === SPECIAL_CARDS.PHOENIX);
    if (hasPhoenix) return null;

    // Dog und Dragon können nicht in Straight verwendet werden
    if (cards.some(c => c.value === SPECIAL_CARDS.DOG || c.value === SPECIAL_CARDS.DRAGON)) {
      return null;
    }

    const values = cards
      .filter(c => c.isNormal())
      .map(c => c.value)
      .sort((a, b) => a - b);

    if (values.length !== cards.length) return null;

    // Prüfe ob aufeinanderfolgend
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) {
        return null;
      }
    }

    return {
      type: COMBINATION_TYPES.STRAIGHT,
      cards: cards,
      value: values[0], // Startwert
      length: values.length,
      suit: null
    };
  }

  /**
   * PAIR_SEQUENCE - Aufeinanderfolgende Paare (min 2 Paare = 4 Karten)
   */
  static detectPairSequence(cards) {
    if (cards.length < 4 || cards.length % 2 !== 0) return null;

    const phoenixCount = cards.filter(c => c.value === SPECIAL_CARDS.PHOENIX).length;
    const normalCards = cards.filter(c => c.isNormal());

    // Gruppiere nach Wert
    const valueGroups = {};
    normalCards.forEach(card => {
      if (!valueGroups[card.value]) {
        valueGroups[card.value] = [];
      }
      valueGroups[card.value].push(card);
    });

    // Finde Paare
    const pairs = [];
    for (const [value, groupCards] of Object.entries(valueGroups)) {
      if (groupCards.length >= 2) {
        pairs.push({
          value: parseInt(value),
          cards: groupCards.slice(0, 2)
        });
      }
    }

    // Mit Phoenix: kann ein fehlendes Paar ersetzen
    let availablePhoenix = phoenixCount;
    const pairValues = pairs.map(p => p.value).sort((a, b) => a - b);

    if (pairValues.length === 0) return null;

    // Prüfe ob aufeinanderfolgend
    for (let i = 1; i < pairValues.length; i++) {
      if (pairValues[i] !== pairValues[i - 1] + 1) {
        // Phoenix könnte Lücke füllen
        if (availablePhoenix > 0 && pairValues[i] === pairValues[i - 1] + 2) {
          availablePhoenix--;
        } else {
          return null;
        }
      }
    }

    // Prüfe ob genug Karten für alle Paare vorhanden
    const totalPairsNeeded = cards.length / 2;
    if (pairs.length + availablePhoenix < totalPairsNeeded) {
      return null;
    }

    return {
      type: COMBINATION_TYPES.PAIR_SEQUENCE,
      cards: cards,
      value: Math.min(...pairValues),
      length: totalPairsNeeded,
      suit: null,
      phoenixUsed: phoenixCount > 0
    };
  }

  /**
   * BOMB_4 - Vier gleiche Karten (schlägt alles außer höhere Bombe)
   */
  static detectBomb4(cards) {
    if (cards.length !== 4) return null;

    const values = cards.map(c => c.value).filter(v => v !== SPECIAL_CARDS.PHOENIX);
    const phoenixCount = cards.filter(c => c.value === SPECIAL_CARDS.PHOENIX).length;

    // Vier normale Karten mit gleichem Wert
    if (values.length === 4 && new Set(values).size === 1) {
      return {
        type: COMBINATION_TYPES.BOMB_4,
        cards: cards,
        value: values[0],
        suit: null,
        isBomb: true
      };
    }

    // Phoenix kann nicht in 4er-Bombe verwendet werden
    if (phoenixCount > 0) return null;

    return null;
  }

  /**
   * BOMB_STRAIGHT - Straight Flush (min 5, gleiche Farbe)
   * Schlägt 4er-Bombe
   */
  static detectBombStraight(cards) {
    if (cards.length < 5) return null;

    // Phoenix, Dog, Dragon können nicht verwendet werden
    if (cards.some(c => 
      c.value === SPECIAL_CARDS.PHOENIX || 
      c.value === SPECIAL_CARDS.DOG || 
      c.value === SPECIAL_CARDS.DRAGON
    )) {
      return null;
    }

    const normalCards = cards.filter(c => c.isNormal());
    if (normalCards.length !== cards.length) return null;

    // Alle müssen gleiche Farbe haben
    const suits = new Set(normalCards.map(c => c.suit));
    if (suits.size !== 1) return null;

    const values = normalCards.map(c => c.value).sort((a, b) => a - b);

    // Prüfe ob aufeinanderfolgend
    for (let i = 1; i < values.length; i++) {
      if (values[i] !== values[i - 1] + 1) {
        return null;
      }
    }

    return {
      type: COMBINATION_TYPES.BOMB_STRAIGHT,
      cards: cards,
      value: values[0],
      length: values.length,
      suit: normalCards[0].suit,
      isBomb: true
    };
  }

  /**
   * Prüft ob eine Kombination eine andere schlagen kann
   * @param {Object} playCombination - Gespielte Kombination
   * @param {Object} lastCombination - Letzte Kombination auf dem Tisch
   * @returns {boolean}
   */
  static canBeat(playCombination, lastCombination) {
    if (!playCombination || !lastCombination) return false;

    // Bomben schlagen alles außer höhere Bomben
    if (playCombination.isBomb && !lastCombination.isBomb) {
      return true;
    }

    if (!playCombination.isBomb && lastCombination.isBomb) {
      return false;
    }

    // Bomben-Vergleich
    if (playCombination.isBomb && lastCombination.isBomb) {
      // Straight Bomb schlägt 4er Bomb
      if (playCombination.type === COMBINATION_TYPES.BOMB_STRAIGHT && 
          lastCombination.type === COMBINATION_TYPES.BOMB_4) {
        return true;
      }
      if (playCombination.type === COMBINATION_TYPES.BOMB_4 && 
          lastCombination.type === COMBINATION_TYPES.BOMB_STRAIGHT) {
        return false;
      }

      // Straight Bomb Vergleich: Länge, dann Startwert
      if (playCombination.type === COMBINATION_TYPES.BOMB_STRAIGHT && 
          lastCombination.type === COMBINATION_TYPES.BOMB_STRAIGHT) {
        if (playCombination.length > lastCombination.length) return true;
        if (playCombination.length < lastCombination.length) return false;
        return playCombination.value > lastCombination.value;
      }

      // 4er Bomb Vergleich: Wert
      if (playCombination.type === COMBINATION_TYPES.BOMB_4 && 
          lastCombination.type === COMBINATION_TYPES.BOMB_4) {
        return playCombination.value > lastCombination.value;
      }
    }

    // Gleicher Typ erforderlich
    if (playCombination.type !== lastCombination.type) {
      return false;
    }

    // Typ-spezifischer Vergleich
    switch (playCombination.type) {
      case COMBINATION_TYPES.SINGLE:
        return playCombination.value > lastCombination.value;

      case COMBINATION_TYPES.PAIR:
      case COMBINATION_TYPES.TRIPLE:
        return playCombination.value > lastCombination.value;

      case COMBINATION_TYPES.FULL_HOUSE:
        return playCombination.value > lastCombination.value;

      case COMBINATION_TYPES.STRAIGHT:
        if (playCombination.length !== lastCombination.length) return false;
        return playCombination.value > lastCombination.value;

      case COMBINATION_TYPES.PAIR_SEQUENCE:
        if (playCombination.length !== lastCombination.length) return false;
        return playCombination.value > lastCombination.value;

      default:
        return false;
    }
  }

  /**
   * Prüft ob eine Kombination gültig ist (ohne Vergleich mit letzter Kombination)
   */
  static isValid(combination) {
    return combination !== null && combination.type !== undefined;
  }
}

