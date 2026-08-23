import { CLUB_NAME } from '../data/constants';
import { getStageData } from '../engine/resolve';
import type { MatchState, MomentOption } from '../engine/types';
import { Ticker } from './Ticker';

interface MatchScreenProps {
  match: MatchState;
  onSelectOption: (option: MomentOption) => void;
  onContinue: () => void;
}

export function MatchScreen({ match, onSelectOption, onContinue }: MatchScreenProps) {
  const { opponent, phase, currentTemplate, minute, scoreP, scoreO, log, resolutionText, resolutionTier, chosenLabel } = match;
  const positive = ['goal', 'great', 'clean'];
  const negative = ['poor', 'lost'];
  const tierColor = positive.includes(resolutionTier ?? '') ? 'text-emerald-400' : negative.includes(resolutionTier ?? '') ? 'text-rose-400' : 'text-amber-400';
  const stageData = phase === 'moment' ? getStageData(match) : null;

  return (
    <div className="flex-1 flex flex-col p-5 gap-4 relative"
      style={{ backgroundImage: 'repeating-linear-gradient(135deg, rgba(16,185,129,0.035) 0px, rgba(16,185,129,0.035) 40px, transparent 40px, transparent 80px)' }}>
      <div className="flex items-center justify-between bg-slate-900 rounded-lg px-4 py-3 border border-slate-800">
        <span className="font-body text-sm text-slate-300 truncate">{CLUB_NAME}</span>
        <span className="font-display text-3xl font-bold tabular-nums">{scoreP} : {scoreO}</span>
        <span className="font-body text-sm text-slate-300 truncate text-right">{opponent.name}</span>
      </div>

      <Ticker log={log} />

      {phase === 'moment' && stageData && (
        <div className="flex-1 flex flex-col gap-4">
          <div className="bg-slate-900 border-l-4 border-amber-400 rounded-r-xl p-4">
            <div className="flex items-baseline justify-between mb-2">
              <span className="font-display text-amber-400 text-2xl font-bold">{minute}'</span>
              <span className="font-data text-xs text-slate-400 uppercase tracking-wide">{currentTemplate.name}</span>
            </div>
            <div className="space-y-1">
              {stageData.context.map((line, i) => (
                <p key={i} className="font-body text-slate-200 text-sm leading-relaxed">{line}</p>
              ))}
            </div>
            <p className="font-body text-amber-400/80 text-xs mt-3 uppercase tracking-wide">Нужно принять решение</p>
          </div>
          <div className="space-y-2.5">
            {stageData.options.map((opt, i) => (
              <button key={i} onClick={() => onSelectOption(opt)}
                className="w-full text-left px-4 py-3.5 rounded-lg bg-slate-900 border border-slate-700 font-body text-sm hover:border-amber-400 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center gap-3"
              >
                <span className="font-data text-amber-400 text-xs shrink-0">{i + 1}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'resolved' && (
        <div className="flex-1 flex flex-col justify-center items-center gap-3 text-center px-2">
          <p className="font-body text-sm text-slate-400">Ты выбрал: «{chosenLabel}»</p>
          <p className={`font-display text-xl font-semibold leading-snug ${tierColor}`}>{resolutionText}</p>
          <button onClick={onContinue} className="w-full mt-3 py-3.5 rounded-lg bg-amber-400 text-slate-950 font-display font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400">Далее</button>
        </div>
      )}

      {phase === 'fulltime' && (
        <div className="flex-1 flex flex-col justify-center items-center gap-4 text-center">
          <p className="font-data text-xs text-slate-400 uppercase tracking-widest">Финальный свисток</p>
          <p className="font-display text-4xl font-bold">{scoreP} : {scoreO}</p>
          <button onClick={onContinue} className="w-full py-3.5 rounded-lg bg-amber-400 text-slate-950 font-display font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400">Смотреть отчёт о матче</button>
        </div>
      )}
    </div>
  );
}
