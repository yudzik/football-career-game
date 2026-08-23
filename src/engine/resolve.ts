import { clamp } from '../utils';
import type { Opponent, Player } from '../types';
import { AMBIENT_EVENTS } from './templates';
import type { MatchState, MomentOption } from './types';

export function rollBase(player: Player, opponent: Opponent, statVal: number, bonus: number): number {
  const formMod = (player.form - 60) / 8;
  const readinessMod = (player.readiness - 70) / 10;
  const fatiguePenalty = player.fatigue > 85 ? -6 : player.fatigue > 70 ? -4 : player.fatigue > 50 ? -2 : 0;
  return (statVal - opponent.strength) + formMod + readinessMod + fatiguePenalty + (bonus || 0) + (Math.random() * 26 - 13);
}

export function resolveAttack(option: MomentOption, player: Player, opponent: Opponent, bonus: number): string {
  const roll = rollBase(player, opponent, player.stats[option.stat], bonus);
  if (roll > 14) return 'goal';
  if (roll > -6) return 'chance';
  return 'lost';
}

export function resolveChainStage1(option: MomentOption, player: Player, opponent: Opponent): string {
  const roll = rollBase(player, opponent, player.stats[option.stat], 0);
  if (roll > 10) return 'clean';
  if (roll > -10) return 'contested';
  return 'lost';
}

export function resolveDefense(option: MomentOption, player: Player, opponent: Opponent): string {
  const roll = rollBase(player, opponent, player.stats[option.stat], 0);
  if (roll > 8) return 'great';
  if (roll > -8) return 'ok';
  return 'poor';
}

export function rollGoals(strength: number, oppStrength: number): number {
  const p = clamp(0.32 + (strength - oppStrength) / 90, 0.08, 0.8);
  let g = 0;
  for (let i = 0; i < 3; i++) if (Math.random() < p) g++;
  return g;
}

export function ambientLine(opponent: Opponent): string {
  const fn = AMBIENT_EVENTS[Math.floor(Math.random() * AMBIENT_EVENTS.length)];
  return fn(opponent);
}

export function getStageData(match: MatchState): { context: string[]; options: MomentOption[] } {
  const { currentTemplate, stage, stage1Tier, opponent } = match;
  if (currentTemplate.chain && stage === 2) {
    const key = stage1Tier === 'clean' ? 'clean' : 'contested';
    return { context: currentTemplate.stage2Context![key](opponent), options: currentTemplate.stage2Options! };
  }
  return { context: currentTemplate.context(opponent), options: currentTemplate.options };
}
