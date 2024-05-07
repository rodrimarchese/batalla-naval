import { supabase } from '../db/supabase';
import { User } from '../user/user';
import { Game, GameStatus } from './game';
import { convertToUserByData } from '../user/util';
import { convertGames, convertToGame, mapStatusToDB } from './util';

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

export async function chooseGame(guest: User, game: Game) {
  const { data, error } = await supabase
    .from('game')
    .update({ guest_id: guest.id })
    .eq('id', game.id)
    .select();

  if (error) {
    throw new Error('Error fetching game from Superbase');
  }

  if (data === null) return null;
  const id = data[0].id;
  return await gameById(id);
}
