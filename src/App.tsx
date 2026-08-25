import { useState } from 'react';
import { PROFILES } from './data/profiles';
import { OPPONENTS } from './data/opponents';
import { CLUB_BASE_STRENGTH, STAT_LABELS } from './data/constants';
import { TEMPLATES } from './engine/templates';
import { calcOvr } from './engine/ovr';
import { resolveAttack, resolveChainStage1, resolveDefense, rollGoals, ambientLine } from './engine/resolve';
import type { MatchState, MomentOption } from './engine/types';
import { generatePlayer } from './career/generator';
import { addProgress } from './career/progress';
import { formatDate, addDays } from './career/calendar';
import { clamp } from './utils';
import type { DayActionType, DayResult, PostMatchSummary, StatEffect } from './career/types';
import type { Country, Difficulty, HistoryEntry, Player, Position, Profile, StatKey } from './types';
import { showcaseOvr } from './career/showcase';
import { DEFAULT_LANGUAGE } from './data/languages';
import type { Language } from './data/languages';
import { CreateWizard } from './ui/CreateWizard';
import { MainMenuScreen } from './ui/MainMenuScreen';
import { HomeScreen } from './ui/HomeScreen';
import { DayResultScreen } from './ui/DayResultScreen';
import { MatchScreen } from './ui/MatchScreen';
import { PostMatchScreen } from './ui/PostMatchScreen';
import { SeasonEndScreen } from './ui/SeasonEndScreen';

type Screen = 'mainMenu' | 'create' | 'home' | 'dayResult' | 'match' | 'postMatch' | 'seasonEnd';

export default function App() {
  const [screen, setScreen] = useState<Screen>('mainMenu');
  const [language, setLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [createStep, setCreateStep] = useState(1);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState(18);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const [player, setPlayer] = useState<Player | null>(null);
  const [startOvr, setStartOvr] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [match, setMatch] = useState<MatchState | null>(null);
  const [postMatchSummary, setPostMatchSummary] = useState<PostMatchSummary | null>(null);

  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 1));
  const [prepDaysUsed, setPrepDaysUsed] = useState(0);
  const [consecutiveTraining, setConsecutiveTraining] = useState(0);
  const [dayResult, setDayResult] = useState<DayResult | null>(null);

  function handleNewCareer() {
    setCreateStep(1);
    setScreen('create');
  }

  function handleContinueCareer() {
    if (player) setScreen('home');
  }

  function handleExit() {
    // Only the native shells and script-opened windows can actually close themselves; in a
    // normal browser tab this is a no-op until a platform exit is wired up.
    window.close();
  }

  // A career always starts from a clean run: the season counters below outlive the old Player,
  // so starting a second career from the main menu has to reset them too.
  function handleGenerate() {
    const p = generatePlayer(name.trim(), surname.trim(), age, selectedCountry!, selectedPosition!, selectedProfile!, selectedDifficulty!);
    setPlayer(p);
    setStartOvr(p.ovr);
    setMatchIndex(0);
    setHistory([]);
    setMatch(null);
    setPostMatchSummary(null);
    setDayResult(null);
    setCurrentDate(new Date(2026, 7, 1));
    setPrepDaysUsed(0);
    setConsecutiveTraining(0);
    setScreen('home');
  }

  function handleDayAction(actionType: DayActionType) {
    const dateLabel = formatDate(currentDate);
    const fatigueBefore = player!.fatigue;
    const readinessBefore = player!.readiness;
    let newPlayer = { ...player! };
    let statEffect: StatEffect | null = null;

    if (actionType === 'train') {
      const fatigueMult = player!.fatigue > 70 ? 0.5 : player!.fatigue > 50 ? 0.75 : 1;
      const potentialFactor = 0.7 + (player!.potential / 100) * 0.6;
      const keys = Object.keys(player!.stats) as StatKey[];
      const profileDef = PROFILES.find((p) => p.key === player!.profileKey);
      const pool = (profileDef && Math.random() < 0.6) ? profileDef.favoredStats : keys;
      const k = pool[Math.floor(Math.random() * pool.length)];
      const gain = Math.max(1, Math.round((7 + Math.floor(Math.random() * 5)) * potentialFactor * fatigueMult));
      const progressBefore = player!.progress[k];
      const statBefore = player!.stats[k];
      const { stats: ns, progress: np } = addProgress(player!.stats, player!.progress, k, gain);
      const fatigueCost = clamp(12 + consecutiveTraining * 4, 10, 30);
      newPlayer = { ...player!, stats: ns, progress: np, ovr: calcOvr(ns, player!.positionGroup), fatigue: clamp(player!.fatigue + fatigueCost, 0, 100) };
      statEffect = { key: k, label: STAT_LABELS[k], progressBefore, progressAfter: np[k], statBefore, statAfter: ns[k], leveledUp: ns[k] > statBefore };
      setConsecutiveTraining((c) => c + 1);
    } else if (actionType === 'recover') {
      newPlayer = { ...player!, fatigue: clamp(player!.fatigue - 25, 0, 100), readiness: clamp(player!.readiness + 20, 0, 100) };
      setConsecutiveTraining(0);
    } else {
      newPlayer = { ...player!, fatigue: clamp(player!.fatigue - 10, 0, 100), readiness: clamp(player!.readiness + 8, 0, 100) };
      setConsecutiveTraining(0);
    }

    setPlayer(newPlayer);
    setPrepDaysUsed((n) => n + 1);
    setCurrentDate((d) => addDays(d, 1));
    setDayResult({ actionType, dateLabel, fatigueBefore, fatigueAfter: newPlayer.fatigue, readinessBefore, readinessAfter: newPlayer.readiness, statEffect });
    setScreen('dayResult');
  }

  function handleDayResultContinue() {
    setDayResult(null);
    setScreen('home');
  }

  function handlePlay() {
    const opponent = OPPONENTS[matchIndex];
    const pool = TEMPLATES.filter((t) => t.positions.includes(player!.positionGroup));
    const firstTemplate = pool[Math.floor(Math.random() * pool.length)];
    setMatch({
      opponent, slotIdx: 0, usedTemplateIds: [], currentTemplate: firstTemplate, stage: 1, stage1Tier: null,
      minute: 12 + Math.floor(Math.random() * 8), phase: 'moment', chosenLabel: null, resolutionText: null, resolutionTier: null,
      log: ['Матч начался'], scoreP: 0, scoreO: 0, playerGoals: 0, playerAssists: 0, moments: [],
    });
    setScreen('match');
  }

  function handleSelectOption(option: MomentOption) {
    const { currentTemplate, stage, opponent, minute, stage1Tier } = match!;
    let tier: string;
    if (currentTemplate.chain && stage === 1) tier = resolveChainStage1(option, player!, opponent);
    else if (currentTemplate.type === 'defensive') tier = resolveDefense(option, player!, opponent);
    else {
      const bonus = (currentTemplate.chain && stage === 2 && stage1Tier === 'clean') ? 10 : 0;
      tier = resolveAttack(option, player!, opponent, bonus);
    }
    const resolutionText = option.outcomes[tier];

    const logLines = [`${minute}' ${resolutionText}`];
    let dScoreP = 0, dScoreO = 0, dGoals = 0, dAssists = 0;

    if (currentTemplate.type === 'defensive') {
      if (tier === 'poor') {
        if (Math.random() < 0.55) { dScoreO = 1; logLines.push(`${minute}' Гол — ${opponent.name}`); }
        else { logLines.push(`${minute}' Соперник не реализует момент!`); }
      }
    } else if (!(currentTemplate.chain && stage === 1)) {
      if (tier === 'goal') { dScoreP = 1; dGoals = 1; }
      else if (tier === 'chance' && Math.random() < 0.45) {
        dScoreP = 1; dAssists = 1; logLines.push(`${minute}' Гол — партнёр (пас: ${player!.name})`);
      }
    }

    setMatch((m) => ({
      ...m!, phase: 'resolved', chosenLabel: option.label, resolutionText, resolutionTier: tier,
      stage1Tier: (m!.currentTemplate.chain && m!.stage === 1) ? tier : m!.stage1Tier,
      log: [...m!.log, ...logLines],
      scoreP: m!.scoreP + dScoreP, scoreO: m!.scoreO + dScoreO,
      playerGoals: m!.playerGoals + dGoals, playerAssists: m!.playerAssists + dAssists,
      moments: [...m!.moments, { statKey: option.stat, tier }],
    }));
  }

  function handleContinueAfterMoment() {
    setMatch((m) => {
      const isChainContinuing = m!.currentTemplate.chain && m!.stage === 1 && m!.resolutionTier !== 'lost';
      if (isChainContinuing) {
        return { ...m!, stage: 2, phase: 'moment', chosenLabel: null };
      }
      const nextSlot = m!.slotIdx + 1;
      if (nextSlot >= 3) {
        const teamExtra = rollGoals(CLUB_BASE_STRENGTH, m!.opponent.strength);
        const oppExtra = rollGoals(m!.opponent.strength, CLUB_BASE_STRENGTH);
        const extraLog: string[] = [];
        for (let i = 0; i < teamExtra; i++) extraLog.push('Гол — партнёр');
        for (let i = 0; i < oppExtra; i++) extraLog.push(`Гол — ${m!.opponent.name}`);
        return { ...m!, phase: 'fulltime', scoreP: m!.scoreP + teamExtra, scoreO: m!.scoreO + oppExtra, log: [...m!.log, ...extraLog, 'Финальный свисток'] };
      }
      const usedIds = [...m!.usedTemplateIds, m!.currentTemplate.id];
      const pool = TEMPLATES.filter((t) => t.positions.includes(player!.positionGroup));
      const available = pool.filter((t) => !usedIds.includes(t.id));
      const nextTemplate = available[Math.floor(Math.random() * available.length)];
      const minute = [12, 40, 68][nextSlot] + Math.floor(Math.random() * 10);
      const ambientMinute = Math.max(1, minute - 4 - Math.floor(Math.random() * 4));
      return {
        ...m!, slotIdx: nextSlot, usedTemplateIds: usedIds, currentTemplate: nextTemplate, stage: 1, stage1Tier: null,
        minute, phase: 'moment', chosenLabel: null, log: [...m!.log, `${ambientMinute}' ${ambientLine(m!.opponent)}`],
      };
    });
  }

  function handleFinishMatch() {
    const GOOD_TIERS = ['goal', 'chance', 'great', 'ok', 'clean'];
    const BAD_TIERS = ['lost', 'poor'];
    let rating = 6.0;
    let goodActions = 0, badActions = 0;
    const progressGains: Partial<Record<StatKey, number>> = {};
    match!.moments.forEach((mo) => {
      const t = mo.tier;
      if (t === 'goal') rating += 1.1;
      else if (t === 'chance') rating += 0.2;
      else if (t === 'lost') rating -= 0.25;
      else if (t === 'great') rating += 0.35;
      else if (t === 'ok') rating += 0.05;
      else if (t === 'poor') rating -= 0.4;
      else if (t === 'clean') rating += 0.15;
      if (GOOD_TIERS.includes(t)) goodActions++;
      else if (BAD_TIERS.includes(t)) badActions++;

      let gain = 0;
      if (t === 'goal' || t === 'great') gain = 12 + Math.floor(Math.random() * 5);
      else if (t === 'clean') gain = 8 + Math.floor(Math.random() * 4);
      else if (t === 'chance' || t === 'ok') gain = 4 + Math.floor(Math.random() * 3);
      if (gain > 0) progressGains[mo.statKey] = (progressGains[mo.statKey] || 0) + gain;
    });
    rating = clamp(rating, 4, 10);

    const potentialFactor = 0.7 + (player!.potential / 100) * 0.6;
    let statsAcc = { ...player!.stats };
    let progressAcc = { ...player!.progress };
    const statChanges: StatEffect[] = [];
    (Object.keys(progressGains) as StatKey[]).forEach((k) => {
      const statBefore = statsAcc[k];
      const progressBefore = progressAcc[k];
      const scaledGain = Math.round(progressGains[k]! * potentialFactor);
      const result = addProgress(statsAcc, progressAcc, k, scaledGain);
      statsAcc = result.stats; progressAcc = result.progress;
      statChanges.push({ key: k, label: STAT_LABELS[k], progressBefore, progressAfter: progressAcc[k], statBefore, statAfter: statsAcc[k], leveledUp: statsAcc[k] > statBefore });
    });
    const newOvr = calcOvr(statsAcc, player!.positionGroup);
    const newForm = clamp(Math.round(player!.form + (rating - 6) * 6), 0, 100);
    const newFatigue = clamp(player!.fatigue + 20, 0, 100);
    const newReadiness = clamp(player!.readiness - 15, 0, 100);
    const formDelta = newForm - player!.form;
    const fatigueDelta = newFatigue - player!.fatigue;

    const updatedPlayer: Player = {
      ...player!, stats: statsAcc, progress: progressAcc, ovr: newOvr, form: newForm, fatigue: newFatigue, readiness: newReadiness,
      careerStats: {
        goals: player!.careerStats.goals + match!.playerGoals,
        assists: player!.careerStats.assists + match!.playerAssists,
        apps: player!.careerStats.apps + 1,
        ratings: [...player!.careerStats.ratings, rating],
      },
    };
    const minutesPlayed = Math.random() < 0.15 ? 78 + Math.floor(Math.random() * 10) : 90;
    const nextIndex = matchIndex + 1;

    setPlayer(updatedPlayer);
    setHistory((h) => [...h, { opponent: match!.opponent.name, scoreP: match!.scoreP, scoreO: match!.scoreO, rating, goals: match!.playerGoals, assists: match!.playerAssists }]);
    setPostMatchSummary({
      opponentName: match!.opponent.name, opponentCrest: match!.opponent.crest, scoreP: match!.scoreP, scoreO: match!.scoreO, minutesPlayed,
      goals: match!.playerGoals, assists: match!.playerAssists, goodActions, badActions, rating, statChanges, formDelta, fatigueDelta,
      nextScreen: nextIndex >= 5 ? 'seasonEnd' : 'home',
    });
    setMatchIndex(nextIndex);
    setMatch(null);
    setPrepDaysUsed(0);
    setConsecutiveTraining(0);
    setCurrentDate((d) => addDays(d, 1));
    setScreen('postMatch');
  }

  function handleMatchContinue() {
    if (match!.phase === 'resolved') handleContinueAfterMoment();
    else if (match!.phase === 'fulltime') handleFinishMatch();
  }
  function handlePostMatchContinue() {
    setScreen(postMatchSummary!.nextScreen);
    setPostMatchSummary(null);
  }

  // The main screen is a horizontal desktop/tablet layout and owns the whole viewport; the
  // career screens keep the narrow column they were built in.
  if (screen === 'mainMenu') {
    return (
      <MainMenuScreen
        ovr={showcaseOvr(player)}
        hasCareer={!!player}
        language={language}
        onLanguageChange={setLanguage}
        onNewCareer={handleNewCareer}
        onContinueCareer={handleContinueCareer}
        onExit={handleExit}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex justify-center font-body">
      <div className="w-full max-w-md flex flex-col min-h-screen">
        {screen === 'create' && (
          <CreateWizard
            step={createStep} setStep={setCreateStep}
            name={name} setName={setName} surname={surname} setSurname={setSurname}
            age={age} setAge={setAge}
            country={selectedCountry} setCountry={setSelectedCountry}
            position={selectedPosition} setPosition={setSelectedPosition}
            profile={selectedProfile} setProfile={setSelectedProfile}
            difficulty={selectedDifficulty} setDifficulty={setSelectedDifficulty}
            onGenerate={handleGenerate}
            onBackToMenu={() => setScreen('mainMenu')}
          />
        )}
        {screen === 'home' && player && (
          <HomeScreen player={player} matchIndex={matchIndex} history={history} currentDate={currentDate} prepDaysUsed={prepDaysUsed} onDayAction={handleDayAction} onPlay={handlePlay} onExitToMenu={() => setScreen('mainMenu')} />
        )}
        {screen === 'dayResult' && dayResult && (
          <DayResultScreen dayResult={dayResult} onContinue={handleDayResultContinue} />
        )}
        {screen === 'match' && match && (
          <MatchScreen match={match} onSelectOption={handleSelectOption} onContinue={handleMatchContinue} />
        )}
        {screen === 'postMatch' && postMatchSummary && (
          <PostMatchScreen summary={postMatchSummary} onContinue={handlePostMatchContinue} />
        )}
        {screen === 'seasonEnd' && player && (
          <SeasonEndScreen player={player} history={history} startOvr={startOvr} />
        )}
      </div>
    </div>
  );
}
