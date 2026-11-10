import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const GEMINI_MODELS = defineFamilyModels(MODEL_FAMILY.GEMINI, {
  GEMINI_3_FLASH_PREVIEW: {
    id: 'gemini-3-flash-preview',
    label: 'Gemini 3 Flash',
  },
});
