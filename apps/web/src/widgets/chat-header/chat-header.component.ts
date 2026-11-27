import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiDataList, TuiDropdown, TuiIcon, TuiLink } from '@taiga-ui/core';
import { TuiChevron } from '@taiga-ui/kit';
import type { ModelId } from '@ai-chat/contracts';
import { ChatStore } from '@entities/chat';
import { SettingsStore } from '@entities/settings';
import { SelectModelService } from '@features/select-model';
import { CHAT_ROUTES } from '@shared/routes';
import { ShellUiService } from '@shared/ui';

@Component({
  selector: 'app-chat-header',
  imports: [TuiChevron, TuiIcon, TuiLink, TuiDropdown, TuiDataList, RouterLink],
  templateUrl: './chat-header.component.html',
  styleUrl: './chat-header.component.less',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatHeaderComponent {
  protected modelSelectionOpen: boolean = false;

  readonly settingsStore = inject(SettingsStore);
  readonly shellUi = inject(ShellUiService);
  readonly selectModel = inject(SelectModelService);
  readonly chatStore = inject(ChatStore);

  protected readonly selectedModelLabel = computed(() => {
    const selectedModelId = this.settingsStore.selectedModelId();
    return this.selectModel.models().find((model) => model.id === selectedModelId)?.label ?? null;
  });
  protected readonly chatRoutes = CHAT_ROUTES;

  protected onModelSelect(model: ModelId): void {
    void this.selectModel.selectModel(model);
    this.modelSelectionOpen = false;
  }

  protected isModelSelected(model: ModelId): boolean {
    return model === this.settingsStore.selectedModelId();
  }

  protected toggleSidebar(): void {
    this.shellUi.toggleSidebar();
  }
}
