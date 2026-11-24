import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  Input,
  ViewChild,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TuiButton, TuiScrollbar } from '@taiga-ui/core';
import { ChatId, ChatState, ChatStore, toChatId } from '@entities/chat';
import { ChatMessage, ChatMessageRole, MessageStore } from '@entities/message';
import { ManageChatService } from '@features/manage-chat';
import { NavigateChatService } from '@features/navigate-chat';
import { SendMessageEvent, SendMessageEventType, SendMessageService } from '@features/send-message';
import { SelectModelService } from '@features/select-model';
import {
  getCssValue,
  handleCodeBlockCopyClick,
  handleCodeBlockCopyKeydown,
  remToPx,
} from '@shared/helpers';
import { CopyTextButtonComponent, MarkdownPipe, ModelLabelPipe } from '@shared';
import { ShellUiService } from '@shared/ui';
import { ChatInputComponent } from '@widgets/chat-input';
import { ChatHistoryState } from './user-chat.model';

@Component({
  selector: 'app-user-chat-page',
  imports: [
    MarkdownPipe,
    TuiScrollbar,
    TuiButton,
    CopyTextButtonComponent,
    ChatInputComponent,
    ModelLabelPipe,
  ],
  templateUrl: './user-chat.page.html',
  styleUrl: './user-chat.page.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserChatPage {
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);

  readonly chatStore = inject(ChatStore);
  readonly messageStore = inject(MessageStore);
  readonly manageChat = inject(ManageChatService);

  private readonly sendMessageService = inject(SendMessageService);
  private readonly selectModel = inject(SelectModelService);
  private readonly navigateChat = inject(NavigateChatService);
  private readonly shellUi = inject(ShellUiService);

  protected readonly historyState = signal<ChatHistoryState>(ChatHistoryState.LOADING);
  private historyLoadId = 0;

  @Input() set id(chatId: string) {
    const activeId = toChatId(chatId);
    const loadId = ++this.historyLoadId;
    this.historyState.set(ChatHistoryState.LOADING);
    this.chatStore.setActive(activeId);
    this.selectModel.syncCurrentModelForChat(activeId);
    this.shellUi.closeSidebarOnMobile();
    void this.loadMessages(activeId, loadId);
  }

  @ViewChild(TuiScrollbar, { read: ElementRef })
  private readonly scrollBar?: ElementRef<HTMLElement>;

  protected readonly ChatState = ChatState;
  protected readonly ChatHistoryState = ChatHistoryState;
  protected readonly ChatMessageRole = ChatMessageRole;

  protected onSendMessage(text: string): void {
    this.send(text, this.messageStore.messages());
  }

  protected onCancelRequest(): void {
    const chat = this.chatStore.activeChat();
    if (!chat || chat.state !== ChatState.THINKING) return;

    this.sendMessageService.stopRequest(chat);
  }

  protected retryLasRequest(): void {
    const messages = this.messageStore.messages();
    const lastUserMsg = messages.filter((msg) => msg.role === ChatMessageRole.USER).at(-1);

    if (!lastUserMsg) return;

    this.send(lastUserMsg.content, messages);
  }

  protected handleRequestEvent(event: SendMessageEvent): void {
    if (
      event.type === SendMessageEventType.SENT &&
      event.chatId === this.chatStore.activeChatId() &&
      this.historyState() === ChatHistoryState.READY
    ) {
      this.scrollToBottomAfterRender(event.chatId, 'smooth');
    }
  }

  protected onCodeBlockCopyClick(event: MouseEvent): void {
    handleCodeBlockCopyClick(event);
  }

  protected onCodeBlockCopyKeydown(event: KeyboardEvent): void {
    handleCodeBlockCopyKeydown(event);
  }

  private send(text: string, messageHistory: ChatMessage[]): void {
    this.sendMessageService
      .sendMessage(text, messageHistory)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (event) => this.handleRequestEvent(event),
        error: (err) => console.error('Error sending message:', err),
      });
  }

  private async loadMessages(chatId: ChatId, loadId: number): Promise<void> {
    try {
      const hasChat = await this.chatStore.ensureChatLoaded(chatId);
      if (!this.isCurrentHistoryLoad(chatId, loadId)) return;

      if (!hasChat) {
        await this.navigateChat.toNewChat();
        return;
      }

      this.selectModel.syncCurrentModelForChat(chatId);
      await this.messageStore.loadByChatId(chatId);
      if (!this.isCurrentHistoryLoad(chatId, loadId)) return;

      this.scrollToBottomAfterRender(chatId, 'instant', () => {
        this.historyState.set(ChatHistoryState.READY);
      });
    } catch (error) {
      if (!this.isCurrentHistoryLoad(chatId, loadId)) return;

      console.error('Error loading chat history:', error);
      this.messageStore.clearMessages();
      this.historyState.set(ChatHistoryState.ERROR);
    }
  }

  private isCurrentHistoryLoad(chatId: ChatId, loadId: number): boolean {
    return (
      !this.destroyRef.destroyed &&
      loadId === this.historyLoadId &&
      chatId === this.chatStore.activeChatId()
    );
  }

  private scrollToMessage(messageId: string, behavior: ScrollBehavior = 'smooth'): void {
    const container = this.scrollBar?.nativeElement;
    if (!container) return;

    const target = container.querySelector<HTMLElement>(`[data-id="${messageId}"]`);
    if (!target) return;

    const messageTopOffset = target.offsetTop;
    const messagesGap = remToPx(parseFloat(getCssValue('--chat-messages-gap')));
    const topOffset = messageTopOffset - messagesGap;

    this.scrollTo(container, topOffset, behavior);
  }

  private scrollToBottomAfterRender(
    chatId: ChatId,
    behavior: ScrollBehavior,
    onScrolled?: () => void,
  ): void {
    const loadId = this.historyLoadId;
    afterNextRender(
      {
        earlyRead: () => {
          const container = this.scrollBar?.nativeElement;
          return container && { container, top: container.scrollHeight };
        },
        write: (position) => {
          if (!this.isCurrentHistoryLoad(chatId, loadId)) return;

          if (position) this.scrollTo(position.container, position.top, behavior);
          onScrolled?.();
        },
      },
      { injector: this.injector },
    );
  }

  private scrollTo(container: HTMLElement, top: number, behavior: ScrollBehavior = 'auto'): void {
    container.scrollTo({
      top,
      behavior,
    });
  }
}
