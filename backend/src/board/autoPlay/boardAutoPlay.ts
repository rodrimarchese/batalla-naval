interface ShipPosition {
  id: string;
  color: string;
  positions: { x: number; y: number }[];
}

const BOARD_SIZE = 15;

// Tipos de barcos y sus tamaños, colores y orientaciones
const SHIPS: {
  id: string;
  size: number;
  color: string;
  orientation: 'V' | 'H';
}[] = [
  { id: 'Patrullero', size: 2, color: 'red', orientation: 'V' },
  { id: 'Submarino', size: 3, color: 'blue', orientation: 'H' },
  { id: 'Destructor', size: 4, color: 'green', orientation: 'H' },
  { id: 'Acorazado', size: 5, color: 'purple', orientation: 'V' },
  { id: 'Portaaviones', size: 6, color: 'orange', orientation: 'H' },
];

export function autoArrangeShips(): ShipPosition[] {
  const board: string[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null),
  );
  const ships: ShipPosition[] = [];

  for (const ship of SHIPS) {
    let placed = false;

    while (!placed) {
      // Generar una posición inicial aleatoria
      const startX = Math.floor(Math.random() * BOARD_SIZE);
      const startY = Math.floor(Math.random() * BOARD_SIZE);

      // Usar la orientación predefinida para cada barco
      const direction = ship.orientation;

      // Verificar si el barco cabe en la posición generada
      if (canPlaceShip(board, startX, startY, direction, ship.size)) {
        // Colocar el barco en el tablero
        const positions: { x: number; y: number }[] = [];
        for (let i = 0; i < ship.size; i++) {
          const x = direction === 'H' ? startX + i : startX;
          const y = direction === 'V' ? startY + i : startY;
          board[y][x] = ship.id;
          positions.push({ x, y });
        }
        ships.push({ id: ship.id, color: ship.color, positions });
        placed = true;
      }
    }
  }

  return ships;
}

function canPlaceShip(
  board: string[][],
  startX: number,
  startY: number,
  direction: 'H' | 'V',
  size: number,
): boolean {
  for (let i = 0; i < size; i++) {
    const x = direction === 'H' ? startX + i : startX;
    const y = direction === 'V' ? startY + i : startY;

    // Verificar si la posición está dentro del tablero
    if (x >= BOARD_SIZE || y >= BOARD_SIZE) {
      return false;
    }

    // Verificar si la posición ya está ocupada
    if (board[y][x] !== null) {
      return false;
    }
  }
  return true;
}
