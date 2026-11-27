import { inject, Injectable } from '@angular/core';
import type { ModelId } from '@ai-chat/contracts';
import { ChatId, ChatStore } from '@entities/chat';
import { ModelStore } from '@entities/model';
import { SettingsStore } from '@entities/settings';

@Injectable({ providedIn: 'root' })
export class SelectModelService {
  private readonly chatStore = inject(ChatStore);
  private readonly modelStore = inject(ModelStore);
  private readonly settingsStore = inject(SettingsStore);

  readonly models = this.modelStore.models;

  async selectModel(model: ModelId): Promise<void> {
    const modelToSet = this.normalizeModel(model);

    this.settingsStore.setSelectedModelId(modelToSet);

    if (!this.chatStore.activeChatId()) {
      await this.settingsStore.persistPreferredModelId(modelToSet);
    }
  }

  syncSelectedModelForChat(chatId: ChatId | null): void {
    if (chatId) {
      const activeChat = this.chatStore.activeChat();
      const model =
        activeChat && this.modelStore.isAvailable(activeChat.model)
          ? activeChat.model
          : this.settingsStore.preferredModelId();
      if (model) this.settingsStore.setSelectedModelId(model);
      return;
    }

    const preferredModelId = this.settingsStore.preferredModelId();
    if (preferredModelId) this.settingsStore.setSelectedModelId(preferredModelId);
  }

  private normalizeModel(model: string): ModelId {
    return this.modelStore.isAvailable(model) ? model : this.modelStore.getDefaultModel();
  }
}
