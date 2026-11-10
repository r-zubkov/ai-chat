import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ChatState, ChatStore } from '@entities/chat';
import { MessageStore } from '@entities/message';
import { SettingsStore } from '@entities/settings';
import { NavigateChatService } from '@features/navigate-chat';
import { SendMessageEventType, SendMessageService } from '@features/send-message';
import { ShellUiService } from '@shared/ui';
import { ChatInputComponent } from '@widgets/chat-input';

@Component({
  selector: 'app-new-chat-page',
  imports: [ChatInputComponent],
  templateUrl: './new-chat.page.html',
  styleUrl: './new-chat.page.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewChatPage implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly chatStore = inject(ChatStore);
  readonly messageStore = inject(MessageStore);
  readonly settings = inject(SettingsStore);

  private readonly sendMessageService = inject(SendMessageService);
  private readonly navigateChat = inject(NavigateChatService);
  private readonly shellUi = inject(ShellUiService);

  ngOnInit(): void {
    this.chatStore.setActive(null);
    this.messageStore.clearState();
    const globalModel = this.settings.globalCurrentModel();
    if (globalModel) this.settings.setCurrentModel(globalModel);
    this.shellUi.closeSidebarOnMobile();
  }

  protected onSendMessage(text: string): void {
    this.sendMessageService
      .sendMessage(text, [])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => {
          if (event.type === SendMessageEventType.SENT) {
            void this.navigateChat.toChat(event.chatId);
          }
        },
        error: (err) => console.error('Error sending message:', err),
      });
  }

  protected onCancelRequest(): void {
    const chat = this.chatStore.activeChat();
    if (!chat || chat.state !== ChatState.THINKING) return;

    this.sendMessageService.stopRequest(chat);
  }

  protected get thinking(): boolean {
    return this.chatStore.activeChat()?.state === ChatState.THINKING;
  }
}
