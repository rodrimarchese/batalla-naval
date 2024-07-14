import { checkIfCorrectTurn, createMovement } from "./movementService";
import { Request, Response } from 'express';
import { userWithId } from '../user/userService';
import {
  gameById,
} from '../game/gameService';
export async function getMovementsForGame(req: Request, res: Response) {
  try {
    const body = req.body;
    const user = await userWithId(body.userId);
    const game = await gameById(body.gameId);
    const x = body.x;
    const y = body.y;
      
    
    const movements = await createMovement(user.id, {gameId: game.id,x, y });
    
    return res.json({ message: 'Event received', yourData: game });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error saving game' });
  }
}