import { Injectable, signal, computed } from '@angular/core';
import { Player, MatchEvent, MatchMetadata } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  // Current Match State
  readonly matchMetadata = signal<MatchMetadata>({
    id: 'M-2026-014',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    date: new Date().toISOString()
  });

  readonly players = signal<Player[]>([]);
  readonly events = signal<MatchEvent[]>([]);

  // Derived State (Computed)
  readonly homePlayers = computed(() => 
    this.players().filter(p => p.team === 'home')
  );

  readonly awayPlayers = computed(() => 
    this.players().filter(p => p.team === 'away')
  );

  readonly totalEvents = computed(() => this.events().length);

  readonly homeEventsCount = computed(() => 
    this.events().filter(e => e.team === 'home').length
  );

  readonly awayEventsCount = computed(() => 
    this.events().filter(e => e.team === 'away').length
  );

  // Actions
  addPlayer(player: Player): void {
    this.players.update(current => [...current, player]);
  }

  updatePlayer(updatedPlayer: Player): void {
    this.players.update(current => 
      current.map(p => p.id === updatedPlayer.id ? updatedPlayer : p)
    );
  }

  removePlayer(playerId: string): void {
    this.players.update(current => 
      current.filter(p => p.id !== playerId)
    );
  }

  addEvent(event: MatchEvent): void {
    this.events.update(current => [...current, event]);
  }

  removeEvent(eventId: string): void {
    this.events.update(current => 
      current.filter(e => e.id !== eventId)
    );
  }

  setTeams(homeName: string, awayName: string): void {
    this.matchMetadata.update(current => ({
      ...current,
      homeTeam: homeName,
      awayTeam: awayName
    }));
  }

  clearAllData(): void {
    this.players.set([]);
    this.events.set([]);
  }
}
