import { truncateAtWord } from './text-utils';

describe('truncateAtWord', () => {
  it('returns an empty string for empty text', () => {
    expect(truncateAtWord('', 10)).toBe('');
  });

  it('returns an empty string when maxLength is not positive', () => {
    expect(truncateAtWord('hello', 0)).toBe('');
  });

  it('returns trimmed text when it is shorter than the limit', () => {
    expect(truncateAtWord('  hello world  ', 20, '...')).toBe('hello world');
  });

  it('truncates at a word boundary and adds an ellipsis', () => {
    expect(truncateAtWord('hello world there', 12, '...')).toBe('hello world...');
  });

  it('truncates strictly when there are no spaces before the limit', () => {
    expect(truncateAtWord('helloworld', 5, '...')).toBe('hello...');
  });

  it('does not add an ellipsis when ellipsis is null', () => {
    expect(truncateAtWord('hello world', 5, null)).toBe('hello');
  });
});
