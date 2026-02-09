import { BotPlayer } from './BotPlayer.js';
import { GAME_STATES } from '../../../shared/gameStates.js';

/**
 * BotManager - Verwaltet Bot-Spieler und deren Aktionen
 */
export class BotManager {
  constructor() {
    this.activeBots = new Map(); // playerId -> BotPlayer
  }

  /**
   * Fügt Bot zu Spiel hinzu
   */
  addBotToGame(gameEngine, botName = null) {
    if (gameEngine.players.length >= 4) {
      throw new Error('Spiel ist bereits voll');
    }

    const name = botName || BotPlayer.generateBotName();
    const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Erstelle BotPlayer direkt
    const bot = new BotPlayer(botId, name, null);
    
    // Füge Bot zu GameEngine hinzu (als normaler Player)
    gameEngine.players.push(bot);
    
    // Wenn 4 Spieler: Starte Spiel
    if (gameEngine.players.length === 4) {
      gameEngine.startGame();
    }

    this.activeBots.set(botId, bot);

    return bot;
  }

  /**
   * Prüft ob Bot am Zug ist und führt Aktion aus
   */
  async handleBotTurn(gameEngine, round) {
    if (!round || !gameEngine) return;

    const currentPlayerIndex = round.currentPlayerIndex;
    const currentPlayer = gameEngine.players[currentPlayerIndex];

    if (!currentPlayer) return;

    const bot = this.activeBots.get(currentPlayer.id);
    if (!bot || !bot.isBot) return;

    // Warte 2-3 Sekunden für natürliches Spielen
    await bot.delay();

    try {
      const decision = await bot.makeDecision(gameEngine, round);

      console.log(`🤖 ${bot.botName} entscheidet: ${decision.action}`, decision.reasoning);

      // Führe Aktion aus
      switch (decision.action) {
        case 'play':
          if (decision.cardIds && decision.cardIds.length > 0) {
            // Validiere dass Bot diese Karten hat
            const validCardIds = decision.cardIds.filter(id => 
              currentPlayer.hand.some(c => c.id === id)
            );
            if (validCardIds.length > 0) {
              gameEngine.playCards(currentPlayer.id, validCardIds);
            } else {
              gameEngine.pass(currentPlayer.id);
            }
          } else {
            gameEngine.pass(currentPlayer.id);
          }
          break;

        case 'pass':
          gameEngine.pass(currentPlayer.id);
          break;

        case 'bomb':
          if (decision.cardIds && decision.cardIds.length > 0) {
            const validCardIds = decision.cardIds.filter(id => 
              currentPlayer.hand.some(c => c.id === id)
            );
            if (validCardIds.length > 0) {
              gameEngine.playBomb(currentPlayer.id, validCardIds);
            }
          }
          break;

        case 'call_tichu':
          if (!currentPlayer.tichuCalled && round.state === GAME_STATES.PLAYING) {
            currentPlayer.tichuCalled = true;
          }
          gameEngine.pass(currentPlayer.id);
          break;

        case 'call_grand_tichu':
          if (!currentPlayer.grandTichuCalled && round.state === GAME_STATES.DEALING_REMAINING_6) {
            gameEngine.setGrandTichu(currentPlayer.id, true);
          }
          break;

        case 'make_wish':
          if (decision.wishValue && decision.wishValue >= 2 && decision.wishValue <= 14) {
            gameEngine.makeWish(currentPlayer.id, decision.wishValue);
          }
          gameEngine.pass(currentPlayer.id);
          break;

        case 'exchange':
          if (decision.cardIds && decision.cardIds.length === 3) {
            const validCardIds = decision.cardIds.filter(id => 
              currentPlayer.hand.some(c => c.id === id)
            );
            if (validCardIds.length === 3) {
              gameEngine.setExchangeCards(currentPlayer.id, validCardIds);
            }
          }
          break;

        default:
          gameEngine.pass(currentPlayer.id);
      }
    } catch (error) {
      console.error(`Bot ${bot.botName} Fehler:`, error);
      gameEngine.pass(currentPlayer.id);
    }
  }

  /**
   * Behandelt Bot-Aktionen für verschiedene Game States
   */
  async handleBotAction(gameEngine, round) {
    if (!round || !gameEngine) return;

    // Grand Tichu Entscheidung
    if (round.state === GAME_STATES.DEALING_REMAINING_6) {
      for (const player of gameEngine.players) {
        const bot = this.activeBots.get(player.id);
        if (bot && bot.isBot && !player.grandTichuCalled && !round.grandTichuDecisions[player.id]) {
          await bot.delay();
          const decision = await bot.makeDecision(gameEngine, round);
          if (decision.action === 'call_grand_tichu') {
            gameEngine.setGrandTichu(player.id, true);
          } else {
            gameEngine.setGrandTichu(player.id, false);
          }
        }
      }
    }

    // Card Exchange
    if (round.state === GAME_STATES.CARD_EXCHANGE) {
      for (const player of gameEngine.players) {
        const bot = this.activeBots.get(player.id);
        if (bot && bot.isBot && !player.cardsExchanged) {
          await bot.delay();
          const decision = await bot.makeDecision(gameEngine, round);
          if (decision.action === 'exchange' && decision.cardIds.length === 3) {
            gameEngine.setExchangeCards(player.id, decision.cardIds);
          }
        }
      }
    }

    // Normaler Spielzug
    if (round.state === GAME_STATES.PLAYER_TURN || round.state === GAME_STATES.PLAYING) {
      await this.handleBotTurn(gameEngine, round);
    }

    // Bomb Window
    if (round.state === GAME_STATES.BOMB_WINDOW) {
      // Bots können auch im Bomb-Fenster Bomben spielen
      for (const player of gameEngine.players) {
        const bot = this.activeBots.get(player.id);
        if (bot && bot.isBot) {
          await bot.delay();
          const decision = await bot.makeDecision(gameEngine, round);
          if (decision.action === 'bomb' && decision.cardIds.length > 0) {
            const validCardIds = decision.cardIds.filter(id => 
              player.hand.some(c => c.id === id)
            );
            if (validCardIds.length > 0) {
              gameEngine.playBomb(player.id, validCardIds);
              break; // Nur eine Bombe pro Fenster
            }
          }
        }
      }
    }
  }

  /**
   * Entfernt Bot
   */
  removeBot(playerId) {
    this.activeBots.delete(playerId);
  }
}
