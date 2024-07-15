import React from "react";
import { Link } from "react-router-dom";

interface Props {
  gameData: any; // Define la interfaz más específica para tu juego
}

const ActiveGame: React.FC<Props> = ({ gameData }) => {
  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-lg font-bold mb-4">
        Game ID: {gameData.id} - In Play
      </h1>
      {/* Aquí iría la lógica de tu interfaz de juego */}
      <Link to="/games" className="text-blue-500 hover:underline mt-4 block">
        Back to games list
      </Link>
    </div>
  );
};

export default ActiveGame;
