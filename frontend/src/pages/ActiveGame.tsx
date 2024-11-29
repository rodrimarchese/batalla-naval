import React, { useEffect, useRef, useState } from "react";
import { Button } from "antd";
import ActiveGameBoard from "../components/ActiveGameBoard";
// import backgroundMusic from "../assets/audio/backgroundMusic.wav";
import hitSound from "../assets/audio/hitSound.wav";
import missSound from "../assets/audio/missSound.wav";

const ActiveGame = ({ gameData, sendMessage, userId }) => {
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

    const isPlayerTurn =
        gameData.status === "onGameYourTurn" || gameData.status === "onGameStarted";

    const hitAudioRef = useRef(new Audio(hitSound));
    const missAudioRef = useRef(new Audio(missSound));
    const [previousMissedHits, setPreviousMissedHits] = useState(gameData.yourMissedHits.length);
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

            // Actualizar el estado anterior
            setPreviousMissedHits(gameData.yourMissedHits.length);
        }
    }, [gameData]);

    console.log("[ActiveGame] gameData actual de este jugador:", gameData);

    return (
        <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
            <Button
                type="primary"
                className="mb-4"
                onClick={() => window.history.back()}
                style={{ alignSelf: 'flex-start' }}
            >
                Salir de la partida
            </Button>
            <div className="text-center">
                <h1 className="text-sm text-gray-500 mb-2">Partida ID: {gameData.id}</h1>
                <h1 className={`text-lg font-bold mb-6 ${isPlayerTurn ? 'text-green-500' : 'text-red-500'}`}>
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
                    <div className="p-4 bg-gray-100 rounded shadow-md flex flex-col items-start mb-4" style={{ minHeight: '180px' }}>
                        <h3 className="font-bold mb-4">Referencia de colores - Tu Tablero</h3>
                        <div className="flex items-center mb-2">
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'gray', marginRight: '10px' }}></div>
                            <span>Tu bote (no destruido)</span>
                        </div>
                        <div className="flex items-center mb-2">
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'red', marginRight: '10px' }}></div>
                            <span>Impacto - en tu tablero (te pegaron bien)</span>
                        </div>
                        <div className="flex items-center mb-2">
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'blue', marginRight: '10px' }}></div>
                            <span>Disparo fallido del oponente</span>
                        </div>
                    </div>
                    <ActiveGameBoard
                        gridSize={15}
                        cellSize={30}
                        gameData={gameData}
                        boardType="defense"
                        playerCanShoot={false} // No puedes disparar en tu propio tablero
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
                </div>
                <div className="flex flex-col items-center">
                    <h2 className="font-bold text-xl mb-2">Tablero del Oponente</h2>
                    <div className="p-4 bg-gray-100 rounded shadow-md flex flex-col items-start mb-4" style={{ minHeight: '180px' }}>
                        <h3 className="font-bold mb-4">Referencia de colores - Tablero del Oponente</h3>
                        <div className="flex items-center mb-2">
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'red', marginRight: '10px' }}></div>
                            <span>Impacto - en el del oponente (le pegaste bien)</span>
                        </div>
                        <div className="flex items-center mb-2">
                            <div style={{ width: '20px', height: '20px', backgroundColor: 'blue', marginRight: '10px' }}></div>
                            <span>Disparo fallido (tuyo)</span>
                        </div>
                    </div>
                    <ActiveGameBoard
                        gridSize={15}
                        cellSize={30}
                        gameData={gameData}
                        boardType="attack"
                        playerCanShoot={isPlayerTurn}
                        sendMessage={sendMessage}
                        userId={userId}
                    />
                </div>
            </div>
        </div>
    );
};

export default ActiveGame;

