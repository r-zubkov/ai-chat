import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const QWEN_MODELS = defineFamilyModels(MODEL_FAMILY.QWEN, {
  QWEN_3_5_FLASH: {
    id: 'qwen-3.5-flash',
    label: 'Qwen 3.5 Flash',
  },
  QWEN_3_5_PLUS: {
    id: 'qwen-3.5-plus',
    label: 'Qwen 3.5 Plus',
  },
  QWEN_3_6_FLASH: {
    id: 'qwen-3.6-flash',
    label: 'Qwen 3.6 Flash',
  },
  QWEN_3_6_PLUS: {
    id: 'qwen-3.6-plus',
    label: 'Qwen 3.6 Plus',
  },
  QWEN_3_7_PLUS: {
    id: 'qwen-3.7-plus',
    label: 'Qwen 3.7 Plus',
  },
  QWEN_3_7_MAX: {
    id: 'qwen-3.7-max',
    label: 'Qwen 3.7 Max',
  },
  QWEN_3_8_FLASH: {
    id: 'qwen-3.8-flash',
    label: 'Qwen 3.8 Flash',
  },
  QWEN_3_8_MAX: {
    id: 'qwen-3.8-max',
    label: 'Qwen 3.8 Max',
  },
});
