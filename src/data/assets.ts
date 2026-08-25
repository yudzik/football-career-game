// Files under public/ are served from the app's base path, which differs per target:
// '/' for the dev server and the Capacitor native shells, '/football-career-game/' for
// the GitHub Pages build. Vite does not rewrite literal string paths to public/ assets,
// so every reference goes through here to pick up BASE_URL (which always ends in '/').
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path}`;
}

export const GAME_LOGO = asset('images/logo.png');
export const STADIUM_BG = asset('images/stadium.jpg');
