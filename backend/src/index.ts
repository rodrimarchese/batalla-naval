import express, {
  Application,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';
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
import { WebSocket } from 'ws';
import { addBoard } from './board/boardService';
import { createMovement } from './movements/movementService';
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
        sendMessageToUser(messageSend);
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
  const userConnection = userConnections.get(messageSend.userId);
  if (userConnection) {
    await saveMessage(messageSend, MessageStatus.send);
    userConnection.send(messageSend.message);
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

async function manageMessage(data: MessageSend) {
  if (data.type == SendMessageType.GameSetUp) {
    console.log('GameSetUp', data);
    await addBoard(JSON.parse(data.message), data.userId);
  }
  if (data.type == SendMessageType.Shot) {
    await createMovement(data.userId, data.message);
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
    obj &&
    typeof obj.userId === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.message === 'string'
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
