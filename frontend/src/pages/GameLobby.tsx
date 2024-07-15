import React from "react";
import { Link } from "react-router-dom";
import { Spinner } from "../components/Spinner";

interface Props {
  gameData: any; // Asegúrate de definir una interfaz más específica o usar la existente
}

const GameLobby: React.FC<Props> = ({ gameData }) => {
  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg">
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
      <p className="text-yellow-500">Waiting for a guest to join...</p>
      <Link to="/games" className="text-blue-500 hover:underline mt-4 block">
        Back to games list
      </Link>
      <Spinner />
    </div>
  );
};

export default GameLobby;
