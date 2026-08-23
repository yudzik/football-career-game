import type { Position } from '../types';

// Position defines the base stat archetype for a role on the pitch. NO ovr/number is ever shown at creation time.
export const POSITIONS: Position[] = [
  { code: 'ВР', label: 'Вратарь', stats: { pace: 55, shooting: 25, passing: 55, dribbling: 40, physical: 65, defending: 75 } },
  { code: 'ЦЗ', label: 'Центральный защитник', stats: { pace: 60, shooting: 35, passing: 58, dribbling: 45, physical: 80, defending: 81 } },
  { code: 'ЛЗ', label: 'Левый защитник', stats: { pace: 72, shooting: 40, passing: 62, dribbling: 58, physical: 70, defending: 70 } },
  { code: 'ПЗ', label: 'Правый защитник', stats: { pace: 72, shooting: 40, passing: 62, dribbling: 58, physical: 70, defending: 70 } },
  { code: 'ЦОП', label: 'Опорный полузащитник', stats: { pace: 62, shooting: 50, passing: 72, dribbling: 62, physical: 74, defending: 72 } },
  { code: 'ЦП', label: 'Центральный полузащитник', stats: { pace: 66, shooting: 58, passing: 76, dribbling: 68, physical: 68, defending: 58 } },
  { code: 'ЦАП', label: 'Атакующий полузащитник', stats: { pace: 68, shooting: 68, passing: 79, dribbling: 78, physical: 55, defending: 35 } },
  { code: 'ЛП', label: 'Левый полузащитник', stats: { pace: 76, shooting: 60, passing: 68, dribbling: 74, physical: 58, defending: 42 } },
  { code: 'ПП', label: 'Правый полузащитник', stats: { pace: 76, shooting: 60, passing: 68, dribbling: 74, physical: 58, defending: 42 } },
  { code: 'ЛВ', label: 'Левый вингер', stats: { pace: 81, shooting: 66, passing: 64, dribbling: 79, physical: 56, defending: 28 } },
  { code: 'ПВ', label: 'Правый вингер', stats: { pace: 81, shooting: 66, passing: 64, dribbling: 79, physical: 56, defending: 28 } },
  { code: 'НАП', label: 'Нападающий', stats: { pace: 74, shooting: 81, passing: 56, dribbling: 68, physical: 71, defending: 24 } },
];
