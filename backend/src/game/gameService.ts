import { supabase } from '../db/supabase';
import { User } from '../user/user';
import { Game, GameStatus } from './game';
import { convertToUserByData } from '../user/util';
import { convertGames, convertToGame, mapStatusToDB } from './util';
import { ApprovedGame, MessageSend, SendMessageType } from '../socket/types';
import { sendMessageToUser } from '../index';
import { CastedObject } from '../board/util';
export async function saveGame(host: User, guest: User, status: GameStatus) {
  try {
    const possibleGame = {
      host_id: host.id,
      guest_id: guest.id,
      status: mapStatusToDB(status),
    };

    const { data: gameQuery, error } = await supabase
      .from('game')
      .insert([possibleGame])
      .select('*');

    if (gameQuery === null) return null;

    const id = gameQuery[0].id;

    const game = await gameById(id);

    if (error) {
      throw error;
    }

    return game;
  } catch (error) {
    throw new Error('Error inserting game in database');
  }
}

export async function saveGameWithOneUser(host: User, status: GameStatus) {
  try {
    const possibleGame = {
      status: mapStatusToDB(status),
      host_id: host.id,
    };

    const { data: gameQuery, error } = await supabase
      .from('game')
      .insert([possibleGame])
      .select('*');

    if (gameQuery === null) return null;

    const id = gameQuery[0].id;

    const game = await gameById(id);

    if (error) {
      throw error;
    }

    return game;
  } catch (error) {
    throw new Error('Error inserting game in database');
  }
}

export async function gameById(id: string) {
  console.log('ID ', id);
  const { data, error: error } = await supabase
    .from('game')
    .select(
      `
                *,
                guest:guest_id (
                    *
                ),
                host:host_id (
                    *
                ) 
            `,
    )
    .eq('id', id)
    .single();

  console.log('Data FETCHED ', data);

  if (error) {
    throw error;
  }
  const host = convertToUserByData(data.host);
  const guest = convertToUserByData(data.guest);

  return convertToGame(data.id, host, guest, data.status, data.created_at);
}

export async function pendingGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('game')
    .select(
      `
                *,
                guest:guest_id (
                    *
                ),
                host:host_id (
                    *
                ) 
            `,
    )
    .eq('status', 'pending');

  if (error) {
    throw new Error('Error fetching games from Superbase');
  }

  return convertGames(data);
}

export async function chooseGame(possibleGuest: User, game: Game) {
  const { data, error } = await supabase
    .from('game')
    .update({
      guest_id: possibleGuest.id,
      status: GameStatus.SettingUp,
    })
    .eq('id', game.id)
    .select(
      `
                *,
                guest:guest_id (
                    *
                ),
                host:host_id (
                    *
                ) 
            `,
    );

  if (error) {
    throw new Error('Error fetching game from Superbase');
  }

  if (data === null) return null;
  const id = data[0].id;
  const gameResult: Game = await gameById(id);

  if (gameResult.host != null && gameResult.guest != null) {
    //Que le avise a los dos que estan en partida
    const approvedGame: ApprovedGame = {
      hostId: gameResult.host.id,
      hostName: gameResult.host.name,
      guestId: gameResult.guest.id,
      guestName: gameResult.guest.name,
      gameId: gameResult.id,
      status: GameStatus.SettingUp,
    };

    const messageHost: MessageSend = {
      userId: gameResult.host.id,
      type: SendMessageType.GameSetUp,
      message: JSON.stringify(approvedGame),
    };
    await sendMessageToUser(messageHost);

    const messageGuest: MessageSend = {
      userId: gameResult.guest.id,
      type: SendMessageType.GameSetUp,
      message: JSON.stringify(approvedGame),
    };
    await sendMessageToUser(messageGuest);
  }

  return gameResult;
}

export async function startGame(game: Game) {
  const { data, error } = await supabase
    .from('game')
    .update({
      status: GameStatus.Started,
    })
    .eq('id', game.id)
    .select('id');

  if (error) {
    throw new Error('Error fetching game from Superbase');
  }

  if (data === null) return null;
  const id = data[0].id;
  const gameResult: Game = await gameById(id);

  if (gameResult.host != null && gameResult.guest != null) {
    //Que le avise a los dos que empezó la partida

    const approvedGame: ApprovedGame = {
      hostId: gameResult.host.id,
      hostName: gameResult.host.name,
      guestId: gameResult.guest.id,
      guestName: gameResult.guest.name,
      gameId: gameResult.id,
      status: GameStatus.Started,
    };

    const messageHost: MessageSend = {
      userId: gameResult.host.id,
      type: SendMessageType.GameSetUp,
      message: JSON.stringify(approvedGame),
    };
    sendMessageToUser(messageHost);

    const messageGuest: MessageSend = {
      userId: gameResult.guest.id,
      type: SendMessageType.GameSetUp,
      message: JSON.stringify(approvedGame),
    };
    sendMessageToUser(messageGuest);
  }

  return gameResult;
}

export async function startGameD(
  game: Game,
  boardStatusHost: CastedObject,
  boardStatusGuest: CastedObject,
) {
  const { data, error } = await supabase
    .from('game')
    .update({
      status: GameStatus.Started,
    })
    .eq('id', game.id)
    .select('id');

  console.log('Data ', data);
  if (error) {
    throw new Error('Error fetching game from Superbase');
  }

  if (data === null) return null;
  const id = data[0].id;
  const gameResult: Game = await gameById(id);
  boardStatusHost.status = SendMessageType.onGameYourTurn;

  if (gameResult.host != null && gameResult.guest != null) {
    const messageHost: MessageSend = {
      userId: gameResult.host.id,
      type: SendMessageType.onGameYourTurn,
      message: JSON.stringify(boardStatusHost),
    };
    sendMessageToUser(messageHost);

    boardStatusGuest.status = SendMessageType.onGameWaiting;

    const messageGuest: MessageSend = {
      userId: gameResult.guest.id,
      type: SendMessageType.onGameWaiting,
      message: JSON.stringify(boardStatusGuest),
    };
    sendMessageToUser(messageGuest);
  }

  return gameResult;
}
