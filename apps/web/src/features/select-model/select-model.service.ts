import { inject, Injectable } from '@angular/core';
import { ChatId, ChatStore } from '@entities/chat';
import { ModelStore } from '@entities/model';
import { SettingsStore } from '@entities/settings';
import type { ModelType } from '@entities/settings';

@Injectable({ providedIn: 'root' })
export class SelectModelService {
  private readonly chatStore = inject(ChatStore);
  private readonly modelStore = inject(ModelStore);
  private readonly settingsStore = inject(SettingsStore);

  readonly models = this.modelStore.models;

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
      const model =
        activeChat && this.modelStore.isAvailable(activeChat.model)
          ? activeChat.model
          : this.settingsStore.globalCurrentModel();
      if (model) this.settingsStore.setCurrentModel(model);
      return;
    }

    const globalModel = this.settingsStore.globalCurrentModel();
    if (globalModel) this.settingsStore.setCurrentModel(globalModel);
  }

  private normalizeModel(model: string): ModelType {
    return this.modelStore.isAvailable(model) ? model : this.modelStore.getDefaultModel();
  }
}
