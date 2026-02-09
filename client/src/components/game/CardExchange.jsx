import { useState, useEffect } from 'react';
import { useGame } from '../../contexts/GameContext.jsx';
import { PlayerHand } from './PlayerHand.jsx';

/**
 * CardExchange - Kartentausch-Phase
 */
export function CardExchange({ hand = [] }) {
  const { exchangeCards, gameState } = useGame();
  const [selectedCards, setSelectedCards] = useState([]);
  const [exchanged, setExchanged] = useState(false);

  // Prüfe ob Exchange bereits abgeschlossen
  useEffect(() => {
    const currentPlayer = gameState?.players?.find(p => p.cardsExchanged);
    if (currentPlayer) {
      setExchanged(true);
    }
  }, [gameState]);

  const handleExchange = () => {
    if (selectedCards.length !== 3) {
      alert('Bitte wähle genau 3 Karten zum Tauschen aus');
      return;
    }

    exchangeCards(selectedCards);
    setExchanged(true);
  };

  if (exchanged) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-white mb-4">
            Karten getauscht! ✓
          </h2>
          <p className="text-gray-300">
            Warte auf andere Spieler...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-4 text-center">
          Kartentausch
        </h2>
        <p className="text-gray-300 text-center mb-6">
          Wähle genau 3 Karten aus, die du an deinen Partner geben möchtest
        </p>

        <div className="mb-6">
          <PlayerHand
            hand={hand}
            selectedCards={selectedCards}
            onCardSelect={setSelectedCards}
            disabled={exchanged}
          />
        </div>

        <div className="flex justify-center gap-4">
          <div className="text-white text-center">
            <p className="text-2xl font-bold">{selectedCards.length} / 3</p>
            <p className="text-sm text-gray-400">Karten ausgewählt</p>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={handleExchange}
            disabled={selectedCards.length !== 3 || exchanged}
            className={`
              px-8 py-3 rounded-lg font-bold text-white
              transition-all duration-200
              ${selectedCards.length === 3 && !exchanged
                ? 'bg-green-600 hover:bg-green-700 active:scale-95'
                : 'bg-gray-600 cursor-not-allowed opacity-50'
              }
            `}
          >
            {selectedCards.length === 3 ? 'Karten tauschen' : 'Wähle 3 Karten'}
          </button>
        </div>
      </div>
    </div>
  );
}

