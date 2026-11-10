import { inject, Injectable } from '@angular/core';
import { ChatId, ChatStore } from '@entities/chat';
import { SettingsStore } from '@entities/settings';
import type { ModelType } from '@entities/settings';
import { AVAILABLE_MODELS, isModelType } from '@shared/config';

@Injectable({ providedIn: 'root' })
export class SelectModelService {
  private readonly chatStore = inject(ChatStore);
  private readonly settingsStore = inject(SettingsStore);

  readonly models = AVAILABLE_MODELS;

  async selectModel(model: ModelType): Promise<void> {
    const modelToSet = this.normalizeModel(model);

    this.settingsStore.setCurrentModel(modelToSet);

    if (!this.chatStore.activeChatId()) {
      await this.settingsStore.persistGlobalModel(modelToSet);
    }
  }

  syncCurrentModelForChat(chatId: ChatId | null): void {
    if (chatId) {
      const activeChat = this.chatStore.activeChat();
      const model = isModelType(activeChat?.model)
        ? activeChat.model
        : this.settingsStore.globalCurrentModel();
      this.settingsStore.setCurrentModel(model);
      return;
    }

    this.settingsStore.setCurrentModel(this.settingsStore.globalCurrentModel());
  }

  private normalizeModel(model: string): ModelType {
    return isModelType(model) ? model : this.models[0].id;
  }
}
