import { useState } from 'react';

/**
 * CardComponent - Einzelne Karte
 */
export function CardComponent({ card, selected = false, onClick, disabled = false }) {
  const [isHovered, setIsHovered] = useState(false);

  if (!card) return null;

  const isSpecial = card.isSpecial || !card.suit;
  const cardClass = `
    relative w-16 h-24 md:w-20 md:h-28
    rounded-lg shadow-lg
    transition-all duration-200
    cursor-pointer
    ${selected ? 'transform -translate-y-4 scale-110 z-10' : ''}
    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
    ${isHovered && !disabled ? 'transform scale-105' : ''}
  `;

  const getCardColor = () => {
    if (isSpecial) {
      if (card.value === 'dragon') return 'bg-red-600';
      if (card.value === 'phoenix') return 'bg-orange-500';
      if (card.value === 'dog') return 'bg-gray-600';
      if (card.value === 'mahjong') return 'bg-yellow-500';
      return 'bg-gray-800';
    }

    switch (card.suit) {
      case 'jade': return 'bg-green-600';
      case 'sword': return 'bg-red-600';
      case 'pagoda': return 'bg-blue-600';
      case 'star': return 'bg-yellow-500';
      default: return 'bg-gray-800';
    }
  };

  const getCardSymbol = () => {
    if (isSpecial) {
      if (card.value === 'dragon') return '🐉';
      if (card.value === 'phoenix') return '🔥';
      if (card.value === 'dog') return '🐕';
      if (card.value === 'mahjong') return '🀄';
      return '?';
    }

    switch (card.suit) {
      case 'jade': return '🟢';
      case 'sword': return '⚔️';
      case 'pagoda': return '🏛️';
      case 'star': return '⭐';
      default: return '?';
    }
  };

  const getCardValue = () => {
    if (isSpecial) {
      return card.value.toUpperCase();
    }
    if (card.value === 11) return 'J';
    if (card.value === 12) return 'Q';
    if (card.value === 13) return 'K';
    if (card.value === 14) return 'A';
    return card.value;
  };

  return (
    <div
      className={`${cardClass} ${getCardColor()} text-white`}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
        <div className="text-2xl mb-1">{getCardSymbol()}</div>
        <div className="text-lg font-bold">{getCardValue()}</div>
      </div>
      {selected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs">✓</span>
        </div>
      )}
    </div>
  );
}

