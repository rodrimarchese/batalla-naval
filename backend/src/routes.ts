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
import { addBoard } from './board/boardController';

export const userRoutes = Router();

userRoutes.post('/createUser', createUser);

userRoutes.get('/allUsers', getUsers);
userRoutes.get('/user/:id', getUser);

userRoutes.post('/game', createGameWithUsers);
userRoutes.post('/game/new', createGameOpen);
userRoutes.get('/game/pending', getAllPendingGames);
userRoutes.get('/game/:id', getGame);

userRoutes.put('/game/addMe', addMeToGame);

userRoutes.post('/board', addBoard);
