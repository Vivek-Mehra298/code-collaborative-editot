import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import connectDB from './db';
import { config, getAllowedOrigins, isOriginAllowed, isProduction } from './config';

import authRoutes from './routes/auth';
import roomRoutes from './routes/rooms';
import { setupSocketHandlers } from './socket/handlers';

dotenv.config();

const app = express();
const server = http.createServer(app);

const corsOptions: cors.CorsOptions = {
  origin(origin, callback) {
    callback(null, isOriginAllowed(origin));
  },
  credentials: true,
};

app.set('trust proxy', 1);
app.use(cors(corsOptions));
app.use(helmet());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    environment: config.nodeEnv,
    allowedOrigins: getAllowedOrigins(),
    uptime: process.uptime(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

// Socket.io
const io = new Server(server, {
  cors: {
    origin(origin, callback) {
      callback(null, isOriginAllowed(origin));
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketHandlers(io);

// Database Connection
const PORT = config.port;
const HOST = config.host;

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use on ${HOST}. Stop the existing process or set a different PORT.`);
    return;
  }

  console.error('Server startup error:', error);
});

const listen = () => {
  server.listen(PORT, HOST, () => {
    const localUrl = `http://localhost:${PORT}`;
    console.log(`Server running at ${localUrl} (${isProduction ? 'production' : 'development'})`);
  });
};

const startServer = async () => {
  if (isProduction) {
    await connectDB();
    listen();
    return;
  }

  listen();

  connectDB().catch((error) => {
    console.error('Database startup warning:', error);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
