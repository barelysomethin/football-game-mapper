import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatchService } from '../core/services/match.service';
import { NgxEchartsDirective } from 'ngx-echarts';
import { EChartsOption } from 'echarts';
import { BaseComponent } from '../core/base/base.component';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, NgxEchartsDirective],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent extends BaseComponent {
  private matchService = inject(MatchService);

  // Consume Observables as Signals
  metadata = toSignal(this.matchService.metadata$, { initialValue: { id: '', homeTeam: '', awayTeam: '', date: '' } });
  events = toSignal(this.matchService.events$, { initialValue: [] });

  // Derived state
  eventsCount = computed(() => this.events().length);
  homeTeam = computed(() => this.metadata().homeTeam);
  awayTeam = computed(() => this.metadata().awayTeam);

  chartOption = computed<EChartsOption>(() => {
    const homeEvents = this.events().filter(e => e.team === 'home').length;
    const awayEvents = this.events().filter(e => e.team === 'away').length;

    return {
      backgroundColor: 'transparent',
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%', left: 'center', textStyle: { color: '#98a8b9' } },
      series: [
        {
          name: 'Events by Team',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 10, borderColor: '#1e2121', borderWidth: 2 },
          label: { show: false, position: 'center' },
          emphasis: { label: { show: true, fontSize: 16, fontWeight: 'bold' } },
          labelLine: { show: false },
          data: [
            { value: homeEvents, name: this.homeTeam(), itemStyle: { color: '#0f8f5b' } },
            { value: awayEvents, name: this.awayTeam(), itemStyle: { color: '#FFB414' } }
          ]
        }
      ]
    };
  });

  socialPosts = computed(() => {
    const count = this.eventsCount();
    if (count === 0) return [];
    return [
      {
        platform: 'Twitter',
        content: `📊 Match analysis complete! ${this.homeTeam()} vs ${this.awayTeam()} showed ${count} key events mapped. #FootballAnalysis`,
        icon: 'share'
      }
    ];
  });

  importDemoData() {
    this.isLoading.set(true);
    // Simulate async data loading for base class example
    setTimeout(() => {
      this.matchService.addEvent({
        id: Math.random().toString(36).substr(2, 9),
        matchId: this.metadata().id,
        playerId: 'H1',
        playerName: 'Captain Awesome',
        team: 'home',
        type: 'Pass',
        outcome: 'Successful',
        minute: 12,
        second: 30,
        pitchX: 45,
        pitchY: 60
      });
      this.isLoading.set(false);
    }, 500);
  }
}
