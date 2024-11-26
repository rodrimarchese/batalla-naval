import React from "react";
import { Link } from "react-router-dom";
import ActiveGameBoard from "../components/ActiveGameBoard";

const ActiveGame = ({ gameData, sendMessage, userId }) => {
  const isPlayerTurn = gameData.status === "onGameYourTurn";

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-lg font-bold mb-4">
        Game ID: {gameData.id} -{" "}
        {isPlayerTurn ? "Your Turn" : "Waiting for Opponent"}
      </h1>
      {isPlayerTurn ? (
        <ActiveGameBoard
          gridSize={15}
          cellSize={30}
          gameData={gameData}
          playerCanShoot={isPlayerTurn}
          sendMessage={sendMessage}
          userId={userId}
        />
      ) : (
        <div className="text-center">
          <p>Loading...</p> {/* Mostrar algún loader aquí */}
        </div>
      )}
      <Link to="/games" className="text-blue-500 hover:underline mt-4 block">
        Back to games list
      </Link>
    </div>
  );
};

export default ActiveGame;
