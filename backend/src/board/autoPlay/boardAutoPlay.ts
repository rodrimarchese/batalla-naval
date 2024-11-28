interface ShipPosition {
  shipType: string;
  positions: { x: number; y: number }[];
}

const BOARD_SIZE = 10;

// Tipos de barcos y sus tamaños
const SHIPS = [
  { shipType: 'Carrier', size: 5 },
  { shipType: 'Battleship', size: 4 },
  { shipType: 'Cruiser', size: 3 },
  { shipType: 'Submarine', size: 3 },
  { shipType: 'Destroyer', size: 2 },
];

export function autoArrangeShips(): ShipPosition[] {
  const board: string[][] = Array.from({ length: BOARD_SIZE }, () =>
    Array(BOARD_SIZE).fill(null),
  );
  const ships: ShipPosition[] = [];

  for (const ship of SHIPS) {
    let placed = false;

    while (!placed) {
      // Generar una dirección aleatoria (horizontal o vertical)
      const direction = Math.random() < 0.5 ? 'H' : 'V';
      // Generar una posición inicial aleatoria
      const startX = Math.floor(Math.random() * BOARD_SIZE);
      const startY = Math.floor(Math.random() * BOARD_SIZE);

      // Verificar si el barco cabe en la posición generada
      if (canPlaceShip(board, startX, startY, direction, ship.size)) {
        // Colocar el barco en el tablero
        const positions: { x: number; y: number }[] = [];
        for (let i = 0; i < ship.size; i++) {
          const x = direction === 'H' ? startX + i : startX;
          const y = direction === 'V' ? startY + i : startY;
          board[y][x] = ship.shipType;
          positions.push({ x, y });
        }
        ships.push({ shipType: ship.shipType, positions });
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
