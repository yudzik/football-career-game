import { clamp } from '../utils';
import { calcOvr, positionGroup } from '../engine/ovr';
import type { Country, Difficulty, Player, Position, Profile, Stats } from '../types';

export function generatePlayer(
  name: string,
  surname: string,
  age: number,
  country: Country,
  position: Position,
  profile: Profile,
  difficulty: Difficulty,
): Player {
  const stats = {} as Stats;
  const progress = {} as Stats;
  (Object.keys(position.stats) as (keyof Stats)[]).forEach((k) => {
    const base = position.stats[k] + difficulty.statBias + (profile.statBias[k] || 0);
    stats[k] = clamp(base + Math.floor(Math.random() * 9) - 4, 20, 95);
    progress[k] = Math.floor(Math.random() * 25);
  });
  const potential = clamp(55 + difficulty.potentialBias + Math.floor(Math.random() * 31) - 15, 15, 99);
  const group = positionGroup(position.code);
  return {
    name, surname, age, country: country.name, position: position.code, positionLabel: position.label, positionGroup: group,
    profileKey: profile.key, profileName: profile.name,
    stats, progress, potential,
    ovr: calcOvr(stats, group),
    form: 60, readiness: 85, fatigue: 15,
    careerStats: { goals: 0, assists: 0, apps: 0, ratings: [] },
  };
}
