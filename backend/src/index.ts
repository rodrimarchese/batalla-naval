import express, {
  Application,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from 'express';
import { Server as HTTPServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import {
  ClerkExpressRequireAuth,
  RequireAuthProp,
  StrictAuthProp,
} from '@clerk/clerk-sdk-node';
import { createClient } from '@supabase/supabase-js';
import { userRoutes } from './routes';
import cors from 'cors';
import { MessageSend } from './socket/types';

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
  wss.on('message', (message: string) => {
    console.log('Received:', message);
    try {
      const data = JSON.parse(message);
      console.log(`Received message: ${message}`);

      if (data.userId) {
        console.log(`User ${data.userId} connected.`);
        // Guardar la conexión con el userId específico
        userConnections.set(data.userId, ws);
      }

      // Aquí puedes manejar otros tipos de mensajes
      // Por ejemplo, actualizar el estado del juego, etc.
    } catch (error) {
      console.error('Error parsing JSON:', error);
    }
  });

  // Manejar cierre de conexión
  wss.on('close', () => {
    console.log('A client disconnected');
    // Eliminar al usuario de las conexiones activas
    userConnections.forEach((conn, userId) => {
      if (conn === ws) {
        userConnections.delete(userId);
        console.log(`Connection with user ${userId} closed.`);
      }
    });
  });

  wss.on('error', error => {
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

// add whebhook route /data
// app.post('/createUser', async (req, res) => {
//   const body = req.body; // Ahora `body` debería tener la estructura JSON que fue parseada por express.json()
//   console.log('Event received:', JSON.stringify(body, null, 2)); // Mejora la impresión del JSON para una mejor legibilidad

//   const userData = body.data;

//   // Supabase
//   const { data, error } = await supabase.from('users').insert([
//     {
//       id: userData.id,
//       name: userData.first_name + ' ' + userData.last_name,
//       email: userData.email_addresses[0].email_address,
//     },
//   ]);

//   res.json({ message: 'Event received', yourData: body }); // Envía una respuesta incluyendo los datos recibidos para confirmar
// });

export function sendMessageToUser(messageSend: MessageSend) {
  const userConnection = userConnections.get(messageSend.userId);
  if (userConnection) {
    userConnection.send(messageSend.message);
  } else {
    console.error(`User ${messageSend.userId} is not connected.`);
  }
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

//message:
/*
{
"userId": ... ????
"typeOfMessage": "connection" / "accepted-game" / "board-status"
"content" {} / "guestId" / objeto
}

 */

//
