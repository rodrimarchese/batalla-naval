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
): Game {
  return {
    id,
    host,
    guest,
    status: mapStatusFromDB(status),
    createdAt: new Date(createdAt),
  };
}

export function mapStatusToDB(status: GameStatus): string {
  return status;
}

export function mapStatusFromDB(statusInDB: string): GameStatus {
  if (statusInDB == 'started') return GameStatus.Started;
  if (statusInDB == 'pending') return GameStatus.Pending;
  if (statusInDB == 'finished') return GameStatus.Finished;
  else return GameStatus.Pending;
}

export function convertGames(data: any[]): Game[] {
  return data.map(gameData => {
    return {
      id: gameData.id,
      host: convertToUserByData(gameData.host),
      guest: convertToUserByData(gameData.guest),
      status: mapStatusFromDB(gameData.status),
      createdAt: new Date(gameData.created_at),
    };
  });
}
