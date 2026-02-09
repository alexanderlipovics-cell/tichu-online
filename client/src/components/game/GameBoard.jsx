import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { GAME_STATES } from '../../../shared/gameStates.js';
import { PlayerHand } from './PlayerHand.jsx';
import { PlayArea } from './PlayArea.jsx';
import { ActionBar } from './ActionBar.jsx';
import { TichuCallButton } from './TichuCallButton.jsx';
import { CardExchange } from './CardExchange.jsx';
import { BombOverlay } from './BombOverlay.jsx';
import { OpponentHand } from './OpponentHand.jsx';
import { ScoreBoard } from './ScoreBoard.jsx';
import { RoundSummary } from './RoundSummary.jsx';

/**
 * GameBoard - Hauptspielfeld (Mobile-optimiert)
 */
export function GameBoard() {
  const { gameState, currentPlayerId, playCards, pass, playBomb, callTichu, callGrandTichu, roundResult } = useGame();
  const [selectedCards, setSelectedCards] = useState([]);
  const [showBombOverlay, setShowBombOverlay] = useState(false);

  // Prüfe Bomb Window
  useEffect(() => {
    if (gameState?.round?.bombWindowOpen) {
      setShowBombOverlay(true);
    } else {
      setShowBombOverlay(false);
    }
  }, [gameState?.round?.bombWindowOpen]);

  // Prüfe Round End
  useEffect(() => {
    if (gameState?.state === GAME_STATES.ROUND_END) {
      // RoundResult wird vom Server gesendet
    }
  }, [gameState?.state]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <p className="text-white text-xl">Warte auf Spielstart...</p>
      </div>
    );
  }

  // Finde eigenen Spieler und Position
  const currentPlayer = gameState.players?.find(p => p.id === currentPlayerId);
  const currentPlayerIndex = gameState.players?.findIndex(p => p.id === currentPlayerId);
  const hand = currentPlayer?.hand || [];
  const isMyTurn = gameState.round?.currentPlayerIndex === currentPlayerIndex;

  // Finde andere Spieler (für OpponentHand)
  const rightPlayer = gameState.players?.[(currentPlayerIndex + 1) % 4];
  const topPlayer = gameState.players?.[(currentPlayerIndex + 2) % 4]; // Partner
  const leftPlayer = gameState.players?.[(currentPlayerIndex + 3) % 4];

  const handlePlay = () => {
    if (selectedCards.length === 0) return;
    playCards(selectedCards);
    setSelectedCards([]);
  };

  const handlePass = () => {
    pass();
  };

  const handleBomb = () => {
    playBomb(selectedCards);
    setSelectedCards([]);
    setShowBombOverlay(false);
  };

  const handleBombOverlayClose = () => {
    setShowBombOverlay(false);
  };

  // Card Exchange Phase
  if (gameState.state === GAME_STATES.CARD_EXCHANGE) {
    return <CardExchange hand={hand} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-2 md:p-4">
      <div className="max-w-7xl mx-auto relative">
        {/* Mobile Header */}
        <div className="text-center mb-2 md:mb-4">
          <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">🃏 Tichu</h1>
          <p className="text-xs md:text-sm text-gray-300">
            Runde {gameState.roundNumber || 1} | 
            {isMyTurn ? ' 🎯 Du bist dran!' : ' ⏳ Warte...'}
          </p>
        </div>

        {/* Game Area - Relative für Opponent Hands */}
        <div className="relative bg-gray-800/30 rounded-lg p-2 md:p-4 mb-2 md:mb-4 min-h-[300px] md:min-h-[400px]">
          {/* Opponent Hands - Positionen */}
          {rightPlayer && (
            <OpponentHand player={rightPlayer} position="right" />
          )}
          {topPlayer && (
            <OpponentHand player={topPlayer} position="top" />
          )}
          {leftPlayer && (
            <OpponentHand player={leftPlayer} position="left" />
          )}

          {/* Center: Play Area */}
          <div className="flex items-center justify-center h-full">
            <div className="w-full max-w-md">
              <PlayArea 
                currentTrick={gameState.round?.currentTrick}
              />
            </div>
          </div>
        </div>

        {/* Score Board - Mobile optimiert */}
        <div className="mb-2 md:mb-4">
          <ScoreBoard 
            teams={gameState.round?.teams} 
            roundNumber={gameState.roundNumber}
          />
        </div>

        {/* Tichu Call Button - Mobile: Bottom Right */}
        <div className="fixed bottom-20 right-4 md:relative md:bottom-auto md:right-auto mb-2 md:mb-4">
          <TichuCallButton
            onCallTichu={() => callTichu(true)}
            onCallGrandTichu={() => callGrandTichu(true)}
            tichuCalled={currentPlayer?.tichuCalled}
            grandTichuCalled={currentPlayer?.grandTichuCalled}
            disabled={!isMyTurn}
          />
        </div>

        {/* Player Hand - Mobile: Bottom */}
        <div className="mb-2 md:mb-4">
          <PlayerHand
            hand={hand}
            selectedCards={selectedCards}
            onCardSelect={setSelectedCards}
            disabled={!isMyTurn}
          />
        </div>

        {/* Action Bar - Mobile: Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto bg-gray-900/95 md:bg-transparent p-2 md:p-0">
          <ActionBar
            selectedCards={selectedCards}
            onPlay={handlePlay}
            onPass={handlePass}
            onBomb={handleBomb}
            canPlay={isMyTurn && selectedCards.length > 0}
            canPass={isMyTurn}
            hasBomb={false} // TODO: Prüfe ob Bombe vorhanden
            disabled={!isMyTurn}
          />
        </div>

        {/* Bomb Overlay */}
        {showBombOverlay && (
          <BombOverlay
            onBomb={handleBomb}
            onClose={handleBombOverlayClose}
            remainingTime={gameState.round?.bombWindowRemaining || 3}
          />
        )}

        {/* Round Summary */}
        {gameState.state === GAME_STATES.ROUND_END && roundResult && (
          <RoundSummary
            roundResult={roundResult}
            onContinue={() => setRoundResult(null)}
          />
        )}
      </div>
    </div>
  );
}

