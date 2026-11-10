import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const GPT_MODELS = defineFamilyModels(MODEL_FAMILY.GPT, {
  GPT_5_LEGACY: {
    id: 'gpt-5',
    label: 'GPT 5',
  },
  GPT_5_MINI_LEGACY: {
    id: 'gpt-5-mini',
    label: 'GPT 5 mini',
  },
  GPT_5_NANO_LEGACY: {
    id: 'gpt-5-nano',
    label: 'GPT 5 nano',
  },
  GPT_5_1: {
    id: 'gpt-5.1',
    label: 'GPT 5.1',
  },
  GPT_5_1_LEGACY: {
    id: 'gpt-51',
    label: 'GPT 5.1',
  },
  GPT_5_2_LEGACY: {
    id: 'gpt-52',
    label: 'GPT 5.2',
  },
});
