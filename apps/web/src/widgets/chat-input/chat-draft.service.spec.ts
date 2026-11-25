import { TestBed } from '@angular/core/testing';
import { ChatDraftService } from './chat-draft.service';

describe('ChatDraftService', () => {
  const storageKey = 'lastDraft';

  afterEach(() => {
    jest.restoreAllMocks();
    localStorage.removeItem(storageKey);
  });

  it.each([null, ''])('starts empty when the stored draft is %p', (storedDraft) => {
    if (storedDraft !== null) localStorage.setItem(storageKey, storedDraft);

    expect(TestBed.inject(ChatDraftService).getDraft()).toBe('');
  });

  it.each(['  First line\nSecond line  ', '  '])('reads the current draft %p', (storedDraft) => {
    const service = TestBed.inject(ChatDraftService);
    localStorage.setItem(storageKey, storedDraft);

    expect(service.getDraft()).toBe(storedDraft);
  });

  it('replaces the stored draft and removes the key when cleared', () => {
    const service = TestBed.inject(ChatDraftService);

    service.saveDraft('First draft');
    service.saveDraft('  Updated draft\n');
    expect(service.getDraft()).toBe('  Updated draft\n');
    expect(localStorage.getItem(storageKey)).toBe('  Updated draft\n');

    service.saveDraft('');
    expect(service.getDraft()).toBe('');
    expect(localStorage.getItem(storageKey)).toBeNull();
  });

  it('starts empty when browser storage is unavailable', () => {
    jest.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Storage is unavailable', 'SecurityError');
    });
    expect(TestBed.inject(ChatDraftService).getDraft()).toBe('');
  });
});
