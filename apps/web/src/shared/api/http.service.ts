import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  API_ROUTES,
  type ChatCompletionRequest,
  type ChatCompletionResponse,
  type ChatRequestMessage,
  type ModelId,
} from '@ai-chat/contracts';
import { map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
/**
 * Reserved HTTP gateway. Not used in the primary runtime chat flow.
 */
export class HttpService {
  private readonly http = inject(HttpClient);

  sendChatCompletion(model: ModelId, messages: ChatRequestMessage[]): Observable<string> {
    const request: ChatCompletionRequest = { model, messages };

    return this.http
      .post<ChatCompletionResponse>(API_ROUTES.chat, request)
      .pipe(map((response) => response.content));
  }
}
