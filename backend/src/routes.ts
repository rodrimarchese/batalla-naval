// routes
import { Router } from 'express';
import { createUser } from './user/userController';

export const userRoutes = Router();

userRoutes.post('/createUser', createUser);
