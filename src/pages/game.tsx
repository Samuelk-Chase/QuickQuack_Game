import { useEffect } from 'react';
import { useRouter } from 'next/router';
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
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <BoardGame playerName="Player" currentPosition={1} />
    </div>
  );
} 