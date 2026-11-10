import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const GROK_MODELS = defineFamilyModels(MODEL_FAMILY.GROK, {
  GROK_4_FAST: {
    id: 'grok-4-fast',
    label: 'Grok 4 Fast',
  },
  GROK_4_3: {
    id: 'grok-4.3',
    label: 'Grok 4.3',
  },
  GROK_4_5: {
    id: 'grok-4.5',
    label: 'Grok 4.5',
  },
  GROK_4_6: {
    id: 'grok-4.6',
    label: 'Grok 4.6',
  },
  GROK_4_7: {
    id: 'grok-4.7',
    label: 'Grok 4.7',
  },
  GROK_BUILD_0_1: {
    id: 'grok-build-0.1',
    label: 'Grok Build 0.1',
  },
});
