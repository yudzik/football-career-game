import { Trophy } from 'lucide-react';
import { CLUB_NAME } from '../data/constants';
import type { HistoryEntry, Player } from '../types';

interface SeasonEndScreenProps {
  player: Player;
  history: HistoryEntry[];
  startOvr: number;
}

export function SeasonEndScreen({ player, history, startOvr }: SeasonEndScreenProps) {
  const ratings = player.careerStats.ratings;
  const avgRating = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : '—';
  const bestIdx = ratings.indexOf(Math.max(...ratings));
  const worstIdx = ratings.indexOf(Math.min(...ratings));
  const best = history[bestIdx];
  const worst = history[worstIdx];

  return (
    <div className="flex-1 flex flex-col p-5 gap-4">
      <div className="text-center">
        <Trophy className="mx-auto text-amber-400" size={32} />
        <h1 className="font-display text-2xl font-semibold mt-2">Сезон завершён</h1>
        <p className="font-data text-xs text-slate-400 mt-1">{player.name} {player.surname} · {CLUB_NAME}</p>
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {([['Матчи', player.careerStats.apps], ['Голы', player.careerStats.goals], ['Ассисты', player.careerStats.assists], ['Ср. оценка', avgRating]] as [string, number | string][]).map(([label, val]) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-lg p-3">
            <p className="font-data text-xs text-slate-400 uppercase">{label}</p>
            <p className="font-display text-2xl font-semibold mt-0.5">{val}</p>
          </div>
        ))}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
        <p className="font-data text-xs text-slate-400 uppercase">Развитие ОВР</p>
        <p className="font-display text-xl font-semibold mt-0.5">{startOvr} → <span className="text-amber-400">{player.ovr}</span></p>
      </div>

      {best && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-lg p-3">
          <p className="font-data text-xs text-emerald-400 uppercase">Лучшая игра</p>
          <p className="font-body text-sm mt-0.5">vs {best.opponent} — {best.scoreP}:{best.scoreO} (оценка {best.rating.toFixed(1)})</p>
        </div>
      )}
      {worst && (
        <div className="bg-slate-900 border border-rose-500/30 rounded-lg p-3">
          <p className="font-data text-xs text-rose-400 uppercase">Худшая игра</p>
          <p className="font-body text-sm mt-0.5">vs {worst.opponent} — {worst.scoreP}:{worst.scoreO} (оценка {worst.rating.toFixed(1)})</p>
        </div>
      )}

      <p className="font-body text-xs text-slate-500 text-center mt-2">Цикл кажется живым? Скажи, что зашло, а что нет.</p>
    </div>
  );
}
