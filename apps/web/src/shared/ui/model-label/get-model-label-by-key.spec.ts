import { GPT_MODELS } from '@shared/config';
import { getModelLabelByKey } from './get-model-label-by-key';

describe('getModelLabelByKey', () => {
  it('returns the label for a known model key', () => {
    expect(getModelLabelByKey(GPT_MODELS.GPT_5_1.id)).toBe('GPT 5.1');
  });

  it('returns the label for a historical model key', () => {
    expect(getModelLabelByKey(GPT_MODELS.GPT_5_1_LEGACY.id)).toBe('GPT 5.1');
  });

  it('returns the label for a model removed from the previous catalog', () => {
    expect(getModelLabelByKey('gemini-25-flash-light')).toBe('Gemini 2.5 Flash Light');
  });

  it('returns a generic label for an unknown model key', () => {
    expect(getModelLabelByKey('unknown-model')).toBe('Модель');
  });
});
