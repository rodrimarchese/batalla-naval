import React, { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import GameLobby from "./GameLobby";
import SetupGame from "./SetupGame";
import ActiveGame from "./ActiveGame";
import GameResultPage from "./GameResultPage";
import { WebSocketClient } from "../components/WebSocketClient";
import { useUser } from "@clerk/clerk-react";

export enum GameStatus {
  Pending = "pending",
  SettingUp = "settingUp",
  onGameWaiting = "onGameWaiting",
  onGameYourTurn = "onGameYourTurn",
  Started = "started",
  Finished = "finishGame",
}

interface ReceivedData {
  type: string;
  message: any;
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL as string;
const VITE_WS_BACKEND_URL = import.meta.env.VITE_WS_BACKEND_URL as string;

const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const { user } = useUser();
  const userId = user?.id;
  const [gameData, setGameData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sendMessageRef = useRef<(message: string) => void>(() => {});




  const handleWebSocketMessage = useCallback((data: any) => {
    try {
      const parsedData: ReceivedData = typeof data === "string" ? JSON.parse(data) : data;
      console.log("Received message DATA:", parsedData);

      const messageContent = parsedData.message;

      if (parsedData.type === "autoPlayResponse" && messageContent) {
        // Actualiza los barcos para el estado 'settingUp' si se recibe autoPlayResponse
        setGameData((prevGameData) => ({
          ...prevGameData,
          ships: messageContent.ships,
        }));
      } else {
        // Limpiar el `boardStatus` anidado
        let updatedBoardStatus = messageContent.boardStatus?.boardStatus || messageContent.boardStatus;

        // Crear el nuevo objeto `gameData` basado en el mensaje recibido
        const newGameData = {
          id: messageContent.boardStatus.gameId,
          host: gameData?.host || null,
          guest: gameData?.guest || null,
          status: parsedData.type,
          boardStatus: updatedBoardStatus,
          deadPiecesOfTheOther: messageContent.deadPiecesOfTheOther || [],
          yourMissedHits: messageContent.yourMissedHits || [],
          rivalMissedHits: messageContent.rivalMissedHits || [],
          winner: messageContent.winner !== undefined ? messageContent.winner : undefined,
        };

        setGameData(newGameData);
      }
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, [gameData]);


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

  console.log("[GamePage] gameData actual de este jugador:", gameData);

  return (
    <>
      <WebSocketClient
        url={`${VITE_WS_BACKEND_URL}`}
        onMessage={handleWebSocketMessage}
        userId={userId}
        sendMessageRef={sendMessageRef}
      />
      {gameData.status === GameStatus.Pending && (
        <GameLobby gameData={gameData} />
      )}
      {gameData.status === GameStatus.SettingUp && (
        <SetupGame
          gameData={gameData}
          sendMessage={sendMessage}
          userId={userId}
        />
      )}
      {(gameData.status === GameStatus.onGameWaiting ||
        gameData.status === GameStatus.onGameYourTurn) && (
        <ActiveGame
          gameData={gameData}
          sendMessage={sendMessage}
          userId={userId}
        />
      )}
      {gameData.status == GameStatus.Finished && (
          <GameResultPage gameData={gameData} />
      )
      }
    </>
  );
};

export default GamePage;
