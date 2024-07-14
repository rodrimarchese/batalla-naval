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

export type BoardWithShip = {
  id: string;
  game_id: string;
  user_id: string;
  x_coordinate: number;
  y_coordinate: number;
  ship_part_status: string;
  ship_id: string;
  ship: {
    id: string;
    ship_type: string;
    created_at: string;
  };
};