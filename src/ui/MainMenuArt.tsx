import { useId } from 'react';

/**
 * Original artwork for the main screen, drawn as SVG so it scales to any horizontal layout
 * and ships without extra binary assets.
 *
 * The footballer is deliberately a generic back view: no name on the shirt, no club marks,
 * no face — it stands for "a player", not for the career the user happens to have running.
 * Proportions follow a ~7.5-head athletic figure on a 320x760 canvas, centred on x=160.
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
  const sock = `${uid}-sock`;
  const glow = `${uid}-glow`;

  return (
    <svg
      viewBox={variant === 'full' ? '0 0 320 760' : '64 30 192 300'}
      className={className}
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMax meet"
    >
      <defs>
        <linearGradient id={shirt} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#2a3a4c" />
          <stop offset="45%" stopColor="#16202b" />
          <stop offset="100%" stopColor="#080d13" />
        </linearGradient>
        {/* the figure is backlit by the floodlights, so skin stays nearly as dark as the kit
            and the shape reads by its rim light rather than by colour */}
        <linearGradient id={skin} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#1d1917" />
          <stop offset="100%" stopColor="#0b0908" />
        </linearGradient>
        <linearGradient id={shorts} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#1d2b3a" />
          <stop offset="100%" stopColor="#070c11" />
        </linearGradient>
        <linearGradient id={sock} x1="0.15" y1="0" x2="0.85" y2="1">
          <stop offset="0%" stopColor="#16212c" />
          <stop offset="100%" stopColor="#070b0f" />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#17c964" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#17c964" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* floodlit haze and the shadow the figure casts on the grass */}
      <ellipse cx="160" cy="400" rx="200" ry="340" fill={`url(#${glow})`} />
      <ellipse cx="160" cy="728" rx="126" ry="18" fill="#02060a" opacity="0.6" />

      {/* head, hair and neck */}
      <path d="M160 40c-20 0-36 18-36 46 0 20 6 36 16 44 6 5 13 8 20 8s14-3 20-8c10-8 16-24 16-44 0-28-16-46-36-46z" fill={`url(#${skin})`} />
      <path d="M160 40c20 0 36 18 36 46 0 10-2 19-5 27-2-21-7-34-16-40-5-4-10-6-15-6s-10 2-15 6c-9 6-14 19-16 40-3-8-5-17-5-27 0-28 16-46 36-46z" fill="#070b10" />
      <path d="M138 118h44v34c0 8-10 12-22 12s-22-4-22-12z" fill="#0e0b0a" />

      {/* legs, drawn before the shorts so the hem overlaps the thighs */}
      <path d="M108 430c-4 50-2 100 6 148 6 42 4 82 8 128h28c2-46 2-86 4-128 2-48 2-98 2-148z" fill={`url(#${skin})`} />
      <path d="M212 430c4 50 2 100-6 148-6 42-4 82-8 128h-28c-2-46-2-86-4-128-2-48-2-98-2-148z" fill={`url(#${skin})`} />

      {/* socks with a colour band at the turnover, then boots */}
      <path d="M114 578c6 42 4 82 8 128h28c2-46 2-86 4-128z" fill={`url(#${sock})`} />
      <path d="M206 578c-6 42-4 82-8 128h-28c-2-46-2-86-4-128z" fill={`url(#${sock})`} />
      <path d="M114 580h41v22h-39z" fill="#17c964" opacity="0.5" />
      <path d="M206 580h-41v22h39z" fill="#17c964" opacity="0.5" />
      <path d="M120 700h32l3 18c1 10-8 16-22 16h-28c-10 0-14-8-7-14z" fill="#05080c" />
      <path d="M200 700h-32l-3 18c-1 10 8 16 22 16h28c10 0 14-8 7-14z" fill="#05080c" />

      {/* shorts */}
      <path d="M106 430c-4 0-7 5-7 12l-2 66c0 12 8 20 21 20h24c8 0 12-4 13-12l5-46 5 46c1 8 5 12 13 12h24c13 0 21-8 21-20l-2-66c0-7-3-12-7-12z" fill={`url(#${shorts})`} />
      <path d="M102 500h28M190 500h28" stroke="#17c964" strokeOpacity="0.25" strokeWidth="5" strokeLinecap="round" />

      {/* shirt: broad shoulders, short sleeves, blank back above the number */}
      <path
        d="M160 150c-10 0-18 1-24 3-12 5-24 13-32 23-12 10-22 18-26 32-4 24-4 52-2 74l34 8c-3 36-5 76-5 116 0 22 6 34 19 36h72c13-2 19-14 19-36 0-40-2-80-5-116l34-8c2-22 2-50-2-74-4-14-14-22-26-32-8-10-20-18-32-23-6-2-14-3-24-3z"
        fill={`url(#${shirt})`}
      />
      <path d="M108 300c-2 38-4 76-4 114M212 300c2 38 4 76 4 114" fill="none" stroke="#050a0f" strokeOpacity="0.5" strokeWidth="3" />
      <text
        x="160"
        y="392"
        textAnchor="middle"
        className="font-display"
        fontSize="112"
        fontWeight="600"
        letterSpacing="5"
        fill="#e6f0fa"
        fillOpacity="0.2"
      >
        10
      </text>

      {/* arms */}
      <path d="M76 288l32 8c-2 34-4 94-6 144-1 30-2 55-2 76 0 12-6 20-14 20s-14-8-13-18c2-38 1-118 1-158 0-30 1-54 2-72z" fill={`url(#${skin})`} />
      <path d="M244 288l-32 8c2 34 4 94 6 144 1 30 2 55 2 76 0 12 6 20 14 20s14-8 13-18c-2-38-1-118-1-158 0-30-1-54-2-72z" fill={`url(#${skin})`} />

      {/* ball on the grass, at the right boot */}
      <ellipse cx="252" cy="724" rx="28" ry="7" fill="#02060a" opacity="0.55" />
      <circle cx="252" cy="700" r="27" fill="#e8eef5" />
      <path d="M252 683l11 8-4 13h-14l-4-13z" fill="#0b1218" />
      <path d="M229 691l6 9-7 10-5-10zM275 691l-6 9 7 10 5-10z" fill="#0b1218" opacity="0.7" />

      {/* stadium rim light along the contour */}
      <path d="M126 70c8-20 20-30 34-30s26 10 34 30" fill="none" stroke="#dceeff" strokeOpacity="0.45" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M76 208c4-14 14-22 26-32 8-10 20-18 32-23 6-2 14-3 26-3s20 1 26 3c12 5 24 13 32 23 12 10 22 18 26 32" fill="none" stroke="#dceeff" strokeOpacity="0.45" strokeWidth="5.5" strokeLinecap="round" />
      <path d="M74 300c-2 44-4 100-5 144M246 300c2 44 4 100 5 144" fill="none" stroke="#dceeff" strokeOpacity="0.16" strokeWidth="4" strokeLinecap="round" />
      <path d="M108 452c-3 44-1 84 6 122M212 452c3 44 1 84-6 122" fill="none" stroke="#dceeff" strokeOpacity="0.13" strokeWidth="4" strokeLinecap="round" />
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
          <stop offset="0%" stopColor="#1f2e3d" />
          <stop offset="100%" stopColor="#0b1119" />
        </linearGradient>
        <linearGradient id={kit} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor="#3f5972" />
          <stop offset="100%" stopColor="#1b2937" />
        </linearGradient>
      </defs>

      <rect x="1" y="1" width="118" height="118" rx="10" fill={`url(#${panel})`} />
      <path d="M30 8v104M90 8v104" stroke="#0a1017" strokeWidth="3" opacity="0.7" />

      {/* rail and hanger */}
      <path d="M14 24h92" stroke="#4d5f71" strokeWidth="4" strokeLinecap="round" />
      <path d="M60 24v6" stroke="#4d5f71" strokeWidth="3" />
      <path d="M43 40l17-11 17 11" fill="none" stroke="#5f7488" strokeWidth="3.5" strokeLinejoin="round" />

      {/* hanging kit — blank back, colour collar accent */}
      <path
        d="M60 38c-11 0-21 4-27 10-4 4-6 10-7 17-1 4 1 7 4 7l9-2-2 34c0 4 2 6 6 6h34c4 0 6-2 6-6l-2-34 9 2c3 0 5-3 4-7-1-7-3-13-7-17-6-6-16-10-27-10z"
        fill={`url(#${kit})`}
      />
      <path d="M39 45c6-5 13-7 21-7s15 2 21 7" fill="none" stroke="#17c964" strokeWidth="3.5" strokeLinecap="round" />
      <rect x="51" y="62" width="18" height="6" rx="3" fill="#17c964" opacity="0.4" />

      {/* bench, boots and ball */}
      <rect x="8" y="100" width="104" height="8" rx="4" fill="#314356" />
      <path d="M18 100v-9h13l4 9zM38 100v-9h13l4 9z" fill="#101922" />
      <circle cx="93" cy="90" r="10" fill="#e8eef5" />
      <path d="M93 83l5 3-2 6h-6l-2-6z" fill="#0b1218" />
    </svg>
  );
}

/** Neutral national mark: three colour bands, no emblem. Sizing comes from the caller. */
export function FlagMark({ bands, className = '' }: { bands: [string, string, string]; className?: string }) {
  return (
    <span className={`inline-flex shrink-0 overflow-hidden rounded ring-1 ring-white/20 ${className}`} aria-hidden="true">
      {bands.map((color, i) => (
        <span key={i} className="flex-1" style={{ background: color }} />
      ))}
    </span>
  );
}
