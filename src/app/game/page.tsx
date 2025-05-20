"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BoardGame from '@/components/BoardGame';
import { supabase, getAllPlayerNames, subscribeToPlayerChanges } from '@/lib/supabase';

// Custom board layout from text grid
const BOARD_TEXT = `
1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
2 3 4 5 6 7 8 0 0 0 0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 9 0 0 0 0 0 0 0          19 20 21      22 0 0
0 0 0 0 0 0 10 11 12 13 14 15 16 17 18 0 0         23 0 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0                  24 0 0
0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0                 26 25 0 0
43 42 41 40 39 38 37 36 35 34 33 32 31 30 29 28 27 0 0 0
44 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
45 0 0 0 0 0 0 0 0 0 0         68 69 70 71 72 0 0 0 0
46 0 0 59 60 61 62 63 64 65 66 67 0 0 0    73 0 0 0 0
47 0 0 58 0 0 0 0 0 0 0 0 0 0 0         74 75 0 0 0
47 0 0 57 0 0 0 0 0 0 0 0 0 0 0 0       76 0 0 0
49 50 0 56 0 0 0 0 0 0 0 0 0 0      78 77 0 0 0 0
0 51 0 55 0 0 0 0 0 0 0 83 82 81 80 79 0 0 0 0
0 52 53 54 0 0 0 0 0 86 85 84 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 87 0 0 0 0 0 0 0 0 0 0
0 0 0 0 0 0 0 0 0 88 0 0 0 0 0 0 0 0 0 0
0 0 96 95 94 93 92 91 80 89 0 0 0 0 0 0 0 0 0 0
0 0 97 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0
0 0 98 99 100 101 102 103 104 105 106 107 108 109 110 111 112 113 114 0`;

// Helper to upsert player position
async function upsertPlayerPosition(user_id: number, character: number, position: number) {
  const { data, error } = await supabase
    .from('PlayerPosition')
    .upsert([
      { user_id, character, position }
    ], { onConflict: 'user_id' });
  if (error) {
    console.error('Error upserting player position:', error);
  }
  return data;
}

export default function GamePage() {
  const router = useRouter();
  const [users, setUsers] = useState<string[]>([]);
  const [showSidebars, setShowSidebars] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(1);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('🐿️');

  const characters = [
    { id: 0, emoji: '🐿️', name: 'Squirrel' },
    { id: 1, emoji: '🦆', name: 'Duck' },
    { id: 2, emoji: '🦢', name: 'Swan' },
    { id: 3, emoji: '🐸', name: 'Frog' },
    { id: 4, emoji: '🦉', name: 'Owl' },
    { id: 5, emoji: '🦊', name: 'Fox' },
    { id: 6, emoji: '🦝', name: 'Raccoon' },
    { id: 7, emoji: '🦡', name: 'Badger' },
    { id: 8, emoji: '🦫', name: 'Beaver' },
    { id: 9, emoji: '🦦', name: 'Otter' },
    { id: 10, emoji: '🦥', name: 'Sloth' },
    { id: 11, emoji: '🦨', name: 'Skunk' },
    { id: 12, emoji: '🦘', name: 'Kangaroo' },
    { id: 13, emoji: '🦙', name: 'Llama' },
    { id: 14, emoji: '🦒', name: 'Giraffe' }
  ];

  useEffect(() => {
    // Check for a session in localStorage (set on login)
    const session = localStorage.getItem('session');
    if (!session) {
      router.replace('/'); // Redirect to home if not authenticated
    }
  }, [router]);

  useEffect(() => {
    console.log('Game page mounted - starting to fetch players');
    
    // Initial fetch of player names
    async function fetchPlayerNames() {
      console.log('fetchPlayerNames function called');
      try {
        const playerNames = await getAllPlayerNames();
        console.log('Successfully fetched player names:', playerNames);
        setUsers(playerNames);
      } catch (error) {
        console.error('Error in fetchPlayerNames:', error);
      }
    }
    fetchPlayerNames();

    // Subscribe to real-time updates
    console.log('Setting up subscription');
    const subscription = subscribeToPlayerChanges((playerNames) => {
      console.log('Subscription callback received new player names:', playerNames);
      setUsers(playerNames);
    });

    // Cleanup subscription on component unmount
    return () => {
      console.log('Cleaning up subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Add a debug effect to monitor users state
  useEffect(() => {
    console.log('Users state updated:', users);
  }, [users]);

  const rollDice = () => {
    if (isRolling) return;
    
    setIsRolling(true);
    // Simulate dice rolling animation
    let rolls = 0;
    const maxRolls = 10;
    const rollInterval = setInterval(() => {
      setDiceRoll(Math.floor(Math.random() * 6) + 1);
      rolls++;
      
      if (rolls >= maxRolls) {
        clearInterval(rollInterval);
        const finalRoll = Math.floor(Math.random() * 6) + 1;
        setDiceRoll(finalRoll);
        
        // Create the exact path sequence from the board
        const pathSequence = [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114
        ];

        // Find the current position's index in the path
        const currentIndex = pathSequence.indexOf(currentPosition);
        
        // Calculate the new position index
        const newIndex = currentIndex + finalRoll;
        
        // Only update if we haven't reached the end
        if (newIndex < pathSequence.length) {
          const newPosition = pathSequence[newIndex];
          setCurrentPosition(newPosition);
          
          // Update player position in Supabase
          const sessionStr = localStorage.getItem('session');
          if (sessionStr) {
            try {
              const session = JSON.parse(sessionStr);
              if (session?.user?.id) {
                // Find the character id
                const charObj = characters.find(c => c.emoji === selectedCharacter);
                const charId = charObj ? charObj.id : 0;
                upsertPlayerPosition(session.user.id, charId, newPosition);
              }
            } catch (error) {
              console.error('Error parsing session:', error);
            }
          }
        }
        
        setIsRolling(false);
      }
    }, 100);
  };

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('/Duckpond.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
      {/* White overlay for less transparency */}
      <div className="absolute inset-0 z-10 bg-white/30 pointer-events-none" />
      
      {/* Mobile menu button */}
      <button 
        onClick={() => setShowSidebars(!showSidebars)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-white/90 p-2 rounded-lg shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Dice Roll Button */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-center gap-2">
        <button
          onClick={rollDice}
          disabled={isRolling}
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <span className="text-2xl">🎲</span>
        </button>
        {diceRoll && (
          <div className="bg-white/90 p-3 rounded-lg shadow-lg text-3xl font-bold">
            {diceRoll}
          </div>
        )}
      </div>

      {/* Player Character Indicator */}
      <div 
        className="fixed top-20 right-4 z-50 bg-white/90 p-3 rounded-lg shadow-lg cursor-pointer hover:bg-white transition-colors"
        onClick={() => setShowCharacterModal(true)}
      >
        <div className="text-4xl">{selectedCharacter}</div>
        <div className="text-sm font-medium text-center mt-1">Click to Change</div>
      </div>

      {/* Character Selection Modal */}
      {showCharacterModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Character</h2>
            <div className="grid grid-cols-3 gap-4">
              {characters.map((char) => (
                <button
                  key={char.emoji}
                  onClick={() => {
                    setSelectedCharacter(char.emoji);
                    setShowCharacterModal(false);
                  }}
                  className={`p-4 rounded-lg text-4xl hover:bg-gray-100 transition-colors ${
                    selectedCharacter === char.emoji ? 'bg-blue-100' : ''
                  }`}
                >
                  {char.emoji}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCharacterModal(false)}
              className="mt-6 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sidebar with users - hidden on mobile unless toggled */}
      <aside className={`fixed lg:static w-64 bg-white/80 p-4 border-r border-gray-200 flex flex-col gap-2 z-20 transition-transform duration-300 ease-in-out ${
        showSidebars ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <h2 className="text-xl font-bold mb-4">Players</h2>
        <ul className="space-y-2">
          {users.map((name, index) => (
            <li key={index} className="p-2 rounded bg-blue-50 text-gray-800 font-medium truncate">
              {name}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main game board */}
      <main className="flex-1 flex items-center justify-center z-10 p-4">
        <div className="relative z-10 w-full max-w-4xl mx-auto flex justify-center">
          <BoardGame 
            playerName="Player" 
            currentPosition={currentPosition} 
            numSpaces={114} 
            playerCharacter={selectedCharacter}
          />
        </div>
      </main>

      {/* Key/legend sidebar - hidden on mobile unless toggled */}
      <aside className={`fixed lg:static w-64 bg-white/80 p-4 border-l border-gray-200 flex flex-col justify-center gap-4 z-20 transition-transform duration-300 ease-in-out ${
        showSidebars ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <h2 className="text-xl font-bold mb-4">Key</h2>
        <div className="flex flex-col gap-4 text-lg">
          <div className="flex items-center gap-2"><span className="text-2xl">🦆</span> <span>= Medium Prize</span></div>
          <div className="flex items-center gap-2"><span className="text-2xl">🦋</span> <span>= Small Prize</span></div>
          <div className="flex items-center gap-2"><span className="text-2xl">✨</span> <span>= Large Prize</span></div>
        </div>
      </aside>

      {/* Overlay for mobile when sidebars are open */}
      {showSidebars && (
        <div 
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setShowSidebars(false)}
        />
      )}
    </div>
  );
} 