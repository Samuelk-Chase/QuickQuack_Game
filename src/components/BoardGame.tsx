import React, { useEffect, useState } from 'react';

interface Space {
  id: number;
  type: 'normal' | 'prize' | 'special';
  description: string;
  funEffect?: string;
  next?: Space;
}

interface BoardGameProps {
  currentPosition: number;
  playerName: string;
  numSpaces?: number;
  playerCharacter: string;
}

// Define the path as a simple array of space configurations
const SPACE_CONFIGS = [
  // Start with a small spiral
  { id: 1, type: 'normal' as const },
  { id: 2, type: 'normal' as const },
  { id: 3, type: 'normal' as const },
  { id: 4, type: 'normal' as const },
  { id: 5, type: 'normal' as const },
  { id: 6, type: 'normal' as const },
  { id: 7, type: 'normal' as const },
  { id: 8, type: 'normal' as const },
  { id: 9, type: 'normal' as const },
  { id: 10, type: 'prize' as const, description: '🦆 First Golden Duck!', funEffect: 'sparkle' },
  { id: 11, type: 'normal' as const },
  { id: 12, type: 'normal' as const },
  { id: 13, type: 'normal' as const },
  { id: 14, type: 'special' as const, description: '🦢 Swan Surprise!', funEffect: 'butterfly' },
  { id: 15, type: 'normal' as const },
  { id: 16, type: 'normal' as const },
  { id: 17, type: 'normal' as const },
  { id: 18, type: 'normal' as const },
  { id: 19, type: 'normal' as const },
  { id: 20, type: 'prize' as const, description: '🦆 Second Golden Duck!', funEffect: 'sparkle' },
  { id: 21, type: 'normal' as const },
  { id: 22, type: 'normal' as const },
  { id: 23, type: 'normal' as const },
  { id: 24, type: 'normal' as const },
  { id: 25, type: 'special' as const, description: '🌊 Water Ripple!', funEffect: 'ripple' },
  { id: 26, type: 'normal' as const },
  { id: 27, type: 'normal' as const },
  { id: 28, type: 'normal' as const },
  { id: 29, type: 'normal' as const },
  { id: 30, type: 'prize' as const, description: '🦆 Third Golden Duck!', funEffect: 'sparkle' },
  { id: 31, type: 'normal' as const },
  { id: 32, type: 'normal' as const },
  { id: 33, type: 'normal' as const },
  { id: 34, type: 'normal' as const },
  { id: 35, type: 'special' as const, description: '🦋 Butterfly Garden!', funEffect: 'butterfly' },
  { id: 36, type: 'normal' as const },
  { id: 37, type: 'normal' as const },
  { id: 38, type: 'normal' as const },
  { id: 39, type: 'normal' as const },
  { id: 40, type: 'prize' as const, description: '🦆 Fourth Golden Duck!', funEffect: 'sparkle' },
  { id: 41, type: 'normal' as const },
  { id: 42, type: 'normal' as const },
  { id: 43, type: 'normal' as const },
  { id: 44, type: 'normal' as const },
  { id: 45, type: 'special' as const, description: '🦆 Duck Parade!', funEffect: 'duck' },
  { id: 46, type: 'normal' as const },
  { id: 47, type: 'normal' as const },
  { id: 48, type: 'normal' as const },
  { id: 49, type: 'normal' as const },
  { id: 50, type: 'prize' as const, description: '🦆 Fifth Golden Duck!', funEffect: 'sparkle' },
  { id: 51, type: 'normal' as const },
  { id: 52, type: 'normal' as const },
  { id: 53, type: 'normal' as const },
  { id: 54, type: 'normal' as const },
  { id: 55, type: 'special' as const, description: '🌊 Big Splash!', funEffect: 'ripple' },
  { id: 56, type: 'normal' as const },
  { id: 57, type: 'normal' as const },
  { id: 58, type: 'normal' as const },
  { id: 59, type: 'normal' as const },
  { id: 60, type: 'prize' as const, description: '🦆 Sixth Golden Duck!', funEffect: 'sparkle' },
  { id: 61, type: 'normal' as const },
  { id: 62, type: 'normal' as const },
  { id: 63, type: 'normal' as const },
  { id: 64, type: 'normal' as const },
  { id: 65, type: 'special' as const, description: '🦋 Butterfly Dance!', funEffect: 'butterfly' },
  { id: 66, type: 'normal' as const },
  { id: 67, type: 'normal' as const },
  { id: 68, type: 'normal' as const },
  { id: 69, type: 'normal' as const },
  { id: 70, type: 'prize' as const, description: '🦆 Seventh Golden Duck!', funEffect: 'sparkle' },
  { id: 71, type: 'normal' as const },
  { id: 72, type: 'normal' as const },
  { id: 73, type: 'normal' as const },
  { id: 74, type: 'normal' as const },
  { id: 75, type: 'special' as const, description: '🦆 Duck Family!', funEffect: 'duck' },
  { id: 76, type: 'normal' as const },
  { id: 77, type: 'normal' as const },
  { id: 78, type: 'normal' as const },
  { id: 79, type: 'normal' as const },
  { id: 80, type: 'prize' as const, description: '🦆 Eighth Golden Duck!', funEffect: 'sparkle' },
  { id: 81, type: 'normal' as const },
  { id: 82, type: 'normal' as const },
  { id: 83, type: 'normal' as const },
  { id: 84, type: 'normal' as const },
  { id: 85, type: 'special' as const, description: '🌊 Waterfall!', funEffect: 'ripple' },
  { id: 86, type: 'normal' as const },
  { id: 87, type: 'normal' as const },
  { id: 88, type: 'normal' as const },
  { id: 89, type: 'normal' as const },
  { id: 90, type: 'prize' as const, description: '🦆 Ninth Golden Duck!', funEffect: 'sparkle' },
  { id: 91, type: 'normal' as const },
  { id: 92, type: 'normal' as const },
  { id: 93, type: 'normal' as const },
  { id: 94, type: 'normal' as const },
  { id: 95, type: 'special' as const, description: '🦋 Final Butterfly!', funEffect: 'butterfly' },
  { id: 96, type: 'normal' as const },
  { id: 97, type: 'normal' as const },
  { id: 98, type: 'normal' as const },
  { id: 99, type: 'normal' as const },
  { id: 100, type: 'prize' as const, description: '🏆 Final Golden Duck!', funEffect: 'sparkle' }
];

// Create a linked list of spaces
function createSpaceList(configs: typeof SPACE_CONFIGS): Space[] {
  const spaces: Space[] = configs.map(config => ({
    ...config,
    description: config.description || '',
  }));

  // Link the spaces together
  for (let i = 0; i < spaces.length - 1; i++) {
    spaces[i].next = spaces[i + 1];
  }

  return spaces;
}

// Function to calculate position in a spiral pattern
function calculateSpiralPosition(index: number, totalSpaces: number) {
  const centerX = 10;
  const centerY = 10;
  const maxRadius = 12;
  const minRadius = 5;
  const angleStep = (2 * Math.PI) / (totalSpaces / 2.5);
  
  // Start from the outside by reversing the index
  const reversedIndex = totalSpaces - 1 - index;
  const angle = reversedIndex * angleStep;
  
  // Simple linear distance calculation for consistent spacing
  const progress = reversedIndex / totalSpaces;
  const distance = minRadius + (progress * (maxRadius - minRadius));
  
  const x = centerX + Math.cos(angle) * distance;
  const y = centerY + Math.sin(angle) * distance;
  
  return { x, y };
}

const BoardGame: React.FC<BoardGameProps> = ({ currentPosition, playerName, numSpaces = 50, playerCharacter }) => {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [currentSpace, setCurrentSpace] = useState<Space | undefined>();

  useEffect(() => {
    const spaceList = createSpaceList(SPACE_CONFIGS);
    setSpaces(spaceList);
  }, []);

  useEffect(() => {
    if (spaces.length > 0) {
      const space = spaces.find(s => s.id === currentPosition);
      if (space) {
        setCurrentSpace(space);
      }
    }
  }, [currentPosition, spaces]);

  if (spaces.length === 0) {
    return <div className="flex items-center justify-center h-64 text-xl">Loading duck map...</div>;
  }

  return (
    <div className="overflow-visible p-2 bg-transparent flex flex-col items-center mx-auto">
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <span>🦆</span> Duck Adventure Map <span>🦆</span>
        </h2>
        <p className="text-lg mt-2">Player: <span className="font-bold">{playerName}</span></p>
        <p className="text-md">Current Position: <span className="font-bold">{currentPosition}</span></p>
      </div>
      
      <div className="relative" style={{ width: '700px', height: '700px' }}>
        {spaces.map((space, index) => {
          const position = calculateSpiralPosition(index, spaces.length);
          const isPlayer = space.id === currentPosition;
          let border = 'border-transparent';
          
          if (isPlayer) {
            border = 'border-green-300';
          }

          let overlay = null;
          if (space.funEffect === 'sparkle') {
            overlay = <span className="absolute top-0 right-0 animate-pulse text-yellow-400 text-lg">✨</span>;
          } else if (space.funEffect === 'butterfly') {
            overlay = <span className="absolute bottom-0 left-0 animate-bounce text-pink-400 text-lg">🦋</span>;
          } else if (space.funEffect === 'ripple') {
            overlay = <span className="absolute inset-0 flex items-center justify-center animate-ping text-blue-300 text-lg">◯</span>;
          } else if (space.funEffect === 'duck') {
            overlay = <span className="absolute inset-0 flex items-center justify-center text-2xl">🦆</span>;
          }

          return (
            <div
              key={space.id}
              style={{
                position: 'absolute',
                left: `${position.x * 35}px`,
                top: `${position.y * 35}px`,
                transform: 'translate(-50%, -50%)',
              }}
              className={`w-12 h-12 flex flex-col items-center justify-center shadow-md text-xs relative overflow-hidden ${border} border-2 rounded-lg transform hover:scale-110 transition-transform duration-200`}
              title={space.description || undefined}
            >
              <img src="/Lillypad.png" alt="Lillypad" className="w-full h-full object-contain" />
              <span className="absolute top-0 left-0 text-xs font-bold">{space.id}</span>
              {isPlayer && <span className="absolute top-0 left-0 right-0 text-center text-lg animate-bounce">{playerCharacter}</span>}
              {overlay}
            </div>
          );
        })}
      </div>
      
      <div className="text-center text-lg font-bold text-yellow-700 mt-4">
        🏁 Finish Line at Space 100! Good luck, duck!
      </div>
    </div>
  );
};

export default BoardGame; 