import { Injectable } from '@angular/core';

const DRAFT_STORAGE_KEY = 'lastDraft';

@Injectable({ providedIn: 'root' })
export class ChatDraftService {
  getDraft(): string {
    try {
      return localStorage.getItem(DRAFT_STORAGE_KEY) ?? '';
    } catch {
      return '';
    }
  }

  saveDraft(text: string): void {
    if (text.length === 0) {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      return;
    }

    localStorage.setItem(DRAFT_STORAGE_KEY, text);
  }
}
