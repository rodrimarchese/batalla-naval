import { UUID } from 'crypto';
import { User } from '../user/user';
import { Game } from '../game/game';
import { Ship } from '../ship/ship';
import { Board, ShipPartStatus } from './board';
import { mapShipStatusFromDB } from '../ship/util';

export function convertToBoard(
  id: UUID,
  user: User | null,
  game: Game | null,
  shipPartStatus: string,
  ship: Ship | null,
  xCoordinate: number,
  yCoordinate: number,
): Board {
  return {
    id,
    user,
    game,
    ship,
    shipPartStatus: mapShipStatusFromDB(shipPartStatus),
    xCoordinate,
    yCoordinate,
  };
}

//CAST BOARD

type ShipPosition = {
  x: number;
  y: number;
  shipPartStatus: ShipPartStatus;
};

type ShipInfo = {
  shipType: string;
  positions: ShipPosition[];
};

type UserShipInfo = {
  userId: string;
  ships: ShipInfo[];
};

export function generateUserShipInfo(boards: Board[]): UserShipInfo[] {
  const userShipInfoMap: Map<string, ShipInfo[]> = new Map();

  boards.forEach(board => {
    const shipType = board.ship?.shipType;
    if (shipType) {
      const userId = board.user!.id;
      const position: ShipPosition = {
        x: board.xCoordinate,
        y: board.yCoordinate,
        shipPartStatus: board.shipPartStatus,
      };

      const shipInfo: ShipInfo = {
        shipType: shipType,
        positions: [position],
      };

      if (userShipInfoMap.has(userId)) {
        const existingShips = userShipInfoMap.get(userId) || [];
        const existingShipIndex = existingShips.findIndex(
          ship => ship.shipType === shipType,
        );
        if (existingShipIndex !== -1) {
          existingShips[existingShipIndex].positions.push(position);
        } else {
          existingShips.push(shipInfo);
        }
        userShipInfoMap.set(userId, existingShips);
      } else {
        userShipInfoMap.set(userId, [shipInfo]);
      }
    }
  });

  const userShipInfoArray: UserShipInfo[] = [];
  userShipInfoMap.forEach((ships, userId) => {
    const userShipInfo: UserShipInfo = {
      userId: userId,
      ships: ships,
    };
    userShipInfoArray.push(userShipInfo);
  });

  return userShipInfoArray;
}

export type CastedObject = {
  status?: string;
  gameId: string;
  userId: string;
  boardStatus: {
    gameId: string;
    userId: string;
    ships: {
      shipType: string;
      shipId: string;
      positions: {
        x: number;
        y: number;
        status: string;
      }[];
    }[];
  };
};

export function castBoardItems(
  boardItems: (Board | null)[][],
): CastedObject | null {
  if (
    !boardItems ||
    boardItems.length === 0 ||
    !boardItems[0] ||
    boardItems[0].length === 0
  ) {
    return null;
  }

  const firstItem = boardItems[0][0];

  if (firstItem?.game && firstItem?.user) {
    const gameId = firstItem.game.id;
    const userId = firstItem.user.id;

    // Utiliza un mapa para almacenar información de los barcos, clave por ship_id
    const shipMap: {
      [key: string]: {
        shipId: string;
        shipType: string;
        positions: { x: number; y: number; status: string }[];
      };
    } = {};

    boardItems.flat().forEach(item => {
      if (item && item.ship) {
        const shipId = item.ship.id;
        const shipType = item.ship?.shipType || 'default';
        const position = {
          x: item.xCoordinate,
          y: item.yCoordinate,
          status: item.shipPartStatus,
        };
        if (!shipMap[shipId]) {
          shipMap[shipId] = { shipId, shipType, positions: [] };
        }
        shipMap[shipId].positions.push(position);
      }
    });

    // Extrae los valores del mapa para obtener la lista de barcos
    const ships = Object.values(shipMap);

    return {
      gameId,
      userId,
      boardStatus: {
        gameId,
        userId,
        ships,
      },
    };
  }

  return null;
}
