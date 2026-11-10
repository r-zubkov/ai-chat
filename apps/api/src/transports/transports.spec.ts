import {
  ADAPTER,
  API_ROUTES,
  CHAT_ERROR_CODE,
  DEEPSEEK_MODELS,
  GPT_MODELS,
  GROK_MODELS,
  SOCKET_EVENTS,
  SOCKET_PATH,
  type ChatDonePayload,
} from '@ai-chat/contracts';
import type { AddressInfo } from 'node:net';
import { io as createClient, type Socket as ClientSocket } from 'socket.io-client';
import request from 'supertest';
import { afterEach, describe, expect, it } from 'vitest';
import { createApplication, type ApiApplication } from '../app.js';
import { ChatServiceError } from '../chat/chat.error.js';
import type { InferenceAdapter, InferenceRequest } from '../chat/inference-adapter.js';
import type { ApiEnvironment } from '../config/environment.js';

const applications: ApiApplication[] = [];
const clients: ClientSocket[] = [];

afterEach(async () => {
  for (const client of clients.splice(0)) client.disconnect();
  for (const application of applications.splice(0)) {
    void application.io.close();
    if (application.httpServer.listening) {
      await new Promise<void>((resolve) => application.httpServer.close(() => resolve()));
    }
  }
});

describe('HTTP transport', () => {
  it('returns safe errors for an invalid request and an unknown model', async () => {
    const application = createTestApplication(new CompletingAdapter());

    const invalidResponse = await request(application.app).post(API_ROUTES.chat).send({});
    expect(invalidResponse.status).toBe(400);
    expect(invalidResponse.body).toMatchObject({ code: CHAT_ERROR_CODE.INVALID_REQUEST });

    const unknownResponse = await request(application.app)
      .post(API_ROUTES.chat)
      .send({ model: 'unknown', messages: [] });
    expect(unknownResponse.status).toBe(400);
    expect(unknownResponse.body).toMatchObject({ code: CHAT_ERROR_CODE.UNKNOWN_MODEL });
  });

  it('normalizes streaming events into an HTTP response', async () => {
    const application = createTestApplication(new CompletingAdapter());
    const response = await request(application.app)
      .post(API_ROUTES.chat)
      .send({
        model: GPT_MODELS.GPT_5_1.id,
        messages: [{ role: 'user', content: 'Question' }],
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ content: 'Answer' });
  });

  it('does not expose the raw provider error', async () => {
    const application = createTestApplication(new FailingAdapter());
    const response = await request(application.app)
      .post(API_ROUTES.chat)
      .send({ model: GPT_MODELS.GPT_5_1.id, messages: [] });

    expect(response.status).toBe(502);
    expect(response.body).toEqual({
      code: CHAT_ERROR_CODE.PROVIDER_ERROR,
      message: 'Model service is unavailable',
    });
    expect(JSON.stringify(response.body)).not.toContain('upstream-secret');
  });
});

describe('Socket.IO transport', () => {
  it('emits request -> chunk -> done', async () => {
    const { client } = await connect(new CompletingAdapter());
    const chunks: string[] = [];
    client.on(SOCKET_EVENTS.chunk, (payload: { delta: string }) => chunks.push(payload.delta));
    const donePromise = onceDone(client);

    client.emit(SOCKET_EVENTS.request, {
      requestId: 'request-1',
      model: GPT_MODELS.GPT_5_1.id,
      messages: [{ role: 'user', content: 'Question' }],
    });

    await expect(donePromise).resolves.toEqual({ requestId: 'request-1', aborted: false });
    expect(chunks).toEqual(['An', 'swer']);
  });

  it('emits one done event with aborted=true after abort', async () => {
    const { client } = await connect(new AbortableAdapter());
    const doneEvents: ChatDonePayload[] = [];
    const donePromise = onceDone(client);
    client.on(SOCKET_EVENTS.done, (payload: ChatDonePayload) => doneEvents.push(payload));
    client.once(SOCKET_EVENTS.chunk, () => {
      client.emit(SOCKET_EVENTS.abort, { requestId: 'request-abort' });
    });

    client.emit(SOCKET_EVENTS.request, {
      requestId: 'request-abort',
      model: GROK_MODELS.GROK_4_FAST.id,
      messages: [],
    });

    await expect(donePromise).resolves.toEqual({ requestId: 'request-abort', aborted: true });
    await delay(30);
    expect(doneEvents).toHaveLength(1);
  });

  it('aborts the provider request after disconnect', async () => {
    const adapter = new AbortableAdapter();
    const { client } = await connect(adapter);
    const started = adapter.started;

    client.emit(SOCKET_EVENTS.request, {
      requestId: 'request-disconnect',
      model: DEEPSEEK_MODELS.DEEPSEEK_V3_2.id,
      messages: [],
    });
    await started;
    client.disconnect();

    await expect(adapter.aborted).resolves.toBeUndefined();
  });
});

class CompletingAdapter implements InferenceAdapter {
  readonly id = ADAPTER.TIMEWEB;

  async *stream() {
    await Promise.resolve();
    yield { type: 'delta' as const, content: 'An' };
    yield { type: 'delta' as const, content: 'swer' };
    yield { type: 'done' as const };
  }
}

class FailingAdapter implements InferenceAdapter {
  readonly id = ADAPTER.TIMEWEB;

  async *stream() {
    await Promise.resolve();
    throw new ChatServiceError(CHAT_ERROR_CODE.PROVIDER_ERROR, 'Provider request failed', 502, {
      cause: new Error('upstream-secret'),
    });
    yield { type: 'done' as const };
  }
}

class AbortableAdapter implements InferenceAdapter {
  readonly id = ADAPTER.TIMEWEB;
  private resolveStarted!: () => void;
  private resolveAborted!: () => void;
  readonly started = new Promise<void>((resolve) => (this.resolveStarted = resolve));
  readonly aborted = new Promise<void>((resolve) => (this.resolveAborted = resolve));

  async *stream(request: InferenceRequest) {
    this.resolveStarted();
    yield { type: 'delta' as const, content: 'Started' };
    await new Promise<void>((resolve) => {
      request.signal.addEventListener(
        'abort',
        () => {
          this.resolveAborted();
          resolve();
        },
        { once: true },
      );
    });
    yield { type: 'done' as const };
  }
}

function createTestApplication(adapter: InferenceAdapter): ApiApplication {
  const environment: ApiEnvironment = {
    mode: 'test',
    port: 5000,
    corsOrigin: 'http://localhost:4200',
  };
  const application = createApplication(environment, [adapter]);
  applications.push(application);
  return application;
}

async function connect(
  adapter: InferenceAdapter,
): Promise<{ application: ApiApplication; client: ClientSocket }> {
  const application = createTestApplication(adapter);
  await new Promise<void>((resolve, reject) => {
    application.httpServer.once('error', reject);
    application.httpServer.listen(0, '127.0.0.1', resolve);
  });
  const address = application.httpServer.address() as AddressInfo;
  const client = createClient(`http://127.0.0.1:${address.port}`, {
    path: SOCKET_PATH,
    transports: ['websocket'],
  });
  clients.push(client);
  await new Promise<void>((resolve, reject) => {
    client.once('connect', resolve);
    client.once('connect_error', reject);
  });
  return { application, client };
}

function onceDone(client: ClientSocket): Promise<ChatDonePayload> {
  return new Promise((resolve) => client.once(SOCKET_EVENTS.done, resolve));
}

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
