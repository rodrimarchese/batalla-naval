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

// Cargar variables de entorno
process.loadEnvFile('.env.local');

const app: Application = express();
const server: HTTPServer = new HTTPServer(app);
const wss: WebSocketServer = new WebSocketServer({ server });

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

  wss.on('message', (message: string) => {
    try {
      const parsedMessage: WebSocketMessage = JSON.parse(message);
      const { userId, content } = parsedMessage;
      console.log(`Received message from user ${userId}: ${content}`);

      const echoMessage: WebSocketMessage = {
        userId,
        content: `Echo: ${content}`,
      };
      const userConnection = userConnections.get(userId);
      if (userConnection) {
        userConnection.send(JSON.stringify(echoMessage));
      }
    } catch (error) {
      console.error('Error al analizar el mensaje JSON:', error);
    }
  });

  wss.on('close', () => {
    console.log('A client disconnected');

    userConnections.forEach((connection, id) => {
      if (connection === ws) {
        userConnections.delete(id);
      }
    });
  });

  wss.on('connection', (message: string) => {
    try {
      const parsedMessage: WebSocketMessage = JSON.parse(message);
      const { userId } = parsedMessage;
      console.log(`User ${userId} connected.`);

      userConnections.set(userId, ws);
    } catch (error) {
      console.error('Error al analizar el mensaje JSON:', error);
    }
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
app.post('/data', async (req, res) => {
  const body = req.body; // Ahora `body` debería tener la estructura JSON que fue parseada por express.json()
  console.log('Event received:', JSON.stringify(body, null, 2)); // Mejora la impresión del JSON para una mejor legibilidad

  // Supabase
  const { data, error } = await supabase
    .from('users')
    .insert([{ id: body.userId, name: body.name, email: body.email }]);

  res.json({ message: 'Event received', yourData: body }); // Envía una respuesta incluyendo los datos recibidos para confirmar
});

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
