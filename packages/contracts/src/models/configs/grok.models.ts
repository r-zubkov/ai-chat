import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const GROK_MODELS = defineFamilyModels(MODEL_FAMILY.GROK, {
  GROK_4_FAST: {
    id: 'grok-4-fast',
    label: 'Grok 4 Fast',
  },
  GROK_CODE_FAST_LEGACY: {
    id: 'grok-code-fast',
    label: 'Grok Code Fast',
  },
});
