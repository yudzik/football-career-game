import type { Opponent, PositionGroup, StatKey } from '../types';

// Outcome tier keys vary by option kind (chain stage 1: clean/contested/lost,
// attacking: goal/chance/lost, defensive: great/ok/poor). Kept as a loose string-keyed
// record — same free-form shape the prototype used — rather than a closed union, so the
// engine logic doesn't have to be reshaped to satisfy the type checker.
export type MomentOutcomes = Record<string, string>;

export interface MomentOption {
  label: string;
  stat: StatKey;
  outcomes: MomentOutcomes;
}

export interface MomentTemplate {
  id: string;
  name: string;
  chain?: boolean;
  type: 'attacking' | 'defensive';
  group: string;
  positions: PositionGroup[];
  context: (o: Opponent) => string[];
  options: MomentOption[];
  stage2Context?: {
    clean: (o: Opponent) => string[];
    contested: (o: Opponent) => string[];
  };
  stage2Options?: MomentOption[];
}

export type MatchPhase = 'moment' | 'resolved' | 'fulltime';

export interface MatchMoment {
  statKey: StatKey;
  tier: string;
}

export interface MatchState {
  opponent: Opponent;
  slotIdx: number;
  usedTemplateIds: string[];
  currentTemplate: MomentTemplate;
  stage: 1 | 2;
  stage1Tier: string | null;
  minute: number;
  phase: MatchPhase;
  chosenLabel: string | null;
  resolutionText: string | null;
  resolutionTier: string | null;
  log: string[];
  scoreP: number;
  scoreO: number;
  playerGoals: number;
  playerAssists: number;
  moments: MatchMoment[];
}
