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
import {
  addBoard,
  checkAllPiecesDead,
  getBoardsDeadFromUser,
  getBoardsForGameIdAndUserId,
} from './board/boardService';
import { createMovement } from './movements/movementService';
import { autoArrangeShips } from './board/autoPlay/boardAutoPlay';
import { generateUniqueMovement } from './movements/shotAutoPlay';
import { gameById } from './game/gameService';
import { userWithId } from './user/userService';
import { User } from './user/user';
// Cargar variables de entorno
process.loadEnvFile('.env.local');

const app: Application = express();
const server: HTTPServer = new HTTPServer(app);
const wss: WebSocketServer = new WebSocketServer({ server });
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permitir todos los métodos
    allowedHeaders: ['Content-Type', 'Authorization'], // Permitir todos los encabezados necesarios
  }),
);

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

//LOGICA DEL TIEMPO!
interface GameTurnState {
  gameId: string;
  currentPlayerId: string | undefined;
  turnStartedAt: number; // Timestamp para el momento en que empezó el turno
  hostUserId: string | undefined; // ID del jugador host
  guestUserId: string | undefined; // ID del jugador invitado
}

const gameTurnMap = new Map<string, GameTurnState>(); // Mapa para mantener el estado de cada juego

export function startGame(
  gameId: string,
  hostUserId: string | undefined,
  guestUserId: string | undefined,
) {
  gameTurnMap.set(gameId, {
    gameId: gameId,
    currentPlayerId: hostUserId,
    turnStartedAt: Date.now(),
    hostUserId: hostUserId,
    guestUserId: guestUserId,
  });
}

export function endGame(gameId: string) {
  gameTurnMap.delete(gameId);
}

export function handlePlayerShot(gameId: string, userId: string): void {
  const gameState = gameTurnMap.get(gameId);

  if (!gameState) {
    console.error(`Juego ${gameId} no encontrado en el mapa de turnos`);
    return;
  }

  if (gameState.currentPlayerId !== userId) {
    console.error(
      `No es el turno del jugador ${userId} para el juego ${gameId}`,
    );
    return;
  }

  // Cambiar el turno al siguiente jugador y actualizar el turno
  gameState.currentPlayerId =
    gameState.currentPlayerId === gameState.hostUserId
      ? gameState.guestUserId
      : gameState.hostUserId;

  gameState.turnStartedAt = Date.now();
}

setInterval(async () => {
  try {
    const currentTime = Date.now();

    for (const gameState of gameTurnMap.values()) {
      try {
        const elapsedTime = (currentTime - gameState.turnStartedAt) / 1000; // Tiempo en segundos

        if (elapsedTime > 20) {
          console.log(
            `Tiempo excedido para el juego ${gameState.gameId}, ejecutando AutoShot para ${gameState.currentPlayerId}...`,
          );

          if (gameState.currentPlayerId) {
            // Generar movimiento automático
            const movement = await generateUniqueMovement(
              gameState.gameId,
              gameState.currentPlayerId,
            );

            // Registrar el movimiento en la base de datos
            await createMovement(gameState.currentPlayerId, movement);
          }
        }
      } catch (gameProcessingError) {
        console.error(
          `Error processing game ${gameState.gameId}:`,
          gameProcessingError,
        );
      }
    }
  } catch (globalError) {
    console.error('Global error in interval:', globalError);
  }
}, 5000); // Verificar cada 5 segundos si algún turno ha excedido el límite de tiempo

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
  }
  if (data.type == SendMessageType.AutoShot) {
    const movement = await generateUniqueMovement(
      data.message.gameId,
      data.userId,
    );
    await createMovement(data.userId, movement);
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

//USER CONNECTED TODO
export async function handleUserConnection(userId: string, gameId: string) {
  try {
    // Buscar el usuario y el juego en curso
    const user = await userWithId(userId);

    const { data: ongoingGames, error } = await supabase
      .from('game')
      .select('*')
      .or(`host_id.eq.${user.id},guest_id.eq.${user.id}`)
      .in('status', ['settingUp', 'finished', 'started'])
      .eq('id', gameId);

    if (error) {
      console.error('Error al obtener juegos en curso:', error);
      return;
    }

    if (!ongoingGames || ongoingGames.length === 0) {
      console.log(`No hay juegos en curso para el usuario ${user.id}`);
      return;
    }

    // Asumir que solo hay un juego en curso, tomar el primero
    const game = ongoingGames[0];

    // Si el juego está en 'settingUp', no hacemos nada
    if (game.status === 'settingUp') {
      console.log(
        `El juego ${game.id} está en configuración. No se realizará ninguna acción.`,
      );
      return;
    }

    // Obtener información sobre el estado del tablero
    let otherUser: User | null;
    if (game.host_id === user.id) {
      otherUser = await userWithId(game.guest_id);
    } else {
      otherUser = await userWithId(game.host_id);
    }

    if (otherUser) {
      const allDeads = await checkAllPiecesDead(game, otherUser);
      const userMissedHits = await getMissedHits(game.id, user.id);
      const rivalMissedHits = await getMissedHits(game.id, otherUser.id);

      const boardDeadOtherUser = await getBoardsDeadFromUser(game, otherUser);
      const boardForUser = await getBoardsForGameIdAndUserId(game, user);

      let messageUser: MessageSend;

      if (
        game.status === 'finished' ||
        (game.status === 'started' && allDeads)
      ) {
        // En estado 'finished' o si 'allDeads' es true, determinar el ganador
        const isWinner =
          game.host_id === user.id
            ? game.winner === 'host'
            : game.winner === 'guest';

        messageUser = {
          userId: user.id,
          type: SendMessageType.finishGame,
          message: {
            deadPiecesOfTheOther: boardDeadOtherUser,
            boardStatus: boardForUser,
            winner: isWinner,
            yourMissedHits: userMissedHits,
            rivalMissedHits: rivalMissedHits,
          },
        };
      } else {
        // Determinar si es su turno o está esperando
        const lastMovement = await getLastMovement(game.id);
        const isUserTurn = !lastMovement || lastMovement.user_id !== user.id;

        messageUser = {
          userId: user.id,
          type: isUserTurn
            ? SendMessageType.onGameYourTurn
            : SendMessageType.onGameWaiting,
          message: {
            deadPiecesOfTheOther: boardDeadOtherUser,
            boardStatus: boardForUser,
            yourMissedHits: userMissedHits,
            rivalMissedHits: rivalMissedHits,
          },
        };
      }

      return messageUser;
    }
  } catch (error) {
    console.error(`Error al manejar la conexión del usuario ${userId}:`, error);
  }
}

// Función auxiliar para obtener el último movimiento
async function getLastMovement(gameId: string) {
  const { data, error } = await supabase
    .from('movements')
    .select('*')
    .eq('game_id', gameId)
    .order('moved_at', { ascending: false })
    .limit(1);

  if (error) {
    console.error('Error al obtener el último movimiento:', error);
    return null;
  }

  return data && data.length > 0 ? data[0] : null;
}

async function getMissedHits(gameId: string, userId: string) {
  const { data, error } = await supabase
    .from('movements')
    .select('x_coordinate, y_coordinate')
    .eq('game_id', gameId)
    .eq('user_id', userId)
    .eq('hit', false);

  if (error || !data) {
    console.error('Error fetching missed hits:', error);
    return [];
  }

  return data.map(movement => ({
    x: movement.x_coordinate,
    y: movement.y_coordinate,
  }));
}
