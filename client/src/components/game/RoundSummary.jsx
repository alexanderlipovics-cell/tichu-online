/**
 * RoundSummary - Rundenende-Übersicht
 */
export function RoundSummary({ roundResult, onContinue }) {
  if (!roundResult) return null;

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          🏁 Runde beendet
        </h2>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-blue-900/50 rounded-lg p-4 text-center">
            <div className="text-white font-bold mb-2">Team 1</div>
            <div className="text-2xl font-bold text-yellow-400">
              {roundResult.team1Score > 0 ? '+' : ''}{roundResult.team1Score}
            </div>
            <div className="text-gray-300 text-sm mt-2">
              Gesamt: {roundResult.team1Total}
            </div>
          </div>

          <div className="bg-red-900/50 rounded-lg p-4 text-center">
            <div className="text-white font-bold mb-2">Team 2</div>
            <div className="text-2xl font-bold text-yellow-400">
              {roundResult.team2Score > 0 ? '+' : ''}{roundResult.team2Score}
            </div>
            <div className="text-gray-300 text-sm mt-2">
              Gesamt: {roundResult.team2Total}
            </div>
          </div>
        </div>

        {roundResult.doubleWin && (
          <div className="bg-yellow-600/50 rounded-lg p-4 mb-6 text-center">
            <p className="text-white font-bold text-lg">
              🎉 Double Win!
            </p>
          </div>
        )}

        {onContinue && (
          <div className="text-center">
            <button
              onClick={onContinue}
              className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg transition-colors"
            >
              Weiter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

