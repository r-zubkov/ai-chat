import { Injectable, signal } from '@angular/core';
import {
  SOCKET_EVENTS,
  SOCKET_PATH,
  type ChatAbortPayload,
  type ChatRequestMessage,
  type ChatRequestPayload,
  type ClientToServerEvents,
  type ModelId,
  type ServerToClientEvents,
} from '@ai-chat/contracts';
import { Observable, Observer } from 'rxjs';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private readonly activeRequests = new Map<string, Observer<string>>();

  readonly connected = signal(false);

  constructor() {
    this.initSocket();
  }

  private initSocket(): void {
    this.socket = io({
      transports: ['websocket'],
      path: SOCKET_PATH,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    this.socket.on('connect', () => {
      console.log('[socket] connected', this.socket?.id);
      this.connected.set(true);
    });

    this.socket.on('disconnect', (reason) => {
      console.warn('[socket] disconnected:', reason);
      this.connected.set(false);

      for (const observer of this.activeRequests.values()) {
        observer.error(new Error('Socket disconnected'));
      }
      this.activeRequests.clear();
    });

    this.socket.on('connect_error', (error) => {
      console.error('[socket] connect_error', error);
      this.connected.set(false);
    });

    this.socket.on(SOCKET_EVENTS.chunk, (data) => {
      this.activeRequests.get(data.requestId)?.next(data.delta);
    });

    this.socket.on(SOCKET_EVENTS.done, (data) => {
      const observer = this.activeRequests.get(data.requestId);
      if (!observer) return;

      this.activeRequests.delete(data.requestId);
      observer.complete();
    });

    this.socket.on(SOCKET_EVENTS.error, (data) => {
      if (!data.requestId) return;

      const observer = this.activeRequests.get(data.requestId);
      if (!observer) return;

      this.activeRequests.delete(data.requestId);
      observer.error(new Error(`[${data.code}] ${data.message}`));
    });
  }

  sendChatCompletion(
    model: ModelId,
    messages: ChatRequestMessage[],
  ): { requestId: string; stream$: Observable<string> } {
    const requestId = crypto.randomUUID();

    const stream$ = new Observable<string>((observer) => {
      if (!this.socket?.connected) {
        observer.error(new Error('Socket is not connected'));
        return;
      }

      this.activeRequests.set(requestId, observer);
      const payload: ChatRequestPayload = { requestId, model, messages };
      this.socket.emit(SOCKET_EVENTS.request, payload);

      return () => {
        const current = this.activeRequests.get(requestId);
        if (current !== observer) return;

        this.activeRequests.delete(requestId);
        this.emitAbort(requestId);
      };
    });

    return { requestId, stream$ };
  }

  abortRequest(requestId: string): void {
    this.emitAbort(requestId);

    const observer = this.activeRequests.get(requestId);
    this.activeRequests.delete(requestId);
    observer?.complete();
  }

  abortAllRequests(): void {
    for (const requestId of Array.from(this.activeRequests.keys())) {
      this.abortRequest(requestId);
    }
  }

  destroy(): void {
    this.abortAllRequests();
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
  }

  private emitAbort(requestId: string): void {
    const payload: ChatAbortPayload = { requestId };
    this.socket?.emit(SOCKET_EVENTS.abort, payload);
  }
}
