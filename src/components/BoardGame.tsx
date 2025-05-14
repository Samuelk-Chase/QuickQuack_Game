import React from 'react';

interface Space {
  id: number;
  type: 'normal' | 'prize' | 'special';
  description: string;
}

interface BoardGameProps {
  currentPosition: number;
  playerName: string;
}

const BoardGame: React.FC<BoardGameProps> = ({ currentPosition, playerName }) => {
  // Create 30 spaces with some special spaces
  const spaces: Space[] = Array.from({ length: 30 }, (_, i) => {
    const id = i + 1;
    let type: 'normal' | 'prize' | 'special' = 'normal';
    let description = '';

    // Add some special spaces
    if (id === 5 || id === 15 || id === 25) {
      type = 'prize';
      description = '🎁 Prize Space!';
    } else if (id === 10 || id === 20) {
      type = 'special';
      description = '⭐ Special Space!';
    }

    return { id, type, description };
  });

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold">Player: {playerName}</h2>
        <p className="text-lg">Current Position: {currentPosition}</p>
      </div>
      <div className="grid grid-cols-6 gap-2">
        {spaces.map((space) => (
          <div
            key={space.id}
            className={`p-4 rounded-lg border ${
              space.id === currentPosition
                ? 'bg-blue-500 text-white'
                : space.type === 'prize'
                ? 'bg-green-200'
                : space.type === 'special'
                ? 'bg-yellow-200'
                : 'bg-gray-100'
            }`}
          >
            <div className="text-center">
              <div className="font-bold">{space.id}</div>
              {space.description && (
                <div className="text-sm mt-1">{space.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BoardGame; 