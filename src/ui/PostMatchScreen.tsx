import { CLUB_NAME, CLUB_CREST } from '../data/constants';
import type { PostMatchSummary } from '../career/types';
import { Crest } from './Crest';

interface PostMatchScreenProps {
  summary: PostMatchSummary;
  onContinue: () => void;
}

export function PostMatchScreen({ summary, onContinue }: PostMatchScreenProps) {
  const { opponentName, opponentCrest, scoreP, scoreO, minutesPlayed, goals, assists, goodActions, badActions, rating, statChanges, formDelta, fatigueDelta } = summary;
  const resultLabel = scoreP > scoreO ? 'Победа' : scoreP < scoreO ? 'Поражение' : 'Ничья';
  const resultColor = scoreP > scoreO ? 'text-emerald-400' : scoreP < scoreO ? 'text-rose-400' : 'text-slate-300';
  return (
    <div className="flex-1 flex flex-col p-5 gap-4">
      <div className="text-center">
        <p className={`font-data text-xs uppercase tracking-widest ${resultColor}`}>{resultLabel}</p>
        <div className="flex items-center justify-center gap-4 mt-1">
          <Crest src={CLUB_CREST} name={CLUB_NAME} size={44} />
          <p className="font-display text-2xl font-bold tabular-nums">{scoreP}–{scoreO}</p>
          <Crest src={opponentCrest} name={opponentName} size={44} />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p className="font-data text-xs text-slate-400 uppercase tracking-wide mb-2">Твой матч</p>
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 font-body text-sm">
          <div className="flex justify-between"><span className="text-slate-400">Минуты</span><span>{minutesPlayed}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Оценка</span><span className="text-amber-400 font-semibold">{rating.toFixed(1)}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Голы</span><span>{goals}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Ассисты</span><span>{assists}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Удачных действий</span><span>{goodActions}</span></div>
          <div className="flex justify-between"><span className="text-slate-400">Потерь</span><span>{badActions}</span></div>
        </div>
      </div>

      <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4">
        <p className="font-data text-xs text-emerald-400 uppercase tracking-wide mb-2">Развитие</p>
        <div className="space-y-1.5 font-body text-sm">
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Форма</span>
            <span className={formDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{formDelta >= 0 ? '↑' : '↓'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300">Усталость</span>
            <span className="text-rose-400">↑ +{fatigueDelta}</span>
          </div>
          <div className="flex items-center gap-2"><span className="text-slate-300">Опыт</span><span className="text-emerald-400">↑</span></div>
          {statChanges.length === 0 && <p className="font-data text-xs text-slate-500 pt-1">Без изменений характеристик в этом матче.</p>}
          {statChanges.map((s) => (
            <div key={s.key} className="pt-1">
              <div className="flex justify-between font-data text-xs text-slate-400">
                <span>{s.label}</span>
                <span>{s.leveledUp ? `${s.statBefore} → ${s.statAfter}` : s.statBefore}</span>
              </div>
              <div className="h-1 bg-slate-800 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-amber-400 rounded-full" style={{ width: `${s.progressAfter}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={onContinue} className="w-full py-3.5 rounded-lg bg-amber-400 text-slate-950 font-display font-semibold tracking-wide focus:outline-none focus:ring-2 focus:ring-amber-400">Продолжить</button>
    </div>
  );
}
