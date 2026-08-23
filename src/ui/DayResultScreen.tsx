import type { DayResult } from '../career/types';

interface DayResultScreenProps {
  dayResult: DayResult;
  onContinue: () => void;
}

export function DayResultScreen({ dayResult, onContinue }: DayResultScreenProps) {
  const { actionType, dateLabel, fatigueBefore, fatigueAfter, readinessBefore, readinessAfter, statEffect } = dayResult;
  const actionLabel = actionType === 'train' ? 'Тренировка' : actionType === 'recover' ? 'Восстановление' : 'Отдых';
  return (
    <div className="flex-1 flex flex-col p-5 gap-4 justify-center items-center text-center">
      <p className="font-data text-xs text-slate-400 uppercase tracking-widest">{dateLabel}</p>
      <p className="font-display text-2xl font-semibold">Действие использовано: {actionLabel}</p>

      <div className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 space-y-1.5 text-left">
        <div className="flex justify-between font-body text-sm">
          <span className="text-slate-400">Усталость</span>
          <span>{fatigueBefore} → <span className={fatigueAfter > fatigueBefore ? 'text-rose-400' : 'text-emerald-400'}>{fatigueAfter}</span></span>
        </div>
        <div className="flex justify-between font-body text-sm">
          <span className="text-slate-400">Готовность</span>
          <span>{readinessBefore} → <span className={readinessAfter >= readinessBefore ? 'text-emerald-400' : 'text-rose-400'}>{readinessAfter}</span></span>
        </div>
      </div>

      {statEffect && (
        <div className="w-full bg-slate-900 border border-amber-400/30 rounded-lg p-3 text-left">
          <div className="flex justify-between font-data text-xs text-slate-400 mb-1">
            <span>{statEffect.label}</span>
            <span>{statEffect.leveledUp ? `${statEffect.statBefore} → ${statEffect.statAfter}` : statEffect.statBefore}</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full" style={{ width: `${statEffect.progressAfter}%` }} />
          </div>
          <p className="font-data text-xs text-slate-500 mt-1">Прогресс: {statEffect.progressBefore}/100 → {statEffect.progressAfter}/100{statEffect.leveledUp ? ' · новый уровень!' : ''}</p>
        </div>
      )}

      <button onClick={onContinue} className="w-full py-3.5 rounded-lg bg-amber-400 text-slate-950 font-display font-semibold mt-2 focus:outline-none focus:ring-2 focus:ring-amber-400">Продолжить</button>
    </div>
  );
}
