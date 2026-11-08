import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import type { ChatId } from '@entities/chat';
import { CHAT_ROUTES } from '@shared/routes';

@Injectable({ providedIn: 'root' })
export class NavigateChatService {
  private readonly router = inject(Router);

  toChat(chatId: ChatId): Promise<boolean> {
    return this.router.navigateByUrl(CHAT_ROUTES.byId(chatId));
  }

  toNewChat(): Promise<boolean> {
    return this.router.navigateByUrl(CHAT_ROUTES.new);
  }
}
