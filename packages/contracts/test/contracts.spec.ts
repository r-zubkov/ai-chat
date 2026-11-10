import { describe, expect, it } from 'vitest';
import {
  CHAT_ERROR_CODE,
  GPT_MODELS,
  getKnownModelDefinition,
  isChatCompletionRequest,
  isChatErrorPayload,
  isChatRequestPayload,
  isModelId,
} from '../src/index.js';

describe('shared contracts', () => {
  it('accepts a valid HTTP payload', () => {
    expect(
      isChatCompletionRequest({
        model: GPT_MODELS.GPT_5_1.id,
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    ).toBe(true);
  });

  it('rejects an unknown model and an empty requestId', () => {
    expect(isChatCompletionRequest({ model: 'unknown', messages: [] })).toBe(false);
    expect(
      isChatRequestPayload({ requestId: '', model: GPT_MODELS.GPT_5_1.id, messages: [] }),
    ).toBe(false);
  });

  it('validates a public error without provider data', () => {
    expect(
      isChatErrorPayload({ code: CHAT_ERROR_CODE.PROVIDER_ERROR, message: 'Provider failed' }),
    ).toBe(true);
  });

  it('keeps a historical model label without making the model available', () => {
    const historicalModel = GPT_MODELS.GPT_5_1_LEGACY.id;

    expect(getKnownModelDefinition(historicalModel)?.label).toBe('GPT 5.1');
    expect(isModelId(historicalModel)).toBe(false);
  });

  it('keeps labels for models removed from the previous catalog', () => {
    expect(getKnownModelDefinition('gpt-5-mini')?.label).toBe('GPT 5 mini');
    expect(getKnownModelDefinition('grok-code-fast')?.label).toBe('Grok Code Fast');
    expect(getKnownModelDefinition('gemini-25-flash')?.label).toBe('Gemini 2.5 Flash');
  });
});
