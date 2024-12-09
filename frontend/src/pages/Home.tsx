import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "antd";
import { useUser } from "@clerk/clerk-react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { Progress, Card } from "antd";

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
  const [accuracyStats, setAccuracyStats] = useState<AccuracyStats | null>(
    null
  );
  const [averageDurationStats, setAverageDurationStats] =
    useState<AverageDurationStats | null>(null);
  const { user } = useUser();
  const [ongoingGame, setOngoingGame] = useState<Game | null>(null); // Estado para el juego en curso

  useEffect(() => {
    const fetchUserGames = async () => {
      try {
        const response = await fetch(
          `${VITE_BACKEND_URL}/game/me/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener los juegos del usuario");
        }
        const data = await response.json();

        // Si hay un juego pendiente o iniciado, lo almacenamos en el estado
        if (data && data.length > 0) {
          setOngoingGame(data[0]);
        } else {
          setOngoingGame(null);
        }
      } catch (error) {
        console.error("Error al obtener los juegos del usuario:", error);
      }
    };

    const fetchGameHistory = async () => {
      try {
        const response = await fetch(
          `${VITE_BACKEND_URL}/statistics/history/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener el historial de juegos");
        }
        const data = await response.json();
        setGameHistory(data.games);
      } catch (error) {
        console.error("Error al obtener el historial de juegos:", error);
      }
    };

    const fetchWinLossStats = async () => {
      try {
        const response = await fetch(
          `${VITE_BACKEND_URL}/statistics/winOrLost/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(
            "Error al obtener las estadísticas de victorias/derrotas"
          );
        }
        const data = await response.json();
        setWinLossStats(data);
      } catch (error) {
        console.error(
          "Error al obtener las estadísticas de victorias/derrotas:",
          error
        );
      }
    };

    const fetchAccuracyStats = async () => {
      try {
        const response = await fetch(
          `${VITE_BACKEND_URL}/statistics/accuracy/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al obtener las estadísticas de precisión");
        }
        const data = await response.json();
        setAccuracyStats(data);
      } catch (error) {
        console.error("Error al obtener las estadísticas de precisión:", error);
      }
    };

    const fetchAverageDurationStats = async () => {
      try {
        const response = await fetch(
          `${VITE_BACKEND_URL}/statistics/averageDuration/${user?.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(
            "Error al obtener la duración promedio de los juegos"
          );
        }
        const data = await response.json();
        setAverageDurationStats(data);
      } catch (error) {
        console.error(
          "Error al obtener la duración promedio de los juegos:",
          error
        );
      }
    };

    if (user) {
      fetchUserGames();
      fetchGameHistory();
      fetchWinLossStats();
      fetchAccuracyStats();
      fetchAverageDurationStats();
    }
  }, [user]);

  const winLossData = [
    { name: "Victorias", value: winLossStats?.totalWins || 0 },
    { name: "Derrotas", value: winLossStats?.totalLosses || 0 },
  ];

  const accuracyData = accuracyStats
    ? {
        percent: (
          (accuracyStats.totalHits / accuracyStats.totalShots) *
          100
        ).toFixed(2),
        totalShots: accuracyStats.totalShots,
        totalHits: accuracyStats.totalHits,
      }
    : { percent: 0, totalShots: 0, totalHits: 0 };

  const COLORS = ["#0088FE", "#FF8042"];

  return (
    <div className="flex w-full justify-center items-center h-screen overflow-hidden">
      <div>
        <h1 className="text-4xl font-bold text-center mb-6">
          ¡Bienvenido a Batalla Naval!
        </h1>
        {/* Si hay un juego pendiente, mostramos el botón para continuar, de lo contrario, mostramos el botón para crear un nuevo juego */}
        {ongoingGame ? (
          <Link to={`/game/${ongoingGame.id}`}>
            <Button type="primary" className="mb-8 block mx-auto">
              Continuar Partida
            </Button>
          </Link>
        ) : (
          <Link to="/games/new">
            <Button type="primary" className="mb-8 block mx-auto">
              Nueva partida
            </Button>
          </Link>
        )}

        <div className="mt-8 flex justify-between items-start space-x-8">
          {winLossStats && winLossStats.totalGames > 0 ? (
            <div className="p-6 bg-white rounded shadow-md text-center flex flex-col items-center">
              <h2 className="text-2xl mb-4">
                Estadísticas de Victorias/Derrotas
              </h2>
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
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="top"
                  wrapperStyle={{ right: -50 }}
                />
              </PieChart>
            </div>
          ) : (
            <div className="p-6 bg-gray-100 rounded shadow-md text-center flex flex-col items-center">
              <p>No tienes partidas todavía</p>
            </div>
          )}

          {averageDurationStats ? (
            <Card
              className="w-80 text-center mt-8 p-6 bg-white rounded shadow-md flex flex-col items-center"
              title="Duración Promedio de los Juegos"
              bordered={false}
            >
              <p>Total de Partidas: {averageDurationStats.totalGames}</p>
              <p>
                Duración Promedio: {averageDurationStats.averageDuration}{" "}
                segundos
              </p>
            </Card>
          ) : (
            <div className="p-6 bg-gray-100 rounded shadow-md text-center flex flex-col items-center">
              <p>No tienes duración promedio de juegos todavía</p>
            </div>
          )}

          {accuracyStats && accuracyStats.totalShots > 0 ? (
            <div className="p-6 bg-white rounded shadow-md text-center flex flex-col items-center">
              <h2 className="text-2xl mb-4">Estadísticas de Precisión</h2>
              <Progress
                type="circle"
                percent={+accuracyData.percent}
                format={(percent) => `${percent}% Precisión`}
                width={200}
              />
              <div className="mt-4">
                <p>Total de Disparos: {accuracyData.totalShots}</p>
                <p>Total de Aciertos: {accuracyData.totalHits}</p>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-gray-100 rounded shadow-md text-center flex flex-col items-center">
              <p>No tienes estadísticas de precisión todavía</p>
            </div>
          )}
        </div>

        {/* Tabla de Historial de Juegos */}
        <div className="mt-4 relative">
          <h2 className="text-2xl mb-4 sticky top-0 bg-white z-20">
            Historial de Partidas
          </h2>
          <table className="table-auto w-full border-collapse border border-gray-300">
            <thead className="sticky top-[3rem] bg-white z-10">
              <tr>
                <th className="border border-gray-300 px-4 py-2">
                  ID de Partida
                </th>
                <th className="border border-gray-300 px-4 py-2">Oponente</th>
                <th className="border border-gray-300 px-4 py-2">Resultado</th>
                <th className="border border-gray-300 px-4 py-2">
                  Duración (segundos)
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Tus Estadísticas
                </th>
                <th className="border border-gray-300 px-4 py-2">
                  Estadísticas del Oponente
                </th>
              </tr>
            </thead>
            <tbody>
              {gameHistory.map((game) => {
                const userTotalShots =
                  game.userEfficiency.totalHits +
                  game.userEfficiency.totalMisses;
                const userHitPercentage =
                  userTotalShots > 0
                    ? (
                        (game.userEfficiency.totalHits / userTotalShots) *
                        100
                      ).toFixed(2)
                    : "100.00";

                const opponentTotalShots =
                  game.opponentEfficiency.totalHits +
                  game.opponentEfficiency.totalMisses;
                const opponentHitPercentage =
                  opponentTotalShots > 0
                    ? (
                        (game.opponentEfficiency.totalHits /
                          opponentTotalShots) *
                        100
                      ).toFixed(2)
                    : "100.00";

                return (
                  <tr key={game.id}>
                    <td className="border border-gray-300 px-4 py-2">
                      {game.id}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {game.opponent.name} ({game.opponent.email})
                    </td>
                    <td
                      className="border border-gray-300 px-4 py-2"
                      style={{
                        color:
                          game.result === "Lost"
                            ? "red"
                            : game.result === "Won"
                            ? "green"
                            : "inherit",
                      }}
                    >
                      {game.result === "Lost"
                        ? "Perdido"
                        : game.result === "Won"
                        ? "Ganado"
                        : game.result}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {game.duration}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div>
                        Total de Aciertos: {game.userEfficiency.totalHits}
                      </div>
                      <div>
                        Total de Fallos: {game.userEfficiency.totalMisses}
                      </div>
                      <div>Porcentaje de Aciertos: {userHitPercentage}%</div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      <div>
                        Total de Aciertos: {game.opponentEfficiency.totalHits}
                      </div>
                      <div>
                        Total de Fallos: {game.opponentEfficiency.totalMisses}
                      </div>
                      <div>
                        Porcentaje de Aciertos: {opponentHitPercentage}%
                      </div>
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
