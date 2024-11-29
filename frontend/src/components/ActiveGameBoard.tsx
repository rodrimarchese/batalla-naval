// ActiveGameBoard.js
import React, { useState, useEffect } from "react";

const ActiveGameBoard = ({
                           gameData,
                           gridSize,
                           cellSize,
                           boardType, // "attack" o "defense"
                           playerCanShoot,
                           sendMessage,
                           userId,
                         }) => {
  const [board, setBoard] = useState(
      Array(gridSize)
          .fill(null)
          .map(() => Array(gridSize).fill(null))
  );

  // Actualizar el tablero cuando gameData cambie
  useEffect(() => {
    const newBoard = Array(gridSize)
        .fill(null)
        .map(() => Array(gridSize).fill(null));

    if (boardType === "defense") {
      // Tablero de defensa: mostrar tus naves y los disparos del oponente
      const ships = gameData.boardStatus?.ships || [];
      ships.forEach((ship) => {
        ship.positions.forEach((pos) => {
          const { x, y, status } = pos;
          if (status === "alive") {
            newBoard[y][x] = "ship";
          } else if (status === "hit" || status === "dead") {
            newBoard[y][x] = "hit";
          }
        });
      });

      // Si tienes información de los disparos del oponente, actualízala aquí
      const opponentShots = gameData.opponentShots || [];
      opponentShots.forEach((shot) => {
        const { x, y, result } = shot;
        if (newBoard[y][x] === null) {
          newBoard[y][x] = result === "miss" ? "miss" : null;
        }
      });

      // Mostrar disparos fallidos del oponente
      const rivalMissedHits = gameData.rivalMissedHits || [];
      rivalMissedHits.forEach(({ x, y }) => {
        if (newBoard[y][x] === null) {
          newBoard[y][x] = "miss";
        }
      });
    } else if (boardType === "attack") {
      // Tablero de ataque: mostrar tus disparos al oponente y las piezas hundidas
      const playerShots = gameData.playerShots || [];
      playerShots.forEach((shot) => {
        const { x, y, result } = shot;
        newBoard[y][x] = result;
      });

      // Mostrar las piezas hundidas del oponente
      const deadPiecesOfTheOther = gameData.deadPiecesOfTheOther || [];
      deadPiecesOfTheOther.forEach(({ x, y }) => {
        newBoard[y][x] = "hit";
      });

      // Mostrar disparos fallidos propios
      const yourMissedHits = gameData.yourMissedHits || [];
      yourMissedHits.forEach(({ x, y }) => {
        if (newBoard[y][x] === null) {
          newBoard[y][x] = "miss";
        }
      });
    }

    setBoard(newBoard);
  }, [gameData, boardType, gridSize]);

  const handleCellClick = (x, y) => {
    if (boardType !== "attack") return; // Solo puedes hacer clic en el tablero de ataque

    if (!playerCanShoot) {
      alert("Espera tu turno!");
      return;
    }

    if (board[y][x] !== null && board[y][x] !== "pending") {
      alert("Esa posición ya la tocaste!");
      return;
    }

    // Marcar la celda como "pending" mientras esperas la respuesta del servidor
    const newBoard = [...board];
    newBoard[y] = [...newBoard[y]];
    newBoard[y][x] = "pending";
    setBoard(newBoard);

    const shotMessage = {
      userId: userId,
      type: "shot",
      message: {
        gameId: gameData.id,
        xCoordinate: x,
        yCoordinate: y,
      },
    };

    console.log(`Shot at: (${x}, ${y})`);

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
            row.map((cell, x) => {
              let backgroundColor = "transparent";
              let cursor = "default";

              if (boardType === "defense") {
                if (cell === "ship") {
                  backgroundColor = "gray"; // Tu nave
                } else if (cell === "hit") {
                  backgroundColor = "red"; // Tu nave ha sido impactada
                } else if (cell === "miss") {
                  backgroundColor = "blue"; // Disparo fallido del oponente
                }
              } else if (boardType === "attack") {
                if (cell === "hit") {
                  backgroundColor = "red"; // Impactaste al oponente
                } else if (cell === "miss") {
                  backgroundColor = "blue"; // Disparo fallido al oponente
                } else if (cell === "pending") {
                  backgroundColor = "yellow"; // Esperando confirmación
                }
                cursor = playerCanShoot && cell === null ? "pointer" : "not-allowed";
              }

              return (
                  <div
                      key={`${x}-${y}`}
                      onClick={() => handleCellClick(x, y)}
                      style={{
                        width: `${cellSize}px`,
                        height: `${cellSize}px`,
                        backgroundColor,
                        border: "1px solid black",
                        boxSizing: "border-box",
                        cursor,
                      }}
                  />
              );
            })
        )}
      </div>
  );
};

export default ActiveGameBoard;