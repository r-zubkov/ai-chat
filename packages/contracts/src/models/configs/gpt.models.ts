import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const GPT_MODELS = defineFamilyModels(MODEL_FAMILY.GPT, {
  GPT_5_1: {
    id: 'gpt-5.1',
    label: 'GPT 5.1',
  },
});
