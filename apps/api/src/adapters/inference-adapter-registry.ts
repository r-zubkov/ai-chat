import { CHAT_ERROR_CODE } from '@ai-chat/contracts';
import { ChatServiceError } from '../chat/chat.error.js';
import type { InferenceAdapter } from '../chat/inference-adapter.js';
import type { AdapterId } from './adapter.constants.js';

export class InferenceAdapterRegistry {
  private readonly adapters: ReadonlyMap<AdapterId, InferenceAdapter>;

  constructor(adapters: readonly InferenceAdapter[]) {
    this.adapters = new Map(adapters.map((adapter) => [adapter.id, adapter]));
  }

  get(adapterId: AdapterId): InferenceAdapter {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) {
      throw new ChatServiceError(
        CHAT_ERROR_CODE.INTERNAL_ERROR,
        `Inference adapter is not registered: ${adapterId}`,
        500,
      );
    }

    return adapter;
  }
}
