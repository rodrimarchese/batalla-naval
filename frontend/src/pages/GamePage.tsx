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
  onGameWaiting = "onGameWaiting",
  onGameYourTurn = "onGameYourTurn",
  Started = "started",
  Finished = "finished",
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

  // En GamePage.js
  const handleWebSocketMessage = useCallback((data: any) => {
    try {
      const parsedData: ReceivedData =
        typeof data === "string" ? JSON.parse(data) : data;
      console.log("Received message DATA:", parsedData);

      // const messageContent = JSON.parse(parsedData.message);
      // console.log("Received message POST DATA:", messageContent);

      const messageContent = parsedData.message;

      // setGameData((prevData) => {
      //   let updatedData = { ...prevData, status: parsedData.type };

      //   // Actualizar boardStatus y deadPiecesOfTheOther si están presentes
      //   if (messageContent.boardStatus) {
      //     updatedData.boardStatus = messageContent.boardStatus;
      //   }

      //   if (messageContent.deadPiecesOfTheOther) {
      //     updatedData.deadPiecesOfTheOther =
      //       messageContent.deadPiecesOfTheOther;
      //   }

      //   // Manejar disparos del jugador
      //   if (parsedData.type === "shotResult") {
      //     const shotResult = {
      //       x: messageContent.xCoordinate,
      //       y: messageContent.yCoordinate,
      //       result: messageContent.result, // "hit" o "miss"
      //     };

      //     updatedData.playerShots = [
      //       ...(prevData.playerShots || []),
      //       shotResult,
      //     ];
      //   }

      //   // Manejar disparos del oponente
      //   if (parsedData.type === "opponentShot") {
      //     const opponentShot = {
      //       x: messageContent.xCoordinate,
      //       y: messageContent.yCoordinate,
      //       result: messageContent.result, // "hit" o "miss"
      //     };

      //     updatedData.opponentShots = [
      //       ...(prevData.opponentShots || []),
      //       opponentShot,
      //     ];
      //   }

      //   return updatedData;
      // });
    } catch (error) {
      console.error("Error parsing WebSocket message:", error);
    }
  }, []);

  // const handleWebSocketMessage = useCallback((data: any) => {
  //   try {
  //     // 1. Verificar si 'data' es un string y parsearlo
  //     const parsedData: ReceivedData =
  //       typeof data === "string" ? JSON.parse(data) : data;
  //     console.log("Received message DATA:", parsedData);

  //     // 2. Parsear la propiedad 'message' que también es un string JSON
  //     const message: MessageData = JSON.parse(parsedData.message);
  //     console.log("Received message ACA:", message);

  //     // 3. Actualizar el estado según el tipo y el status
  //     // if (
  //     //   parsedData.type === "onGameWaiting" ||
  //     //   parsedData.type === "onGameYourTurn"
  //     // ) {
  //     setGameData((prevData) => ({
  //       ...prevData,
  //       status: parsedData.type,
  //     }));
  //     // }

  //     // if (message.status) {
  //     //   setGameData((prevData) => ({
  //     //     ...prevData,
  //     //     status: message.status,
  //     //     // Puedes añadir otros campos aquí si es necesario
  //     //   }));
  //     // }
  //   } catch (error) {
  //     console.error("Error parsing WebSocket message:", error);
  //   }
  // }, []);

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
    </>
  );
};

export default GamePage;
