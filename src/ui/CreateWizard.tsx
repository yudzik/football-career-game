import type { Dispatch, SetStateAction } from 'react';
import { COUNTRIES } from '../data/countries';
import { POSITIONS } from '../data/positions';
import { PROFILES } from '../data/profiles';
import { DIFFICULTIES } from '../data/difficulties';
import type { Country, Difficulty, Position, Profile } from '../types';
import { GAME_LOGO, STADIUM_BG } from '../data/assets';

const OPTION_BTN = (active: boolean) => `text-left p-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${active ? 'bg-slate-800 border-amber-400' : 'bg-slate-900 border-slate-700'}`;

interface CreateWizardProps {
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  surname: string;
  setSurname: Dispatch<SetStateAction<string>>;
  age: number;
  setAge: Dispatch<SetStateAction<number>>;
  country: Country | null;
  setCountry: Dispatch<SetStateAction<Country | null>>;
  position: Position | null;
  setPosition: Dispatch<SetStateAction<Position | null>>;
  profile: Profile | null;
  setProfile: Dispatch<SetStateAction<Profile | null>>;
  difficulty: Difficulty | null;
  setDifficulty: Dispatch<SetStateAction<Difficulty | null>>;
  onGenerate: () => void;
  /** Back out of step 1 to the main menu, so entering the wizard is not a one-way door. */
  onBackToMenu?: () => void;
}

export function CreateWizard({ step, setStep, name, setName, surname, setSurname, age, setAge, country, setCountry, position, setPosition, profile, setProfile, difficulty, setDifficulty, onGenerate, onBackToMenu }: CreateWizardProps) {
  const canNext =
    step === 1 ? name.trim().length > 0 :
    step === 2 ? true :
    step === 3 ? !!country :
    step === 4 ? !!position :
    step === 5 ? !!profile :
    !!difficulty;

  return (
    <div className="relative flex-1 flex flex-col min-h-0">
      {/* Stadium backdrop for the game's front screen, dimmed so the wizard stays readable. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${STADIUM_BG})` }}
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/88 to-slate-950/96" />

      <div className="relative flex-1 flex flex-col p-5 gap-4 min-h-0">
      <img src={GAME_LOGO} alt="Football Career Game" className="w-full max-w-[15rem] mx-auto shrink-0" />

      <div className="shrink-0">
        <p className="font-data text-amber-400 text-xs tracking-widest uppercase mb-1">Создание футболиста · Шаг {step} из 6</p>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${(step / 6) * 100}%` }} />
        </div>
      </div>

      {step === 1 && (
        <div className="flex-1 flex flex-col gap-3 justify-center">
          <h2 className="font-display text-2xl font-semibold">Как тебя зовут?</h2>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 font-body text-slate-50 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400" />
          <input value={surname} onChange={(e) => setSurname(e.target.value)} placeholder="Фамилия"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 font-body text-slate-50 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400" />
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col gap-3 justify-center">
          <h2 className="font-display text-2xl font-semibold">Сколько тебе лет?</h2>
          <div className="grid grid-cols-3 gap-2">
            {[16, 17, 18, 19, 20, 21].map((a) => (
              <button key={a} onClick={() => setAge(a)}
                className={`py-3 rounded-lg font-data text-sm border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${age === a ? 'bg-amber-400 text-slate-950 border-amber-400' : 'bg-slate-900 border-slate-700 text-slate-300'}`}
              >{a}</button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <h2 className="font-display text-2xl font-semibold shrink-0">Откуда ты?</h2>
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start pb-1">
            {COUNTRIES.map((c) => (
              <button key={c.name} onClick={() => setCountry(c)} className={OPTION_BTN(country?.name === c.name)}>
                <span className="font-body text-sm">{c.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <h2 className="font-display text-2xl font-semibold shrink-0">Твоя позиция</h2>
          <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 content-start pb-1">
            {POSITIONS.map((p) => (
              <button key={p.code} onClick={() => setPosition(p)} className={OPTION_BTN(position?.code === p.code)}>
                <div className="font-display text-sm font-medium">{p.label}</div>
                <div className="font-data text-xs text-slate-500 mt-0.5">{p.code}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 5 && (
        <div className="flex-1 flex flex-col gap-3 min-h-0">
          <h2 className="font-display text-2xl font-semibold shrink-0">Твой игровой профиль</h2>
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-1">
            {PROFILES.map((p) => (
              <button key={p.key} onClick={() => setProfile(p)} className={OPTION_BTN(profile?.key === p.key)}>
                <div className="font-display text-base font-medium">{p.name}</div>
                <div className="font-body text-xs text-slate-400 mt-0.5">{p.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 6 && (
        <div className="flex-1 flex flex-col gap-3">
          <h2 className="font-display text-2xl font-semibold">Выбери сложность своего пути</h2>
          <div className="flex flex-col gap-2">
            {DIFFICULTIES.map((d) => (
              <button key={d.key} onClick={() => setDifficulty(d)} className={OPTION_BTN(difficulty?.key === d.key)}>
                <div className="font-display text-base font-semibold uppercase tracking-wide">{d.label}</div>
                <div className="font-body text-xs text-slate-400 mt-1">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2 shrink-0">
        {step > 1 ? (
          <button onClick={() => setStep(step - 1)} className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 font-body text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400">Назад</button>
        ) : onBackToMenu && (
          <button onClick={onBackToMenu} className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 font-body text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400">В меню</button>
        )}
        {step < 6 ? (
          <button disabled={!canNext} onClick={() => setStep(step + 1)}
            className="flex-1 py-3 rounded-lg bg-amber-400 text-slate-950 font-display font-semibold disabled:bg-slate-800 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400">Далее</button>
        ) : (
          <button disabled={!canNext} onClick={onGenerate}
            className="flex-1 py-3.5 rounded-lg bg-amber-400 text-slate-950 font-display font-semibold disabled:bg-slate-800 disabled:text-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400">Создать игрока</button>
        )}
      </div>
      </div>
    </div>
  );
}
