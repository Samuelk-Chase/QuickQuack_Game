import React, { useEffect, useState } from 'react';

interface Space {
  id: number;
  type: 'normal' | 'prize' | 'special';
  description: string;
  x: number;
  y: number;
  funEffect?: string;
}

interface BoardGameProps {
  currentPosition: number;
  playerName: string;
  numSpaces?: number;
  playerCharacter: string;
}

// Custom board layout from text grid
const BOARD_TEXT = `
1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
2 3 4 5 6 7 8 0 0 0 0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 9 0 0 0 0 0 0 0 19 20 21 22 0 0
0 0 0 0 0 0 10 11 12 13 14 15 16 17 18 0 0 23 0 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 24 0 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 26 25 0 0
43 42 41 40 39 38 37 36 35 34 33 32 31 30 29 28 27 0 0 0
44 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
45 0 0 0 0 0 0 0 0 0 0 68 69 70 71 72 0 0 0 0
46 0 0 59 60 61 62 63 64 65 66 67 0 0 0 73 0 0 0 0
47 0 0 58 0 0 0 0 0 0 0 0 0 0 0 74 75 0 0 0
47 0 0 57 0 0 0 0 0 0 0 0 0 0 0 0 76 0 0 0
49 50 0 56 0 0 0 0 0 0 0 0 0 0 78 77 0 0 0 0
0 51 0 55 0 0 0 0 0 0 0 83 82 81 80 79 0 0 0 0
0 52 53 54 0 0 0 0 0 86 85 84 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 87 0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 88 0 0 0 0 0 0 0 0 0 0
0 0 96 95 94 93 92 91 80 89 0 0 0 0 0 0 0 0 0 0
0 0 97 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
0 0 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 0`;

function parseBoardText(boardText: string): { x: number; y: number }[] {
  const lines = boardText.trim().split('\n');
  const coords: { x: number; y: number }[] = [];
  
  // First pass: collect all coordinates in order of appearance
  for (let y = 0; y < lines.length; y++) {
    const numbers = lines[y].trim().split(/\s+/);
    for (let x = 0; x < numbers.length; x++) {
      if (numbers[x] !== '0') {
        coords.push({ x, y });
      }
    }
  }
  
  return coords;
}

// Function to calculate distance between two points
function calculateDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

// Function to find the next space in the path
function findNextSpace(currentSpace: Space | undefined, allSpaces: Space[]): Space | undefined {
  if (!currentSpace) return allSpaces[0];

  // Find the closest space that hasn't been visited yet
  let closestSpace: Space | undefined;
  let minDistance = Infinity;

  for (const space of allSpaces) {
    // Skip the current space
    if (space.id === currentSpace.id) continue;

    const distance = calculateDistance(currentSpace.x, currentSpace.y, space.x, space.y);
    
    // If this space is closer and hasn't been visited yet
    if (distance < minDistance && space.id > currentSpace.id) {
      minDistance = distance;
      closestSpace = space;
    }
  }

  return closestSpace;
}

const GRID_SIZE = BOARD_TEXT.trim().split('\n')[0].length;

const BoardGame: React.FC<BoardGameProps> = ({ currentPosition, playerName, numSpaces = 50, playerCharacter }) => {
  const [spaces, setSpaces] = useState<Space[] | null>(null);
  const [currentSpace, setCurrentSpace] = useState<Space | undefined>();

  useEffect(() => {
    // Use the custom board layout
    const pathCoords = parseBoardText(BOARD_TEXT);
    const newSpaces: Space[] = pathCoords.map(({ x, y }, i) => {
      const id = i + 1;
      let type: 'normal' | 'prize' | 'special' = 'normal';
      let description = '';
      let funEffect: 'sparkle' | 'butterfly' | 'ripple' | 'duck' | null = null;
      
      // Add special spaces along the path
      if (id % 10 === 0) {
        type = 'prize';
        description = '🦆 Golden Duck!';
        funEffect = 'sparkle';
      } else if (id % 7 === 0) {
        type = 'special';
        description = '🦢 Swan Surprise!';
        funEffect = 'butterfly';
      } else if (id % 13 === 0) {
        funEffect = 'ripple';
      } else if (id % 9 === 0) {
        funEffect = 'duck';
      }
      
      return { id, type, description, x, y, funEffect } as Space & { funEffect?: string };
    });
    setSpaces(newSpaces);
  }, []);

  // Update current space when currentPosition changes
  useEffect(() => {
    if (spaces) {
      const space = spaces.find(s => s.id === currentPosition);
      if (space) {
        setCurrentSpace(space);
      }
    }
  }, [currentPosition, spaces]);

  if (!spaces) {
    return <div className="flex items-center justify-center h-64 text-xl">Loading duck map...</div>;
  }

  // Create a lookup for quick access
  const spaceLookup = new Map(spaces.map((s) => [`${s.x},${s.y}`, s]));

  return (
    <div
      className="overflow-visible p-2 bg-transparent flex flex-col items-center mx-auto ml-32"
      style={{ width: `${GRID_SIZE * 3}rem`, maxWidth: '100%' }}
    >
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <span>🦆</span> Duck Adventure Map <span>🦆</span>
        </h2>
        <p className="text-lg mt-2">Player: <span className="font-bold">{playerName}</span></p>
        <p className="text-md">Current Position: <span className="font-bold">{currentPosition}</span></p>
      </div>
      <div
        className="grid mx-auto"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 2rem)`,
          width: `${GRID_SIZE * 2}rem`,
          height: `${GRID_SIZE * 2}rem`,
          padding: 0,
          marginBottom: 0
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, idx) => {
          const x = idx % GRID_SIZE;
          const y = Math.floor(idx / GRID_SIZE);
          const space = spaceLookup.get(`${x},${y}`);
          if (space) {
            const isPlayer = space.id === currentPosition;
            let bg = 'bg-yellow-100';
            let border = 'border-black';
            let effect = null;
            if (space.type === 'prize') {
              bg = 'bg-yellow-300';
              border = 'border-black';
            } else if (space.type === 'special') {
              bg = 'bg-blue-200';
              border = 'border-black';
            }
            if (isPlayer) {
              bg = 'bg-green-300 animate-bounce';
              border = 'border-black';
            }
            // Fun effects
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
                key={idx}
                className={`w-8 h-8 flex flex-col items-center justify-center shadow-md text-xs relative overflow-hidden bg-transparent`}
                title={space.description || undefined}
              >
                <img src="/Lillypad.png" alt="Lillypad" className="w-full h-full object-contain" />
                {isPlayer && <span className="absolute top-0 left-0 right-0 text-center text-lg animate-bounce">{playerCharacter}</span>}
                {overlay}
              </div>
            );
          } else {
            // Make empty cells fully transparent
            return (
              <div
                key={idx}
                className="w-8 h-8 bg-transparent"
              />
            );
          }
        })}
      </div>
      <div className="text-center text-lg font-bold text-yellow-700">
        🏁 Finish Line at Space {spaces.length}! Good luck, duck!
      </div>
    </div>
  );
};

export default BoardGame; 