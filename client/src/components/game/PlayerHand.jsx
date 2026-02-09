import { useState } from 'react';
import { CardComponent } from './CardComponent.jsx';

/**
 * PlayerHand - Eigene Karten (unten)
 */
export function PlayerHand({ hand = [], onCardSelect, selectedCards = [], disabled = false }) {
  const [localSelected, setLocalSelected] = useState(new Set(selectedCards));

  const handleCardClick = (cardId) => {
    if (disabled) return;

    const newSelected = new Set(localSelected);
    if (newSelected.has(cardId)) {
      newSelected.delete(cardId);
    } else {
      newSelected.add(cardId);
    }
    setLocalSelected(newSelected);
    
    if (onCardSelect) {
      onCardSelect(Array.from(newSelected));
    }
  };

  if (!hand || hand.length === 0) {
    return (
      <div className="flex justify-center items-center h-32 bg-gray-800/50 rounded-lg">
        <p className="text-gray-400">Keine Karten</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap justify-center gap-2 p-4 bg-gray-900/80 rounded-lg min-h-[140px]">
      {hand.map((card) => (
        <CardComponent
          key={card.id}
          card={card}
          selected={localSelected.has(card.id)}
          onClick={() => handleCardClick(card.id)}
          disabled={disabled}
        />
      ))}
    </div>
  );
}

