"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import BoardGame from '@/components/BoardGame';
import { supabase } from '@/lib/supabase';

export default function GamePage() {
  const router = useRouter();
  const [users, setUsers] = useState<{ id: string; name: string | null; email: string }[]>([]);

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
      {/* Sidebar with users */}
      <aside className="w-64 bg-white/80 p-4 border-r border-gray-200 flex flex-col gap-2 z-10">
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
      <main className="flex-1 flex items-center justify-center z-10">
        <div className="relative z-10">
          <BoardGame playerName="Player" currentPosition={1} numSpaces={100} />
        </div>
      </main>
      {/* Key/legend sidebar */}
      <aside className="w-64 bg-white/80 p-4 border-l border-gray-200 flex flex-col gap-4 z-10 items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Key</h2>
        <div className="flex flex-col gap-4 text-lg">
          <div className="flex items-center gap-2"><span className="text-2xl">🦆</span> <span>= Medium Prize</span></div>
          <div className="flex items-center gap-2"><span className="text-2xl">🦋</span> <span>= Small Prize</span></div>
          <div className="flex items-center gap-2"><span className="text-2xl">✨</span> <span>= Large Prize</span></div>
        </div>
      </aside>
    </div>
  );
} 