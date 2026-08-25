import { useId } from 'react';

/**
 * Original artwork for the main screen, drawn as SVG so it scales to any horizontal layout
 * and ships without extra binary assets.
 *
 * The footballer is deliberately a generic back view: no name on the shirt, no club marks,
 * no face — it stands for "a player", not for the career the user happens to have running.
 */

interface PlayerSilhouetteProps {
  /** 'full' = standing figure with the ball, 'bust' = shoulders-and-back crop for the cards. */
  variant?: 'full' | 'bust';
  className?: string;
}

export function PlayerSilhouette({ variant = 'full', className = '' }: PlayerSilhouetteProps) {
  const uid = useId().replace(/:/g, '');
  const shirt = `${uid}-shirt`;
  const skin = `${uid}-skin`;
  const shorts = `${uid}-shorts`;
  const glow = `${uid}-glow`;

  return (
    <svg
      viewBox={variant === 'full' ? '0 0 240 560' : '60 14 120 202'}
      className={className}
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id={shirt} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#22303f" />
          <stop offset="50%" stopColor="#121b25" />
          <stop offset="100%" stopColor="#070b10" />
        </linearGradient>
        {/* the figure is backlit by the floodlights, so skin stays nearly as dark as the kit
            and the shape reads by its rim light rather than by colour */}
        <linearGradient id={skin} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#221b18" />
          <stop offset="100%" stopColor="#0d0908" />
        </linearGradient>
        <linearGradient id={shorts} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#182330" />
          <stop offset="100%" stopColor="#060a0f" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#17c964" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#17c964" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floodlit haze behind the figure */}
      <ellipse cx="120" cy="310" rx="140" ry="235" fill={`url(#${glow})`} />
      <ellipse cx="120" cy="519" rx="86" ry="13" fill="#02060a" opacity="0.6" />

      {/* head and neck */}
      <path d="M120 22c15 0 25 12 25 30 0 17-11 30-25 30s-25-13-25-30c0-18 10-30 25-30z" fill={`url(#${skin})`} />
      <path d="M96 56c-1-22 10-34 24-34s25 12 24 34c-3-14-11-21-24-21s-21 7-24 21z" fill="#080c11" />
      <path d="M109 74h22v18h-22z" fill="#120d0c" />

      {/* shirt with short sleeves — blank back, no name plate */}
      <path
        d="M120 86c-14 0-27 4-38 12-8 6-13 19-16 38-2 11 0 20 5 24l22-5c-2 30-4 60-4 87 0 7 4 11 11 11h40c7 0 11-4 11-11 0-27-2-57-4-87l22 5c5-4 7-13 5-24-3-19-8-32-16-38-11-8-24-12-38-12z"
        fill={`url(#${shirt})`}
      />
      <text
        x="120"
        y="205"
        textAnchor="middle"
        className="font-display"
        fontSize="46"
        fontWeight="600"
        letterSpacing="2"
        fill="#e6f0fa"
        fillOpacity="0.16"
      >
        10
      </text>

      {/* arms */}
      <path d="M72 154L93 160c-3 25-6 45-8 58-2 20-3 34-4 46-1 9-4 14-9 14s-8-5-7-14c1-14 2-29 3-46 1-18 2-42 4-64z" fill={`url(#${skin})`} />
      <path d="M168 154l-21 6c3 25 6 45 8 58 2 20 3 34 4 46 1 9 4 14 9 14s8-5 7-14c-1-14-2-29-3-46-1-18-2-42-4-64z" fill={`url(#${skin})`} />

      {/* legs, socks, boots — drawn before the shorts so the hem overlaps the thighs */}
      <path d="M92 300h26l-3 100c-1 14-2 28-3 48h-10c-1-20-2-34-3-48z" fill={`url(#${skin})`} />
      <path d="M148 300h-26l3 100c1 14 2 28 3 48h10c1-20 2-34 3-48z" fill={`url(#${skin})`} />
      <path d="M101 444h15l-2 54h-11z" fill="#0c141c" />
      <path d="M139 444h-15l2 54h11z" fill="#0c141c" />
      <rect x="100" y="446" width="17" height="6" rx="2" fill="#17c964" opacity="0.5" />
      <rect x="123" y="446" width="17" height="6" rx="2" fill="#17c964" opacity="0.5" />
      <path d="M103 494h12l1 12c0 6-5 9-12 9h-9c-5 0-7-5-3-9z" fill="#060a0e" />
      <path d="M137 494h-12l-1 12c0 6 5 9 12 9h9c5 0 7-5 3-9z" fill="#060a0e" />

      {/* shorts */}
      <path
        d="M89 254h62c6 0 11 5 11 12l-3 62c0 8-5 12-12 12h-16c-4 0-6-2-7-6l-4-30-4 30c-1 4-3 6-7 6H93c-7 0-12-4-12-12l-3-62c0-7 5-12 11-12z"
        fill={`url(#${shorts})`}
      />

      {/* ball on the grass */}
      <ellipse cx="182" cy="514" rx="18" ry="5" fill="#02060a" opacity="0.55" />
      <circle cx="182" cy="500" r="17" fill="#e6edf4" />
      <path d="M182 490l7 5-3 8h-8l-3-8z" fill="#0b1218" />
      <path d="M168 494l3 6-4 6-3-6zM196 494l-3 6 4 6 3-6z" fill="#0b1218" opacity="0.7" />

      {/* stadium rim light along the contour */}
      <path d="M99 36c4-9 11-14 21-14s17 5 21 14" fill="none" stroke="#dceeff" strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
      <path d="M82 98c11-8 24-12 38-12s27 4 38 12" fill="none" stroke="#dceeff" strokeOpacity="0.38" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M68 148c2-18 6-32 12-40M172 148c-2-18-6-32-12-40" fill="none" stroke="#dceeff" strokeOpacity="0.26" strokeWidth="3" strokeLinecap="round" />
      <path d="M71 168c-2 32-4 66-6 96M169 168c2 32 4 66 6 96" fill="none" stroke="#dceeff" strokeOpacity="0.15" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M93 344c-1 32-2 66-3 98M147 344c1 32 2 66 3 98" fill="none" stroke="#dceeff" strokeOpacity="0.11" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** Locker-room corner: kit on a hanger, boots and a ball on the bench. */
export function LockerIllustration({ className = '' }: { className?: string }) {
  const uid = useId().replace(/:/g, '');
  const panel = `${uid}-panel`;
  const kit = `${uid}-kit`;

  return (
    <svg viewBox="0 0 120 120" className={className} role="presentation" aria-hidden="true">
      <defs>
        <linearGradient id={panel} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d2b39" />
          <stop offset="100%" stopColor="#0b1119" />
        </linearGradient>
        <linearGradient id={kit} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#3b5470" />
          <stop offset="100%" stopColor="#1b2937" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="118" height="118" rx="10" fill={`url(#${panel})`} />
      <path d="M30 8v104M90 8v104" stroke="#0a1017" strokeWidth="3" opacity="0.7" />

      {/* rail and hanger */}
      <path d="M14 24h92" stroke="#48596a" strokeWidth="3" strokeLinecap="round" />
      <path d="M60 24v6" stroke="#48596a" strokeWidth="2" />
      <path d="M43 40l17-11 17 11" fill="none" stroke="#5a6d80" strokeWidth="3" strokeLinejoin="round" />

      {/* hanging kit — blank back, green collar accent */}
      <path
        d="M60 38c-11 0-21 4-27 10-4 4-6 10-7 17-1 4 1 7 4 7l9-2-2 34c0 4 2 6 6 6h34c4 0 6-2 6-6l-2-34 9 2c3 0 5-3 4-7-1-7-3-13-7-17-6-6-16-10-27-10z"
        fill={`url(#${kit})`}
      />
      <path d="M39 45c6-5 13-7 21-7s15 2 21 7" fill="none" stroke="#17c964" strokeWidth="3" strokeLinecap="round" />
      <rect x="52" y="62" width="16" height="5" rx="2" fill="#17c964" opacity="0.4" />

      {/* bench, boots and ball */}
      <rect x="8" y="100" width="104" height="8" rx="4" fill="#2b3c4d" />
      <path d="M18 100v-9h13l4 9zM38 100v-9h13l4 9z" fill="#101922" />
      <circle cx="93" cy="91" r="9" fill="#e6edf4" />
      <path d="M93 84l4 3-1 5h-6l-1-5z" fill="#0b1218" />
    </svg>
  );
}

/** Neutral national mark: three colour bands, no emblem. */
export function FlagMark({ bands, className = '' }: { bands: [string, string, string]; className?: string }) {
  return (
    <span className={`inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[3px] ring-1 ring-white/20 ${className}`} aria-hidden="true">
      {bands.map((color, i) => (
        <span key={i} className="flex-1" style={{ background: color }} />
      ))}
    </span>
  );
}
