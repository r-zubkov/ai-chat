import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_ROUTES, GPT_MODELS } from '@ai-chat/contracts';
import { ChatHttpService } from './chat-http.service';

describe('ChatHttpService', () => {
  let service: ChatHttpService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ChatHttpService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ChatHttpService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends a request to the relative API route and reads the normalized response', () => {
    let result = '';
    service
      .sendChatCompletion(GPT_MODELS.GPT_5_1.id, [{ role: 'user', content: 'Вопрос' }])
      .subscribe((content) => (result = content));

    const request = http.expectOne(API_ROUTES.chat);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      model: GPT_MODELS.GPT_5_1.id,
      messages: [{ role: 'user', content: 'Вопрос' }],
    });
    request.flush({ content: 'Ответ' });

    expect(result).toBe('Ответ');
  });
});
