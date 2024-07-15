import React, { useState } from "react";
import Draggable from "react-draggable";

const DraggableBoat = ({
  id,
  positions,
  cellSize,
  gridSize,
  color,
  onPositionChange,
}) => {
  const orientation =
    positions.length > 1 && positions[0].x === positions[1].x
      ? "vertical"
      : "horizontal";
  const initialX = Math.min(...positions.map((pos) => pos.x)) * cellSize;
  const initialY = Math.min(...positions.map((pos) => pos.y)) * cellSize;

  const [position, setPosition] = useState({ x: initialX, y: initialY });

  const bounds = {
    left: 0,
    top: 0,
    right:
      (gridSize - (orientation === "horizontal" ? positions.length : 1)) *
      cellSize,
    bottom:
      (gridSize - (orientation === "vertical" ? positions.length : 1)) *
      cellSize,
  };

  const handleStop = (e, data) => {
    const newX = Math.round(data.lastX / cellSize) * cellSize;
    const newY = Math.round(data.lastY / cellSize) * cellSize;

    if (!onPositionChange(id, newX, newY)) {
      // Si el movimiento no es válido, reinicia la posición al valor inicial
      setPosition({ x: initialX, y: initialY });
    } else {
      // Si es válido, actualiza con la nueva posición
      setPosition({ x: newX, y: newY });
    }
  };

  return (
    <Draggable
      axis="both"
      handle={`.handle${id}`}
      position={position}
      grid={[cellSize, cellSize]}
      bounds={bounds}
      onStop={handleStop}
      //   style={{ position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width:
            orientation === "horizontal"
              ? positions.length * cellSize
              : cellSize,
          height:
            orientation === "vertical" ? positions.length * cellSize : cellSize,
        }}
      >
        {positions.map((pos, index) => (
          <div
            key={index}
            className={`handle${id} flex justify-center items-center cursor-pointer`}
            style={{
              position: "absolute",
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              left: orientation === "horizontal" ? index * cellSize : 0,
              top: orientation === "vertical" ? index * cellSize : 0,
              backgroundColor: color,
              zIndex: 1000, // Asegura que los barcos puedan superponerse visualmente
            }}
          />
        ))}
      </div>
    </Draggable>
  );
};

export default DraggableBoat;
