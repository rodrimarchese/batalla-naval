import express, {
  Application,
  ErrorRequestHandler,
  NextFunction,
  Request,
  Response,
} from 'express';
import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer, WebSocket } from 'ws';
import { MessageStatus } from './message/util';
import {
  ClerkExpressRequireAuth,
  RequireAuthProp,
  StrictAuthProp,
} from '@clerk/clerk-sdk-node';
import { createClient } from '@supabase/supabase-js';
import { userRoutes } from './routes';
import cors from 'cors';
import { MessageSend, SendMessageType } from './socket/types';
import { addBoard } from './board/boardService';
import { createMovement } from './movements/movementService';
import { autoArrangeShips } from './board/autoPlay/boardAutoPlay';
import { generateUniqueMovement } from './movements/shotAutoPlay';
import { gameById } from './game/gameService';
// Cargar variables de entorno
process.loadEnvFile('.env.local');

const app: Application = express();
const server: HTTPServer = new HTTPServer(app);
const wss: WebSocketServer = new WebSocketServer({ server });
app.use(cors());

const port: number = parseInt(process.env.PORT as string, 10) || 8080;

// Configura el cliente de Supabase
const supabaseUrl: string = process.env.SUPABASE_URL as string;
const supabaseKey: string = process.env.SUPABASE_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

const userConnections = new Map<string, WebSocket>();
interface WebSocketMessage {
  userId: string;
  content: string;
}
// WebSocket connection setup
wss.on('connection', (ws: WebSocket) => {
  console.log('A client connected via WebSocket.');

  // Manejar mensajes entrantes
  ws.on('message', async (message: string) => {
    console.log('Received:', message);
    try {
      const data = JSON.parse(message);
      if (isValidMessageSend(data)) {
        console.log('Mensaje válido:', data);
        await manageMessage(data);
      } else {
        const messageSend: MessageSend = {
          userId: data.userId,
          type: SendMessageType.ErrorMessage,
          message: 'Error persing',
        };
        await sendMessageToUser(messageSend);
        console.error('El mensaje parseado no es válido');
      }
      console.log(`Received message: ${message}`);

      if (data.type == 'onConnection') {
        console.log(`User ${data.userId} connected.`);
        // Guardar la conexión con el userId específico
        userConnections.set(data.userId, ws);

        await sendAllMessagesPending(data.userId);
      }

      // Aquí puedes manejar otros tipos de mensajes
      // Por ejemplo, actualizar el estado del juego, etc.
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });

  // Manejar cierre de conexión
  ws.on('close', () => {
    console.log('A client disconnected');
    // Eliminar al usuario de las conexiones activas
    userConnections.forEach((conn, userId) => {
      if (conn === ws) {
        userConnections.delete(userId);
        console.log(`Connection with user ${userId} closed.`);
      }
    });
  });

  ws.on('error', error => {
    console.error('WebSocket error:', error);
  });
});

app.use(express.json());
app.use(userRoutes);

app.get(
  '/protected-route',
  ClerkExpressRequireAuth({
    // Add options here
    // See the Middleware options section for more details
    jwtKey: process.env.CLERK_JWT_KEY,
    onError: (error: any) => {
      console.error('Error de autenticación:', error);
      return { message: 'Acceso denegado.' };
    },
  }),
  (req: RequireAuthProp<Request>, res) => {
    res.json(req.auth);
  },
);

export async function sendMessageToUser(messageSend: MessageSend) {
  //PONERME DE ACUERDO CON @RODRI si esto mandarlo asi o con todo
  const userConnection = userConnections.get(messageSend.userId);
  if (userConnection) {
    const messageObject = {
      type: messageSend.type,
      message: messageSend.message,
    };
    await saveMessage(messageSend, MessageStatus.send);
    userConnection.send(JSON.stringify(messageObject));
  } else {
    await saveMessage(messageSend, MessageStatus.pending);
    console.error(
      `User ${messageSend.userId} is not connected. Message has been saved`,
    );
  }
}

export async function sendMessageToUserWithoutSaving(messageSend: MessageSend) {
  const userConnection = userConnections.get(messageSend.userId);
  if (userConnection) {
    userConnection.send(messageSend.message);
  } else {
    console.error(
      `User ${messageSend.userId} is not connected. Message has been saved`,
    );
  }
}

async function saveMessage(messageSend: MessageSend, status: MessageStatus) {
  try {
    const message = {
      user_id: messageSend.userId,
      type_of_message: messageSend.type,
      message: messageSend.message,
      status: status,
    };

    const { data: messageQuery, error } = await supabase
      .from('messages')
      .insert(message)
      .select('*');

    console.log('message ', messageQuery);
  } catch (error) {
    throw new Error('Error inserting message in database');
  }
}

export function prepareAutoArrangeMessage(data: any) {
  const gameId = data.gameId;
  console.log('gameId ', gameId);
  const ships = autoArrangeShips();
  return { gameId, ships };
}

async function manageMessage(data: MessageSend) {
  if (data.type == SendMessageType.GameSetUp) {
    await addBoard(JSON.parse(data.message), data.userId);
  }
  if (data.type == SendMessageType.GameSetUpAutoPlay) {
    const messageSend: MessageSend = {
      userId: data.userId,
      type: SendMessageType.AutoPlayResponse,
      message: {
        ships: prepareAutoArrangeMessage(data.message).ships,
      },
    };
    await sendMessageToUser(messageSend);
  }
  if (data.type == SendMessageType.Shot) {
    await createMovement(data.userId, data.message);
    await changeTurn(data.message.gameId);
  }
  if (data.type == SendMessageType.AutoShot) {
    const movement = await generateUniqueMovement(
      data.message.gameId,
      data.userId,
    );
    await createMovement(data.userId, movement);
    await changeTurn(data.message.gameId);
  }
}

setInterval(async () => {
  const { data: games, error } = await supabase
    .from('game')
    .select('id, status, started_at, host_id, guest_id')
    .eq('status', 'started');

  if (error) {
    console.error('Error fetching active games:', error);
    return;
  }

  const currentTime = new Date().getTime();

  for (const game of games) {
    // Obtener los movimientos del juego
    const { data: movements, error: movementsError } = await supabase
      .from('movements')
      .select('user_id, moved_at')
      .eq('game_id', game.id);

    if (movementsError) {
      console.error(
        `Error fetching movements for game ${game.id}:`,
        movementsError,
      );
      continue;
    }

    let turnStartTime;
    let currentTurnUserId;

    if (movements.length === 0) {
      // Si no hay movimientos, el turno inicial es del host
      turnStartTime = new Date(game.started_at).getTime();
      currentTurnUserId = game.host_id;
    } else {
      // Si ya hay movimientos, el último jugador en mover se determina
      const sortedMovements = movements.sort(
        (a, b) =>
          new Date(b.moved_at).getTime() - new Date(a.moved_at).getTime(),
      );
      const lastMovement = sortedMovements[0];

      turnStartTime = new Date(lastMovement.moved_at).getTime();
      currentTurnUserId =
        lastMovement.user_id === game.host_id ? game.guest_id : game.host_id;
    }

    const elapsedTime = (currentTime - turnStartTime) / 1000; // Tiempo en segundos

    if (elapsedTime > 20) {
      console.log(
        `Turno excedido para el juego ${game.id}. Ejecutando AutoShot para ${currentTurnUserId}...`,
      );

      const movement = await generateUniqueMovement(game.id, currentTurnUserId);
      await createMovement(currentTurnUserId, movement);
    }
  }
}, 1000);

async function changeTurn(gameId: string) {
  try {
    // Volver a buscar el juego con datos actualizados
    const { data: game, error: gameError } = await supabase
      .from('game')
      .select('id, current_turn_user_id, host_id, guest_id')
      .eq('id', gameId)
      .single();

    if (gameError || !game) {
      console.error('Error fetching game data for changing turn:', gameError);
      return;
    }

    let nextUserId;
    if (game.current_turn_user_id === game.host_id) {
      nextUserId = game.guest_id;
    } else {
      nextUserId = game.host_id;
    }

    console.log('ID del usuario actual del turno:', game.current_turn_user_id);
    console.log('ID del próximo usuario del turno:', nextUserId);

    const { error } = await supabase
      .from('game')
      .update({
        current_turn_user_id: nextUserId,
        current_turn_started_at: new Date().toISOString(),
      })
      .eq('id', game.id);

    if (error) {
      console.error('Error updating current turn user:', error);
    } else {
      console.log(
        `Turno cambiado al jugador ${nextUserId} para el juego ${game.id}`,
      );
    }
  } catch (e) {
    console.error('Error al cambiar el turno:', e);
  }
}

export async function sendAllMessagesPending(userId: string) {
  const { data: pendingMessages, error: fetchError } = await supabase
    .from('messages')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending');

  console.log('Pending messages ', pendingMessages);
  if (fetchError) {
    throw new Error('Error fetching pending messages from database');
  }

  const messageSends: MessageSend[] = pendingMessages.map(message => ({
    userId: message.user_id,
    type: message.type_of_message as SendMessageType,
    message: message.message,
  }));

  for (const messageSend of messageSends) {
    await sendMessageToUserWithoutSaving(messageSend);
  }

  if (pendingMessages) {
    const updatePromises = pendingMessages.map(async message => {
      console.log('MESSAGE', message);
      const { id } = message;
      console.log(id);
      const { error: updateError } = await supabase
        .from('messages')
        .update({ status: 'send' })
        .eq('id', id);

      if (updateError) {
        throw new Error(`Error updating message ${id}: ${updateError.message}`);
      }
    });

    await Promise.all(updatePromises);
    console.log('All pending messages have been updated to send status');
  } else {
    console.log('No pending messages found');
  }

  return messageSends;
}

app.use(
  (
    err: ErrorRequestHandler,
    req: Request,
    res: Response,
    next: NextFunction,
  ) => {
    console.error(err);
    res.status(401).send('Unauthenticated!');
  },
);

server.listen(port, () => {
  console.log(
    `Batalla naval app listening at http://localhost:${port} ⛴️ 🔫 🪖 🚢`,
  );
});

function isValidMessageSend(obj: any): obj is MessageSend {
  return (
    (obj &&
      typeof obj.userId === 'string' &&
      typeof obj.type === 'string' &&
      typeof obj.message === 'string') ||
    typeof obj.message === 'object'
  );
}

//message:
/*
{
"userId": ... ????
"typeOfMessage": "connection" / "accepted-game" / "board-status"
"content" {} / "guestId" / objeto
}

 */

//
