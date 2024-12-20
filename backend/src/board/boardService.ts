import { User } from '../user/user';
import { Game } from '../game/game';
import { saveShip } from '../ship/shipService';
import { Ship } from '../ship/ship';
import { supabase } from '../db/supabase';
import { convertToShipByData, mapShipStatusToDB } from '../ship/util';
import { ShipPartStatus } from './board';
import { convertToUserByData } from '../user/util';
import { convertToGameByData } from '../game/util';
import { convertToBoard, CastedObject, castBoardItems } from './util';
import { finishGame, gameById, startGameD } from '../game/gameService';
import { userWithId } from '../user/userService';
import { MessageSend, SendMessageType } from '../socket/types';
import { endGame, sendMessageToUser } from '../index';

export async function addBoard(body: any, userId: string) {
  console.log('BODY ', body);
  try {
    const game = await gameById(body.gameId);
    if (game == null) {
      const messageSend: MessageSend = {
        userId: userId,
        type: SendMessageType.ErrorMessage,
        message: JSON.stringify({ error: 'This game does not exists' }),
      };
      await sendMessageToUser(messageSend);
      return;
    }
    const user = await userWithId(userId);
    if (game.host?.id !== user.id && game.guest?.id !== user.id) {
      const messageSend: MessageSend = {
        userId: userId,
        type: SendMessageType.ErrorMessage,
        message: JSON.stringify({
          error: 'You are not allowed to modify this game',
        }),
      };
      await sendMessageToUser(messageSend);
      return;
    }

    const existingBoard = await getBoardsForGameIdAndUserId(game, user);
    if (
      existingBoard &&
      Array.isArray(existingBoard.boardStatus.ships) &&
      existingBoard.boardStatus.ships.length > 0
    ) {
      const messageSend: MessageSend = {
        userId: userId,
        type: SendMessageType.ErrorMessage,
        message: JSON.stringify({
          error: 'You have already set up your board',
        }),
      };
      await sendMessageToUser(messageSend);
      return;
    }

    const boardDefined = await saveNewBoard(game, user, body.ships);
    if (boardDefined == null) return;

    let userToCheck: User | null;
    //ACA chequear que el otro haya guardado el estado y en ese caso empezar el juego
    if (game.host?.id == user.id) userToCheck = game.guest;
    else userToCheck = game.host;

    if (
      game.host !== null &&
      game.host?.id !== null &&
      game.guest != null &&
      game.guest?.id !== null
    ) {
      const boardForHost = await getBoardsForGameIdAndUserId(game, game.host);
      const boardForGuest = await getBoardsForGameIdAndUserId(game, game.guest);

      if (userToCheck) {
        const checkReadyGameStatus = await checkBoardForAGameAndUser(
          game,
          userToCheck,
        );

        if (checkReadyGameStatus) {
          if (boardForGuest !== null && boardForHost !== null) {
            startGameD(game, boardForHost, boardForGuest);
          }
        } else {
          const messageSend: MessageSend = {
            userId: userId,
            type: SendMessageType.CorrectSettingUp,
            message: {
              boardDefined: boardDefined,
            },
          };
          await sendMessageToUser(messageSend);
          return;
        }
      }
    }
  } catch (error: any) {
    console.error('Error adding board:', error);
  }
}

export async function saveNewBoard(
  game: Game,
  user: User,
  ships: { shipType: string; positions: { x: number; y: number }[] }[],
): Promise<CastedObject | null> {
  const positionsSet = new Set<string>();

  for (const ship of ships) {
    for (const position of ship.positions) {
      const positionKey = `${position.x}-${position.y}`;
      if (positionsSet.has(positionKey)) {
        const messageSend: MessageSend = {
          userId: user.id,
          type: SendMessageType.ErrorMessage,
          message: JSON.stringify({
            error: 'Invalid position, keys are duplicated',
          }),
        };
        await sendMessageToUser(messageSend);
        return null;
      }
      positionsSet.add(positionKey);
    }
  }

  try {
    const saveShipPromises = ships.map(async possibleShip => {
      const ship = await saveShip(possibleShip.shipType);
      const saveBoardPromises = possibleShip.positions.map(async position => {
        return saveBoard(game, user, ship, position.x, position.y);
      });
      return Promise.all(saveBoardPromises);
    });

    const boardItems = await Promise.all(saveShipPromises);
    return castBoardItems(boardItems);
  } catch (error) {
    console.error('Error in saveNewBoard:', error);
    return null;
  }
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

export async function getBoardsForGameIdAndUserId(game: Game, user: User) {
  const { data: existingRecord, error } = await supabase
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
    .eq('game_id', game.id)
    .eq('user_id', user.id);

  return castBoardWithShipItems(existingRecord);
}

export async function checkAllPiecesDead(game: Game, user: User) {
  const { data: existingRecord, error } = await supabase
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
    .eq('game_id', game.id)
    .eq('user_id', user.id);

  const castedBoard = castBoardWithShipItems(existingRecord);

  console.log('CASTED BOARD ', castedBoard);
  if (castedBoard !== null) {
    const allDead = castedBoard.boardStatus.ships.every(ship =>
      ship.positions.every(position => position.status === 'dead'),
    );
    return allDead;
  }

  return false;
}

export async function getBoardsDeadFromUser(game: Game, user: User) {
  const { data: existingRecord, error } = await supabase
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
    .eq('game_id', game.id)
    .eq('user_id', user.id)
    .eq('ship_part_status', 'dead');

  return getPositions(existingRecord);
}

function castBoardWithShipItems(boardItems: any): CastedObject | null {
  if (!boardItems || boardItems.length === 0) {
    return null;
  }

  const gameId = boardItems[0].game_id;
  const userId = boardItems[0].user_id;

  const shipMap: {
    [key: string]: {
      shipId: string;
      shipType: string;
      positions: { x: number; y: number; status: string }[];
    };
  } = {};

  boardItems.forEach((item: any) => {
    if (item.ship) {
      const shipId = item.ship.id;
      const shipType = item.ship.ship_type;
      const position = {
        x: item.x_coordinate,
        y: item.y_coordinate,
        status: item.ship_part_status,
      };

      if (!shipMap[shipId]) {
        shipMap[shipId] = { shipId, shipType, positions: [] };
      }
      shipMap[shipId].positions.push(position);
    }
  });

  const ships = Object.values(shipMap);

  return {
    gameId,
    userId,
    boardStatus: {
      gameId,
      userId,
      ships,
    },
  };
}

function getPositions(boardItems: any): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];
  boardItems.forEach((item: any) => {
    if (item.ship) {
      const position = {
        x: item.x_coordinate,
        y: item.y_coordinate,
      };
      positions.push(position);
    }
  });
  return positions;
}

export async function changeStatusOfPiece(
  game: Game,
  userThatShot: User,
  xCoordinate: number,
  yCoordinate: number,
  movementId: string,
) {
  let user: User | null;
  if (game.host?.id == userThatShot.id) user = game.guest;
  else user = game.host;

  if (user !== null) {
    const { data: existingRecord } = await supabase
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
      .eq('game_id', game.id)
      .eq('user_id', user.id)
      .eq('x_coordinate', xCoordinate)
      .eq('y_coordinate', yCoordinate);

    if (existingRecord !== null && existingRecord.length > 0) {
      const position = existingRecord[0];

      const { data, error } = await supabase
        .from('board')
        .update({
          ship_part_status: ShipPartStatus.Dead,
        })
        .eq('id', position.id)
        .select('id');

      await supabase
        .from('movements')
        .update({
          hit: true,
        })
        .eq('id', movementId)
        .select('id');
    }
  }
}

export async function sendMessageOfStatus(game: Game, user: User) {
  let otherUser: User | null;

  if (game.host?.id == user.id) otherUser = game.guest;
  else otherUser = game.host;
  if (otherUser != null) {
    const allDeads = await checkAllPiecesDead(game, otherUser);

    const userMissedHits = await getMissedHits(game.id, user.id);
    const rivalMissedHits = await getMissedHits(game.id, otherUser.id);

    if (allDeads) {
      await finishGame(game, user);
      endGame(game.id);
      const boardDeadOtherUser = await getBoardsDeadFromUser(game, otherUser);
      const boardForUser = await getBoardsForGameIdAndUserId(game, user);
      const messageUser: MessageSend = {
        userId: user.id,
        type: SendMessageType.finishGame,
        message: {
          deadPiecesOfTheOther: boardDeadOtherUser,
          boardStatus: boardForUser,
          winner: true,
          yourMissedHits: userMissedHits,
          rivalMissedHits: rivalMissedHits,
        },
      };
      sendMessageToUser(messageUser);

      const boardDeadUser = await getBoardsDeadFromUser(game, user);
      const boardForOtherUser = await getBoardsForGameIdAndUserId(
        game,
        otherUser,
      );

      const messageOtherUser: MessageSend = {
        userId: otherUser.id,
        type: SendMessageType.finishGame,
        message: {
          deadPiecesOfTheOther: boardDeadUser,
          boardStatus: boardForOtherUser,
          winner: false,
          yourMissedHits: rivalMissedHits,
          rivalMissedHits: userMissedHits,
        },
      };
      sendMessageToUser(messageOtherUser);
    } else {
      const boardDeadOtherUser = await getBoardsDeadFromUser(game, otherUser);
      const boardForUser = await getBoardsForGameIdAndUserId(game, user);

      const messageUser: MessageSend = {
        userId: user.id,
        type: SendMessageType.onGameWaiting,
        message: {
          deadPiecesOfTheOther: boardDeadOtherUser,
          boardStatus: boardForUser,
          yourMissedHits: userMissedHits,
          rivalMissedHits: rivalMissedHits,
        },
      };
      sendMessageToUser(messageUser);
      const boardDeadUser = await getBoardsDeadFromUser(game, user);
      const boardForOtherUser = await getBoardsForGameIdAndUserId(
        game,
        otherUser,
      );

      const messageOtherUser: MessageSend = {
        userId: otherUser.id,
        type: SendMessageType.onGameYourTurn,
        message: {
          deadPiecesOfTheOther: boardDeadUser,
          boardStatus: boardForOtherUser,
          yourMissedHits: rivalMissedHits,
          rivalMissedHits: userMissedHits,
        },
      };
      sendMessageToUser(messageOtherUser);
    }
  }

  async function getMissedHits(gameId: string, userId: string) {
    const { data, error } = await supabase
      .from('movements')
      .select('x_coordinate, y_coordinate')
      .eq('game_id', gameId)
      .eq('user_id', userId)
      .eq('hit', false);

    if (error || !data) {
      console.error('Error fetching missed hits:', error);
      return [];
    }

    return data.map(movement => ({
      x: movement.x_coordinate,
      y: movement.y_coordinate,
    }));
  }
}
