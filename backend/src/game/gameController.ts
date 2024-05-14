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

export async function createGameOpen(req: Request, res: Response) {
  try {
    const body = req.body;

    const host = await userWithId(body.hostId);

    const game = await saveGameWithOneUser(host, GameStatus.Pending);
    return res.json({ message: 'Event received', yourData: game });
  } catch (error: any) {
    if (error.message === 'User not found') {
      return res.status(404).json({ error: error.message });
    }
    return res.status(500).json({ message: 'Error saving game' });
  }
}

export async function getAllPendingGames(req: Request, res: Response) {
  try {
    const game = await pendingGames();
    return res.json({ message: 'Event received', yourData: game });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error saving game' });
  }
}

export async function addMeToGame(req: Request, res: Response) {
  try {
    const body = req.body;
    const game = await gameById(body.gameId);
    const me = await userWithId(body.userId);

    const updatedGame = await chooseGame(me, game);
    return res.json({ message: 'Event received', yourData: updatedGame });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error updating game' });
  }
}

export async function getGame(req: Request, res: Response) {
  try {
    const game = await gameById(req.params.id);
    return res.json({ message: 'Event received', yourData: game });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error getting game' });
  }
}
