import {
  copyHtmlToClipboard,
  copyPlainTextToClipboard,
  extractPlainTextFromHtml,
} from './clipboard';

describe('clipboard helpers', () => {
  let originalNavigatorClipboardDescriptor: PropertyDescriptor | undefined;
  let originalClipboardItemDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    originalNavigatorClipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    originalClipboardItemDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'ClipboardItem');
  });

  afterEach(() => {
    restoreProperty(navigator, 'clipboard', originalNavigatorClipboardDescriptor);
    restoreProperty(globalThis, 'ClipboardItem', originalClipboardItemDescriptor);
  });

  it('extracts plain text from an HTML string', () => {
    expect(extractPlainTextFromHtml('<strong>Привет</strong> мир')).toBe('Привет мир');
  });

  it('copies plain text to the clipboard', async () => {
    const clipboard = createClipboardMock();
    clipboard.writeText.and.callFake(() => Promise.resolve());
    setNavigatorClipboard(clipboard);

    const copied = await copyPlainTextToClipboard('Текст');

    expect(copied).toBeTrue();
    expect(clipboard.writeText).toHaveBeenCalledWith('Текст');
  });

  it('returns false for plain text when the clipboard is unavailable', async () => {
    setNavigatorClipboard(undefined);

    const copied = await copyPlainTextToClipboard('Текст');

    expect(copied).toBeFalse();
  });

  it('returns false for plain text after a write error', async () => {
    const clipboard = createClipboardMock();
    clipboard.writeText.and.callFake(() => Promise.reject(new Error('Ошибка записи')));
    setNavigatorClipboard(clipboard);
    spyOn(console, 'error');

    const copied = await copyPlainTextToClipboard('Текст');

    expect(copied).toBeFalse();
    expect(console.error).toHaveBeenCalled();
  });

  it('copies HTML through ClipboardItem when rich copy is available', async () => {
    const clipboard = createClipboardMock();
    clipboard.write.and.callFake(() => Promise.resolve());
    setNavigatorClipboard(clipboard);
    setClipboardItemMock();

    const copied = await copyHtmlToClipboard('<b>Текст</b>', 'Текст');

    expect(copied).toBeTrue();
    expect(clipboard.write).toHaveBeenCalled();
    expect(clipboard.writeText).not.toHaveBeenCalled();
  });

  it('falls back to plain text when ClipboardItem is unavailable', async () => {
    const clipboard = createClipboardMock();
    clipboard.writeText.and.callFake(() => Promise.resolve());
    setNavigatorClipboard(clipboard);
    Object.defineProperty(globalThis, 'ClipboardItem', {
      value: undefined,
      configurable: true,
      writable: true,
    });

    const copied = await copyHtmlToClipboard('<b>Текст</b>', 'Текст');

    expect(copied).toBeTrue();
    expect(clipboard.write).not.toHaveBeenCalled();
    expect(clipboard.writeText).toHaveBeenCalledWith('Текст');
  });

  it('falls back to plain text after a rich-copy write error', async () => {
    const clipboard = createClipboardMock();
    clipboard.write.and.callFake(() => Promise.reject(new Error('Ошибка rich-copy')));
    clipboard.writeText.and.callFake(() => Promise.resolve());
    setNavigatorClipboard(clipboard);
    setClipboardItemMock();
    spyOn(console, 'error');

    const copied = await copyHtmlToClipboard('<b>Текст</b>', 'Текст');

    expect(copied).toBeTrue();
    expect(clipboard.write).toHaveBeenCalled();
    expect(clipboard.writeText).toHaveBeenCalledWith('Текст');
    expect(console.error).toHaveBeenCalled();
  });

  it('returns false for HTML copy when the clipboard is unavailable', async () => {
    setNavigatorClipboard(undefined);

    const copied = await copyHtmlToClipboard('<b>Текст</b>', 'Текст');

    expect(copied).toBeFalse();
  });
});

function createClipboardMock(): jasmine.SpyObj<Pick<Clipboard, 'write' | 'writeText'>> {
  return jasmine.createSpyObj<Pick<Clipboard, 'write' | 'writeText'>>('clipboard', [
    'write',
    'writeText',
  ]);
}

function setNavigatorClipboard(
  clipboard: Pick<Clipboard, 'write' | 'writeText'> | undefined,
): void {
  Object.defineProperty(navigator, 'clipboard', {
    value: clipboard,
    configurable: true,
    writable: true,
  });
}

function setClipboardItemMock(): void {
  class MockClipboardItem {
    constructor(public readonly items: Record<string, Blob>) {}
  }

  Object.defineProperty(globalThis, 'ClipboardItem', {
    value: MockClipboardItem,
    configurable: true,
    writable: true,
  });
}

function restoreProperty(
  target: object,
  key: PropertyKey,
  descriptor: PropertyDescriptor | undefined,
): void {
  if (descriptor) {
    Object.defineProperty(target, key, descriptor);
    return;
  }

  Reflect.deleteProperty(target, key);
}
