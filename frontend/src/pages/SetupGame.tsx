import React, { useState } from "react";
import DraggableBoat from "../components/DraggableBoat";
import { Button } from "antd";

interface UserData {
  id: string;
  name: string;
  email: string;
}

const SetupGame = ({ gameData, sendMessage }) => {
  console.log("gameData:", gameData);

  const gridSize = 15; // 15x15 grid
  const cellSize = 30; // Each cell is 30x30px
  const [ships, setShips] = useState([
    {
      id: "Patroller",
      color: "red",
      positions: [
        { x: 0, y: 0 },
        { x: 0, y: 1 },
      ], // Barco vertical de tamaño 2
    },
    {
      id: "Submarine",
      color: "blue",
      positions: [
        { x: 2, y: 0 },
        { x: 3, y: 0 },
        { x: 4, y: 0 },
      ], // Barco horizontal de tamaño 3
    },
    {
      id: "Destroyer",
      color: "green",
      positions: [
        { x: 0, y: 3 },
        { x: 0, y: 4 },
        { x: 0, y: 5 },
        { x: 0, y: 6 },
      ], // Barco horizontal de tamaño 4
    },
    {
      id: "Battleship",
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
      id: "Carrier",
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

  const updateShipPosition = (id, newX, newY) => {
    setShips((prevShips) =>
      prevShips.map((ship) =>
        ship.id === id
          ? {
              ...ship,
              positions: ship.positions.map((pos, index) => {
                // Calcula las nuevas posiciones basándose en la orientación del barco
                if (ship.positions[0].x === ship.positions[1].x) {
                  // Orientación vertical
                  return { x: newX / cellSize, y: newY / cellSize + index };
                } else {
                  // Orientación horizontal
                  return { x: newX / cellSize + index, y: newY / cellSize };
                }
              }),
            }
          : ship
      )
    );
  };

  const logPositions = () => {
    console.log(
      "Current positions:",
      ships.map((ship) => ({
        id: ship.id,
        positions: ship.positions,
      }))
    );
  };

  return (
    <>
      <div
        className="relative border border-gray-800 bg-gray-50"
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
            key={ship.id}
            id={ship.id}
            positions={ship.positions}
            color={ship.color}
            cellSize={cellSize}
            gridSize={gridSize}
            onPositionChange={updateShipPosition}
          />
        ))}
      </div>
      <div className="ml-4">
        <h2>Ship Positions:</h2>
        <ul>
          {ships.map((ship) => (
            <li key={ship.id}>
              <strong>{ship.id}:</strong>{" "}
              {ship.positions.map((pos) => `(${pos.x}, ${pos.y})`).join(", ")}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <Button onClick={logPositions}>Log positions</Button>
      </div>
    </>
  );
};

export default SetupGame;
