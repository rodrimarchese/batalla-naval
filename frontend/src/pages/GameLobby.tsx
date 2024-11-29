import React from "react";
import { Link } from "react-router-dom";
import { Spinner } from "../components/Spinner";

interface Props {
    gameData: any; // Asegúrate de definir una interfaz más específica o usar la existente
}

const GameLobby: React.FC<Props> = ({ gameData }) => {
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
                <Spinner />
            </div>
        </div>
    );
};

export default GameLobby;