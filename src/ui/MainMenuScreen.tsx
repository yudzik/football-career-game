import { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Check,
  FolderOpen,
  Gamepad2,
  Globe,
  Instagram,
  Lock,
  LogOut,
  Send,
  Settings,
  Trophy,
  Upload,
  Volleyball,
  Youtube,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { GAME_LOGO, STADIUM_BG } from '../data/assets';
import { LANGUAGES } from '../data/languages';
import type { Language } from '../data/languages';
import {
  CAREER_CARD,
  CHOICE_CARD,
  MAIN_MENU_ITEMS,
  MAIN_MENU_SLOGAN,
  NEWS_CARD,
  SOCIAL_LINKS,
  SUBSCRIBE_TITLE,
  WORLD_CARD,
} from '../data/mainMenu';
import type { MainMenuActionId } from '../data/mainMenu';
import { FEATURED_REGIONS } from '../data/regions';
import { FlagMark, LockerIllustration, PlayerSilhouette } from './MainMenuArt';

const MENU_ICONS: Record<MainMenuActionId, LucideIcon> = {
  newCareer: Volleyball,
  continueCareer: FolderOpen,
  loadCareer: Upload,
  achievements: Trophy,
  exit: LogOut,
};

const SOCIAL_ICONS: Record<string, LucideIcon> = {
  telegram: Send,
  youtube: Youtube,
  instagram: Instagram,
  discord: Gamepad2,
};

const FOCUS_RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-pitch-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950';

interface MainMenuScreenProps {
  /** OVR for the career card — the running career's rating, or the archetype preview. */
  ovr: number;
  /** True once a career exists in this session, which is what «Продолжить карьеру» needs. */
  hasCareer: boolean;
  language: Language;
  onLanguageChange: (language: Language) => void;
  onNewCareer: () => void;
  onContinueCareer: () => void;
  onExit: () => void;
  /** Wired once a settings screen exists; until then the button renders disabled. */
  onOpenSettings?: () => void;
}

export function MainMenuScreen({
  ovr,
  hasCareer,
  language,
  onLanguageChange,
  onNewCareer,
  onContinueCareer,
  onExit,
  onOpenSettings,
}: MainMenuScreenProps) {
  // Only the actions whose systems already exist are live. Saves and achievements are later
  // stages of the project, so their buttons stay visible but locked instead of pretending.
  const handlers: Record<MainMenuActionId, (() => void) | null> = {
    newCareer: onNewCareer,
    continueCareer: hasCareer ? onContinueCareer : null,
    loadCareer: null,
    achievements: null,
    exit: onExit,
  };

  return (
    <div className="relative h-dvh w-full overflow-hidden bg-slate-950 font-body text-slate-100">
      <div aria-hidden className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${STADIUM_BG})` }} />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: 'radial-gradient(120% 85% at 50% 78%, rgba(0,176,80,0.20) 0%, rgba(2,6,10,0) 55%)' }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-slate-950/85 via-slate-950/45 to-slate-950/95" />

      <div className="relative flex h-full">
        <LeftPanel handlers={handlers} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar language={language} onLanguageChange={onLanguageChange} onOpenSettings={onOpenSettings} />

          <div className="flex min-h-0 flex-1">
            <Stage />
            <SideCards ovr={ovr} hasCareer={hasCareer} />
          </div>
        </div>
      </div>

      <PortraitNotice />
    </div>
  );
}

function LeftPanel({ handlers }: { handlers: Record<MainMenuActionId, (() => void) | null> }) {
  return (
    <aside className="flex w-[clamp(13.5rem,20vw,17.5rem)] shrink-0 flex-col border-r border-white/5 bg-slate-950/80 px-4 py-4 backdrop-blur-sm">
      <img src={GAME_LOGO} alt="Football Career Game" className="w-[min(100%,11rem)] shrink-0" />

      <nav className="flex flex-1 flex-col gap-1.5 pt-[7%] pb-4">
        {MAIN_MENU_ITEMS.map((item, index) => {
          const Icon = MENU_ICONS[item.id];
          const onClick = handlers[item.id];
          const primary = index === 0;

          if (!onClick) {
            return (
              <div
                key={item.id}
                aria-disabled="true"
                title={item.lockedHint ? `${item.label} · ${item.lockedHint}` : item.label}
                className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2.5 opacity-45"
              >
                <Icon size={16} className="shrink-0 text-slate-400" />
                <span className="truncate font-display text-[0.76rem] font-medium uppercase tracking-wide text-slate-300">{item.label}</span>
                <Lock size={12} className="ml-auto shrink-0 text-slate-500" />
              </div>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={onClick}
              className={
                primary
                  ? `flex items-center gap-2 rounded-lg border border-pitch-400/60 bg-gradient-to-r from-pitch-500 to-pitch-600 px-3 py-2.5 text-left shadow-[0_10px_28px_-12px_rgba(0,176,80,0.9)] transition-colors hover:from-pitch-400 hover:to-pitch-500 ${FOCUS_RING}`
                  : `flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 text-left transition-colors hover:border-pitch-500/40 hover:bg-white/[0.07] ${FOCUS_RING}`
              }
            >
              <Icon size={16} className={primary ? 'shrink-0 text-slate-950' : 'shrink-0 text-pitch-400'} />
              <span
                className={
                  primary
                    ? 'truncate font-display text-[0.76rem] font-semibold uppercase tracking-wide text-slate-950'
                    : 'truncate font-display text-[0.76rem] font-medium uppercase tracking-wide text-slate-200'
                }
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="shrink-0">
        <p className="font-data text-[0.6rem] uppercase tracking-[0.18em] text-slate-500">{SUBSCRIBE_TITLE}</p>
        <div className="mt-2 flex gap-2">
          {SOCIAL_LINKS.map((link) => {
            const Icon = SOCIAL_ICONS[link.id] ?? Globe;
            const shell = 'flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300';
            return link.url ? (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                title={link.label}
                aria-label={link.label}
                className={`${shell} transition-colors hover:border-pitch-500/50 hover:text-pitch-400 ${FOCUS_RING}`}
              >
                <Icon size={15} />
              </a>
            ) : (
              <span key={link.id} title={link.label} aria-label={link.label} role="img" className={shell}>
                <Icon size={15} />
              </span>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

interface TopBarProps {
  language: Language;
  onLanguageChange: (language: Language) => void;
  onOpenSettings?: () => void;
}

function TopBar({ language, onLanguageChange, onOpenSettings }: TopBarProps) {
  return (
    <header className="flex shrink-0 items-center justify-end gap-2 px-4 pt-3 pb-1">
      <button
        type="button"
        onClick={onOpenSettings}
        disabled={!onOpenSettings}
        title={onOpenSettings ? 'Настройки' : 'Настройки · скоро'}
        aria-label="Настройки"
        className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-slate-950/70 text-slate-300 backdrop-blur-sm transition-colors enabled:hover:border-pitch-500/50 enabled:hover:text-pitch-400 disabled:opacity-60 ${FOCUS_RING}`}
      >
        <Settings size={17} />
      </button>
      <LanguageSwitch language={language} onLanguageChange={onLanguageChange} />
    </header>
  );
}

function LanguageSwitch({ language, onLanguageChange }: { language: Language; onLanguageChange: (language: Language) => void }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-slate-950/70 px-3 text-slate-200 backdrop-blur-sm transition-colors hover:border-pitch-500/50 ${FOCUS_RING}`}
      >
        <Globe size={15} className="text-pitch-400" />
        <span className="font-body text-xs font-medium">{language.label}</span>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Язык интерфейса"
          className="absolute right-0 z-20 mt-1.5 w-40 overflow-hidden rounded-lg border border-white/10 bg-slate-950/95 py-1 shadow-xl backdrop-blur"
        >
          {LANGUAGES.map((item) => {
            const selected = item.code === language.code;
            return (
              <li key={item.code}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  disabled={!item.available}
                  onClick={() => {
                    onLanguageChange(item);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-1.5 text-left font-body text-xs transition-colors enabled:hover:bg-white/[0.06] disabled:opacity-40 ${selected ? 'text-pitch-400' : 'text-slate-300'}`}
                >
                  <span className="font-data text-[0.6rem] tracking-wider text-slate-500">{item.short}</span>
                  <span className="truncate">{item.label}</span>
                  {selected && <Check size={13} className="ml-auto shrink-0" />}
                  {!item.available && <span className="ml-auto shrink-0 font-data text-[0.55rem] uppercase text-slate-500">скоро</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function Stage() {
  return (
    <section className="relative flex min-w-0 flex-1 flex-col items-center justify-end px-4 pb-4">
      <PlayerSilhouette className="min-h-0 w-auto max-h-[42rem] flex-1 drop-shadow-[0_20px_45px_rgba(0,0,0,0.65)]" />
      <p className="mt-3 shrink-0 text-center font-display text-[clamp(0.7rem,1.35vw,1rem)] font-semibold uppercase tracking-[0.2em] text-slate-200">
        {MAIN_MENU_SLOGAN.lead} <span className="text-pitch-400">{MAIN_MENU_SLOGAN.accent}</span>
      </p>
    </section>
  );
}

function SideCards({ ovr, hasCareer }: { ovr: number; hasCareer: boolean }) {
  return (
    <aside className="flex w-[clamp(15rem,24vw,20rem)] shrink-0 flex-col justify-center gap-2.5 overflow-y-auto px-4 py-3">
      <Card title={CAREER_CARD.title}>
        <div className="flex items-center gap-3">
          <div className="flex h-20 w-16 shrink-0 items-end justify-center overflow-hidden rounded-lg border border-white/5 bg-gradient-to-b from-slate-800/60 to-slate-950">
            <PlayerSilhouette variant="bust" className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-3xl font-bold leading-none text-pitch-400">{ovr}</span>
              <span className="font-data text-[0.55rem] uppercase tracking-widest text-slate-500">ovr</span>
            </div>
            <p className="font-data text-[0.55rem] uppercase tracking-wider text-slate-500">
              {hasCareer ? CAREER_CARD.liveCaption : CAREER_CARD.previewCaption}
            </p>
          </div>
        </div>
        <p className="mt-2 text-[0.68rem] leading-snug text-slate-400">{CAREER_CARD.desc}</p>
      </Card>

      <Card title={WORLD_CARD.title}>
        <div className="flex flex-wrap gap-1">
          {FEATURED_REGIONS.map((region) => (
            <span
              key={region.country.name}
              className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/[0.03] px-1.5 py-1"
            >
              <FlagMark bands={region.bands} />
              <span className="text-[0.62rem] font-medium text-slate-300">{region.country.name}</span>
            </span>
          ))}
        </div>
        <p className="mt-2 flex items-center gap-1.5 font-data text-[0.6rem] uppercase tracking-wider text-pitch-400">
          <Globe size={12} /> {WORLD_CARD.caption}
        </p>
      </Card>

      <Card title={CHOICE_CARD.title}>
        <div className="flex items-center gap-3">
          <LockerIllustration className="h-16 w-16 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <p className="text-[0.68rem] leading-snug text-slate-400">{CHOICE_CARD.desc}</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {CHOICE_CARD.tags.map((tag) => (
                <span key={tag} className="rounded border border-pitch-500/25 bg-pitch-500/10 px-1.5 py-0.5 font-data text-[0.55rem] uppercase tracking-wider text-pitch-300">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <NewsCard />
    </aside>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="rounded-xl border border-white/8 bg-slate-950/70 p-3 backdrop-blur-sm">
      <h2 className="mb-2 font-display text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-100">{title}</h2>
      {children}
    </article>
  );
}

/**
 * Decorative card only — see NEWS_CARD in data/mainMenu.ts. «Смотреть все» is a visual
 * element, not a link: there is no News System and no news screen to navigate to yet.
 */
function NewsCard() {
  return (
    <article className="rounded-xl border border-white/8 bg-slate-950/70 p-3 backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="font-display text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-slate-100">{NEWS_CARD.title}</h2>
        <span aria-hidden className="flex items-center gap-0.5 font-data text-[0.55rem] uppercase tracking-wider text-slate-500">
          {NEWS_CARD.linkLabel} <ChevronRight size={11} />
        </span>
      </div>
      <ul className="space-y-1.5">
        {NEWS_CARD.items.map((item) => (
          <li key={item.id} className="flex gap-2">
            <span aria-hidden className="mt-0.5 h-8 w-10 shrink-0 rounded bg-gradient-to-br from-pitch-700/50 via-slate-800 to-slate-950" />
            <div className="min-w-0">
              <p className="font-data text-[0.55rem] uppercase tracking-wider text-pitch-400">{item.tag}</p>
              <p className="text-[0.65rem] leading-snug text-slate-400">{item.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}

/** The screen is built for horizontal screens; a narrow portrait window gets a hint instead
 *  of a squashed layout. There is no separate vertical version of the main screen. */
function PortraitNotice() {
  return (
    <div className="absolute inset-0 z-30 hidden items-center justify-center bg-slate-950 px-8 text-center portrait:max-lg:flex">
      <div>
        <img src={GAME_LOGO} alt="Football Career Game" className="mx-auto w-40" />
        <p className="mt-5 font-display text-base font-semibold uppercase tracking-wide text-slate-100">Поверни устройство</p>
        <p className="mt-1.5 text-xs text-slate-400">Игра рассчитана на горизонтальный экран.</p>
      </div>
    </div>
  );
}
