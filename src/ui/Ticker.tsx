interface TickerProps {
  log: string[];
}

export function Ticker({ log }: TickerProps) {
  const recent = log.slice(-5);
  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 font-data text-xs text-slate-400 space-y-1">
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        <span className="text-slate-500 uppercase tracking-wider">Live</span>
      </div>
      {recent.map((line, i) => (
        <div key={i} className={i === recent.length - 1 ? 'text-slate-100' : ''}>{line}</div>
      ))}
    </div>
  );
}
