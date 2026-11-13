import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const GPT_MODELS = defineFamilyModels(MODEL_FAMILY.GPT, {
  GPT_4O: {
    id: 'gpt-4o',
    label: 'GPT 4o',
  },
  GPT_4_1_MINI: {
    id: 'gpt-4.1-mini',
    label: 'GPT 4.1 mini',
  },
  GPT_4_1: {
    id: 'gpt-4.1',
    label: 'GPT 4.1',
  },
  GPT_5_1: {
    id: 'gpt-5.1',
    label: 'GPT 5.1',
  },
  GPT_5_2: {
    id: 'gpt-5.2',
    label: 'GPT 5.2',
  },
  GPT_5_3_CODEX: {
    id: 'gpt-5.3-codex',
    label: 'GPT 5.3 Codex',
  },
  GPT_5_4_NANO: {
    id: 'gpt-5.4-nano',
    label: 'GPT 5.4 Nano',
  },
  GPT_5_4_MINI: {
    id: 'gpt-5.4-mini',
    label: 'GPT 5.4 Mini',
  },
  GPT_5_4: {
    id: 'gpt-5.4',
    label: 'GPT 5.4',
  },
  GPT_5_5: {
    id: 'gpt-5.5',
    label: 'GPT-5.5',
  },
  GPT_5_6_LUNA: {
    id: 'gpt-5.6-luna',
    label: 'GPT-5.6 Luna',
  },
  GPT_5_6_TERRA: {
    id: 'gpt-5.6-terra',
    label: 'GPT-5.6 Terra',
  },
  GPT_5_6_SOL: {
    id: 'gpt-5.6-sol',
    label: 'GPT-5.6 Sol',
  },
  GPT_6_LUNA: {
    id: 'gpt-6-luna',
    label: 'GPT-6 Luna',
  },
  GPT_6_SOL: {
    id: 'gpt-6-sol',
    label: 'GPT-6 Sol',
  },
  GPT_6_ASTRA: {
    id: 'gpt-6-astra',
    label: 'GPT-6 Astra',
  },
  GPT_6_1_TERRA: {
    id: 'gpt-6.1-terra',
    label: 'GPT-6.1 Terra',
  },
  GPT_6_1_SOL: {
    id: 'gpt-6.1-sol',
    label: 'GPT-6.1 Sol',
  },
});
