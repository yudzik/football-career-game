import { useEffect, useRef, useState } from 'react';
import {
  Check,
  ChevronDown,
  ChevronRight,
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

// Card shell. The cards share the column height: each one grows into the spare space instead
// of leaving a gap under the last card, but never shrinks below what its content needs.
const CARD = 'flex min-h-fit flex-1 flex-col justify-center rounded-2xl border border-white/10 bg-slate-950/72 p-3 backdrop-blur-sm 2xl:p-5';
const CARD_TITLE = 'font-display text-[1.05rem] font-semibold uppercase tracking-[0.13em] text-slate-50';

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
        style={{ background: 'radial-gradient(120% 85% at 50% 80%, rgba(0,176,80,0.22) 0%, rgba(2,6,10,0) 58%)' }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/95" />

      <div className="relative flex h-full">
        <LeftPanel handlers={handlers} />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar language={language} onLanguageChange={onLanguageChange} onOpenSettings={onOpenSettings} />
          <Stage />
        </div>

        <SideCards ovr={ovr} hasCareer={hasCareer} />
      </div>

      <PortraitNotice />
    </div>
  );
}

function LeftPanel({ handlers }: { handlers: Record<MainMenuActionId, (() => void) | null> }) {
  return (
    <aside className="flex w-[clamp(19rem,24.5vw,26rem)] shrink-0 flex-col border-r border-white/5 bg-slate-950/85 px-6 py-6 backdrop-blur-sm">
      <img src={GAME_LOGO} alt="Football Career Game" className="w-full max-w-[17rem] shrink-0" />

      <nav className="flex flex-1 flex-col justify-center gap-2.5 py-6">
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
                className="flex items-center gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] px-3.5 py-3.5 opacity-45"
              >
                <Icon size={20} className="shrink-0 text-slate-400" />
                <span className="truncate font-display text-[1.02rem] font-medium uppercase tracking-wide text-slate-300">{item.label}</span>
                <Lock size={14} className="ml-auto hidden shrink-0 text-slate-500 2xl:block" />
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
                  ? `flex items-center gap-2.5 rounded-xl border border-pitch-400/60 bg-gradient-to-r from-pitch-500 to-pitch-600 px-3.5 py-4 text-left shadow-[0_14px_36px_-14px_rgba(0,176,80,0.95)] transition-colors hover:from-pitch-400 hover:to-pitch-500 ${FOCUS_RING}`
                  : `flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.04] px-3.5 py-3.5 text-left transition-colors hover:border-pitch-500/50 hover:bg-white/[0.08] ${FOCUS_RING}`
              }
            >
              <Icon size={primary ? 24 : 20} className={primary ? 'shrink-0 text-slate-950' : 'shrink-0 text-pitch-400'} />
              <span
                className={
                  primary
                    ? 'truncate font-display text-[1.18rem] font-semibold uppercase tracking-wide text-slate-950'
                    : 'truncate font-display text-[1.02rem] font-medium uppercase tracking-wide text-slate-200'
                }
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="shrink-0">
        <p className="font-data text-[0.72rem] uppercase tracking-[0.2em] text-slate-500">{SUBSCRIBE_TITLE}</p>
        <div className="mt-3 flex gap-2.5">
          {SOCIAL_LINKS.map((link) => {
            const Icon = SOCIAL_ICONS[link.id] ?? Globe;
            const shell = 'flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.05] text-slate-300';
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
                <Icon size={19} />
              </a>
            ) : (
              <span key={link.id} title={link.label} aria-label={link.label} role="img" className={shell}>
                <Icon size={19} />
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
    <header className="flex shrink-0 items-center justify-end gap-2.5 px-5 pt-4 pb-1">
      <button
        type="button"
        onClick={onOpenSettings}
        disabled={!onOpenSettings}
        title={onOpenSettings ? 'Настройки' : 'Настройки · скоро'}
        aria-label="Настройки"
        className={`flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-slate-950/70 text-slate-300 backdrop-blur-sm transition-colors enabled:hover:border-pitch-500/50 enabled:hover:text-pitch-400 disabled:opacity-60 ${FOCUS_RING}`}
      >
        <Settings size={20} />
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
        className={`flex h-11 items-center gap-2.5 rounded-xl border border-white/10 bg-slate-950/70 px-4 text-slate-100 backdrop-blur-sm transition-colors hover:border-pitch-500/50 ${FOCUS_RING}`}
      >
        <Globe size={18} className="text-pitch-400" />
        <span className="font-body text-[0.95rem] font-medium">{language.label}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Язык интерфейса"
          className="absolute right-0 z-20 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-slate-950/95 py-1.5 shadow-2xl backdrop-blur"
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
                  className={`flex w-full items-center gap-2.5 px-4 py-2 text-left font-body text-[0.92rem] transition-colors enabled:hover:bg-white/[0.07] disabled:opacity-40 ${selected ? 'text-pitch-400' : 'text-slate-300'}`}
                >
                  <span className="font-data text-[0.7rem] tracking-wider text-slate-500">{item.short}</span>
                  <span className="truncate">{item.label}</span>
                  {selected && <Check size={15} className="ml-auto shrink-0" />}
                  {!item.available && <span className="ml-auto shrink-0 font-data text-[0.65rem] uppercase text-slate-500">скоро</span>}
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
    <section className="relative flex min-h-0 min-w-0 flex-1 flex-col items-center justify-end px-4 pb-5">
      <div className="flex min-h-0 w-full flex-1 items-end justify-center">
        <PlayerSilhouette className="h-full max-h-full w-full drop-shadow-[0_28px_60px_rgba(0,0,0,0.7)]" />
      </div>
      <p className="mt-4 shrink-0 text-center font-display text-[clamp(0.95rem,1.45vw,1.55rem)] font-semibold uppercase tracking-[0.14em] text-slate-100">
        {MAIN_MENU_SLOGAN.lead} <span className="text-pitch-400">{MAIN_MENU_SLOGAN.accent}</span>
      </p>
    </section>
  );
}

function SideCards({ ovr, hasCareer }: { ovr: number; hasCareer: boolean }) {
  return (
    <aside className="flex w-[clamp(22rem,29vw,29rem)] shrink-0 flex-col gap-2 overflow-y-auto px-4 py-2.5 2xl:gap-4 2xl:px-5 2xl:py-5">
      <article className={CARD}>
        <h2 className={CARD_TITLE}>{CAREER_CARD.title}</h2>
        <div className="mt-2.5 flex items-center gap-4">
          <div className="flex h-16 w-[3.4rem] shrink-0 items-end justify-center overflow-hidden rounded-xl border border-white/8 bg-gradient-to-b from-slate-800/70 to-slate-950 2xl:h-24 2xl:w-20">
            <PlayerSilhouette variant="bust" className="h-full w-full" />
          </div>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-[2.6rem] font-bold leading-none text-pitch-400 2xl:text-[3.2rem]">{ovr}</span>
              <span className="font-data text-[0.72rem] uppercase tracking-[0.2em] text-slate-500">ovr</span>
            </div>
            <p className="mt-1 font-data text-[0.72rem] uppercase tracking-wider text-slate-400">
              {hasCareer ? CAREER_CARD.liveCaption : CAREER_CARD.previewCaption}
            </p>
          </div>
        </div>
        <p className="mt-2.5 text-[0.88rem] leading-snug text-slate-300">{CAREER_CARD.desc}</p>
      </article>

      <article className={CARD}>
        <h2 className={CARD_TITLE}>{WORLD_CARD.title}</h2>
        <div className="mt-2.5 grid grid-cols-5 gap-1">
          {FEATURED_REGIONS.map((region) => (
            <span key={region.country.name} className="flex flex-col items-center gap-1">
              <FlagMark bands={region.bands} className="h-7 w-full" />
              <span className="w-full truncate text-center text-[0.72rem] font-medium tracking-tight text-slate-300">{region.country.name}</span>
            </span>
          ))}
        </div>
        <p className="mt-2.5 flex items-center gap-2 font-display text-[0.92rem] font-semibold uppercase tracking-[0.06em] text-pitch-400">
          <Globe size={16} className="shrink-0" /> {WORLD_CARD.caption}
        </p>
      </article>

      <article className={CARD}>
        <h2 className={CARD_TITLE}>{CHOICE_CARD.title}</h2>
        <div className="mt-2.5 flex items-center gap-4">
          <LockerIllustration className="h-[4.5rem] w-[4.5rem] shrink-0 rounded-xl 2xl:h-24 2xl:w-24" />
          <p className="min-w-0 text-[0.88rem] leading-snug text-slate-300">{CHOICE_CARD.desc}</p>
        </div>
        <p className="mt-2.5 text-[0.8rem] font-medium text-pitch-300">{CHOICE_CARD.tags.join(' · ')}</p>
      </article>

      <NewsCard />
    </aside>
  );
}

/**
 * Decorative card only — see NEWS_CARD in data/mainMenu.ts. «Смотреть все» is a visual
 * element, not a link: there is no News System and no news screen to navigate to yet.
 */
function NewsCard() {
  return (
    <article className={CARD}>
      <div className="flex items-center justify-between gap-3">
        <h2 className={CARD_TITLE}>{NEWS_CARD.title}</h2>
        <span aria-hidden className="flex items-center gap-1 font-data text-[0.7rem] uppercase tracking-wider text-slate-500">
          {NEWS_CARD.linkLabel} <ChevronRight size={14} />
        </span>
      </div>
      <ul className="mt-2.5 space-y-2.5">
        {NEWS_CARD.items.map((item, index) => (
          <li key={item.id} className={index === 0 ? 'flex gap-3' : 'hidden gap-3 2xl:flex'}>
            <span aria-hidden className="h-11 w-14 shrink-0 rounded-lg bg-gradient-to-br from-pitch-700/55 via-slate-800 to-slate-950 2xl:h-12 2xl:w-16" />
            <div className="min-w-0">
              <p className="font-data text-[0.68rem] uppercase tracking-wider text-pitch-400">{item.tag}</p>
              <p className="text-[0.85rem] leading-snug text-slate-300">{item.text}</p>
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
        <img src={GAME_LOGO} alt="Football Career Game" className="mx-auto w-52" />
        <p className="mt-6 font-display text-xl font-semibold uppercase tracking-wide text-slate-100">Поверни устройство</p>
        <p className="mt-2 text-sm text-slate-400">Игра рассчитана на горизонтальный экран.</p>
      </div>
    </div>
  );
}
