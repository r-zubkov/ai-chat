import { escapeHtml } from './escape-html';

describe('escapeHtml', () => {
  it('escapes special HTML characters', () => {
    expect(escapeHtml(`<&>"'`)).toBe('&lt;&amp;&gt;&quot;&#39;');
  });

  it('does not change a string without special characters', () => {
    expect(escapeHtml('const value = 1;')).toBe('const value = 1;');
  });
});
