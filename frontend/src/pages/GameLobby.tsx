import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";

interface Props {
    gameData: any;
}

const VITE_BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const GameLobby: React.FC<Props> = ({ gameData }) => {
    const navigate = useNavigate();

    const abandonGame = async () => {
        try {
            const response = await fetch(`${VITE_BACKEND_URL}/game/abandon`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    gameId: gameData.id,
                    userId: gameData.host.id,
                }),
            });

            if (response.ok) {
                navigate("/home");
            } else {
                console.error("Error al abandonar el juego");
            }
        } catch (error) {
            console.error("Error al abandonar el juego:", error);
        }
    };

    return (
        <div className="flex w-full h-screen items-start justify-center pt-20">
            <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg text-center">
                <h1 className="text-lg font-bold mb-4">ID del Juego: {gameData.id}</h1>
                <p>
                    <strong>Anfitrión:</strong> {gameData.host.name}
                </p>
                <p>
                    <strong>Email:</strong> {gameData.host.email}
                </p>
                <p>
                    <strong>Juego Creado El:</strong> {new Date(gameData.createdAt).toLocaleString()}
                </p>
                <p className="text-yellow-500">Esperando que un invitado se una...</p>
                <Link to="/games" className="text-blue-500 hover:underline mt-4 block">
                    Volver a la lista de juegos
                </Link>
                <button
                    onClick={abandonGame}
                    className="mt-7 mb-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                >
                    Abandonar
                </button>
                <Spinner />
            </div>
        </div>
    );
};

export default GameLobby;
