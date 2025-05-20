'use client';

import { useState, useEffect } from 'react';
import { supabase, getPlayer, createPlayer, Player } from '@/lib/supabase';
import Auth from '@/components/Auth';
import BoardGame from '@/components/BoardGame';

export default function Home() {
  const [session, setSession] = useState<any>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [characterName, setCharacterName] = useState('');
  const [showCharacterForm, setShowCharacterForm] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState('🐿️');

  // Add the characters array here
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

  // For a single player, just use an array with that player
  const players = player ? [{
    user_id: Number(player.id), // Convert string id to number user_id
    name: player.name,
    character: player.character_id, // Use character_id as character
    position: player.position,
  }] : [];

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        loadPlayer(session.user.id);
      }
    });

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        loadPlayer(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadPlayer = async (userId: string) => {
    try {
      const playerData = await getPlayer(userId);
      setPlayer(playerData);
    } catch (error) {
      // Player doesn't exist yet, show character creation form
      setShowCharacterForm(true);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setPlayer(null);
    setShowCharacterForm(false);
  };

  const handleCharacterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user || !characterName) return;

    try {
      const newPlayer = await createPlayer(
        session.user.id,
        session.user.email || '',
        1 // Replace 1 with the actual selected character ID if available
      );
      setPlayer(newPlayer);
      setShowCharacterForm(false);
    } catch (error) {
      console.error('Error creating player:', error);
    }
  };

  if (!session) {
    return <Auth />;
  }

  if (showCharacterForm) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Choose Your Character</h2>
          <form onSubmit={handleCharacterSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Character Name
              </label>
              <input
                type="text"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Start Game
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!player) {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">QuickQuack Game</h1>
            <p className="text-gray-600">Playing as: {player.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Logout
          </button>
        </div>
        <BoardGame 
          currentPosition={player.position} 
          playerName={player.name} 
          playerCharacter={selectedCharacter}
          players={players}
          characters={characters}
        />
      </div>
    </main>
  );
}
