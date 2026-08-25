export type StatKey = 'pace' | 'shooting' | 'passing' | 'dribbling' | 'physical' | 'defending';

export type Stats = Record<StatKey, number>;

export type PositionGroup = 'GK' | 'DEF' | 'MID' | 'WING' | 'ATT';

export interface Position {
  code: string;
  label: string;
  stats: Stats;
}

export interface Profile {
  key: string;
  name: string;
  desc: string;
  statBias: Partial<Stats>;
  favoredStats: StatKey[];
}

export interface Country {
  name: string;
  confederation: string;
}

export interface Difficulty {
  key: string;
  label: string;
  desc: string;
  statBias: number;
  potentialBias: number;
}

export interface Opponent {
  name: string;
  strength: number;
  crest: string;
}

export interface CareerStats {
  goals: number;
  assists: number;
  apps: number;
  ratings: number[];
}

export interface Player {
  name: string;
  surname: string;
  age: number;
  country: string;
  position: string;
  positionLabel: string;
  positionGroup: PositionGroup;
  profileKey: string;
  profileName: string;
  stats: Stats;
  progress: Stats;
  potential: number;
  ovr: number;
  form: number;
  readiness: number;
  fatigue: number;
  careerStats: CareerStats;
}

export interface HistoryEntry {
  opponent: string;
  scoreP: number;
  scoreO: number;
  rating: number;
  goals: number;
  assists: number;
}
