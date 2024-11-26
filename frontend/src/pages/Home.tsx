import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { useUser } from '@clerk/clerk-react';

type Game = {
  id: string;
  opponent: {
    id: string;
    name: string;
    email: string;
  };
  result: string;
  startedAt: string;
  duration: number;
  userEfficiency: {
    totalHits: number;
    totalMisses: number;
  };
  opponentEfficiency: {
    totalHits: number;
    totalMisses: number;
  };
};

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Home() {
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const { user } = useUser();

  useEffect(() => {
    const fetchGameHistory = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/statistics/history/${user?.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch game history');
        }
        const data = await response.json();
        setGameHistory(data.games);
      } catch (error) {
        console.error('Error fetching game history:', error);
      }
    };

    fetchGameHistory();
  }, [user]);

  return (
      <div className="flex w-full justify-center items-center h-screen overflow-hidden">
        <div>
          <h1 className="text-3xl">Home</h1>
          <p>Welcome to the home page</p>

          <Link to="/games/new">
            <Button type="primary" className="mt-4">
              Nueva partida
            </Button>
          </Link>

          <div className="mt-8 max-h-96 overflow-y-auto relative">
            <h2 className="text-2xl mb-4 sticky top-0 bg-white z-20">Game History</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead className="sticky top-[3rem] bg-white z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Game ID</th>
                <th className="border border-gray-300 px-4 py-2">Opponent</th>
                <th className="border border-gray-300 px-4 py-2">Result</th>
                <th className="border border-gray-300 px-4 py-2">Duration (seconds)</th>
                <th className="border border-gray-300 px-4 py-2">Your Stats</th>
                <th className="border border-gray-300 px-4 py-2">Opponent Stats</th>
              </tr>
              </thead>
              <tbody>
              {gameHistory.map((game) => {
                const userTotalShots = game.userEfficiency.totalHits + game.userEfficiency.totalMisses;
                const userHitPercentage = userTotalShots > 0 ? ((game.userEfficiency.totalHits / userTotalShots) * 100).toFixed(2) : '100.00';

                const opponentTotalShots = game.opponentEfficiency.totalHits + game.opponentEfficiency.totalMisses;
                const opponentHitPercentage = opponentTotalShots > 0 ? ((game.opponentEfficiency.totalHits / opponentTotalShots) * 100).toFixed(2) : '100.00';

                return (
                    <tr key={game.id}>
                      <td className="border border-gray-300 px-4 py-2">{game.id}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {game.opponent.name} ({game.opponent.email})
                      </td>
                      <td className="border border-gray-300 px-4 py-2">{game.result}</td>
                      <td className="border border-gray-300 px-4 py-2">{game.duration}</td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>Total Hits: {game.userEfficiency.totalHits}</div>
                        <div>Total Misses: {game.userEfficiency.totalMisses}</div>
                        <div>Hit Percentage: {userHitPercentage}%</div>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <div>Total Hits: {game.opponentEfficiency.totalHits}</div>
                        <div>Total Misses: {game.opponentEfficiency.totalMisses}</div>
                        <div>Hit Percentage: {opponentHitPercentage}%</div>
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
  );
}

export default Home;


