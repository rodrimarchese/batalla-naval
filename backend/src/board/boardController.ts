import { Request, Response } from 'express';
import { gameById } from '../game/gameService';
import { userWithId } from '../user/userService';
import { saveNewBoard } from './boardService';

/*
Este metodo crea guarda de un board el espacio de las piezas de un ship

ejemplo en postman:

{
    "gameId": "a841a505-2bd9-43f4-ba43-bcb4a1aeedf0",
    "userId": "123",
    "ships": [
        {
            "shipType": "A",
            "positions": [{"x": 1, "y":2, }, {"x": 2, "y":2}]
        }

    ]
}

el shipType es por si el front lo quiere manejar, por ejemplo el tamaño del ship si se necesita
 */
export async function addBoard(req: Request, res: Response) {
  try {
    const body = req.body;
    const game = await gameById(body.gameId);
    const user = await userWithId(body.userId);
    const boardDefined = await saveNewBoard(game, user, body.ships);
    return res.json({ message: 'Event received', yourData: boardDefined });
  } catch (error: any) {
    return res.status(500).json({ message: 'Error creating board' });
  }
}
