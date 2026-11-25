import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Output,
  inject,
  input,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { isMobileDevice } from '@shared/helpers';
import { TuiButton, TuiInput } from '@taiga-ui/core';
import { TuiTextarea } from '@taiga-ui/kit';
import { ChatDraftService } from './chat-draft.service';

@Component({
  selector: 'app-chat-input',
  imports: [ReactiveFormsModule, TuiTextarea, TuiInput, TuiButton],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatInputComponent {
  private readonly chatDraft = inject(ChatDraftService);

  readonly thinking = input(false);
  readonly allowSend = input(true);

  @Output() sendMessage = new EventEmitter<string>();
  @Output() cancelRequest = new EventEmitter<void>();

  protected readonly form = new FormGroup({
    message: new FormControl(this.chatDraft.getDraft(), {
      nonNullable: true,
    }),
  });

  constructor() {
    this.watchDraftChanges();
  }

  protected get isSendAllowed(): boolean {
    return (
      this.allowSend() && !this.thinking() && this.form.controls.message.value.trim().length > 0
    );
  }

  protected send(): void {
    const text = this.form.controls.message.value.trim();

    if (!this.isSendAllowed) return;

    this.sendMessage.emit(text);
    this.form.controls.message.reset('');
  }

  protected cancel(): void {
    this.cancelRequest.emit();
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (event.isComposing) return;

    if (event.key !== 'Enter' || event.shiftKey || isMobileDevice()) return;

    event.preventDefault();
    this.send();
  }

  private watchDraftChanges(): void {
    this.form.controls.message.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((text) => this.chatDraft.saveDraft(text));
  }
}
