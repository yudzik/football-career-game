import type { Player } from '../types';

export function squadStatus(player: Player): 'Основа' | 'Ротация' {
  const score = player.ovr * 0.5 + player.form * 0.25 + player.readiness * 0.25 - player.fatigue * 0.15;
  return score > 55 ? 'Основа' : 'Ротация';
}
