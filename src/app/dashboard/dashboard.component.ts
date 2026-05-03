import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatchService } from '../core/services/match.service';
import { BaseComponent } from '../core/base/base.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent extends BaseComponent {
  private matchService = inject(MatchService);

  // Requirement #7 & #2 compliance
  matchInfo = toSignal(this.matchService.metadata$, { initialValue: { id: '', homeTeam: '', awayTeam: '', date: '' } });
  players = toSignal(this.matchService.players$, { initialValue: [] });
  events = toSignal(this.matchService.events$, { initialValue: [] });

  // Requirement #3 compliance
  homeRoster = computed(() => this.players().filter(p => p.team === 'home'));
  awayRoster = computed(() => this.players().filter(p => p.team === 'away'));
  eventsCount = computed(() => this.events().length);
}
