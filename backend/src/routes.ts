// routes
import { Router } from 'express';
import { createUser, getUsers, getUser } from './user/userController';
import {
  addMeToGame,
  createGameOpen,
  createGameWithUsers,
  getAllPendingGames,
} from './game/gameController';
import { addBoard } from './board/boardController';

export const userRoutes = Router();

userRoutes.post('/user', createUser);

userRoutes.get('/allUsers', getUsers);
userRoutes.get('/user/:id', getUser);

userRoutes.post('/game', createGameWithUsers);
userRoutes.post('/openGame', createGameOpen);
userRoutes.get('/game/pending', getAllPendingGames);

userRoutes.put('/game/addMe', addMeToGame);

userRoutes.post('/board', addBoard);
