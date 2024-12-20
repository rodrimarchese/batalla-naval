import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import ActiveGameBoard from "../components/ActiveGameBoard";
import backgroundMusic from "../assets/audio/backgroundMusic.wav";
import hitSound from "../assets/audio/hitSound.wav";
import missSound from "../assets/audio/missSound.wav";
import { useNavigate } from "react-router-dom";

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ActiveGame = ({ gameData, sendMessage, userId }) => {
  const navigate = useNavigate();

  const hitAudioRef = useRef(new Audio(hitSound));
  const missAudioRef = useRef(new Audio(missSound));
  const [previousMissedHits, setPreviousMissedHits] = useState(
    gameData.yourMissedHits.length
  );
  const audioRef = useRef(new Audio(backgroundMusic));

  useEffect(() => {
    const audio = audioRef.current;
    // Configuración del audio
    audio.loop = true; // Para que la música de fondo se repita
    audio.volume = 0.01; // Ajustar el volumen entre 0.0 y 1.0
    audio.play();
    // Limpiar al desmontar el componente
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (gameData.status === "onGameWaiting") {
      // Comparar el estado actual de yourMissedHits con el estado anterior
      if (gameData.yourMissedHits.length > previousMissedHits) {
        missAudioRef.current.volume = 0.3;
        missAudioRef.current.play();
      } else if (gameData.yourMissedHits.length === previousMissedHits) {
        hitAudioRef.current.volume = 0.05;
        hitAudioRef.current.play();
      }

      setPreviousMissedHits(gameData.yourMissedHits.length);
    }
  }, [gameData]);

  const handleAutoShot = () => {
    const autoShotMessage = {
      userId: userId,
      type: "autoShot",
      message: {
        gameId: gameData.id,
      },
    };
    console.log("Enviando solicitud de AutoShot:", autoShotMessage);
    sendMessage(JSON.stringify(autoShotMessage));
  };

  const abandonGame = async () => {
    try {
      const response = await fetch(`${VITE_BACKEND_URL}/game/abandon`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId: gameData.id,
          userId: userId,
        }),
      });

      if (response.ok) {
        navigate("/games");
      } else {
        console.error("Error al abandonar el juego");
      }
    } catch (error) {
      console.error("Error al abandonar el juego:", error);
    }
  };

  const isPlayerTurn =
    gameData.status === "onGameYourTurn" || gameData.status === "onGameStarted";

  const [timeRemaining, setTimeRemaining] = useState(25); // Temporizador inicializado con 20 segundos

  useEffect(() => {
    if (isPlayerTurn) {
      setTimeRemaining(25); // Reiniciar el temporizador cada vez que sea el turno del jugador

      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      // Limpiar el temporizador cuando termine el turno o el componente se desmonte
      return () => clearInterval(timer);
    }
  }, [isPlayerTurn]);

  console.log("[ActiveGame] gameData actual de este jugador:", gameData);

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <Button
        type="primary"
        className="mb-4"
        onClick={abandonGame}
        style={{
          alignSelf: "flex-start",
          backgroundColor: "#f44336",
          borderColor: "#f44336",
        }}
      >
        Abandonar
      </Button>
      <Button
        type="primary"
        className="mb-4 ml-2"
        onClick={() => window.history.back()}
        style={{ alignSelf: "flex-start" }}
      >
        Salir de la partida
      </Button>
      <div className="text-center">
        <h1 className="text-sm text-gray-500 mb-2">
          Partida ID: {gameData.id}
        </h1>
        <h1
          className={`text-lg font-bold mb-6 ${
            isPlayerTurn
              ? "text-green-500 bg-green-100 p-4 rounded-lg text-2xl"
              : "text-red-500"
          }`}
        >
          {isPlayerTurn ? "Tu turno" : "Esperando al oponente"}
        </h1>
        {isPlayerTurn && (
          <div className="text-lg text-gray-700 mb-6">
            Tiempo restante: {timeRemaining} segundos
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-xl mb-2">Tu Tablero</h2>

          <ActiveGameBoard
            gridSize={15}
            cellSize={30}
            gameData={gameData}
            boardType="defense"
            playerCanShoot={false} // No puedes disparar en tu propio tablero
            sendMessage={sendMessage}
            userId={userId}
          />

          <div
            className="p-4 bg-gray-100 rounded shadow-md flex flex-col items-start mb-4 mt-4"
            style={{ minHeight: "180px" }}
          >
            <h3 className="font-bold mb-4">
              Referencia de colores - Tu Tablero
            </h3>
            <div className="flex items-center mb-2">
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "gray",
                  marginRight: "10px",
                }}
              ></div>
              <span>Tu bote</span>
            </div>
            <div className="flex items-center mb-2">
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "red",
                  marginRight: "10px",
                }}
              ></div>
              <span>Impacto - en tu Bote</span>
            </div>
            <div className="flex items-center mb-2">
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "blue",
                  marginRight: "10px",
                }}
              ></div>
              <span>Disparo fallido del oponente</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-xl mb-2">Tablero del Oponente</h2>

          <ActiveGameBoard
            gridSize={15}
            cellSize={30}
            gameData={gameData}
            boardType="attack"
            playerCanShoot={isPlayerTurn}
            sendMessage={sendMessage}
            userId={userId}
          />
          <Button
            type="primary"
            className="mt-4"
            onClick={handleAutoShot}
            disabled={!isPlayerTurn}
          >
            AutoShot
          </Button>
          <div
            className="p-4 bg-gray-100 rounded shadow-md flex flex-col items-start mb-4 mt-4"
            style={{ minHeight: "180px" }}
          >
            <h3 className="font-bold mb-4">
              Referencia de colores - Tablero del Oponente
            </h3>
            <div className="flex items-center mb-2">
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "red",
                  marginRight: "10px",
                }}
              ></div>
              <span>Impacto - en el Bote del oponente</span>
            </div>
            <div className="flex items-center mb-2">
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  backgroundColor: "blue",
                  marginRight: "10px",
                }}
              ></div>
              <span>Disparo fallido propio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActiveGame;
