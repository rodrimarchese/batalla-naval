import { User } from '../user/user';
import { Game, GameStatus } from './game';
import { UUID } from 'crypto';
import { convertToUserByData } from '../user/util';

export function convertToGame(
  id: UUID,
  host: User | null,
  guest: User | null,
  status: string,
  createdAt: any,
  startedAt: any,
  finishedAt: any,
  currentTurnStartedAt: any,
  winner: User | null,
  currentTurnUser: User | null,
): Game {
  return {
    id,
    host,
    guest,
    status: mapStatusFromDB(status),
    createdAt: new Date(createdAt),
    startedAt: startedAt ? new Date(startedAt) : null,
    finishedAt: finishedAt ? new Date(finishedAt) : null,
    currentTurnStartedAt: currentTurnStartedAt
      ? new Date(currentTurnStartedAt)
      : null,
    winner: winner,
    currentTurnUser: currentTurnUser,
  };
}

export function mapStatusToDB(status: GameStatus): string {
  return status;
}

export function mapStatusFromDB(statusInDB: string): GameStatus {
  if (statusInDB == 'started') return GameStatus.Started;
  if (statusInDB == 'pending') return GameStatus.Pending;
  if (statusInDB == 'settingUp') return GameStatus.SettingUp;
  if (statusInDB == 'finished') return GameStatus.Finished;
  else return GameStatus.Pending;
}

export function convertGames(data: any[]): Game[] {
  return data.map(gameData => {
    return {
      id: gameData.id,
      host: gameData.host ? convertToUserByData(gameData.host) : null,
      guest: gameData.guest ? convertToUserByData(gameData.guest) : null,
      status: mapStatusFromDB(gameData.status),
      createdAt: new Date(gameData.created_at),
      startedAt: gameData.started_at ? new Date(gameData.started_at) : null,
      finishedAt: gameData.finished_at ? new Date(gameData.finished_at) : null,
      currentTurnStartedAt: gameData.current_turn_started_at
        ? new Date(gameData.current_turn_started_at)
        : null,
      winner: gameData.winner ? convertToUserByData(gameData.host) : null,
      currentTurnUser: gameData.currentTurnUser
        ? convertToUserByData(gameData.currentTurnUser)
        : null,
    };
  });
}

export function convertToGameByData(data: any): Game | null {
  if (data == null) return null;
  return {
    id: data.id,
    host: data.host ? convertToUserByData(data.host) : null,
    guest: data.guest ? convertToUserByData(data.guest) : null,
    status: mapStatusFromDB(data.status),
    createdAt: new Date(data.created_at),
    startedAt: data.started_at ? new Date(data.started_at) : null,
    finishedAt: data.ended_at ? new Date(data.ended_at) : null,
    currentTurnStartedAt: data.current_turn_started_at
      ? new Date(data.current_turn_started_at)
      : null,
    winner: data.winner ? convertToUserByData(data.host) : null,
    currentTurnUser: data.current_turn_user_id
      ? convertToUserByData(data.current_turn_user_id)
      : null,
  };
}
