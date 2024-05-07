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

// WebSocket connection setup
wss.on('connection', ws => {
  console.log('A client connected via WebSocket.');

  ws.on('message', message => {
    console.log(`Received message: ${message}`);
    ws.send(`Echo: ${message}`);
  });

  ws.on('close', () => {
    console.log('A client disconnected');
  });

  ws.send('Welcome to the WebSocket server!');
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
