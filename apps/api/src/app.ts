import { CHAT_ERROR_CODE, SOCKET_PATH } from '@ai-chat/contracts';
import express, { type Express } from 'express';
import { createServer, type Server as HttpServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import morgan from 'morgan';
import { Server as SocketIoServer } from 'socket.io';
import { InferenceAdapterRegistry } from './adapters/inference-adapter-registry.js';
import { ChatService } from './chat/chat.service.js';
import type { InferenceAdapter } from './chat/inference-adapter.js';
import type { ApiEnvironment } from './environments/environment.model.js';
import type { AvailableModels } from './models/available-models.js';
import { registerChatRoute } from './transports/http/chat.route.js';
import { registerModelsRoute } from './transports/http/models.route.js';
import { registerChatSocket } from './transports/socket/chat.socket.js';
import type { ClientToServerEvents, ServerToClientEvents } from '@ai-chat/contracts';

export interface ApiApplication {
  readonly app: Express;
  readonly httpServer: HttpServer;
  readonly io: SocketIoServer<ClientToServerEvents, ServerToClientEvents>;
}

export interface ApiApplicationOptions {
  readonly serveStatic?: boolean;
}

export function createApplication(
  environment: ApiEnvironment,
  inferenceAdapters: readonly InferenceAdapter[],
  availableModels: AvailableModels,
  options: ApiApplicationOptions = {},
): ApiApplication {
  const app = express();
  const httpServer = createServer(app);
  const io = new SocketIoServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
    path: SOCKET_PATH,
  });
  const chatService = new ChatService(
    new InferenceAdapterRegistry(inferenceAdapters),
    availableModels,
  );

  app.use(express.json({ limit: '5mb' }));
  if (!environment.production) {
    app.use(morgan('dev'));
  }

  registerChatRoute(app, chatService);
  registerModelsRoute(app, availableModels);
  registerChatSocket(io, chatService);

  app.use('/api', (_request, response) => {
    response.status(404).json({
      code: CHAT_ERROR_CODE.INVALID_REQUEST,
      message: 'API route not found',
    });
  });

  if (options.serveStatic) {
    const publicDirectory = fileURLToPath(new URL('./public', import.meta.url));
    const indexFile = fileURLToPath(new URL('./public/index.html', import.meta.url));
    app.use(express.static(publicDirectory));
    app.get('*', (_request, response) => {
      response.sendFile(indexFile);
    });
  }

  return { app, httpServer, io };
}
