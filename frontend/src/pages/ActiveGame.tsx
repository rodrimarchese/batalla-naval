// ActiveGame.js
import React from "react";
import { Link } from "react-router-dom";
import ActiveGameBoard from "../components/ActiveGameBoard";

const ActiveGame = ({ gameData, sendMessage, userId }) => {
  const isPlayerTurn =
    gameData.status === "onGameYourTurn" || gameData.status === "onGameStarted";

  console.log("[ActiveGame] gameData actual de este jugador:", gameData);

  return (
    <div className="max-w-xl mx-auto p-4 bg-white shadow-md rounded-lg">
      <h1 className="text-lg font-bold mb-4">
        Game ID: {gameData.id} -{" "}
        {isPlayerTurn ? "Your Turn" : "Waiting for Opponent"}
      </h1>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "10px",
        }}
      >
        <div
          style={{
            margin: "10px",
          }}
        >
          <h2>Your Board</h2>
          <ActiveGameBoard
            gridSize={15}
            cellSize={30}
            gameData={gameData}
            boardType="defense"
            playerCanShoot={false} // No puedes disparar en tu propio tablero
            sendMessage={sendMessage}
            userId={userId}
          />
        </div>
        <div
          style={{
            margin: "10px",
          }}
        >
          <h2>Opponent's Board</h2>
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
      <Link to="/games" className="text-blue-500 hover:underline mt-4 block">
        Back to games list
      </Link>
    </div>
  );
};

export default ActiveGame;
