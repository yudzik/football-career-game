import type { Difficulty } from '../types';

export const DIFFICULTIES: Difficulty[] = [
  { key: 'easy', label: 'Лёгкий старт', desc: 'Более благоприятные стартовые условия.', statBias: 4, potentialBias: 10 },
  { key: 'realistic', label: 'Реалистичный', desc: 'Сбалансированный и наиболее реалистичный путь.', statBias: 0, potentialBias: 0 },
  { key: 'hard', label: 'Тяжёлый путь', desc: 'Более сложное начало карьеры и более медленное развитие.', statBias: -4, potentialBias: -10 },
];
