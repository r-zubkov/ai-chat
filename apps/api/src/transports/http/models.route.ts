import { API_ROUTES, type AvailableModelIdsResponse } from '@ai-chat/contracts';
import type { Express } from 'express';
import type { AvailableModels } from '../../models/available-models.js';

export function registerModelsRoute(app: Express, availableModels: AvailableModels): void {
  app.get(API_ROUTES.models, (_request, response) => {
    const modelIds: AvailableModelIdsResponse = Array.from(availableModels.keys());
    response.json(modelIds);
  });
}
