import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Progress } from "antd";
import winnerMusic from "../assets/audio/winnerMusic.wav";
import loserMusic from "../assets/audio/loserMusic.wav";

const GameResultPage = ({ gameData }) => {
    const navigate = useNavigate();
    const audioRef = useRef(null);

    // Determinar el mensaje y color basado en si el jugador ganó o perdió
    const resultMessage = gameData.winner ? "¡Ganaste!" : "Perdiste";
    const resultColor = gameData.winner ? "green" : "red";

    // Datos generales
    const totalPieces = 20;
    const hits = gameData.deadPiecesOfTheOther.length;
    const misses = gameData.yourMissedHits.length;
    const totalShots = hits + misses;
    const accuracy = totalShots > 0 ? Number(((hits / totalShots) * 100).toFixed(2)) : 0;
    const opponentMissedHits = gameData.rivalMissedHits.length;

    const accuracyData = {
        totalShots,
        totalHits: hits,
        percent: accuracy,
    };

    useEffect(() => {
        // Seleccionar la música correcta según el resultado del juego
        const audio = gameData.winner ? new Audio(winnerMusic) : new Audio(loserMusic);
        audio.volume = 0.5; // Ajustar el volumen
        audio.play();
        audioRef.current = audio;

        // Limpiar al desmontar el componente
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        };
    }, [gameData.winner]);

    return (
        <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg">
            <h1
                className="text-4xl font-bold mb-6 text-center"
                style={{ color: resultColor }}
            >
                {resultMessage}
            </h1>

            <div className="stats-section mt-6">
                <h2 className="text-2xl font-semibold mb-4">Estadísticas del Juego</h2>
                <ul className="list-disc pl-6 mb-6">
                    <li>ID del Juego: {gameData.id}</li>
                    <li>Total de Piezas Hundidas del Oponente: {hits} / {totalPieces}</li>
                    <li>Tus Disparos Fallidos: {misses}</li>
                    <li>Disparos Fallidos del Oponente: {opponentMissedHits}</li>
                    <li>Precisión de Tus Disparos: {accuracy}%</li>
                </ul>

                {accuracyData && (
                    <div className="accuracy-chart mt-6" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <h2 className="text-2xl mb-4">Estadísticas de Precisión</h2>
                        <Progress
                            type="circle"
                            percent={accuracyData.percent}
                            format={(percent) => `${percent}% Precisión`}
                            width={200}
                        />
                        <div className="mt-4">
                            <p>Total de Disparos: {accuracyData.totalShots}</p>
                            <p>Total de Aciertos: {accuracyData.totalHits}</p>
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={() => navigate("/home")}
                className="mt-8 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-700"
            >
                Ir a Inicio
            </button>
        </div>
    );
};

export default GameResultPage;
