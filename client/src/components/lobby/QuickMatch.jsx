import { useState, useEffect } from 'react';
import { useSocket } from '../../contexts/SocketContext.jsx';
import { useGame } from '../../contexts/GameContext.jsx';

/**
 * QuickMatch - Schnelles Matchmaking
 */
export function QuickMatch({ username }) {
  const { socket, connected } = useSocket();
  const { quickMatch } = useGame();
  const [matching, setMatching] = useState(false);
  const [queuePosition, setQueuePosition] = useState(null);

  useEffect(() => {
    if (!socket) return;

    socket.on('quick-match-queued', (data) => {
      setMatching(true);
      setQueuePosition(data.position || 0);
    });

    socket.on('room-joined', () => {
      setMatching(false);
      setQueuePosition(null);
    });

    return () => {
      socket.off('quick-match-queued');
      socket.off('room-joined');
    };
  }, [socket]);

  const handleQuickMatch = () => {
    if (!connected || matching || !username) return;

    const userId = 'user-' + Math.random().toString(36).substr(2, 9);
    setMatching(true);
    quickMatch(userId, username);
  };

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold text-white mb-4">Schnelles Match</h2>
      <p className="text-gray-200 mb-6">
        Finde sofort 3 andere Spieler und starte ein Spiel!
      </p>
      
      {matching ? (
        <div className="space-y-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
          <p className="text-white text-lg">
            Suche nach Spielern...
            {queuePosition !== null && queuePosition > 0 && (
              <span className="block text-sm text-gray-300 mt-2">
                Position in Warteschlange: {queuePosition}
              </span>
            )}
          </p>
        </div>
      ) : (
        <button
          onClick={handleQuickMatch}
          disabled={!connected || !username}
          className={`
            px-8 py-4 text-xl font-bold rounded-lg
            transition-all duration-200
            ${connected && username
              ? 'bg-green-600 hover:bg-green-700 text-white active:scale-95'
              : 'bg-gray-600 text-gray-300 cursor-not-allowed'
            }
          `}
        >
          🎮 Quick Match starten
        </button>
      )}
    </div>
  );
}

