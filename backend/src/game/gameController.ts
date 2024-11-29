import { Request, Response } from 'express';
import { userWithId } from '../user/userService';
import {
  chooseGame,
  gameById,
  pendingGames,
  saveGame,
  saveGameWithOneUser,
} from './gameService';
import { GameStatus } from './game';
import { mapStatusToDB } from './util';
import { supabase } from '../db/supabase';
import { userRoutes } from '../routes';
import { endGame, handleUserConnection } from '../index';

// CREA JUEGO ENTRE 2 USUARIOS, con estado started
export async function createGameWithUsers(req: Request, res: Response) {
  try {
    const body = req.body;

    const host = await userWithId(body.hostId);
    const guest = await userWithId(body.guestId);

    const game = await saveGame(host, guest, GameStatus.Started); // esto deberia manejarse con notifications
    return res.json({ message: 'Event received', yourData: game });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ message: 'Error saving game' });
  }
}

// ABRE UN JUEGO CON UN HOST, con estado pending
export async function createGameOpen(req: Request, res: Response) {
  try {
    const body = req.body;

    const host = await userWithId(body.hostId);

    const game = await saveGameWithOneUser(host, GameStatus.Pending);
    return res.json({ message: 'Event received', yourData: game });
  } catch (error: any) {
    if (
      error.message === 'User not found' ||
      error.message === 'User already has a game in pending or started status'
    ) {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ message: 'Error saving game' });
  }
}

// Pide todos los pending games
export async function getAllPendingGames(req: Request, res: Response) {
  try {
    const game = await pendingGames();
    return res.json({ message: 'Event received', yourData: game });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error saving game' });
  }
}

// Se puede agregar a un juego
export async function addMeToGame(req: Request, res: Response) {
  try {
    const body = req.body;
    const game = await gameById(body.gameId);
    const me = await userWithId(body.userId);

    const updatedGame = await chooseGame(me, game);
    return res.json({ message: 'Event received', yourData: updatedGame });
  } catch (error: any) {
    if (
      error.message == 'User already has a game in pending or started status'
    ) {
      return res.status(404).json({
        message: 'User already has a game in pending or started status',
      });
    }
    return res.status(500).json({ message: 'Error updating game' });
  }
}

// Obtener juegos en "pending" y "started" de un usuario
export async function getUserGames(req: Request, res: Response) {
  const { userId } = req.params;

  console.log('user id', userId);
  try {
    const { data: games, error } = await supabase
      .from('game')
      .select('*')
      .or(`host_id.eq.${userId},guest_id.eq.${userId}`)
      .in('status', [
        mapStatusToDB(GameStatus.Pending),
        mapStatusToDB(GameStatus.Started),
        mapStatusToDB(GameStatus.SettingUp),
      ]);

    console.log(games);
    if (error) {
      return res.status(500).json({ message: 'Error fetching user games' });
    }

    return res.status(200).json(games);
  } catch (err) {
    return res.status(500).json({ message: 'Unexpected error' });
  }
}

export async function getActualGame(req: Request, res: Response) {
  const { userId, gameId } = req.params;
  const message = await handleUserConnection(userId, gameId);

  return res.status(200).json(message);
}
// Abandonar un juego
export async function abandonGame(req: Request, res: Response) {
  const { gameId, userId } = req.body;

  try {
    const game = await gameById(gameId);

    if (!game) {
      return res.status(404).json({ message: 'Game not found' });
    }

    // Verificar que el usuario es parte del juego
    if (game.host?.id !== userId && game.guest?.id !== userId) {
      return res.status(403).json({ message: 'User not part of the game' });
    }

    const { error } = await supabase
      .from('game')
      .update({
        status: GameStatus.Abandoned,
      })
      .eq('id', gameId);

    if (error) {
      return res.status(500).json({ message: 'Error abandoning game' });
    }

    endGame(gameId);
    return res.status(200).json({ message: 'Game abandoned successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Unexpected error' });
  }
}

//PIDE UN JUEGO
export async function getGame(req: Request, res: Response) {
  try {
    const game = await gameById(req.params.id);
    return res.json({ message: 'Event received', yourData: game });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error getting game' });
  }
}
