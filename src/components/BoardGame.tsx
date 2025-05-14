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
  numSpaces?: number; // Allow variable number of spaces
}

// Custom board layout from text grid
const BOARD_TEXT = `
1000000000000000000
1111111000000000000
0000001000000011110
0000001111111110010
0000000000000000010
1111000000000000110
1001111111111111100
1000000000000000000
1000000000011111000
1001111111110001000
1001000000000001100
1001000000000000100
110100000000001100
0101000000011111000
0111000001110000000
0000000001000000000
0000000001000000000
0011111111000000000
0010000000000000000
0011111111111111111`;

function parseBoardText(boardText: string): { x: number; y: number }[] {
  const lines = boardText.trim().split('\n');
  const coords: { x: number; y: number }[] = [];
  for (let y = 0; y < lines.length; y++) {
    for (let x = 0; x < lines[y].length; x++) {
      if (lines[y][x] === '1') {
        coords.push({ x, y });
      }
    }
  }
  return coords;
}

const GRID_SIZE = BOARD_TEXT.trim().split('\n')[0].length;

const BoardGame: React.FC<BoardGameProps> = ({ currentPosition, playerName, numSpaces = 50 }) => {
  const [spaces, setSpaces] = useState<Space[] | null>(null);

  useEffect(() => {
    // Use the custom board layout
    const pathCoords = parseBoardText(BOARD_TEXT);
    const newSpaces: Space[] = pathCoords.map(({ x, y }, i) => {
      const id = i + 1;
      let type: 'normal' | 'prize' | 'special' = 'normal';
      let description = '';
      // Add more fun: randomly assign special effects
      let funEffect: 'sparkle' | 'butterfly' | 'ripple' | 'duck' | null = null;
      if (id === 5 || id === 15 || id === 25) {
        type = 'prize';
        description = '🦆 Golden Duck!';
        funEffect = 'sparkle';
      } else if (id === 10 || id === 20) {
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

  if (!spaces) {
    return <div className="flex items-center justify-center h-64 text-xl">Loading duck map...</div>;
  }

  // Create a lookup for quick access
  const spaceLookup = new Map(spaces.map((s) => [`${s.x},${s.y}`, s]));

  return (
    <div
      className="overflow-auto max-h-[80vh] max-w-[80vw] p-2 bg-transparent"
      style={{ width: `${GRID_SIZE * 3}rem`, height: `${GRID_SIZE * 3}rem` }}
    >
      <div className="mb-4 text-center">
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          <span>🦆</span> Duck Adventure Map <span>🦆</span>
        </h2>
        <p className="text-lg mt-2">Player: <span className="font-bold">{playerName}</span></p>
        <p className="text-md">Current Position: <span className="font-bold">{currentPosition}</span></p>
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, 3rem)`,
          width: `${GRID_SIZE * 3}rem`,
          height: `${GRID_SIZE * 3}rem`,
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
                className={`w-12 h-12 flex flex-col items-center justify-center shadow-md text-xs relative overflow-hidden bg-transparent`}
                title={space.description || undefined}
              >
                <img src="/Lillypad.png" alt="Lillypad" className="w-full h-full object-contain" />
                {isPlayer && <span className="absolute top-0 left-0 right-0 text-center text-lg">👑</span>}
                {overlay}
              </div>
            );
          } else {
            // Make empty cells fully transparent
            return (
              <div
                key={idx}
                className="w-12 h-12 bg-transparent"
              />
            );
          }
        })}
      </div>
      <div className="mt-6 text-center text-lg font-bold text-yellow-700">
        🏁 Finish Line at Space {numSpaces}! Good luck, duck!
      </div>
    </div>
  );
};

export default BoardGame; 