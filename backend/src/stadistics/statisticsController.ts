import { Request, Response } from 'express';
import {
  fetchAverageGameDuration,
  fetchUserAccuracyStats,
  fetchUserGameHistory,
  fetchWinLossStats,
} from './statisticsService';

/*
-  historial mostrando el usuario contrincante, resultado (ganado, perdido, abandonado), fecha, duración y eficiencia.
 */
export async function getUserGameHistory(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const games = await fetchUserGameHistory(userId);
    return res.json({ games });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error getting user game history' });
  }
}

/*
- porcentaje de ganados vs perdidos. (Esto obviamente desde el back seria dar una respuesta sobre el porcentaje)
 */

export async function getWinLossStats(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const stats = await fetchWinLossStats(userId);
    return res.json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: 'Error getting win/loss stats' });
  }
}

/*
- Nivel de precisión total y por partida. */

export async function getUserAccuracyStats(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const stats = await fetchUserAccuracyStats(userId);
    return res.json(stats);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Error getting user accuracy stats' });
  }
}

/*
- Duración de cada partida.
 */

export async function getAverageGameDuration(req: Request, res: Response) {
  try {
    const userId = req.params.userId;
    const stats = await fetchAverageGameDuration(userId);
    return res.json(stats);
  } catch (error: any) {
    return res
      .status(500)
      .json({ message: 'Error getting average game duration' });
  }
}
