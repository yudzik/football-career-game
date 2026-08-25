/**
 * Text content of the main screen, kept out of the components the same way POSITIONS or
 * PROFILES are kept out of the career screens. Nothing here is game state: no rules, no
 * numbers any engine reads — only labels the screen renders.
 */

export type MainMenuActionId = 'newCareer' | 'continueCareer' | 'loadCareer' | 'achievements' | 'exit';

export interface MainMenuItem {
  id: MainMenuActionId;
  label: string;
  /** Shown next to the label while the action is not available yet. */
  lockedHint?: string;
}

/** Settings live in the top bar, not in this list. */
export const MAIN_MENU_ITEMS: MainMenuItem[] = [
  { id: 'newCareer', label: 'Новая карьера' },
  { id: 'continueCareer', label: 'Продолжить карьеру', lockedHint: 'нет карьеры' },
  { id: 'loadCareer', label: 'Загрузить карьеру', lockedHint: 'скоро' },
  { id: 'achievements', label: 'Достижения', lockedHint: 'скоро' },
  { id: 'exit', label: 'Выход' },
];

export const MAIN_MENU_SLOGAN = {
  lead: 'ТВОЯ ИСТОРИЯ. ТВОЙ ПУТЬ.',
  accent: 'ТВОЯ ЛЕГЕНДА.',
};

export interface SocialLink {
  id: string;
  label: string;
  /** Left null until the real account exists — the icon then stays a non-clickable mark. */
  url: string | null;
}

export const SUBSCRIBE_TITLE = 'Подпишись на нас';

export const SOCIAL_LINKS: SocialLink[] = [
  { id: 'telegram', label: 'Telegram', url: null },
  { id: 'youtube', label: 'YouTube', url: null },
  { id: 'instagram', label: 'Instagram', url: null },
  { id: 'discord', label: 'Discord', url: null },
];

export const CAREER_CARD = {
  title: 'Карьера игрока',
  desc: 'Тренировки, форма и матчи двигают характеристики — рейтинг растёт вместе с игроком.',
  liveCaption: 'Текущий OVR',
  previewCaption: 'Старт карьеры',
};

export const WORLD_CARD = {
  title: 'Реалистичный мир',
  desc: 'Пять национальных направлений — путь начинается в одном из них.',
  caption: '5 национальных чемпионатов',
};

export const CHOICE_CARD = {
  title: 'Твой выбор',
  desc: 'Каждый день карьеры решаешь ты: как готовиться, где играть и что подписывать.',
  tags: ['Тренировки', 'Матчи', 'Трансферы', 'Контракты'],
};

/**
 * Decorative only. There is no News System, no news database and no navigation behind this —
 * the card and its «Смотреть все» label are static UI until an Event / News Engine exists.
 */
export const NEWS_CARD = {
  title: 'Новости',
  linkLabel: 'Смотреть все',
  items: [
    { id: 'debut', tag: 'Карьера', text: 'Начни путь и сыграй свой первый матч за клуб.' },
    { id: 'growth', tag: 'Развитие', text: 'Держи форму и готовность — от них зависит твой матч.' },
  ],
};
