import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChatInputComponent } from './chat-input.component';

describe('ChatInputComponent draft', () => {
  const storageKey = 'lastDraft';

  function createInput(): ComponentFixture<ChatInputComponent> {
    const fixture = TestBed.createComponent(ChatInputComponent);
    fixture.detectChanges();
    return fixture;
  }

  function textarea(fixture: ComponentFixture<ChatInputComponent>): HTMLTextAreaElement {
    return fixture.debugElement.query(By.css('textarea')).nativeElement as HTMLTextAreaElement;
  }

  function enterText(fixture: ComponentFixture<ChatInputComponent>, text: string): void {
    const field = textarea(fixture);
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }

  afterEach(() => localStorage.removeItem(storageKey));

  it('populates the first render and keeps edits when the composer is recreated', () => {
    localStorage.setItem(storageKey, '  Saved draft\nSecond line  ');
    const fixture = createInput();
    expect(textarea(fixture).value).toBe('  Saved draft\nSecond line  ');

    enterText(fixture, 'Edited draft');
    expect(localStorage.getItem(storageKey)).toBe('Edited draft');
    fixture.destroy();

    expect(textarea(createInput()).value).toBe('Edited draft');
  });

  it('clears saved text when erased or submitted', () => {
    const fixture = createInput();
    const sent = jest.fn();
    const subscription = fixture.componentInstance.sendMessage.subscribe(sent);

    enterText(fixture, 'Draft to erase');
    enterText(fixture, '');
    expect(localStorage.getItem(storageKey)).toBeNull();

    enterText(fixture, '  Draft to send  ');
    const form = fixture.debugElement.query(By.css('form')).nativeElement as HTMLFormElement;
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(sent).toHaveBeenCalledWith('Draft to send');
    expect(textarea(fixture).value).toBe('');
    expect(localStorage.getItem(storageKey)).toBeNull();
    subscription.unsubscribe();
  });
});
