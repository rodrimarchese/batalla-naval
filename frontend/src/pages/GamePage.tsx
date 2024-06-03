import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Spinner } from "../components/Spinner";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface GameData {
  id: string;
  host: UserData;
  guest?: UserData | null;
  status: string;
  createdAt: string;
}

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/game/${gameId}`);
        if (!response.ok) throw new Error("Failed to fetch game data");
        const result = await response.json();
        setGameData(result.yourData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (gameId) {
      fetchGameData();
    }
  }, [gameId]);

  console.log("gameData:", gameData);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="loader"></div>
      </div>
    );

  if (error)
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  if (!gameData)
    return (
      <div className="text-gray-600 text-center mt-4">No game data found.</div>
    );

  return (
    <div className="max-w-xl mx-auto p-4">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-lg font-bold mb-4">Game ID: {gameData.id}</h1>
        <p>
          <strong>Host:</strong> {gameData.host.name}
        </p>
        <p>
          <strong>Email:</strong> {gameData.host.email}
        </p>
        <p>
          <strong>Game Created At:</strong>{" "}
          {new Date(gameData.createdAt).toLocaleString()}
        </p>
        {gameData.guest ? (
          <p>
            <strong>Guest:</strong> {gameData.guest.name} has joined the game.
          </p>
        ) : (
          <p className="text-yellow-500">Waiting for a guest to join...</p>
        )}
        <p>
          <strong>Status:</strong> {gameData.status}
        </p>
        <Link to="/games" className="text-blue-500 hover:underline mt-4 block">
          Back to games list
        </Link>
      </div>
      {gameData.status === "pending" && (
        <div className="mt-8">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default GamePage;
