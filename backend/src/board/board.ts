import { UUID } from 'crypto';
import { Game } from '../game/game';
import { User } from '../user/user';
import { Ship } from '../ship/ship';

export enum ShipPartStatus {
  Alive = 'alive',
  Dead = 'dead',
}
export type Board = {
  id: UUID;
  game: Game | null;
  user: User | null;
  ship: Ship | null;
  xCoordinate: number;
  yCoordinate: number;
  shipPartStatus: ShipPartStatus;
};
