import { Play, Dumbbell, HeartPulse, Moon, Calendar, Menu } from 'lucide-react';
import { OPPONENTS } from '../data/opponents';
import { STAT_LABELS, CLUB_NAME, CLUB_CREST } from '../data/constants';
import { Crest } from './Crest';
import { squadStatus } from '../career/squadStatus';
import { formatDate } from '../career/calendar';
import { StatBar } from './StatBar';
import type { DayActionType } from '../career/types';
import type { HistoryEntry, Player, StatKey } from '../types';

interface HomeScreenProps {
  player: Player;
  matchIndex: number;
  history: HistoryEntry[];
  currentDate: Date;
  prepDaysUsed: number;
  onDayAction: (actionType: DayActionType) => void;
  onPlay: () => void;
  /** Back to the main screen, which is what makes «Продолжить карьеру» reachable again. */
  onExitToMenu?: () => void;
}

export function HomeScreen({ player, matchIndex, history, currentDate, prepDaysUsed, onDayAction, onPlay, onExitToMenu }: HomeScreenProps) {
  const opponent = OPPONENTS[matchIndex];
  const status = squadStatus(player);
  const isMatchDay = prepDaysUsed >= 3;

  return (
    <div className="flex-1 flex flex-col p-5 gap-4">
      <div className="bg-slate-900 border border-amber-400/30 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-amber-400" />
          <p className="font-display text-lg font-semibold">{formatDate(currentDate)}</p>
          {onExitToMenu && (
            <button onClick={onExitToMenu} title="Главное меню" aria-label="Главное меню"
              className="ml-auto flex items-center gap-1 rounded-lg border border-slate-700 px-2 py-1 font-data text-[0.6rem] uppercase tracking-wider text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <Menu size={12} /> Меню
            </button>
          )}
        </div>
        {isMatchDay ? (
          <div className="flex items-center gap-2 mt-1">
            <Crest src={opponent.crest} name={opponent.name} size={34} />
            <p className="font-data text-amber-400 text-sm uppercase tracking-wide">Матч сегодня</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <Crest src={opponent.crest} name={opponent.name} size={30} />
            <p className="font-data text-xs text-slate-400">До матча: {3 - prepDaysUsed} дн. · Матч {matchIndex + 1} из 5</p>
          </div>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold">{player.name} {player.surname}</h1>
        <p className="font-data text-xs text-slate-400">{player.positionLabel} · {player.profileName} · {player.age} лет · {player.country}</p>
        <div className="flex items-center gap-2 mt-2">
          <Crest src={CLUB_CREST} name={CLUB_NAME} size={40} />
          <span className={`font-data text-xs px-2 py-1 rounded ${status === 'Основа' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{status}</span>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
        <div className="font-display text-4xl font-bold text-amber-400">{player.ovr}</div>
        <div className="flex-1 space-y-1.5">
          <StatBar label="Форма" value={player.form} color="bg-emerald-500" />
          <StatBar label="Готов." value={player.readiness} color="bg-amber-400" />
          <StatBar label="Устал." value={player.fatigue} color="bg-rose-500" />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <p className="font-data text-xs text-slate-400 uppercase tracking-wide mb-2">Характеристики</p>
        <div className="grid grid-cols-3 gap-x-3 gap-y-2">
          {(Object.entries(player.stats) as [StatKey, number][]).map(([k, v]) => (
            <div key={k} className="flex items-center justify-between">
              <span className="font-data text-xs text-slate-400">{STAT_LABELS[k]}</span>
              <span className="font-data text-sm text-slate-100">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {history.length > 0 && (
        <div>
          <p className="font-data text-xs text-slate-400 uppercase tracking-wide mb-1.5">Результаты</p>
          <div className="flex gap-1.5 flex-wrap">
            {history.map((h, i) => {
              const res = h.scoreP > h.scoreO ? 'В' : h.scoreP < h.scoreO ? 'П' : 'Н';
              const color = res === 'В' ? 'bg-emerald-500 text-slate-950' : res === 'П' ? 'bg-rose-500 text-slate-950' : 'bg-slate-700 text-slate-200';
              return <span key={i} className={`font-data text-xs w-8 h-8 rounded-full flex items-center justify-center font-semibold ${color}`}>{res}</span>;
            })}
          </div>
        </div>
      )}

      <div className="mt-auto">
        {isMatchDay ? (
          <button onClick={onPlay} className="w-full py-3.5 rounded-lg bg-amber-400 text-slate-950 font-display font-semibold tracking-wide flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400">
            <Play size={18} /> Играть матч
          </button>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            <button onClick={() => onDayAction('train')} className="py-3 rounded-lg bg-slate-900 border border-slate-700 font-body text-xs font-medium flex flex-col items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <Dumbbell size={16} /> Тренировка
            </button>
            <button onClick={() => onDayAction('recover')} className="py-3 rounded-lg bg-slate-900 border border-slate-700 font-body text-xs font-medium flex flex-col items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <HeartPulse size={16} /> Восст.
            </button>
            <button onClick={() => onDayAction('rest')} className="py-3 rounded-lg bg-slate-900 border border-slate-700 font-body text-xs font-medium flex flex-col items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-amber-400">
              <Moon size={16} /> Отдых
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
