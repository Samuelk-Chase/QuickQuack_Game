import BoardGame from '@/components/BoardGame';

export default function GamePage() {
  // In a real app, you would get the logged-in user's info here
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <BoardGame playerName="Player" currentPosition={1} />
    </div>
  );
} 