import { defineFamilyModels } from '../define-family-models.js';
import { MODEL_FAMILY } from '../model.constants.js';

export const CLAUDE_MODELS = defineFamilyModels(MODEL_FAMILY.CLAUDE, {
  CLAUDE_4_5_HAIKU: {
    id: 'claude-4.5-haiku',
    label: 'Claude 4.5 Haiku',
  },
  CLAUDE_4_6_SONNET: {
    id: 'claude-4.6-sonnet',
    label: 'Claude 4.6 Sonnet',
  },
  CLAUDE_4_6_OPUS: {
    id: 'claude-4.6-opus',
    label: 'Claude 4.6 Opus',
  },
  CLAUDE_4_7_OPUS: {
    id: 'claude-4.7-opus',
    label: 'Claude 4.7 Opus',
  },
  CLAUDE_4_8_OPUS: {
    id: 'claude-4.8-opus',
    label: 'Claude 4.8 Opus',
  },
  CLAUDE_5_FABLE: {
    id: 'claude-5-fable',
    label: 'Claude 5 Fable',
  },
  CLAUDE_5_SONNET: {
    id: 'claude-5-sonnet',
    label: 'Claude 5 Sonnet',
  },
  CLAUDE_5_OPUS: {
    id: 'claude-5-opus',
    label: 'Claude Opus 5',
  },
  CLAUDE_5_1_FABLE: {
    id: 'claude-5.1-fable',
    label: 'Claude 5.1 Fable',
  },
  CLAUDE_5_5_HAIKU: {
    id: 'claude-5.5-haiku',
    label: 'Claude 5.5 Haiku',
  },
  CLAUDE_5_5_SONNET: {
    id: 'claude-5.5-sonnet',
    label: 'Claude 5.5 Sonnet',
  },
  CLAUDE_5_5_OPUS: {
    id: 'claude-5.5-opus',
    label: 'Claude Opus 5.5',
  },
});
