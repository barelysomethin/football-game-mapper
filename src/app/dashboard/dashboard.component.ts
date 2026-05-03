import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatchService } from '../core/services/match.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent {
  private matchService = inject(MatchService);

  // Expose signals for the template
  matchInfo = this.matchService.matchMetadata;
  homeRoster = this.matchService.homeRoster;
  awayRoster = this.matchService.awayRoster;
  eventsCount = this.matchService.eventsCount;
}
