// routes
import { Router } from 'express';
import { createUser, getUsers, getUser } from './user/userController';
import {
  abandonGame,
  addMeToGame,
  createGameOpen,
  createGameWithUsers,
  getActualGame,
  getAllPendingGames,
  getGame,
  getUserGames,
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
import cors from 'cors';
export const userRoutes = Router();

// disable cors for this routes
userRoutes.use(
  cors({
    origin: '*', // Permitir todos los orígenes
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permitir todos los métodos
    allowedHeaders: ['Content-Type', 'Authorization'], // Permitir todos los encabezados necesarios
  }),
);

userRoutes.options('*', cors());

userRoutes.post('/createUser', createUser);

userRoutes.get('/allUsers', getUsers);
userRoutes.get('/user/:id', getUser);

userRoutes.post('/game', createGameWithUsers);
userRoutes.post('/game/new', createGameOpen);
userRoutes.get('/game/pending', getAllPendingGames);
userRoutes.get('/game/:id', getGame);

userRoutes.get('/sendMessages', sendMessages);

userRoutes.put('/game/addMe', addMeToGame);

userRoutes.get('/game/me/:userId', getUserGames);

userRoutes.get('/game/actual/:userId/:gameId', getActualGame);

userRoutes.post('/game/abandon', abandonGame);

userRoutes.post('/board', addBoard);

userRoutes.get('/movements', getMovementsForGame);

userRoutes.get('/statistics/history/:userId', getUserGameHistory);

userRoutes.get('/statistics/winOrLost/:userId', getWinLossStats);

userRoutes.get('/statistics/accuracy/:userId', getUserAccuracyStats);

userRoutes.get('/statistics/averageDuration/:userId', getAverageGameDuration);
