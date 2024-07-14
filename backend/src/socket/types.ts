import { GameStatus } from "../game/game";

export enum SendMessageType {
  GameSetUp = 'settingUp',
  OnConnection = 'onConnection',
  onGameYourTurn = 'onGameYourTurn',
  onGameWaiting = 'onGameWaiting',
  finishGame = 'finishGame',
  ErrorMessage = 'error',
  Shot = 'shot',
}


export type ApprovedGame = {
  hostId: String;
  hostName: String;
  guestId: String;
  guestName: String;
  gameId: String;
  status: GameStatus;
};

export type MessageSend = {
  userId: string;
  type: SendMessageType;
  message: string;
};
