/**
 * ActionBar - Play/Pass/Bomb Buttons
 */
export function ActionBar({ 
  selectedCards = [], 
  onPlay, 
  onPass, 
  onBomb,
  canPlay = false,
  canPass = false,
  hasBomb = false,
  disabled = false
}) {
  return (
    <div className="flex gap-4 justify-center items-center p-4 bg-gray-900/80 rounded-lg">
      <button
        onClick={onPlay}
        disabled={disabled || !canPlay || selectedCards.length === 0}
        className={`
          px-6 py-3 rounded-lg font-bold text-white
          transition-all duration-200
          ${canPlay && selectedCards.length > 0 && !disabled
            ? 'bg-green-600 hover:bg-green-700 active:scale-95'
            : 'bg-gray-600 cursor-not-allowed opacity-50'
          }
        `}
      >
        Spielen ({selectedCards.length})
      </button>

      <button
        onClick={onPass}
        disabled={disabled || !canPass}
        className={`
          px-6 py-3 rounded-lg font-bold text-white
          transition-all duration-200
          ${canPass && !disabled
            ? 'bg-yellow-600 hover:bg-yellow-700 active:scale-95'
            : 'bg-gray-600 cursor-not-allowed opacity-50'
          }
        `}
      >
        Passen
      </button>

      {hasBomb && (
        <button
          onClick={onBomb}
          disabled={disabled}
          className={`
            px-6 py-3 rounded-lg font-bold text-white
            transition-all duration-200
            ${!disabled
              ? 'bg-red-600 hover:bg-red-700 active:scale-95 animate-pulse'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
            }
          `}
        >
          💣 Bombe
        </button>
      )}
    </div>
  );
}

