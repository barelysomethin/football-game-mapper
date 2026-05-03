import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatchService } from '../core/services/match.service';
import { NgEchartsModule } from 'ngx-echarts';
import { EChartsOption } from 'echarts';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, NgEchartsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ReportsComponent {
  private matchService = inject(MatchService);

  // Data from service
  eventsCount = this.matchService.eventsCount;
  events = this.matchService.events;
  homeTeam = computed(() => this.matchService.matchMetadata().homeTeam);
  awayTeam = computed(() => this.matchService.matchMetadata().awayTeam);

  // Chart Options
  chartOption = computed<EChartsOption>(() => {
    const homeEvents = this.events().filter(e => e.team === 'home').length;
    const awayEvents = this.events().filter(e => e.team === 'away').length;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item'
      },
      legend: {
        bottom: '0%',
        left: 'center',
        textStyle: { color: '#98a8b9' }
      },
      series: [
        {
          name: 'Events by Team',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: '#1e2121',
            borderWidth: 2
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 16,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: homeEvents, name: this.homeTeam(), itemStyle: { color: '#0f8f5b' } },
            { value: awayEvents, name: this.awayTeam(), itemStyle: { color: '#FFB414' } }
          ]
        }
      ]
    };
  });

  // Simple Social Post Generator
  socialPosts = computed(() => {
    const count = this.eventsCount();
    if (count === 0) return [];

    return [
      {
        platform: 'Twitter',
        content: `📊 Match analysis complete! ${this.homeTeam()} vs ${this.awayTeam()} showed some intense action with ${count} key events mapped. #FootballAnalysis #MatchLab`,
        icon: 'share'
      },
      {
        platform: 'Instagram',
        content: `Victory is in the details. 📈 Check out the full breakdown of today's match. ${count} data points captured for maximum precision.`,
        icon: 'camera_alt'
      }
    ];
  });

  importDemoData() {
    // Logic to add some dummy events for demo purposes
    // In a real app, this might come from a CSV upload
    this.matchService.addEvent({
      id: Math.random().toString(36).substr(2, 9),
      matchId: 'M-2026-014',
      playerId: 'H1',
      playerName: 'Captain Awesome',
      team: 'home',
      type: 'Pass',
      outcome: 'Successful',
      minute: 12,
      second: 30,
      pitchX: 45.5,
      pitchY: 60.2
    });
  }
}
