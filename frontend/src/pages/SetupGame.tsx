import React, { useState, useEffect } from "react";
import DraggableBoat from "../components/DraggableBoat";
import { Button } from "antd";

const SetupGame = ({ gameData, sendMessage, userId }) => {
  console.log("gameData:", gameData);

  const gridSize = 15; // Cuadrícula de 15x15
  const cellSize = 30; // Cada celda mide 30x30px
  const [ships, setShips] = useState([
    {
      id: "Patrullero",
      color: "red",
      positions: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ], // Barco vertical de tamaño 2
    },
    {
      id: "Submarino",
      color: "blue",
      positions: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
      ], // Barco horizontal de tamaño 3
    },
    {
      id: "Destructor",
      color: "green",
      positions: [
        { x: 0, y: 3 },
        { x: 0, y: 4 },
        { x: 0, y: 5 },
        { x: 0, y: 6 },
      ], // Barco horizontal de tamaño 4
    },
    {
      id: "Acorazado",
      color: "purple",
      positions: [
        { x: 3, y: 4 },
        { x: 3, y: 5 },
        { x: 3, y: 6 },
        { x: 3, y: 7 },
        { x: 3, y: 8 },
      ], // Barco vertical de tamaño 5
    },
    {
      id: "Portaaviones",
      color: "orange",
      positions: [
        { x: 3, y: 2 },
        { x: 4, y: 2 },
        { x: 5, y: 2 },
        { x: 6, y: 2 },
        { x: 7, y: 2 },
        { x: 8, y: 2 },
      ], // Barco horizontal
    },
  ]);
  const [awaitingApproval, setAwaitingApproval] = useState(false);

  useEffect(() => {
    if (gameData.ships) {
      setShips(gameData.ships);
    }
  }, [gameData]);

  const checkPositionValid = (newPositions, otherShips) => {
    const occupied = new Set(
        otherShips.flatMap((ship) =>
            ship.positions.map((pos) => `${pos.x},${pos.y}`)
        )
    );
    return newPositions.every((pos) => !occupied.has(`${pos.x},${pos.y}`));
  };

  const updateShipPosition = (id, newX, newY) => {
    let validMove = false;
    setShips((prevShips) => {
      const movingShip = prevShips.find((ship) => ship.id === id);
      const otherShips = prevShips.filter((ship) => ship.id !== id);
      const baseX = newX / cellSize;
      const baseY = newY / cellSize;

      if (!movingShip) return prevShips;

      const newPositions = movingShip.positions.map((pos, index) => {
        if (movingShip.positions[0].x === movingShip.positions[1].x) {
          // Orientación vertical
          return { x: baseX, y: baseY + index };
        } else {
          // Orientación horizontal
          return { x: baseX + index, y: baseY };
        }
      });

      if (checkPositionValid(newPositions, otherShips)) {
        validMove = true;
        return prevShips.map((ship) =>
            ship.id === id ? { ...ship, positions: newPositions } : ship
        );
      }
      return prevShips; // Si no es válido, no cambia los barcos
    });
    return validMove;
  };

  const sendShipSetup = () => {
    const shipData = ships.map((ship) => ({
      shipType: ship.id,
      positions: ship.positions,
    }));

    console.log("Enviando configuración de barcos:", shipData);

    const message = {
      userId: userId,
      type: "settingUp",
      message: JSON.stringify({
        gameId: gameData.id,
        ships: shipData,
      }),
    };

    sendMessage(JSON.stringify(message));
  };

  const sendAutoPlayRequest = () => {
    const message = {
      userId: userId,
      type: "settingUpAutoPlay",
      message: {
        gameId: gameData.id,
      },
    };

    console.log("Enviando solicitud de autoPlay:", message);
    sendMessage(JSON.stringify(message));
    setAwaitingApproval(false);
  };

  return (
      <div className="flex flex-row items-start justify-center mt-8">
        <div
            className="relative border border-gray-800 bg-gray-50 mr-8"
            style={{
              width: `${gridSize * cellSize}px`,
              height: `${gridSize * cellSize}px`,
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent ${
                  cellSize - 1
              }px, #ccc ${cellSize - 1}px, #ccc ${cellSize}px),
                          repeating-linear-gradient(90deg, transparent, transparent ${
                  cellSize - 1
              }px, #ccc ${cellSize - 1}px, #ccc ${cellSize}px)`,
            }}
        >
          {ships.map((ship) => (
              <DraggableBoat
                  key={`${ship.id}-${ship.positions[0].x}-${ship.positions[0].y}`} // Usar una clave única para forzar la re-renderización
                  id={ship.id}
                  positions={ship.positions}
                  color={ship.color}
                  cellSize={cellSize}
                  gridSize={gridSize}
                  onPositionChange={updateShipPosition}
              />
          ))}
        </div>

        <div className="ml-4 mt-4 flex flex-col items-start">
          <h2>Posiciones de los barcos:</h2>
          <ul>
            {ships.map((ship) => (
                <li key={ship.id}>
                  <strong>{ship.id}:</strong>{" "}
                  {ship.positions.map((pos) => `(${pos.x}, ${pos.y})`).join(", ")}
                </li>
            ))}
          </ul>
          <div className="flex justify-center mt-6">
            <Button
                type="primary"
                style={{ backgroundColor: "#ff9800", borderColor: "#ff9800" }}
                onClick={sendShipSetup}
            >
              Estoy listo
            </Button>
          </div>
          <div className="flex justify-center mt-2">
            <Button
                type="default"
                style={{ backgroundColor: "#4caf50", borderColor: "#4caf50" }}
                onClick={sendAutoPlayRequest}
            >
              Generar autoPlay
            </Button>
          </div>
          {awaitingApproval && (
              <div className="flex justify-center mt-2">
                <Button
                    type="primary"
                    style={{ backgroundColor: "#ff9800", borderColor: "#ff9800" }}
                    onClick={sendShipSetup}
                >
                  Aceptar Configuración
                </Button>
                <Button
                    type="default"
                    style={{
                      backgroundColor: "#f44336",
                      borderColor: "#f44336",
                      marginLeft: "10px",
                    }}
                    onClick={sendAutoPlayRequest}
                >
                  Regenerar
                </Button>
              </div>
          )}
        </div>
      </div>
  );
};

export default SetupGame;
