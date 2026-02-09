/**
 * OpponentHand - Gegner-Karten (verdeckt)
 */
export function OpponentHand({ player, position = 'right' }) {
  const handSize = player?.handSize || 0;
  const isOut = player?.isOut || false;
  const tichuCalled = player?.tichuCalled || false;
  const grandTichuCalled = player?.grandTichuCalled || false;

  const positionClasses = {
    right: 'absolute right-4 top-1/2 -translate-y-1/2',
    left: 'absolute left-4 top-1/2 -translate-y-1/2',
    top: 'absolute top-4 left-1/2 -translate-x-1/2'
  };

  if (isOut) {
    return (
      <div className={`${positionClasses[position]} text-center`}>
        <div className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold">
          ✓ Raus
        </div>
        <p className="text-white text-sm mt-2">{player?.username}</p>
      </div>
    );
  }

  return (
    <div className={`${positionClasses[position]} text-center`}>
      <div className="mb-2">
        <p className="text-white font-bold text-sm mb-1">{player?.username}</p>
        {(tichuCalled || grandTichuCalled) && (
          <div className="flex gap-1 justify-center mb-2">
            {grandTichuCalled && (
              <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs">
                Grand Tichu
              </span>
            )}
            {tichuCalled && (
              <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs">
                Tichu
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Verdeckte Karten */}
      <div className="flex gap-1 flex-wrap justify-center max-w-[200px]">
        {Array.from({ length: handSize }).map((_, i) => (
          <div
            key={i}
            className="w-8 h-12 md:w-10 md:h-14 bg-blue-900 border-2 border-blue-700 rounded shadow-lg"
          />
        ))}
      </div>
      
      <p className="text-white text-xs mt-2">{handSize} Karten</p>
    </div>
  );
}

