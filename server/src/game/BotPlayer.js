import { Player } from './Player.js';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

dotenv.config();

/**
 * BotPlayer - AI Bot mit Groq API
 */
export class BotPlayer extends Player {
  constructor(id, botName, socketId = null) {
    super(id, botName, socketId);
    this.isBot = true;
    this.botName = botName;
    this.groq = process.env.GROQ_API_KEY 
      ? new Groq({ apiKey: process.env.GROQ_API_KEY })
      : null;
  }

  /**
   * Bot-Namen Liste
   */
  static BOT_NAMES = [
    'Bot Magnus',
    'Bot Chen',
    'Bot Silva',
    'Bot Karpov',
    'Bot Fischer',
    'Bot Kasparov'
  ];

  /**
   * Generiert zufälligen Bot-Namen
   */
  static generateBotName() {
    const names = this.BOT_NAMES;
    return names[Math.floor(Math.random() * names.length)];
  }

  /**
   * Serialisiert Game State für Bot-Prompt
   */
  serializeGameState(gameState, round, playerIndex) {
    const player = gameState.players[playerIndex];
    const team = round.teams.find(t => t.players.some(p => p.id === player.id));
    const teammate = team.getPartner(player.id);
    const opponents = gameState.players.filter(p => 
      p.team !== player.team && p.id !== player.id
    );

    // Aktueller Trick
    const currentTrick = round.currentTrick;
    const trickPlays = currentTrick?.plays?.filter(p => !p.passed) || [];
    const lastPlay = trickPlays.length > 0 ? trickPlays[trickPlays.length - 1] : null;

    // Gespielte Karten diese Runde (für alle Spieler)
    const cardsPlayedThisRound = round.tricks.flatMap(trick => 
      trick.plays?.filter(p => !p.passed).flatMap(p => p.cards || []) || []
    );

    return {
      botHand: player.hand.map(c => ({
        id: c.id,
        suit: c.suit,
        value: c.value,
        isSpecial: c.isSpecial(),
        numericValue: c.getNumericValue()
      })),
      handSize: player.hand.length,
      currentTrick: {
        leadPlayer: currentTrick?.leadPlayerId,
        plays: trickPlays.map(p => ({
          playerId: p.playerId,
          cardsCount: p.cards?.length || 0,
          combination: p.combination ? {
            type: p.combination.type,
            value: p.combination.value
          } : null
        })),
        lastPlay: lastPlay ? {
          playerId: lastPlay.playerId,
          cardsCount: lastPlay.cards?.length || 0,
          combination: lastPlay.combination ? {
            type: lastPlay.combination.type,
            value: lastPlay.combination.value
          } : null
        } : null
      },
      roundInfo: {
        roundNumber: gameState.roundNumber,
        state: round.state,
        currentPlayerIndex: round.currentPlayerIndex,
        isMyTurn: round.currentPlayerIndex === playerIndex
      },
      scores: {
        myTeam: team.score,
        opponentTeam: round.teams.find(t => t.teamNumber !== team.teamNumber)?.score || 0,
        myPoints: player.points,
        teammatePoints: teammate?.points || 0
      },
      teammate: {
        id: teammate?.id,
        username: teammate?.username,
        handSize: teammate?.hand.length || 0,
        isOut: teammate?.isOut || false,
        tichuCalled: teammate?.tichuCalled || false,
        grandTichuCalled: teammate?.grandTichuCalled || false
      },
      opponents: opponents.map(o => ({
        id: o.id,
        username: o.username,
        handSize: o.hand.length,
        isOut: o.isOut,
        tichuCalled: o.tichuCalled,
        grandTichuCalled: o.grandTichuCalled
      })),
      myStatus: {
        tichuCalled: player.tichuCalled,
        grandTichuCalled: player.grandTichuCalled,
        isOut: player.isOut,
        cardsExchanged: player.cardsExchanged
      },
      cardsPlayedThisRound: cardsPlayedThisRound.length,
      tricksWon: player.tricksWon?.length || 0,
      bombWindowOpen: round.bombHandler?.isBombWindowOpen() || false,
      wishSystem: round.wishSystem?.getActiveWish() || null
    };
  }

  /**
   * System Prompt mit Tichu-Regeln und Strategie
   */
  getSystemPrompt() {
    return `Du bist ein Experte für Tichu, ein chinesisches Kartenspiel für 4 Spieler (2 Teams).

SPIELREGELN:
- Ziel: Als erstes Team 1000 Punkte erreichen
- 56 Karten: 52 normale (4 Farben × 13 Werte 2-A) + 4 Spezialkarten (Drache, Phoenix, Hund, Mah Jong)
- Jeder Spieler bekommt 14 Karten
- Spezialkarten: Drache (höchste Single, 25 Punkte), Phoenix (Joker, -25 Punkte), Hund (gibt Lead an Partner), Mah Jong (Wert 1, kann Wunsch aussprechen)

KOMBINATIONEN (in Reihenfolge der Stärke):
1. SINGLE - Eine Karte
2. PAIR - Zwei gleiche
3. TRIPLE - Drei gleiche
4. FULL_HOUSE - Triple + Pair
5. STRAIGHT - Min. 5 aufeinanderfolgend
6. PAIR_SEQUENCE - Min. 2 aufeinanderfolgende Paare
7. BOMB_4 - Vier gleiche (schlägt alles außer höhere Bombe)
8. BOMB_STRAIGHT - Straight Flush min. 5 (schlägt 4er-Bombe)

SPIELABLAUF:
1. Grand Tichu Call (nach ersten 8 Karten) - +200/-200 Punkte
2. Tichu Call (nach allen 14 Karten) - +100/-100 Punkte
3. Kartentausch: 3 Karten an Partner geben
4. Spielen: Mah Jong beginnt, dann im Uhrzeigersinn
5. Bomb-Fenster: 3 Sekunden nach Trick-Ende kann jeder eine Bombe spielen

STRATEGIE:
- Tichu nur callen wenn du sehr gute Karten hast (viele hohe Karten, Bomben)
- Grand Tichu nur mit extrem guten ersten 8 Karten
- Phoenix als Joker strategisch nutzen (in Kombis oder als Single)
- Drache früh spielen wenn du viele Punkte-Karten hast
- Hund nur spielen wenn Partner gute Karten haben könnte
- Mah Jong Wunsch: Wähle Wert den du selbst hast oder den Gegner nicht haben
- Bomben sparsam nutzen, aber nicht zu spät
- Teamwork: Partner unterstützen, Gegner blockieren
- Punkte-Karten (5, 10, K, Drache) früh loswerden wenn möglich

ANTWORT-FORMAT (JSON):
{
  "action": "play" | "pass" | "bomb" | "call_tichu" | "call_grand_tichu" | "make_wish" | "exchange",
  "cardIds": ["card-id-1", "card-id-2"], // Nur bei play/bomb/exchange
  "wishValue": 5, // Nur bei make_wish (2-14)
  "reasoning": "Kurze Erklärung deiner Entscheidung"
}`;
  }

  /**
   * Entscheidet Bot-Aktion mit Groq API
   */
  async makeDecision(gameState, round) {
    if (!this.groq) {
      console.warn('Groq API Key nicht gesetzt - Bot macht zufällige Entscheidungen');
      return this.makeRandomDecision(gameState, round);
    }

    const playerIndex = gameState.players.findIndex(p => p.id === this.id);
    const gameStateJSON = this.serializeGameState(gameState, round, playerIndex);

    const prompt = `Aktueller Spielzustand:
${JSON.stringify(gameStateJSON, null, 2)}

Was ist deine nächste Aktion? Antworte NUR mit gültigem JSON im Format:
{
  "action": "play" | "pass" | "bomb" | "call_tichu" | "call_grand_tichu" | "make_wish" | "exchange",
  "cardIds": ["card-id-1", "card-id-2"],
  "wishValue": 5,
  "reasoning": "Erklärung"
}`;

    try {
      const completion = await this.groq.chat.completions.create({
        messages: [
          { role: 'system', content: this.getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 500
      });

      const response = completion.choices[0]?.message?.content || '';
      return this.parseBotResponse(response, gameStateJSON);
    } catch (error) {
      console.error('Groq API Error:', error);
      return this.makeRandomDecision(gameState, round);
    }
  }

  /**
   * Parst Bot-Response
   */
  parseBotResponse(response, gameState) {
    try {
      // Extrahiere JSON aus Response (kann Code-Block sein)
      let jsonStr = response.trim();
      
      // Entferne Markdown Code-Blocks
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }

      // Finde JSON-Objekt
      const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonStr = jsonMatch[0];
      }

      const decision = JSON.parse(jsonStr);

      // Validiere und normalisiere
      return {
        action: decision.action || 'pass',
        cardIds: decision.cardIds || [],
        wishValue: decision.wishValue,
        reasoning: decision.reasoning || 'Keine Erklärung'
      };
    } catch (error) {
      console.error('Bot Response Parse Error:', error, response);
      return {
        action: 'pass',
        cardIds: [],
        reasoning: 'Parse-Fehler, passe'
      };
    }
  }

  /**
   * Fallback: Zufällige Entscheidung wenn Groq nicht verfügbar
   */
  makeRandomDecision(gameState, round) {
    const player = gameState.players.find(p => p.id === this.id);
    if (!player || player.hand.length === 0) {
      return { action: 'pass', cardIds: [], reasoning: 'Keine Karten' };
    }

    // 70% spielen, 30% passen
    if (Math.random() < 0.7 && player.hand.length > 0) {
      const numCards = Math.min(Math.floor(Math.random() * 3) + 1, player.hand.length);
      const cardIds = player.hand.slice(0, numCards).map(c => c.id);
      return { action: 'play', cardIds, reasoning: 'Zufällige Entscheidung' };
    }

    return { action: 'pass', cardIds: [], reasoning: 'Zufällig gepasst' };
  }

  /**
   * Verzögerung für natürliches Spielen (2-3 Sekunden)
   */
  async delay() {
    const delayMs = 2000 + Math.random() * 1000; // 2-3 Sekunden
    return new Promise(resolve => setTimeout(resolve, delayMs));
  }
}

