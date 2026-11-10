import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const GEMINI_MODELS = defineFamilyModels(MODEL_FAMILY.GEMINI, {
  GEMINI_3_FLASH_PREVIEW: {
    id: 'gemini-3-flash-preview',
    label: 'Gemini 3 Flash',
  },
  GEMINI_3_1_FLASH_LITE: {
    id: 'gemini-3.1-flash-lite',
    label: 'Gemini 3.1 Flash Lite',
  },
  GEMINI_3_1_PRO_PREVIEW: {
    id: 'gemini-3.1-pro-preview',
    label: 'Gemini 3.1 Pro Preview',
  },
  GEMINI_3_5_FLASH_LITE: {
    id: 'gemini-3.5-flash-lite',
    label: 'Gemini 3.5 Flash Lite',
  },
  GEMINI_3_5_FLASH: {
    id: 'gemini-3.5-flash',
    label: 'Gemini 3.5 Flash',
  },
  GEMINI_3_6_FLASH: {
    id: 'gemini-3.6-flash',
    label: 'Gemini 3.6 Flash',
  },
  GEMINI_3_7_FLASH: {
    id: 'gemini-3.7-flash',
    label: 'Gemini 3.7 Flash',
  },
  GEMINI_3_8_FLASH: {
    id: 'gemini-3.8-flash',
    label: 'Gemini 3.8 Flash',
  },
  GEMINI_4_ARGON: {
    id: 'gemini-4-argon',
    label: 'Gemini 4 Argon',
  },
});
