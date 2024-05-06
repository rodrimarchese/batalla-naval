// routes
import { Router } from 'express';
import { createUser } from './userController';

export const userRoutes = Router();

userRoutes.post('/createUser', createUser);