import { GEMINI_MODELS } from '@shared/config';
import { ModelLabelPipe } from './model-label.pipe';

describe('ModelLabelPipe', () => {
  const pipe = new ModelLabelPipe();

  it('returns the label for a known model key', () => {
    expect(pipe.transform(GEMINI_MODELS.GEMINI_3_FLASH_PREVIEW.id)).toBe('Gemini 3 Flash');
  });

  it('returns an empty string for null and undefined', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
  });
});
