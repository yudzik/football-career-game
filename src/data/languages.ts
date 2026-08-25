/**
 * Languages offered by the top-bar switcher on the main screen.
 *
 * `available` marks a language the game actually ships texts for. The interface is Russian
 * today, so the switcher lists the others as coming soon instead of silently doing nothing —
 * full localisation is its own task and is not part of the main screen.
 */
export interface Language {
  code: string;
  label: string;
  short: string;
  available: boolean;
}

export const LANGUAGES: Language[] = [
  { code: 'ru', label: 'Русский', short: 'RU', available: true },
  { code: 'en', label: 'English', short: 'EN', available: false },
];

export const DEFAULT_LANGUAGE = LANGUAGES[0];
