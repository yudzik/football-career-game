import type { StatKey } from '../types';
import { asset } from './assets';

export const STAT_LABELS: Record<StatKey, string> = {
  pace: 'СКО',
  shooting: 'УДА',
  passing: 'ПАС',
  dribbling: 'ДРИ',
  physical: 'ФИЗ',
  defending: 'ЗАЩ',
};

export const CLUB_NAME = 'Vorantis';
export const CLUB_CREST = asset('images/crest-vorantis.png');
export const CLUB_BASE_STRENGTH = 73;
