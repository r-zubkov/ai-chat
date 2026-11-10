import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const DEEPSEEK_MODELS = defineFamilyModels(MODEL_FAMILY.DEEPSEEK, {
  DEEPSEEK_V_3_2: {
    id: 'deepseek-v3.2',
    label: 'DeepSeek V3.2',
  },
  DEEPSEEK_V_4_PRO: {
    id: 'deepseek-v4-pro',
    label: 'DeepSeek V4 Pro',
  },
  DEEPSEEK_V_4_1_FLASH: {
    id: 'deepseek-v4.1-flash',
    label: 'DeepSeek V4.1 Flash',
  },
});
