import { supabase } from '../db/supabase';
import { User } from '../user/user';
import { Game, GameStatus } from '../game/game';
import { userWithId } from '../user/userService';
import { Movement } from './movement';
import {
  changeStatusOfPiece,
  sendMessageOfStatus,
} from '../board/boardService';

import { gameById } from '../game/gameService';

import { UUID } from 'crypto';

import { convertToUserByData } from '../user/util';
import { convertToGameByData } from '../game/util';
import { MessageSend, SendMessageType } from '../socket/types';
import { sendMessageToUser } from '../index';

export async function createMovement(userId: string, message: any) {
  try {
    const user = await userWithId(userId);

    const game = await gameById(message.gameId);

    const x = message.xCoordinate;
    const y = message.yCoordinate;

    if (game.status == GameStatus.Finished) {
      const messageSend: MessageSend = {
        userId: userId,
        type: SendMessageType.ErrorMessage,
        message: JSON.stringify({ error: 'The game is finished' }),
      };
      await sendMessageToUser(messageSend);
    } else if (await checkIfCorrectTurn(user, game)) {
      const possibleMovement = {
        game_id: game.id,
        user_id: user.id,
        x_coordinate: x,
        y_coordinate: y,
      };

      const { data: gameQuery, error } = await supabase
        .from('movements')
        .insert([possibleMovement])
        .select('*');

      if (gameQuery === null) return null;

      const id = gameQuery[0].id;

      const movement = await movementById(id);

      if (movement.game !== null && movement.user !== null) {
        await changeStatusOfPiece(movement.game, movement.user, x, y);
        await sendMessageOfStatus(game, user);
      }
      if (error) {
        throw error;
      }
    } else {
      const messageSend: MessageSend = {
        userId: userId,
        type: SendMessageType.ErrorMessage,
        message: JSON.stringify({ error: 'not your turn' }),
      };
      await sendMessageToUser(messageSend);
    }
  } catch (e: any) {
    const messageSend: MessageSend = {
      userId: userId,
      type: SendMessageType.ErrorMessage,
      message: JSON.stringify({
        error: 'INVALID VALUE (game, user or coordinates)',
      }),
    };
    await sendMessageToUser(messageSend);
  }
}

export async function movementById(id: string) {
  const { data, error } = await supabase
    .from('movements')
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

  return convertToMove(
    data.id,
    user,
    game,
    data.x_coordinate,
    data.y_coordinate,
    data.moved_at,
  );
}

export function convertToMove(
  id: UUID,
  user: User | null,
  game: Game | null,
  xCoordinate: number,
  yCoordinate: number,
  movedAt: Date,
): Movement {
  return {
    id,
    game,
    user,
    xCoordinate,
    yCoordinate,
    movedAt,
  };
}

export async function checkIfCorrectTurn(
  user: User,
  game: Game,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('movements')
    .select(
      `
        *,
        user:user_id (
            *
        ),
        game:game_id (
            *
        )
    `,
    )
    .eq('game_id', game.id);

  if (data !== null && data.length == 0 && game.host?.id == user.id) {
    return true;
  }

  console.log('TURNS ', data);

  if (data && data.length > 0) {
    const sortedData = data.sort(
      (a, b) => new Date(b.moved_at).getTime() - new Date(a.moved_at).getTime(),
    );
    const lastMovement = sortedData[0];

    if (lastMovement.user_id === user.id) {
      return false;
    }
    return true;
  } else if (data && data.length === 0 && game.host?.id === user.id) {
    return true;
  }

  return false;

  if (error) {
    throw error;
  }
}
