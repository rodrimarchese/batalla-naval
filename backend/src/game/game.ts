import { UUID } from 'crypto';
import { User } from '../user/user';

export enum GameStatus {
  Pending = 'pending',
  SettingUp = 'settingUp',
  Started = 'started',
  Finished = 'finished',
}
export type Game = {
  id: UUID;
  host: User | null;
  guest: User | null;
  status: GameStatus; //esto cuando tengamos lo de notificaciones va a importar, mientras tanto no
  createdAt: Date;
};
