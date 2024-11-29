import { GameStatus } from '../game/game';

export enum SendMessageType {
  GameSetUp = 'settingUp',
  CorrectSettingUp = 'correctSettingUp',
  OnConnection = 'onConnection',
  onGameYourTurn = 'onGameYourTurn',
  onGameWaiting = 'onGameWaiting',
  finishGame = 'finishGame',
  ErrorMessage = 'error',
  Shot = 'shot',
  AutoShot = 'autoShot',
  GameSetUpAutoPlay = 'settingUpAutoPlay',
  AutoPlayResponse = 'autoPlayResponse',
}

export type ApprovedGame = {
  hostId: string;
  hostName: string;
  guestId: string;
  guestName: string;
  gameId: string;
  status: GameStatus;
};

export type MessageSend = {
  userId: string;
  type: SendMessageType;
  message: any;
};
