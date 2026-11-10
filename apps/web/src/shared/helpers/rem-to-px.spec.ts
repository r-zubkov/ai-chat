import { remToPx } from './rem-to-px';

describe('remToPx', () => {
  let previousFontSize: string;

  beforeEach(() => {
    previousFontSize = document.documentElement.style.fontSize;
  });

  afterEach(() => {
    document.documentElement.style.fontSize = previousFontSize;
  });

  it('converts rem to pixels using the current root font size', () => {
    document.documentElement.style.fontSize = '10px';

    expect(remToPx(1.5)).toBe(15);
  });

  it('returns 0 for a zero rem value', () => {
    document.documentElement.style.fontSize = '16px';

    expect(remToPx(0)).toBe(0);
  });
});
