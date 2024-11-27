import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { useUser } from '@clerk/clerk-react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { Progress, Card } from 'antd';

// Define types for data
interface Game {
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
}

interface WinLossStats {
  totalGames: number;
  totalWins: number;
  totalLosses: number;
}

interface AccuracyStats {
  totalShots: number;
  totalHits: number;
  totalGames: number;
  averageHitsPerGame: number;
}

interface AverageDurationStats {
  totalGames: number;
  averageDuration: number;
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function Home() {
  const [gameHistory, setGameHistory] = useState<Game[]>([]);
  const [winLossStats, setWinLossStats] = useState<WinLossStats | null>(null);
  const [accuracyStats, setAccuracyStats] = useState<AccuracyStats | null>(null);
  const [averageDurationStats, setAverageDurationStats] = useState<AverageDurationStats | null>(null);
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

    const fetchWinLossStats = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/statistics/winOrLost/${user?.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch win/loss statistics');
        }
        const data = await response.json();
        setWinLossStats(data);
      } catch (error) {
        console.error('Error fetching win/loss statistics:', error);
      }
    };

    const fetchAccuracyStats = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/statistics/accuracy/${user?.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch accuracy statistics');
        }
        const data = await response.json();
        setAccuracyStats(data);
      } catch (error) {
        console.error('Error fetching accuracy statistics:', error);
      }
    };

    const fetchAverageDurationStats = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/statistics/averageDuration/${user?.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch average duration statistics');
        }
        const data = await response.json();
        setAverageDurationStats(data);
      } catch (error) {
        console.error('Error fetching average duration statistics:', error);
      }
    };

    if (user) {
      fetchGameHistory();
      fetchWinLossStats();
      fetchAccuracyStats();
      fetchAverageDurationStats();
    }
  }, [user]);

  const winLossData = [
    { name: 'Wins', value: winLossStats?.totalWins || 0 },
    { name: 'Losses', value: winLossStats?.totalLosses || 0 },
  ];

  const accuracyData = accuracyStats ? {
    percent: ((accuracyStats.totalHits / accuracyStats.totalShots) * 100).toFixed(2),
    totalShots: accuracyStats.totalShots,
    totalHits: accuracyStats.totalHits,
  } : { percent: 0, totalShots: 0, totalHits: 0 };

  const COLORS = ['#0088FE', '#FF8042'];

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

          <div className="mt-8 flex justify-between items-start space-x-8">
            <div>
              <h2 className="text-2xl mb-4">Game Win/Loss Statistics</h2>
              <PieChart width={300} height={220}>
                <Pie
                    data={winLossData}
                    cx={150}
                    cy={110}
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                >
                  {winLossData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="top" wrapperStyle={{ right: -50 }} />
              </PieChart>
            </div>

            {averageDurationStats && (
                <Card className="w-80 text-center mt-8" title="Average Game Duration" bordered={false}>
                  <p>Total Games: {averageDurationStats.totalGames}</p>
                  <p>Average Duration: {averageDurationStats.averageDuration} seconds</p>
                </Card>
            )}

            {accuracyStats && (
                <div>
                  <h2 className="text-2xl mb-4">Accuracy Statistics</h2>
                  <Progress
                      type="circle"
                      percent={accuracyData.percent}
                      format={(percent) => `${percent}% Accuracy`}
                      width={200}
                  />
                  <div className="mt-4">
                    <p>Total Shots: {accuracyData.totalShots}</p>
                    <p>Total Hits: {accuracyData.totalHits}</p>
                  </div>
                </div>
            )}
          </div>

          {/* Game History Table */}
          <div className="mt-4 max-h-64 overflow-y-auto relative">
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
                const userHitPercentage =
                    userTotalShots > 0
                        ? ((game.userEfficiency.totalHits / userTotalShots) * 100).toFixed(2)
                        : '100.00';

                const opponentTotalShots = game.opponentEfficiency.totalHits + game.opponentEfficiency.totalMisses;
                const opponentHitPercentage =
                    opponentTotalShots > 0
                        ? ((game.opponentEfficiency.totalHits / opponentTotalShots) * 100).toFixed(2)
                        : '100.00';

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
