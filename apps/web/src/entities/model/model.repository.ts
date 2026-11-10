import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  API_ROUTES,
  isAvailableModelIdsResponse,
  type AvailableModelIdsResponse,
} from '@ai-chat/contracts';
import { firstValueFrom } from 'rxjs';

const AVAILABLE_MODEL_IDS_CACHE_KEY = 'ai-chat.available-model-ids.v1';

@Injectable({ providedIn: 'root' })
export class ModelRepository {
  private readonly http = inject(HttpClient);

  getCachedAvailableModelIds(): AvailableModelIdsResponse | null {
    try {
      const serialized = localStorage.getItem(AVAILABLE_MODEL_IDS_CACHE_KEY);
      if (!serialized) return null;

      const value = JSON.parse(serialized) as unknown;
      return isAvailableModelIdsResponse(value) ? value : null;
    } catch {
      return null;
    }
  }

  async getAvailableModelIds(): Promise<AvailableModelIdsResponse> {
    const response = await firstValueFrom(this.http.get<unknown>(API_ROUTES.models));

    if (!isAvailableModelIdsResponse(response)) {
      throw new Error('Invalid available models response');
    }

    return response;
  }

  cacheAvailableModelIds(modelIds: AvailableModelIdsResponse): void {
    try {
      localStorage.setItem(AVAILABLE_MODEL_IDS_CACHE_KEY, JSON.stringify(modelIds));
    } catch (error: unknown) {
      console.warn('Failed to cache available model IDs', error);
    }
  }
}
