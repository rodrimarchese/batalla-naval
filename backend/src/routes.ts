// routes
import { Router } from 'express';
import { createUser, getUsers, getUser } from './user/userController';
import {
  addMeToGame,
  createGameOpen,
  createGameWithUsers,
  getAllPendingGames,
  getGame,
} from './game/gameController';

import { sendMessages } from './message/controller';
import { addBoard } from './board/boardController';
import { getMovementsForGame } from './movements/movementController';
import {
  getAverageGameDuration,
  getUserAccuracyStats,
  getUserGameHistory,
  getWinLossStats,
} from './stadistics/statisticsController';
export const userRoutes = Router();

userRoutes.post('/createUser', createUser);

userRoutes.get('/allUsers', getUsers);
userRoutes.get('/user/:id', getUser);

userRoutes.post('/game', createGameWithUsers);
userRoutes.post('/game/new', createGameOpen);
userRoutes.get('/game/pending', getAllPendingGames);
userRoutes.get('/game/:id', getGame);

userRoutes.get('/sendMessages', sendMessages);

userRoutes.put('/game/addMe', addMeToGame);

userRoutes.post('/board', addBoard);

userRoutes.get('/movements', getMovementsForGame);

userRoutes.get('/statistics/history/:userId', getUserGameHistory);

userRoutes.get('/statistics/winOrLost/:userId', getWinLossStats);

userRoutes.get('/statistics/accuracy/:userId', getUserAccuracyStats);

userRoutes.get('/statistics/averageDuration/:userId', getAverageGameDuration);
