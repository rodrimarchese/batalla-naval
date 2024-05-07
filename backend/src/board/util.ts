import { UUID } from 'crypto';
import { User } from '../user/user';
import { Game } from '../game/game';
import { mapStatusFromDB } from '../game/util';
import { Ship } from '../ship/ship';
import { Board } from './board';
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
