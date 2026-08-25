import { POSITIONS } from '../data/positions';
import { calcOvr, positionGroup } from '../engine/ovr';
import type { Player } from '../types';

/**
 * The rating shown on the main screen's career card. With a career running it is that
 * career's OVR; without one it is the average rating of the position archetypes, computed
 * through the same calcOvr the game uses — a read-only preview, never a hand-written number
 * and never written back into a career.
 */
export function showcaseOvr(player: Player | null): number {
  if (player) return player.ovr;
  const ratings = POSITIONS.map((p) => calcOvr(p.stats, positionGroup(p.code)));
  return Math.round(ratings.reduce((sum, r) => sum + r, 0) / ratings.length);
}
