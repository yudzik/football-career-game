import type { Country } from '../types';

// Small starter set — kept as flat objects with a confederation stub so a full world list can replace this
// array later without touching any code that reads country.name / country.confederation.
export const COUNTRIES: Country[] = [
  { name: 'Аргентина', confederation: 'CONMEBOL' }, { name: 'Бразилия', confederation: 'CONMEBOL' },
  { name: 'Уругвай', confederation: 'CONMEBOL' }, { name: 'Испания', confederation: 'UEFA' },
  { name: 'Франция', confederation: 'UEFA' }, { name: 'Германия', confederation: 'UEFA' },
  { name: 'Англия', confederation: 'UEFA' }, { name: 'Италия', confederation: 'UEFA' },
  { name: 'Португалия', confederation: 'UEFA' }, { name: 'Нидерланды', confederation: 'UEFA' },
  { name: 'Хорватия', confederation: 'UEFA' }, { name: 'Бельгия', confederation: 'UEFA' },
  { name: 'Марокко', confederation: 'CAF' }, { name: 'Нигерия', confederation: 'CAF' },
  { name: 'Япония', confederation: 'AFC' }, { name: 'Южная Корея', confederation: 'AFC' },
  { name: 'США', confederation: 'CONCACAF' }, { name: 'Мексика', confederation: 'CONCACAF' },
];
