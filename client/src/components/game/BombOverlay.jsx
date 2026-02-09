import { useState, useEffect } from 'react';

/**
 * BombOverlay - Bomb-Intervention (3 Sek Timer)
 */
export function BombOverlay({ onBomb, onClose, remainingTime = 3 }) {
  const [timeLeft, setTimeLeft] = useState(remainingTime);

  useEffect(() => {
    if (timeLeft <= 0) {
      onClose();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 0.1) {
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [timeLeft, onClose]);

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-red-900/90 rounded-lg p-8 text-center max-w-md animate-pulse">
        <div className="text-6xl mb-4">💣</div>
        <h2 className="text-3xl font-bold text-white mb-4">
          BOMBEN-FENSTER
        </h2>
        <div className="text-5xl font-bold text-yellow-400 mb-6">
          {Math.ceil(timeLeft)}s
        </div>
        <p className="text-gray-200 mb-6">
          Du kannst jetzt eine Bombe spielen!
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={onBomb}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
          >
            💣 Bombe spielen
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition-colors"
          >
            Überspringen
          </button>
        </div>
      </div>
    </div>
  );
}

