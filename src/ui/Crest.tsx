interface CrestProps {
  src: string;
  name: string;
  /** Rendered height in px; the crest keeps its own aspect ratio. */
  size?: number;
  className?: string;
}

/** Club crest standing in for the club's written name — the name rides along as alt/title text. */
export function Crest({ src, name, size = 24, className = '' }: CrestProps) {
  return (
    <img
      src={src}
      alt={name}
      title={name}
      style={{ height: size }}
      className={`w-auto shrink-0 object-contain drop-shadow-[0_1px_3px_rgba(0,0,0,0.55)] ${className}`}
    />
  );
}
