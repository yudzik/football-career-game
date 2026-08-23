import type { Stats, StatKey } from '../types';

// Gradual growth: progress accumulates 0-100 per stat; only when it overflows 100 does the
// underlying stat itself move by 1 point. This is what keeps OVR from jumping.
export function addProgress(stats: Stats, progress: Stats, key: StatKey, amount: number): { stats: Stats; progress: Stats } {
  let p = progress[key] + amount;
  let s = stats[key];
  while (p >= 100) {
    if (s >= 99) { p = 99; break; }
    p -= 100;
    s += 1;
  }
  return { stats: { ...stats, [key]: s }, progress: { ...progress, [key]: Math.max(0, Math.round(p)) } };
}
