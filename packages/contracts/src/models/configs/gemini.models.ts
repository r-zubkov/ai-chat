import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const GEMINI_MODELS = defineFamilyModels(MODEL_FAMILY.GEMINI, {
  GEMINI_3_FLASH_PREVIEW: {
    id: 'gemini-3-flash-preview',
    label: 'Gemini 3 Flash',
  },
  GEMINI_2_FLASH_LEGACY: {
    id: 'gemini-2-flash',
    label: 'Gemini 2 Flash',
  },
  GEMINI_2_FLASH_LIGHT_LEGACY: {
    id: 'gemini-2-flash-light',
    label: 'Gemini 2 Flash Light',
  },
  GEMINI_2_5_FLASH_LEGACY: {
    id: 'gemini-25-flash',
    label: 'Gemini 2.5 Flash',
  },
  GEMINI_2_5_FLASH_LIGHT_LEGACY: {
    id: 'gemini-25-flash-light',
    label: 'Gemini 2.5 Flash Light',
  },
});
