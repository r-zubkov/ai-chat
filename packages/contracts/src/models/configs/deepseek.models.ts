import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const DEEPSEEK_MODELS = defineFamilyModels(MODEL_FAMILY.DEEPSEEK, {
  DEEPSEEK_V3_2: {
    id: 'deepseek-v3.2',
    label: 'DeepSeek V3.2',
  },
  DEEPSEEK_V3_2_LEGACY: {
    id: 'deepseek-32',
    label: 'DeepSeek V3.2',
  },
});
