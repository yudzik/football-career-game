import { COUNTRIES } from './countries';
import type { Country } from '../types';

/**
 * Neutral three-band marks standing in for a national flag: colours only, no emblems and no
 * competition branding. They are a visual key for the country, nothing the engines read.
 */
const REGION_BANDS: Record<string, [string, string, string]> = {
  Англия: ['#eef2f7', '#d7263d', '#eef2f7'],
  Испания: ['#c8102e', '#f4c21b', '#c8102e'],
  Германия: ['#15181c', '#d7263d', '#f4c21b'],
  Италия: ['#128a4c', '#eef2f7', '#d7263d'],
  Франция: ['#1d4ea0', '#eef2f7', '#d7263d'],
};

export interface FeaturedRegion {
  country: Country;
  bands: [string, string, string];
}

const FEATURED_REGION_NAMES = ['Англия', 'Испания', 'Германия', 'Италия', 'Франция'];

/**
 * The five national directions the main screen advertises. They are countries the career
 * already knows about (data/countries.ts) — no leagues, no competitions, no new entities:
 * the card names the country, never a tournament.
 */
export const FEATURED_REGIONS: FeaturedRegion[] = FEATURED_REGION_NAMES
  .map((name) => COUNTRIES.find((c) => c.name === name))
  .filter((c): c is Country => Boolean(c))
  .map((country) => ({ country, bands: REGION_BANDS[country.name] }));
