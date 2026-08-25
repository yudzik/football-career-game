import type { StatKey } from '../types';

export type DayActionType = 'train' | 'recover' | 'rest';

export interface StatEffect {
  key: StatKey;
  label: string;
  progressBefore: number;
  progressAfter: number;
  statBefore: number;
  statAfter: number;
  leveledUp: boolean;
}

export interface DayResult {
  actionType: DayActionType;
  dateLabel: string;
  fatigueBefore: number;
  fatigueAfter: number;
  readinessBefore: number;
  readinessAfter: number;
  statEffect: StatEffect | null;
}

export interface PostMatchSummary {
  opponentName: string;
  opponentCrest: string;
  scoreP: number;
  scoreO: number;
  minutesPlayed: number;
  goals: number;
  assists: number;
  goodActions: number;
  badActions: number;
  rating: number;
  statChanges: StatEffect[];
  formDelta: number;
  fatigueDelta: number;
  nextScreen: 'seasonEnd' | 'home';
}
