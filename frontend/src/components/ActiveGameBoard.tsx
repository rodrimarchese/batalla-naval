import React, { useState } from "react";

const ActiveGameBoard = ({
  gameData,
  gridSize,
  cellSize,
  playerCanShoot,
  sendMessage,
  userId, // Asegúrate de pasar el userId desde el componente padre
}) => {
  const [board, setBoard] = useState(
    Array(gridSize).fill(Array(gridSize).fill(null))
  );

  const handleCellClick = (x, y) => {
    if (!playerCanShoot) {
      console.log("Wait for your turn!");
      return; // No hacer nada si no es el turno del jugador
    }
    if (board[y][x] !== null) {
      console.log("Position already shot!");
      return; // Evitar disparar sobre la misma celda más de una vez
    }
    const newBoard = [...board];
    newBoard[y] = [...newBoard[y]];
    newBoard[y][x] = "shot"; // Marcar la celda como disparada
    setBoard(newBoard);

    console.log(`Shot at: (${x}, ${y})`);

    // Preparar el mensaje a enviar
    const shotMessage = {
      userId: userId,
      type: "Shot",
      message: { gameId: gameData.id, x: x, y: y },
    };

    // Enviar mensaje de disparo
    sendMessage(JSON.stringify(shotMessage));
  };

  return (
    <div
      className="grid"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
        width: `${gridSize * cellSize}px`,
        height: `${gridSize * cellSize}px`,
      }}
    >
      {board.map((row, y) =>
        row.map((cell, x) => (
          <div
            key={`${x}-${y}`}
            onClick={() => handleCellClick(x, y)}
            style={{
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              backgroundColor: cell === "shot" ? "red" : "transparent",
              border: "1px solid black",
              boxSizing: "border-box",
              cursor: playerCanShoot ? "pointer" : "not-allowed",
            }}
          />
        ))
      )}
    </div>
  );
};

export default ActiveGameBoard;
