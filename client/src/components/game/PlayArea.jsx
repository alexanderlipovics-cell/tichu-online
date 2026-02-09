import { CardComponent } from './CardComponent.jsx';

/**
 * PlayArea - Mitte - gespielte Karten
 */
export function PlayArea({ currentTrick, lastPlay }) {
  if (!currentTrick || !currentTrick.plays || currentTrick.plays.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-800/30 rounded-lg border-2 border-dashed border-gray-600">
        <p className="text-gray-400 text-lg">Warte auf ersten Zug...</p>
      </div>
    );
  }

  const activePlays = currentTrick.plays.filter(p => !p.passed && p.cardsCount > 0);
  const lastPlayData = activePlays[activePlays.length - 1] || lastPlay;

  return (
    <div className="flex flex-col items-center justify-center h-64 bg-gray-800/30 rounded-lg p-4">
      {lastPlayData && (
        <div className="mb-4">
          <p className="text-white text-sm mb-2">
            Letzter Zug: {lastPlayData.playerId}
          </p>
          <div className="flex gap-2 justify-center">
            {/* Hier würden die gespielten Karten angezeigt */}
            <div className="text-white">
              {lastPlayData.cardsCount} Karte(n) gespielt
            </div>
          </div>
        </div>
      )}
      
      <div className="text-gray-400 text-sm">
        {activePlays.length} / 4 Spielzüge
      </div>
    </div>
  );
}

