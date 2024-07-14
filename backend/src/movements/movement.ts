import { Game } from '../game/game';
import { User } from '../user/user';

export type Movement = {
  id: string;
  game: Game | null;
  user: User | null;
  xCoordinate: number;
  yCoordinate: number;
  movedAt: Date;
};