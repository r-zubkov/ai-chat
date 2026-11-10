import { computed, Injectable, signal } from '@angular/core';

type InitialDataLoader = () => Promise<void>;

export interface InitialDataLoadOptions {
  readonly showLoader: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AppStateService {
  private readonly status = signal<'restoring' | 'loading' | 'ready' | 'error'>('restoring');
  private readonly initialDataPromise: Promise<boolean>;
  private resolveInitialData!: (value: boolean) => void;
  private initialDataLoader: InitialDataLoader | null = null;
  private loading = false;

  readonly initialDataLoading = computed(() => this.status() === 'loading');
  readonly initialDataReady = computed(() => this.status() === 'ready');
  readonly initialDataError = computed(() => this.status() === 'error');

  constructor() {
    this.initialDataPromise = new Promise<boolean>((resolve) => {
      this.resolveInitialData = resolve;
    });
  }

  registerInitialDataLoad(loader: InitialDataLoader, options: InitialDataLoadOptions): void {
    if (this.initialDataLoader) return;

    this.initialDataLoader = loader;
    this.runInitialDataLoad(options.showLoader);
  }

  retryInitialDataLoad(): void {
    if (this.status() !== 'error') return;
    this.runInitialDataLoad(true);
  }

  getInitialDataGuardResult(): Promise<boolean> {
    return this.initialDataPromise;
  }

  private runInitialDataLoad(showLoader: boolean): void {
    if (!this.initialDataLoader || this.loading) return;

    this.loading = true;
    this.status.set(showLoader ? 'loading' : 'restoring');

    void this.initialDataLoader()
      .then(() => {
        this.status.set('ready');
        this.resolveInitialData(true);
      })
      .catch((error: unknown) => {
        console.error('Failed to initialize application', error);
        this.status.set('error');
      })
      .finally(() => {
        this.loading = false;
      });
  }
}
