"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BoardGame from '@/components/BoardGame';
import { supabase } from '@/lib/supabase';

export default function GamePage() {
  const router = useRouter();
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([]);
  const [showSidebars, setShowSidebars] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(1);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('🐿️');

  const characters = [
    { emoji: '🐿️', name: 'Squirrel' },
    { emoji: '🦆', name: 'Duck' },
    { emoji: '🦢', name: 'Swan' },
    { emoji: '🐸', name: 'Frog' },
    { emoji: '🦉', name: 'Owl' },
    { emoji: '🦊', name: 'Fox' },
    { emoji: '🦝', name: 'Raccoon' },
    { emoji: '🦡', name: 'Badger' },
    { emoji: '🦫', name: 'Beaver' },
    { emoji: '🦦', name: 'Otter' },
    { emoji: '🦥', name: 'Sloth' },
    { emoji: '🦨', name: 'Skunk' },
    { emoji: '🦘', name: 'Kangaroo' },
    { emoji: '🦙', name: 'Llama' },
    { emoji: '🦒', name: 'Giraffe' }
  ];

  useEffect(() => {
    // Check for a session in localStorage (set on login)
    const session = localStorage.getItem('session');
    if (!session) {
      router.replace('/'); // Redirect to home if not authenticated
    }
  }, [router]);

  useEffect(() => {
    // Fetch all users from Supabase
    async function fetchUsers() {
      const { data, error } = await supabase.from('User').select('id, name, email');
      console.log('DEBUG: fetched users:', data);
      if (error) console.error('DEBUG: Supabase error:', error);
      if (!error && data) {
        setUsers(data);
      }
    }
    fetchUsers();
  }, []);

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
        // Update position based on the dice roll, ensuring we don't exceed the maximum space (114)
        setCurrentPosition(prev => Math.min(prev + finalRoll, 114));
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
          {users.map((user) => (
            <li key={user.id} className="p-2 rounded bg-blue-50 text-gray-800 font-medium truncate">
              {user.name || user.email}
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