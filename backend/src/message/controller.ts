import {sendAllMessagesPending} from '../index'
import { Request, Response } from 'express';

export async function sendMessages(req: Request, res: Response) {
  try {
    const body = req.body;

    const updatedGame = await sendAllMessagesPending(body.userId);
    return res.json({ message: 'Event received', yourData: updatedGame });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error sending Messages' });
  }
}