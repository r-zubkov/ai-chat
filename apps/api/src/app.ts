import { CHAT_ERROR_CODE, SOCKET_PATH } from '@ai-chat/contracts';
import cors from 'cors';
import express, { type Express } from 'express';
import { createServer, type Server as HttpServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import morgan from 'morgan';
import { Server as SocketIoServer } from 'socket.io';
import { InferenceAdapterRegistry } from './adapters/inference-adapter-registry.js';
import { ChatService } from './chat/chat.service.js';
import type { InferenceAdapter } from './chat/inference-adapter.js';
import type { ApiEnvironment } from './config/environment.js';
import { registerChatRoute } from './transports/http/chat.route.js';
import { registerChatSocket } from './transports/socket/chat.socket.js';
import type { ClientToServerEvents, ServerToClientEvents } from '@ai-chat/contracts';

export interface ApiApplication {
  readonly app: Express;
  readonly httpServer: HttpServer;
  readonly io: SocketIoServer<ClientToServerEvents, ServerToClientEvents>;
}

export function createApplication(
  environment: ApiEnvironment,
  inferenceAdapters: readonly InferenceAdapter[],
): ApiApplication {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIoServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: SOCKET_PATH,
    cors: {
      origin: environment.corsOrigin,
      methods: ['GET', 'POST'],
    },
  });
  const chatService = new ChatService(new InferenceAdapterRegistry(inferenceAdapters));

  app.use(express.json({ limit: '5mb' }));
  if (environment.mode === 'dev') {
    app.use(
      cors({
        origin: environment.corsOrigin,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type'],
      }),
    );
    app.use(morgan('dev'));
  }

  registerChatRoute(app, chatService);
  registerChatSocket(io, chatService);

  app.use('/api', (_request, response) => {
    response.status(404).json({
      code: CHAT_ERROR_CODE.INVALID_REQUEST,
      message: 'API route not found',
    });
  });

  const publicDirectory = fileURLToPath(new URL('../public', import.meta.url));
  app.use(express.static(publicDirectory));
  app.get('*', (_request, response) => {
    response.sendFile(fileURLToPath(new URL('../public/index.html', import.meta.url)));
  });

  return { app, httpServer, io };
}
