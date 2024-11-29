import { UUID } from 'crypto';
import { User } from '../user/user';

export enum GameStatus {
  Pending = 'pending',
  SettingUp = 'settingUp',
  Started = 'started',
  Finished = 'finished',
  Abandoned = 'abandoned',
}
export type Game = {
  id: UUID;
  host: User | null;
  guest: User | null;
  status: GameStatus; //esto cuando tengamos lo de notificaciones va a importar, mientras tanto no
  createdAt: Date;
  startedAt: Date | null; // Fecha de inicio del juego
  finishedAt: Date | null; // Fecha de finalización del juego
  currentTurnStartedAt: Date | null;
  winner: User | null;
};
