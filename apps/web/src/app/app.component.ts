import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  effect,
  inject,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { TuiButton, TuiLoader, TuiRoot } from '@taiga-ui/core';
import { ChatStore } from '@entities/chat';
import { ModelStore } from '@entities/model';
import { SettingsStore } from '@entities/settings';
import { SendMessageService } from '@features/send-message';
import { ShellUiService } from '@shared/ui';
import { ChatHeaderComponent, ChatSidebarComponent } from '@widgets';
import { AppStateService } from './app-state.service';

const BASE_PAGE_TITLE = 'AI Chat';
const INITIALIZATION_MIN_DURATION = 700;

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiButton, TuiLoader, TuiRoot, ChatSidebarComponent, ChatHeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  private resizeObserver?: ResizeObserver;
  private lastObservedWidth?: number;

  readonly shellUi = inject(ShellUiService);
  readonly appState = inject(AppStateService);
  private readonly chatStore = inject(ChatStore);
  private readonly modelStore = inject(ModelStore);
  private readonly settingsStore = inject(SettingsStore);
  private readonly sendMessage = inject(SendMessageService);
  private readonly title = inject(Title);

  constructor() {
    effect(() => {
      const chatTitle = this.chatStore.activeChat()?.title.trim();
      this.title.setTitle(chatTitle ? `${BASE_PAGE_TITLE} - ${chatTitle}` : BASE_PAGE_TITLE);
    });

    const cachedModels = this.modelStore.restoreCachedModels();

    this.appState.registerInitialDataLoad(
      async () => {
        const models =
          cachedModels ??
          (await withMinimumDuration(
            this.modelStore.refreshAvailableModels(),
            INITIALIZATION_MIN_DURATION,
          ));

        await Promise.all([this.settingsStore.loadSettings(models), this.chatStore.loadAll()]);

        if (cachedModels) void this.refreshAvailableModelsInBackground();
      },
      { showLoader: cachedModels === null },
    );
  }

  ngOnInit(): void {
    this.observeWidthChange();
  }

  ngOnDestroy(): void {
    this.cleanupResizeObserver();
    this.sendMessage.destroy();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload(): void {
    this.sendMessage.destroy();
  }

  protected retryInitialDataLoad(): void {
    this.appState.retryInitialDataLoad();
  }

  private async refreshAvailableModelsInBackground(): Promise<void> {
    try {
      const models = await this.modelStore.refreshAvailableModels();
      await this.settingsStore.reconcileAvailableModels(models);
    } catch (error: unknown) {
      console.warn('Failed to refresh available models', error);
    }
  }

  private observeWidthChange(): void {
    this.resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;

      const width = entry.contentRect.width;
      if (width === this.lastObservedWidth) return;

      this.lastObservedWidth = width;
      this.shellUi.updateMobileState(width);
    });

    this.resizeObserver.observe(document.body);
  }

  private cleanupResizeObserver(): void {
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.lastObservedWidth = undefined;
  }
}

async function withMinimumDuration<T>(operation: Promise<T>, duration: number): Promise<T> {
  const startedAt = Date.now();
  let result: T;

  try {
    result = await operation;
  } finally {
    const remainingDuration = duration - (Date.now() - startedAt);
    if (remainingDuration > 0) {
      await new Promise<void>((resolve) => setTimeout(resolve, remainingDuration));
    }
  }

  return result;
}
