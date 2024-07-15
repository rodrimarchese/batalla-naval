import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import GameLobby from "./GameLobby";
import SetupGame from "./SetupGame";
import ActiveGame from "./ActiveGame";
import { WebSocketClient } from "../components/WebSocketClient";
import { useUser } from "@clerk/clerk-react";

export enum GameStatus {
  Pending = "pending",
  SettingUp = "settingUp",
  Started = "started",
  Finished = "finished",
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
const WS_BACKEND_URL = import.meta.env.WS_BACKEND_URL as string;

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useUser();
  const userId = user?.id;
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sendMessageRef = useRef<(message: string) => void>(() => {});

  console.log("game data:", gameData);

  const handleWebSocketMessage = useCallback((data: any) => {
    const message = JSON.parse(data);
    console.log("Received message ACA:", message);
    if (message.status) {
      setGameData((prevData) => ({
        ...prevData,
        status: message.status,
      }));
    }
  }, []);

  // Use the sendMessage function from the ref
  const sendMessage = (message: any) => {
    if (sendMessageRef.current) {
      sendMessageRef.current(message);
    }
  };

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        const response = await fetch(`${VITE_BACKEND_URL}/game/${gameId}`);
        if (!response.ok) throw new Error("Failed to fetch game data");
        const result = await response.json();
        setGameData(result.yourData);
      } catch (err: any) {
        console.error("Error fetching game data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGameData();
  }, [gameId]);

  if (!gameData || !userId) return <div>Loading...</div>;

  return (
    <>
      <WebSocketClient
        url={`${WS_BACKEND_URL}`}
        onMessage={handleWebSocketMessage}
        userId={userId}
        sendMessageRef={sendMessageRef}
      />
      {gameData.status === GameStatus.Pending && (
        <GameLobby gameData={gameData} />
      )}
      {gameData.status === GameStatus.SettingUp && (
        <SetupGame gameData={gameData} sendMessage={sendMessage} />
      )}
      {gameData.status === GameStatus.Started && (
        <ActiveGame gameData={gameData} />
      )}
    </>
  );
};

export default GamePage;
