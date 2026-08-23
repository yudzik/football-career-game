import type { Profile } from '../types';

// Profile is a separate axis from position (Master Context step 5, not merged into step 4).
// It layers a small stat bias on top of the position's archetype and biases which stat training
// favors ("стиль развития") — it never shows a number and never sets OVR directly.
export const PROFILES: Profile[] = [
  { key: 'playmaker', name: 'Плеймейкер', desc: 'Мастер передач и созидания', statBias: { passing: 6, dribbling: 3 }, favoredStats: ['passing', 'dribbling'] },
  { key: 'dribbler', name: 'Дриблёр', desc: 'Любит обыгрывать соперников', statBias: { dribbling: 6, pace: 3 }, favoredStats: ['dribbling', 'pace'] },
  { key: 'workhorse', name: 'Трудяга', desc: 'Выносливость и борьба', statBias: { physical: 6, defending: 3 }, favoredStats: ['physical', 'defending'] },
  { key: 'visionary', name: 'Визионер', desc: 'Видит поле на шаг вперёд', statBias: { passing: 5, defending: 3 }, favoredStats: ['passing', 'defending'] },
  { key: 'poacher', name: 'Бомбардир', desc: 'Сосредоточен на голах и завершении атак', statBias: { shooting: 7, pace: 2 }, favoredStats: ['shooting', 'pace'] },
  { key: 'allrounder', name: 'Универсал', desc: 'Сбалансированная игра без явных слабостей', statBias: { pace: 2, shooting: 2, passing: 2, dribbling: 2, physical: 2, defending: 2 }, favoredStats: ['pace', 'shooting', 'passing', 'dribbling', 'physical', 'defending'] },
];
