import React, { useEffect, useState } from 'react';

interface Space {
  id: number;
  type: 'normal' | 'prize' | 'special';
  description: string;
  x: number;
  y: number;
}

interface BoardGameProps {
  currentPosition: number;
  playerName: string;
}

const NUM_SPACES = 30;
const GRID_SIZE = 100;

// Helper to generate a random snaking path
function generateRandomPath(length: number, gridSize: number): { x: number; y: number }[] {
  const path: { x: number; y: number }[] = [{ x: 0, y: 0 }];
  const visited = new Set([`0,0`]);
  const directions = [
    { dx: 1, dy: 0 }, // right
    { dx: 0, dy: 1 }, // down
    { dx: -1, dy: 0 }, // left
    { dx: 0, dy: -1 }, // up
  ];
  while (path.length < length) {
    const { x, y } = path[path.length - 1];
    // Shuffle directions for randomness
    const shuffled = directions.sort(() => Math.random() - 0.5);
    let moved = false;
    for (const { dx, dy } of shuffled) {
      const nx = x + dx;
      const ny = y + dy;
      const key = `${nx},${ny}`;
      if (
        nx >= 0 && nx < gridSize &&
        ny >= 0 && ny < gridSize &&
        !visited.has(key)
      ) {
        path.push({ x: nx, y: ny });
        visited.add(key);
        moved = true;
        break;
      }
    }
    // If stuck, backtrack
    if (!moved) {
      path.pop();
      if (path.length === 0) throw new Error('Failed to generate path');
    }
  }
  return path;
}

const BoardGame: React.FC<BoardGameProps> = ({ currentPosition, playerName }) => {
  const [spaces, setSpaces] = useState<Space[] | null>(null);

  useEffect(() => {
    // Generate the snaking path only on the client
    const pathCoords = generateRandomPath(NUM_SPACES, GRID_SIZE);
    const newSpaces: Space[] = pathCoords.map(({ x, y }, i) => {
      const id = i + 1;
      let type: 'normal' | 'prize' | 'special' = 'normal';
      let description = '';
      if (id === 5 || id === 15 || id === 25) {
        type = 'prize';
        description = '🦆 Golden Duck!';
      } else if (id === 10 || id === 20) {
        type = 'special';
        description = '🦢 Swan Surprise!';
      }
      return { id, type, description, x, y };
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
      className="overflow-auto max-h-[80vh] max-w-[80vw] p-2 bg-gradient-to-br from-blue-200 to-yellow-100 rounded-2xl shadow-lg border-4 border-yellow-300"
      style={{ width: '800px', height: '800px' }}
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
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(8px, 1fr))`,
          width: '800px',
          height: '800px',
        }}
      >
        {Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, idx) => {
          const x = idx % GRID_SIZE;
          const y = Math.floor(idx / GRID_SIZE);
          const space = spaceLookup.get(`${x},${y}`);
          if (space) {
            const isPlayer = space.id === currentPosition;
            let bg = 'bg-yellow-100';
            let icon = '🦆';
            let border = 'border-black';
            if (space.type === 'prize') {
              bg = 'bg-yellow-300';
              icon = '🦆✨';
              border = 'border-black';
            } else if (space.type === 'special') {
              bg = 'bg-blue-200';
              icon = '🦢';
              border = 'border-black';
            }
            if (isPlayer) {
              bg = 'bg-green-300 animate-bounce';
              icon = '🦆👑';
              border = 'border-black';
            }
            return (
              <div
                key={idx}
                className={`w-6 h-6 sm:w-8 sm:h-8 border ${bg} ${border} flex flex-col items-center justify-center shadow-md text-xs`}
                title={space.description || undefined}
              >
                <span className="text-xs">{icon}</span>
              </div>
            );
          } else {
            // Make empty cells more visible
            return (
              <div
                key={idx}
                className="w-6 h-6 sm:w-8 sm:h-8 border border-black bg-white"
              />
            );
          }
        })}
      </div>
      <div className="mt-6 text-center text-lg font-bold text-yellow-700">
        🏁 Finish Line at Space {NUM_SPACES}! Good luck, duck!
      </div>
    </div>
  );
};

export default BoardGame; 