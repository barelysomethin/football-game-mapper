export interface Player {
  id: string;
  name: string;
  number: string;
  position: string;
  team: 'home' | 'away';
}

export interface MatchEvent {
  id: string;
  matchId: string;
  playerId: string;
  playerName: string;
  team: 'home' | 'away';
  type: string; // e.g., 'Pass', 'Shot', 'Goal'
  outcome: 'Successful' | 'Unsuccessful' | 'Neutral';
  minute: number;
  second: number;
  pitchX: number; // 0-100
  pitchY: number; // 0-100
  confidence?: number;
  detectedClass?: string;
  notes?: string;
}

export interface Team {
  name: string;
  players: Player[];
}

export interface MatchMetadata {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
}
