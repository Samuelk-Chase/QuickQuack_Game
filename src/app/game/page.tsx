"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import BoardGame from '@/components/BoardGame';

export default function GamePage() {
  const router = useRouter();

  useEffect(() => {
    // Check for a session in localStorage (set on login)
    const session = localStorage.getItem('session');
    if (!session) {
      router.replace('/'); // Redirect to home if not authenticated
    }
  }, [router]);

  return (
    <div
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        backgroundImage: `url('/Duckpond.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
      }}
      className="flex items-center justify-center"
    >
      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-white bg-opacity-40 pointer-events-none" />
      <div className="relative z-10">
        <BoardGame playerName="Player" currentPosition={1} />
      </div>
    </div>
  );
} 