import type { PositionGroup, Stats } from '../types';

// Maps a specific position code to its broad group, which is what the Match Engine actually filters on.
export function positionGroup(code: string): PositionGroup {
  if (code === 'ВР') return 'GK';
  if (['ЦЗ', 'ЛЗ', 'ПЗ'].includes(code)) return 'DEF';
  if (['ЦОП', 'ЦП', 'ЦАП'].includes(code)) return 'MID';
  if (['ЛВ', 'ПВ', 'ЛП', 'ПП'].includes(code)) return 'WING';
  return 'ATT';
}

// How much each of the 6 stats counts toward OVR, per position group — a CB's defending matters
// far more than his shooting, a striker's shooting matters far more than his defending, etc.
const OVR_WEIGHTS: Record<PositionGroup, Stats> = {
  GK: { pace: 0.5, shooting: 0.2, passing: 1, dribbling: 0.5, physical: 1.3, defending: 1.5 },
  DEF: { pace: 0.8, shooting: 0.3, passing: 0.9, dribbling: 0.6, physical: 1.3, defending: 1.5 },
  MID: { pace: 0.8, shooting: 0.8, passing: 1.4, dribbling: 1.2, physical: 0.9, defending: 0.7 },
  WING: { pace: 1.3, shooting: 1, passing: 0.8, dribbling: 1.4, physical: 0.6, defending: 0.4 },
  ATT: { pace: 1, shooting: 1.5, passing: 0.6, dribbling: 1.1, physical: 0.9, defending: 0.3 },
};

export function calcOvr(stats: Stats, group: PositionGroup): number {
  const weights = OVR_WEIGHTS[group] || { pace: 1, shooting: 1, passing: 1, dribbling: 1, physical: 1, defending: 1 };
  let sum = 0;
  let total = 0;
  (Object.keys(stats) as (keyof Stats)[]).forEach((k) => {
    sum += stats[k] * weights[k];
    total += weights[k];
  });
  return Math.round(sum / total);
}
