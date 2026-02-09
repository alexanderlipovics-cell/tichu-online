/**
 * ScoreBoard - Punktestand
 */
export function ScoreBoard({ teams = [], roundNumber = 1 }) {
  if (!teams || teams.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-800/80 rounded-lg p-4">
      <h3 className="text-white font-bold mb-3 text-center">
        Runde {roundNumber} - Punktestand
      </h3>
      <div className="grid grid-cols-2 gap-4">
        {teams.map((team, idx) => (
          <div
            key={idx}
            className={`
              p-4 rounded-lg text-center
              ${idx === 0 ? 'bg-blue-900/50' : 'bg-red-900/50'}
            `}
          >
            <div className="text-white font-bold text-lg mb-1">
              Team {team.teamNumber}
            </div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">
              {team.score}
            </div>
            <div className="text-gray-300 text-sm">
              {team.players?.map(p => p.username).join(' & ') || 'Spieler'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

