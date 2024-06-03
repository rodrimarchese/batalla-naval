import { User } from '../user/user';
import { Game } from '../game/game';
import { saveShip } from '../ship/shipService';
import { Ship } from '../ship/ship';
import { supabase } from '../db/supabase';
import { convertToShipByData, mapShipStatusToDB } from '../ship/util';
import { ShipPartStatus } from './board';
import { convertToUserByData } from '../user/util';
import { convertToGameByData } from '../game/util';
import { convertToBoard } from './util';

export async function saveNewBoard(
  game: Game,
  user: User,
  ships: { shipType: string; positions: { x: number; y: number }[] }[],
) {
  //TODO: AGREGAR QUE NO SE PISEN EN LAS COORDENADAS
  const saveShipPromises = ships.map(async possibleShip => {
    const ship = await saveShip(possibleShip.shipType);
    const saveBoardPromises = possibleShip.positions.map(async position => {
      return saveBoard(game, user, ship, position.x, position.y);
    });
    return Promise.all(saveBoardPromises);
  });
  return Promise.all(saveShipPromises);
}



export async function checkBoardForAGameAndUser(game: Game, user: User) {
  const { data: existingRecord, error } = await supabase
    .from('board')
    .select('*')
    .eq('game_id', game.id)
    .eq('user_id', user.id)
    .limit(1);

  if (error) {
    console.error('Error fetching record:', error);
    throw error;
  } else if (existingRecord.length > 0) {
    return true;
  } else {
    return false;
  }
}

export async function saveBoard(
  game: Game,
  user: User,
  ship: Ship | null,
  xCoordinate: number,
  yCoordinate: number,
) {
  try {
    const possibleBoard = {
      game_id: game.id,
      user_id: user.id,
      x_coordinate: xCoordinate,
      y_coordinate: yCoordinate,
      ship_id: ship === null ? null : ship.id,
      ship_part_status: mapShipStatusToDB(ShipPartStatus.Alive),
    };
    const { data: boardQuery, error } = await supabase
      .from('board')
      .insert([possibleBoard])
      .select('*');

    if (boardQuery === null) return null;

    if (error) {
      console.log(error);
      throw error;
    }

    const id = boardQuery[0].id;
    const board = await boardById(id);

    if (error) {
      console.log(error);
      throw error;
    }

    console.log('Board ', board);
    return board;
  } catch (error) {
    throw new Error('Error inserting game in database');
  }
}
export async function boardById(id: string) {
  const { data, error } = await supabase
    .from('board')
    .select(
      `
      *,
      game:game_id (
        *,
        host:users!host_id(*),
        guest:users!guest_id(*)
      ),
      user:user_id (
        *
      ),
      ship: ship_id (
        *
      )
    `,
    )
    .eq('id', id)
    .single();

  if (error) {
    throw error;
  }

  const user = convertToUserByData(data.user);
  const game = convertToGameByData(data.game);
  const ship = convertToShipByData(data.ship);

  return convertToBoard(
    data.id,
    user,
    game,
    data.ship_part_status,
    ship,
    data.x_coordinate,
    data.y_coordinate,
  );
}

export async function getBoardForGameIdAndUserId(game: Game, user: User) {}
