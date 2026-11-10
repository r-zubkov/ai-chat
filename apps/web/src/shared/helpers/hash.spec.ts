import { buildTextHash } from './hash';

describe('buildTextHash', () => {
  it('returns a deterministic hash for the same input', () => {
    const text = 'same input';

    expect(buildTextHash(text)).toBe(buildTextHash(text));
  });

  it('returns 0 for an empty string', () => {
    expect(buildTextHash('')).toBe('0');
  });

  it('returns different hashes for different input', () => {
    expect(buildTextHash('abc')).not.toBe(buildTextHash('abd'));
  });
});
