import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Player, MatchEvent, MatchMetadata } from '../models/match.model';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  // 1. Private state using BehaviorSubjects
  private readonly _metadata = new BehaviorSubject<MatchMetadata>({
    id: 'M-2026-014',
    homeTeam: 'Team A',
    awayTeam: 'Team B',
    date: new Date().toLocaleDateString()
  });

  private readonly _players = new BehaviorSubject<Player[]>([]);
  private readonly _events = new BehaviorSubject<MatchEvent[]>([]);

  // 2. Public Observables (Strict Requirement #7)
  readonly metadata$ = this._metadata.asObservable();
  readonly players$ = this._players.asObservable();
  readonly events$ = this._events.asObservable();

  // 3. Actions
  addPlayer(player: Player): void {
    this._players.next([...this._players.value, player]);
  }

  addEvent(event: MatchEvent): void {
    this._events.next([...this._events.value, event]);
  }

  setTeams(homeName: string, awayName: string): void {
    this._metadata.next({
      ...this._metadata.value,
      homeTeam: homeName,
      awayTeam: awayName
    });
  }

  clearData(): void {
    this._players.next([]);
    this._events.next([]);
  }
}
