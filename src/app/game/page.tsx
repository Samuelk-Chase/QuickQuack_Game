"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BoardGame from '@/components/BoardGame';
import { supabase, getAllPlayerPositions, subscribeToPlayerChanges, getAllPlayerNames, getAllPlayersWithPosition, getPlayerPosition, getUserIdByEmail, insertPlayerPrize, checkPlayerPrizeExists } from '@/lib/supabase';
import { SPACE_CONFIGS } from '@/lib/gameConfig';

interface RollType {
  name: string;
  rolls: number;
}

const ROLL_TYPES: RollType[] = [
  { name: 'Ceramic Membership', rolls: 3 },
  { name: 'Lucky Duck Membership', rolls: 2 },
  { name: 'Good Membership', rolls: 1 },
  { name: 'Flock Sale', rolls: 2 },
  { name: 'Single Ceramic', rolls: 1 },
  { name: 'Google Review', rolls: 1 },
  { name: 'Dashwipe Review', rolls: 1 }
];

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
  const { data: existing, error: selectError } = await supabase
    .from('PlayerPosition')
    .select('user_id')
    .eq('user_id', user_id)
    .single();

  if (existing) {
    // Update
    await supabase
      .from('PlayerPosition')
      .update({ character, position })
      .eq('user_id', user_id);
  } else {
    // Insert
    await supabase
      .from('PlayerPosition')
      .insert({ user_id, character, position });
  }
}

export default function GamePage() {
  const router = useRouter();
  const [players, setPlayers] = useState<any[]>([]);
  const [showSidebars, setShowSidebars] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(1);
  const [diceRoll, setDiceRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [showRollOptions, setShowRollOptions] = useState(false);
  const [selectedRollType, setSelectedRollType] = useState<RollType | null>(null);
  const [remainingRolls, setRemainingRolls] = useState(0);

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
    { id: 14, emoji: '🦒', name: 'Giraffe' },
    { id: 15, emoji: '🦈', name: 'shark'},
  ];

  useEffect(() => {
    console.log('GamePage useEffect running');
    const session = localStorage.getItem('session');
    console.log('Session from localStorage:', session);
    if (!session) {
      router.replace('/'); // Redirect to home if not authenticated
      return;
    }
    async function fetchPlayerData() {
      console.log('fetchPlayerData called');
      try {
        if (!session) return;
        const sessionObj = JSON.parse(session);
        console.log('Parsed sessionObj:', sessionObj);
        const email = sessionObj.email;
        if (!email) {
          console.error('No email in session!');
          return;
        }
        const userId = await getUserIdByEmail(email);
        console.log('userId from DB:', userId);
        if (userId) {
          console.log('About to fetch PlayerPosition for userId:', userId, typeof userId);
          const data = await getPlayerPosition(userId);
          console.log('PlayerPosition data:', data);
          setCurrentPosition(data.position);
        }
      } catch (error) {
        console.error('Error loading player position:', error);
      }
    }
    fetchPlayerData();
  }, [router]);

  useEffect(() => {
    async function fetchPlayers() {
      try {
        const { data: positions, error } = await supabase
          .from('PlayerPosition')
          .select('*');
        if (error) {
          console.error('Error fetching player positions:', error);
          return;
        }
        const { data: users, error: userError } = await supabase
          .from('User')
          .select('id, name');
        if (userError) {
          console.error('Error fetching users:', userError);
          return;
        }
        const players = positions.map(pos => {
          const user = users.find(u => u.id === pos.user_id);
          return {
            ...pos,
            name: user ? user.name : 'Unknown'
          };
        });
        setPlayers(players);
      } catch (error) {
        console.error('Error fetching all players:', error);
      }
    }
    fetchPlayers();
  }, []);

  useEffect(() => {
    // Subscribe to real-time updates
    const subscription = subscribeToPlayerChanges((playerObjs) => {
      setPlayers(Array.isArray(playerObjs) ? playerObjs.map(p => p.name) : []);
    });

    // Cleanup subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const rollDice = () => {
    if (isRolling) return;
    
    if (!selectedRollType) {
      setShowRollOptions(true);
      return;
    }

    setIsRolling(true);
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
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100
        ];

        // Find the current position's index in the path
        const currentIndex = pathSequence.indexOf(currentPosition);
        
        // Calculate the new position index
        const newIndex = currentIndex + finalRoll;
        
        // Only update if we haven't reached the end and won't go past 100
        if (newIndex < pathSequence.length && pathSequence[newIndex] <= 100) {
          const newPosition = pathSequence[newIndex];
          setCurrentPosition(newPosition);

          // Check if the new position is a prize space and record it if not already recorded
          const landedSpace = SPACE_CONFIGS.find(space => space.id === newPosition);
          if (landedSpace && landedSpace.type === 'prize') {
            console.log(`Landed on a prize space! Space ID: ${newPosition}, Description: ${landedSpace.description}`);
            (async () => {
              const sessionStr = localStorage.getItem('session');
              if (sessionStr) {
                try {
                  const session = JSON.parse(sessionStr);
                  // Prioritize getting UUID from session.user.id if available
                  let userId: string | null = session?.user?.id || session?.id || session?.user_id || null;
                  console.log('Attempting to get userId from session. Initial userId:', userId);

                  // If userId is still not a string (e.g., number from old session data), try getting it by email
                  if (!userId || typeof userId !== 'string' && session?.email) {
                    console.log('UserId not found or not string, attempting to get by email:', session?.email);
                    try {
                      const dbUserId = await getUserIdByEmail(session.email);
                      if(dbUserId) userId = dbUserId; // Use the UUID from DB if found
                      console.log('Got userId from DB by email:', userId);
                    } catch (err) {
                      console.error('Could not get userId by email for prize insert:', err);
                    }
                  }

                  if (userId) {
                    console.log('Checking if prize already exists for userId:', userId, 'and spaceId:', newPosition);
                    // Check if the prize has already been awarded for this user and space
                    const prizeExists = await checkPlayerPrizeExists(userId, newPosition);
                    console.log('Prize exists check result:', prizeExists);

                    if (!prizeExists) {
                      // Use the actual prize type and description from the config
                      const prizeType = landedSpace.description.includes('Small') ? 'Small Prize'
                                      : landedSpace.description.includes('Medium') ? 'Medium Prize'
                                      : landedSpace.description.includes('Large') ? 'Large Prize'
                                      : landedSpace.description.includes('Random') ? 'Random Prize'
                                      : landedSpace.description.includes('Grand') ? 'Grand Prize'
                                      : 'Unknown Prize';

                      await insertPlayerPrize(userId, prizeType, landedSpace.description, newPosition);
                      console.log(`Recorded prize "${landedSpace.description}" for user ${userId} at space ${newPosition}`);
                    } else {
                      console.log(`Prize "${landedSpace.description}" at space ${newPosition} already recorded for user ${userId}`);
                    }
                  } else {
                    console.error('No valid userId found in session or database for prize insert');
                  }
                } catch (error) {
                  console.error('Error processing prize insertion logic:', error); // More general error catch
                }
              } else {
                console.error('No sessionStr found in localStorage for prize insert logic.');
                console.error('No session found in localStorage for prize insert');
              }
            })();
          }

          // Async update after animation
          (async () => {
            const sessionStr = localStorage.getItem('session');
            if (sessionStr) {
              try {
                const session = JSON.parse(sessionStr);
                let userId = session?.user?.id || session?.id || session?.user_id;
                if (!userId && session?.email) {
                  try {
                    userId = await getUserIdByEmail(session.email);
                  } catch (err) {
                    console.error('Could not get userId by email:', err);
                  }
                }
                if (userId) {
                  // Get the player's current character from the players array
                  const currentPlayer = players.find(p => p.user_id === userId);
                  const charId = currentPlayer?.character; // No default character
                  if (charId !== undefined) {
                    console.debug('Attempting to upsert position:', { userId, charId, newPosition });
                    try {
                      const result = await upsertPlayerPosition(userId, charId, newPosition);
                      console.debug('upsertPlayerPosition result:', result);
                      
                      // Update the local players state
                      setPlayers(prevPlayers => 
                        prevPlayers.map(player => 
                          player.user_id === userId 
                            ? { ...player, position: newPosition, character: charId }
                            : player
                        )
                      );
                    } catch (err) {
                      console.error('upsertPlayerPosition error:', err);
                    }
                  } else {
                    console.error('No character found for user:', userId);
                  }
                } else {
                  console.error('No userId found in session or database for upsert');
                }
              } catch (error) {
                console.error('Error parsing session:', error);
              }
            } else {
              console.error('No session found in localStorage for upsert');
            }
          })();
        }
        
        setIsRolling(false);
        setRemainingRolls(prev => prev - 1);
        
        // If no more rolls left, reset the selected roll type
        if (remainingRolls <= 1) {
          setSelectedRollType(null);
        }
      }
    }, 100);
  };

  const handleRollTypeSelect = (rollType: RollType) => {
    setSelectedRollType(rollType);
    setRemainingRolls(rollType.rolls);
    setShowRollOptions(false);
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
          <div className="bg-white/90 p-3 rounded-lg shadow-lg text-3xl font-bold text-black">
            {diceRoll}
          </div>
        )}
        {selectedRollType && (
          <div className="bg-white/90 p-2 rounded-lg shadow-lg text-sm text-black">
            {selectedRollType.name}: {remainingRolls} rolls left
          </div>
        )}
      </div>

      {/* Roll Options Modal */}
      {showRollOptions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-4 text-center text-black">Choose Your Roll Type</h2>
            <div className="grid grid-cols-1 gap-2">
              {ROLL_TYPES.map((rollType) => (
                <button
                  key={rollType.name}
                  onClick={() => handleRollTypeSelect(rollType)}
                  className="p-3 rounded-lg bg-blue-100 hover:bg-blue-200 text-black font-medium transition-colors"
                >
                  {rollType.name} ({rollType.rolls} rolls)
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowRollOptions(false)}
              className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-black font-medium py-2 px-4 rounded-lg transition-colors"
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
        <h2 className="text-xl font-bold mb-4 text-black">Leaderboard</h2>
        <div className="space-y-2">
          {[...players]
            .sort((a, b) => b.position - a.position)
            .map((player, index) => {
              const charObj = characters.find(c => c.id === player.character);
              return (
                <div key={player.user_id} className="flex items-center gap-2 p-2 rounded hover:bg-white/5">
                  <span className="font-bold text-black">{index + 1}.</span>
                  <span className="text-xl">{charObj ? charObj.emoji : '❓'}</span>
                  <span className="truncate text-black">{player.name}</span>
                  <span className="ml-auto text-sm text-black">{player.position}</span>
                </div>
              );
            })}
        </div>
        <div className="mt-auto pt-4 border-t border-gray-200">
          <button
            onClick={() => {
              localStorage.removeItem('session');
              router.push('/');
            }}
            className="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main game board */}
      <main className="flex-1 flex items-center justify-center z-10 p-4">
        <div className="relative z-10 w-full max-w-4xl mx-auto flex justify-center">
          <BoardGame
            currentPosition={currentPosition}
            playerName="Player"
            playerCharacter=""
            players={players}
            characters={characters}
          />
        </div>
      </main>

      {/* Key/legend sidebar - hidden on mobile unless toggled */}
      <aside className={`fixed lg:static w-64 bg-white/80 p-4 border-l border-gray-200 flex flex-col justify-center gap-4 z-20 transition-transform duration-300 ease-in-out ${
        showSidebars ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      }`}>
        <h2 className="text-xl font-bold mb-4 text-black">Key</h2>
        <div className="flex flex-col gap-4 text-lg">
          <div className="flex items-center gap-2"><span className="text-2xl">🎁</span> <span className="text-black">= Small Prize</span></div>
          <div className="flex items-center gap-2"><span className="text-2xl">🎯</span> <span className="text-black">= Medium Prize</span></div>
          <div className="flex items-center gap-2"><span className="text-2xl">🏆</span> <span className="text-black">= Large Prize</span></div>
          <div className="flex items-center gap-2"><span className="text-2xl">🌟</span> <span className="text-black">= Awardco Grand Prize</span></div>
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
