/**
 * TichuCallButton - Tichu/Grand Tichu Button
 */
export function TichuCallButton({ 
  onCallTichu, 
  onCallGrandTichu,
  tichuCalled = false,
  grandTichuCalled = false,
  disabled = false
}) {
  return (
    <div className="flex flex-col gap-2">
      {!grandTichuCalled && (
        <button
          onClick={onCallGrandTichu}
          disabled={disabled || grandTichuCalled}
          className={`
            px-4 py-2 rounded-lg font-bold text-white text-sm
            transition-all duration-200
            ${!disabled && !grandTichuCalled
              ? 'bg-purple-600 hover:bg-purple-700 active:scale-95'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
            }
            ${grandTichuCalled ? 'ring-2 ring-yellow-400' : ''}
          `}
        >
          {grandTichuCalled ? '✓ Grand Tichu' : 'Grand Tichu'}
        </button>
      )}

      {!tichuCalled && (
        <button
          onClick={onCallTichu}
          disabled={disabled || tichuCalled}
          className={`
            px-4 py-2 rounded-lg font-bold text-white text-sm
            transition-all duration-200
            ${!disabled && !tichuCalled
              ? 'bg-blue-600 hover:bg-blue-700 active:scale-95'
              : 'bg-gray-600 cursor-not-allowed opacity-50'
            }
            ${tichuCalled ? 'ring-2 ring-yellow-400' : ''}
          `}
        >
          {tichuCalled ? '✓ Tichu' : 'Tichu'}
        </button>
      )}
    </div>
  );
}

