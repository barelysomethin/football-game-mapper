import { Component, OnDestroy, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Component({
  template: '',
  standalone: true
})
export abstract class BaseComponent implements OnDestroy {
  // Shared logic for all components (Requirement #8)
  
  // Track component destruction for RxJS cleanup
  protected readonly destroy$ = new Subject<void>();
  
  // Shared UI state
  readonly isLoading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Common helper to handle errors
  protected handleError(err: any, customMessage?: string): void {
    console.error(err);
    this.errorMessage.set(customMessage || 'An unexpected error occurred. Please try again.');
    this.isLoading.set(false);
  }

  protected clearError(): void {
    this.errorMessage.set(null);
  }
}
