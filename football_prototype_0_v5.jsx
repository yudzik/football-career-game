import { useState } from 'react';
import { Trophy, Play, Dumbbell, HeartPulse, Moon, Calendar } from 'lucide-react';

const FONT_IMPORT = `
  @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
  .font-display { font-family: 'Oswald', sans-serif; }
  .font-body { font-family: 'Inter', sans-serif; }
  .font-data { font-family: 'IBM Plex Mono', monospace; }
`;

const STAT_LABELS = { pace: 'СКО', shooting: 'УДА', passing: 'ПАС', dribbling: 'ДРИ', physical: 'ФИЗ', defending: 'ЗАЩ' };

// Position defines the base stat archetype for a role on the pitch. NO ovr/number is ever shown at creation time.
const POSITIONS = [
  { code: 'ВР', label: 'Вратарь', stats: { pace: 55, shooting: 25, passing: 55, dribbling: 40, physical: 65, defending: 75 } },
  { code: 'ЦЗ', label: 'Центральный защитник', stats: { pace: 60, shooting: 35, passing: 58, dribbling: 45, physical: 80, defending: 81 } },
  { code: 'ЛЗ', label: 'Левый защитник', stats: { pace: 72, shooting: 40, passing: 62, dribbling: 58, physical: 70, defending: 70 } },
  { code: 'ПЗ', label: 'Правый защитник', stats: { pace: 72, shooting: 40, passing: 62, dribbling: 58, physical: 70, defending: 70 } },
  { code: 'ЦОП', label: 'Опорный полузащитник', stats: { pace: 62, shooting: 50, passing: 72, dribbling: 62, physical: 74, defending: 72 } },
  { code: 'ЦП', label: 'Центральный полузащитник', stats: { pace: 66, shooting: 58, passing: 76, dribbling: 68, physical: 68, defending: 58 } },
  { code: 'ЦАП', label: 'Атакующий полузащитник', stats: { pace: 68, shooting: 68, passing: 79, dribbling: 78, physical: 55, defending: 35 } },
  { code: 'ЛП', label: 'Левый полузащитник', stats: { pace: 76, shooting: 60, passing: 68, dribbling: 74, physical: 58, defending: 42 } },
  { code: 'ПП', label: 'Правый полузащитник', stats: { pace: 76, shooting: 60, passing: 68, dribbling: 74, physical: 58, defending: 42 } },
  { code: 'ЛВ', label: 'Левый вингер', stats: { pace: 81, shooting: 66, passing: 64, dribbling: 79, physical: 56, defending: 28 } },
  { code: 'ПВ', label: 'Правый вингер', stats: { pace: 81, shooting: 66, passing: 64, dribbling: 79, physical: 56, defending: 28 } },
  { code: 'НАП', label: 'Нападающий', stats: { pace: 74, shooting: 81, passing: 56, dribbling: 68, physical: 71, defending: 24 } },
];

// Profile is a separate axis from position (Master Context step 5, not merged into step 4).
// It layers a small stat bias on top of the position's archetype and biases which stat training
// favors ("стиль развития") — it never shows a number and never sets OVR directly.
const PROFILES = [
  { key: 'playmaker', name: 'Плеймейкер', desc: 'Мастер передач и созидания', statBias: { passing: 6, dribbling: 3 }, favoredStats: ['passing', 'dribbling'] },
  { key: 'dribbler', name: 'Дриблёр', desc: 'Любит обыгрывать соперников', statBias: { dribbling: 6, pace: 3 }, favoredStats: ['dribbling', 'pace'] },
  { key: 'workhorse', name: 'Трудяга', desc: 'Выносливость и борьба', statBias: { physical: 6, defending: 3 }, favoredStats: ['physical', 'defending'] },
  { key: 'visionary', name: 'Визионер', desc: 'Видит поле на шаг вперёд', statBias: { passing: 5, defending: 3 }, favoredStats: ['passing', 'defending'] },
  { key: 'poacher', name: 'Бомбардир', desc: 'Сосредоточен на голах и завершении атак', statBias: { shooting: 7, pace: 2 }, favoredStats: ['shooting', 'pace'] },
  { key: 'allrounder', name: 'Универсал', desc: 'Сбалансированная игра без явных слабостей', statBias: { pace: 2, shooting: 2, passing: 2, dribbling: 2, physical: 2, defending: 2 }, favoredStats: ['pace', 'shooting', 'passing', 'dribbling', 'physical', 'defending'] },
];

// Small starter set — kept as flat objects with a confederation stub so a full world list can replace this
// array later without touching any code that reads country.name / country.confederation.
const COUNTRIES = [
  { name: 'Аргентина', confederation: 'CONMEBOL' }, { name: 'Бразилия', confederation: 'CONMEBOL' },
  { name: 'Уругвай', confederation: 'CONMEBOL' }, { name: 'Испания', confederation: 'UEFA' },
  { name: 'Франция', confederation: 'UEFA' }, { name: 'Германия', confederation: 'UEFA' },
  { name: 'Англия', confederation: 'UEFA' }, { name: 'Италия', confederation: 'UEFA' },
  { name: 'Португалия', confederation: 'UEFA' }, { name: 'Нидерланды', confederation: 'UEFA' },
  { name: 'Хорватия', confederation: 'UEFA' }, { name: 'Бельгия', confederation: 'UEFA' },
  { name: 'Марокко', confederation: 'CAF' }, { name: 'Нигерия', confederation: 'CAF' },
  { name: 'Япония', confederation: 'AFC' }, { name: 'Южная Корея', confederation: 'AFC' },
  { name: 'США', confederation: 'CONCACAF' }, { name: 'Мексика', confederation: 'CONCACAF' },
];

const DIFFICULTIES = [
  { key: 'easy', label: 'Лёгкий старт', desc: 'Более благоприятные стартовые условия.', statBias: 4, potentialBias: 10 },
  { key: 'realistic', label: 'Реалистичный', desc: 'Сбалансированный и наиболее реалистичный путь.', statBias: 0, potentialBias: 0 },
  { key: 'hard', label: 'Тяжёлый путь', desc: 'Более сложное начало карьеры и более медленное развитие.', statBias: -4, potentialBias: -10 },
];

const OPPONENTS = [
  { name: 'Норд Атлетик', strength: 68 },
  { name: 'Сан-Пабло', strength: 74 },
  { name: 'Кастель Уно', strength: 71 },
  { name: 'Вест Индастриал', strength: 82 },
  { name: 'Ривер Стар', strength: 77 },
];

const CLUB_NAME = 'Мадрид Роял';
const CLUB_BASE_STRENGTH = 73;

const RU_MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
function formatDate(date) { return `${date.getDate()} ${RU_MONTHS[date.getMonth()]} ${date.getFullYear()}`; }
function addDays(date, n) { const d = new Date(date); d.setDate(d.getDate() + n); return d; }

// ===== MATCH ENGINE — unchanged from the previous prototype build =====

const AMBIENT_EVENTS = [
  (o) => 'Соперник пробил мимо ворот.',
  (o) => 'Ты выиграл верховую борьбу в центре поля.',
  (o) => 'Партнёр получил жёлтую карточку.',
  (o) => `Опасная атака ${CLUB_NAME}, но без завершения.`,
  (o) => `${o.name} зарабатывает угловой.`,
  (o) => 'Пас в касание — хорошая комбинация в центре.',
  (o) => 'Судья фиксирует фол в центре поля.',
  (o) => `Вратарь ${o.name} уверенно забирает верховой мяч.`,
  (o) => 'Затяжной розыгрыш без ударов по воротам.',
  (o) => 'Ты сфолил в центре поля.',
  (o) => `${o.name} перестраивается в обороне.`,
  (o) => 'Трибуны поддерживают команду.',
];

// Maps a specific position code to its broad group, which is what the Match Engine actually filters on.
function positionGroup(code) {
  if (code === 'ВР') return 'GK';
  if (['ЦЗ', 'ЛЗ', 'ПЗ'].includes(code)) return 'DEF';
  if (['ЦОП', 'ЦП', 'ЦАП'].includes(code)) return 'MID';
  if (['ЛВ', 'ПВ', 'ЛП', 'ПП'].includes(code)) return 'WING';
  return 'ATT';
}

// The 5 timeless football-situation archetypes stay as the conceptual foundation. How many concrete
// TEMPLATES exist under each one is driven purely by what the 5 position pools actually need — the
// count is not artificially capped at 5, only the underlying concept groups are.
const MOMENT_GROUPS = {
  flank_attack: 'Фланговая атака',
  one_on_one: 'Выход один на один',
  set_piece: 'Стандарт',
  counter: 'Контратака',
  defensive_episode: 'Защитный эпизод',
};

const TEMPLATES = [
  {
    id: 'flank', name: 'Атака через фланг', chain: true, type: 'attacking', group: 'flank_attack', positions: ['WING', 'MID'],
    context: (o) => [
      'Ты получил мяч на фланге.',
      `Перед тобой защитник ${o.name}.`,
      'В штрафной — двое партнёров, один открывается за спину защитнику.',
      'В центре есть свободная зона.',
    ],
    options: [
      { label: 'Обострить через дриблинг', stat: 'dribbling', outcomes: {
        clean: 'Ты убрал защитника финтом и ворвался в штрафную.',
        contested: 'Ты прошёл мимо, но защитник зацепил тебя корпусом — скорость потеряна.',
        lost: 'Защитник прочитал движение и выбил мяч в аут.',
      }},
      { label: 'Отдать передачу в штрафную', stat: 'passing', outcomes: {
        clean: 'Точный пас между защитниками — партнёр выходит один на один.',
        contested: 'Пас смещён — партнёр дотягивается неудобно, под острым углом.',
        lost: 'Передачу перехватил центральный защитник.',
      }},
      { label: 'Сместиться в центр', stat: 'dribbling', outcomes: {
        clean: 'Ты ушёл с фланга внутрь и открыл себе угол для удара.',
        contested: 'Сместился, но соперник успел перестроиться и закрыть линию паса.',
        lost: 'Потерял равновесие при развороте — мяч у соперника.',
      }},
    ],
    stage2Context: {
      clean: (o) => [`Ты в штрафной, вратарь ${o.name} слегка смещён не в свою сторону.`, 'Один защитник ещё возвращается.'],
      contested: (o) => ['Мяч у тебя на подступах к штрафной под давлением.', `Защита ${o.name} уже перестроилась.`],
    },
    stage2Options: [
      { label: 'Пробить сразу', stat: 'shooting', outcomes: {
        goal: 'Удар точно в дальний угол — ГОЛ!',
        chance: 'Удар отбит вратарём на угловой.',
        lost: 'Удар заблокирован защитником.',
      }},
      { label: 'Обыграть последнего защитника', stat: 'dribbling', outcomes: {
        goal: 'Финт — и ты один на один с пустыми воротами. ГОЛ!',
        chance: 'Обыграл, но угол сузился — вратарь спасает.',
        lost: 'Защитник выбивает мяч в подкате.',
      }},
      { label: 'Откатить назад под удар', stat: 'passing', outcomes: {
        goal: 'Партнёр без помех пробивает в сетку. ГОЛ!',
        chance: 'Партнёр бьёт, но мяч летит рядом со штангой.',
        lost: 'Передачу перехватывают на подступах к штрафной.',
      }},
    ],
  },
  {
    id: 'counter', name: 'Контратака', chain: true, type: 'attacking', group: 'counter', positions: ['WING', 'MID', 'ATT'],
    context: (o) => [
      'Мяч у тебя после отбора — быстрая контратака.',
      `Защита ${o.name} ещё не успела вернуться.`,
      'Один партнёр рванул на свободное пространство справа.',
    ],
    options: [
      { label: 'Рвануть на ворота', stat: 'pace', outcomes: {
        clean: 'Ты на скорости оторвался от защитников и вышел к штрафной.',
        contested: 'Тебя настигают — защитник почти рядом.',
        lost: 'Защитник в подкате выбивает мяч на пределе скорости.',
      }},
      { label: 'Отдать партнёру справа', stat: 'passing', outcomes: {
        clean: 'Точный пас в свободную зону — партнёр на ходу входит в штрафную.',
        contested: 'Пас чуть впереди — партнёру приходится тормозить и терять скорость.',
        lost: 'Защитник перехватывает передачу на скорости.',
      }},
      { label: 'Придержать темп', stat: 'dribbling', outcomes: {
        clean: 'Ты сбавил и сохранил мяч, дождавшись поддержки — атака развивается организованно.',
        contested: 'Замедлился — контратака теряет остроту, но мяч ещё у тебя.',
        lost: 'Пока думал, соперник накрыл сзади.',
      }},
    ],
    stage2Context: {
      clean: (o) => ['Пространство перед штрафной свободно.', `Только один защитник ${o.name} успевает за тобой.`],
      contested: (o) => ['Защита успела вернуться числом.', 'Свободного пространства почти нет.'],
    },
    stage2Options: [
      { label: 'Пробить с ходу', stat: 'shooting', outcomes: {
        goal: 'Удар с лёта в угол — ГОЛ!',
        chance: 'Вратарь тащит мяч на угловой.',
        lost: 'Удар выше ворот.',
      }},
      { label: 'Прокинуть мимо вратаря', stat: 'dribbling', outcomes: {
        goal: 'Дерзкий финт против вратаря — и мяч в пустых воротах! ГОЛ!',
        chance: 'Вратарь в последний момент успевает накрыть мяч.',
        lost: 'Вратарь читает движение и забирает мяч.',
      }},
      { label: 'Отдать на свободного партнёра', stat: 'passing', outcomes: {
        goal: 'Партнёр бьёт в упор — ГОЛ!',
        chance: 'Партнёр не успевает обработать пас как следует.',
        lost: 'Защитник выносит мяч на угловой.',
      }},
    ],
  },
  {
    id: 'one', name: 'Выход один на один', type: 'attacking', group: 'one_on_one', positions: ['ATT', 'WING', 'MID'],
    context: (o) => [
      `Ты вышел один на один с вратарём ${o.name}.`,
      'Защитники позади не успевают.',
      'Вратарь начинает сокращать угол.',
    ],
    options: [
      { label: 'Пробить низом в угол', stat: 'shooting', outcomes: {
        goal: 'Точно низом в угол — ГОЛ!',
        chance: 'Вратарь в броске вытаскивает мяч.',
        lost: 'Удар прямо во вратаря.',
      }},
      { label: 'Обыграть вратаря', stat: 'dribbling', outcomes: {
        goal: 'Финт — вратарь на земле, ворота пустые. ГОЛ!',
        chance: 'Обыграл, но угол бьёт слишком острый — мимо.',
        lost: 'Вратарь успевает выбить мяч в подкате.',
      }},
      { label: 'Прокинуть партнёру', stat: 'passing', outcomes: {
        goal: 'Партнёр замыкает передачу в пустые ворота — ГОЛ!',
        chance: 'Партнёр не успел набежать на передачу.',
        lost: 'Защитник перехватывает передачу.',
      }},
    ],
  },
  {
    id: 'setpiece', name: 'Стандарт', type: 'attacking', group: 'set_piece', positions: ['ATT', 'MID', 'WING'],
    context: (o) => [
      `Штрафной в опасной зоне против ${o.name}.`,
      'Стенка выстроена в девяти метрах.',
      'У тебя есть несколько секунд на решение.',
    ],
    options: [
      { label: 'Пробить самому', stat: 'shooting', outcomes: {
        goal: 'Мяч над стенкой и в девятку — ГОЛ!',
        chance: 'Вратарь тащит мяч на угловой.',
        lost: 'Удар в стенку.',
      }},
      { label: 'Навесить на партнёра', stat: 'passing', outcomes: {
        goal: 'Верховая передача — партнёр замыкает головой. ГОЛ!',
        chance: 'Навес неточный, партнёр не дотягивается.',
        lost: 'Защита выбивает мяч на подборе.',
      }},
      { label: 'Разыграть накоротке', stat: 'dribbling', outcomes: {
        goal: 'Быстрая комбинация вскрывает стенку — ГОЛ!',
        chance: 'Комбинация не задалась, но мяч остаётся у команды.',
        lost: 'Соперник перехватывает розыгрыш.',
      }},
    ],
  },
  {
    id: 'defense', name: 'Защитный эпизод', type: 'defensive', group: 'defensive_episode', positions: ['DEF', 'MID'],
    context: (o) => [
      `${o.name} идёт в атаку на твоей стороне поля.`,
      'Нападающий соперника принимает мяч спиной к воротам.',
      'Партнёры просят подстраховки.',
    ],
    options: [
      { label: 'Жёсткий отбор', stat: 'defending', outcomes: {
        great: 'Чистый подкат — мяч у тебя, атака сорвана.',
        ok: 'Заблокировал удар корпусом — мяч ушёл на угловой.',
        poor: 'Опоздал в подкате. Соперник выходит один на один...',
      }},
      { label: 'Физическая борьба', stat: 'physical', outcomes: {
        great: 'Выиграл единоборство и вынес мяч подальше от штрафной.',
        ok: 'Оттеснил нападающего, но тот успел отдать пас.',
        poor: 'Проиграл борьбу — нападающий соперника врывается в штрафную...',
      }},
      { label: 'Сыграть на опережение', stat: 'pace', outcomes: {
        great: 'Успел на долю секунды раньше и перехватил мяч.',
        ok: 'Помешал приёму, но мяч отскочил сопернику.',
        poor: 'Не успел — соперник выходит один на один...',
      }},
    ],
  },
  {
    id: 'gk_shot', name: 'Удар соперника', type: 'defensive', group: 'defensive_episode', positions: ['GK'],
    context: (o) => [
      `Соперник наносит удар из пределов штрафной.`,
      'Мяч летит низом в угол ворот.',
      'У тебя доли секунды на реакцию.',
    ],
    options: [
      { label: 'Тянуться и парировать', stat: 'defending', outcomes: {
        great: 'Мощный бросок — мяч в руках!',
        ok: 'Отбил на угловой, опасности нет.',
        poor: 'Не дотянулся — мяч летит в сторону сетки...',
      }},
      { label: 'Сыграть на добивание', stat: 'physical', outcomes: {
        great: 'Чётко забрал мяч в руки.',
        ok: 'Отбил перед собой, но подбора нет.',
        poor: 'Мяч выскользнул из рук в опасной близости от линии...',
      }},
      { label: 'Закрыть ближний угол', stat: 'defending', outcomes: {
        great: 'Угадал направление — надёжный сейв!',
        ok: 'Задел мяч кончиками пальцев — угловой.',
        poor: 'Пробили точно в другой угол...',
      }},
    ],
  },
  {
    id: 'gk_oneonone', name: 'Выход один на один', type: 'defensive', group: 'one_on_one', positions: ['GK'],
    context: (o) => [
      `Нападающий ${o.name} вышел один на один с тобой.`,
      'Защитники позади не успевают.',
      'Нужно принять решение до удара.',
    ],
    options: [
      { label: 'Выйти навстречу и сократить угол', stat: 'physical', outcomes: {
        great: 'Идеальный выход — нападающий пробил прямо в тебя!',
        ok: 'Заставил пробить неудобно — мяч рядом со штангой.',
        poor: 'Вышел слишком рано — обыграли по мячу...',
      }},
      { label: 'Остаться на линии и играть по мячу', stat: 'defending', outcomes: {
        great: 'Дождался удара и парировал!',
        ok: 'Отбил, но мяч ушёл на угловой.',
        poor: 'Не угадал направление удара...',
      }},
      { label: 'Сыграть на опережение у мяча', stat: 'pace', outcomes: {
        great: 'Успел первым и забрал мяч в ноги!',
        ok: 'Помешал приёму, мяч отскочил в сторону.',
        poor: 'Не успел — нападающий убежал от тебя...',
      }},
    ],
  },
  {
    id: 'gk_cross', name: 'Навес в штрафную', type: 'defensive', group: 'set_piece', positions: ['GK'],
    context: (o) => [
      `${o.name} навешивает в штрафную с фланга.`,
      'В штрафной несколько игроков в борьбе.',
      'Мяч летит по высокой траектории.',
    ],
    options: [
      { label: 'Выйти и забрать верхом', stat: 'physical', outcomes: {
        great: 'Уверенно забрал мяч на выходе!',
        ok: 'Задел мяч кулаками — угловой.',
        poor: 'Не дотянулся — нападающий бьёт по воротам без помех...',
      }},
      { label: 'Остаться на линии', stat: 'defending', outcomes: {
        great: 'Среагировал на добивание и забрал мяч!',
        ok: 'Мяч отбили партнёры, ситуация под контролем.',
        poor: 'Мяч выскользнул из рук — нападающий добивает...',
      }},
      { label: 'Сыграть на перехвате до удара', stat: 'pace', outcomes: {
        great: 'Перехватил на подступах, угрозы нет!',
        ok: 'Выбил мяч на угловой в последний момент.',
        poor: 'Опоздал на перехват — нападающий бьёт головой в упор...',
      }},
    ],
  },
  {
    id: 'gk_distribution', name: 'Розыгрыш от ворот', type: 'defensive', group: 'counter', positions: ['GK'],
    context: (o) => [
      'Ты забрал мяч после углового.',
      `Оборона ${o.name} ещё не успела перестроиться.`,
      'Есть окно для быстрого начала атаки.',
    ],
    options: [
      { label: 'Начать контратаку длинной передачей', stat: 'passing', outcomes: {
        great: 'Точный длинный пас застаёт защиту врасплох — партнёр вырывается один на один!',
        ok: 'Пас длинный, но неточный — соперник успевает вернуться.',
        poor: 'Пас перехвачен в центре поля — соперник сразу же угрожает твоим воротам...',
      }},
      { label: 'Отдать короткий пас защитнику', stat: 'passing', outcomes: {
        great: 'Надёжно начали атаку с низов, без риска.',
        ok: 'Пас принят, но атака развивается медленно.',
        poor: 'Защитник не готов к передаче — потеря у собственной штрафной...',
      }},
      { label: 'Подержать мяч и успокоить игру', stat: 'physical', outcomes: {
        great: 'Сбил темп сопернику, команда перестроилась.',
        ok: 'Игра успокоилась, но атакующего момента не вышло.',
        poor: 'Затянул с решением — соперник продавил прессингом, мяч потерян у своей штрафной...',
      }},
    ],
  },
  {
    id: 'def_buildup', name: 'Продвижение мяча', type: 'defensive', group: 'counter', positions: ['DEF'],
    context: (o) => [
      'Мяч у тебя после розыгрыша от вратаря.',
      `Прессинг ${o.name} только начинается.`,
      'Есть время принять решение.',
    ],
    options: [
      { label: 'Длинный пас за линию защиты', stat: 'passing', outcomes: {
        great: 'Точный пас разрезал оборону — партнёр вышел на ударную позицию!',
        ok: 'Пас неточный, но команда сохранила владение.',
        poor: 'Перехват в центре поля — соперник сразу контратакует...',
      }},
      { label: 'Короткий розыгрыш через полузащиту', stat: 'dribbling', outcomes: {
        great: 'Чисто прошли прессинг короткими передачами.',
        ok: 'Розыгрыш получился, но атака заглохла.',
        poor: 'Потерял мяч под давлением у своей штрафной...',
      }},
      { label: 'Простой вынос вперёд', stat: 'physical', outcomes: {
        great: 'Вынос точно нашёл партнёра.',
        ok: 'Мяч ушёл в борьбу, 50 на 50.',
        poor: 'Неточный вынос — соперник забирает мяч в опасной зоне...',
      }},
    ],
  },
  {
    id: 'def_aerial', name: 'Верховая борьба', type: 'defensive', group: 'set_piece', positions: ['DEF'],
    context: (o) => [
      `${o.name} навешивает в штрафную с фланга.`,
      'Нападающий готовится к прыжку рядом с тобой.',
      'Мяч летит по высокой траектории.',
    ],
    options: [
      { label: 'Выиграть верховую борьбу', stat: 'physical', outcomes: {
        great: 'Чисто выиграл воздух и вынес мяч!',
        ok: 'Зацепил мяч, ушёл на угловой.',
        poor: 'Проиграл борьбу — нападающий бьёт головой...',
      }},
      { label: 'Сыграть на опережение', stat: 'pace', outcomes: {
        great: 'Успел первым и выбил мяч на угловой.',
        ok: 'Помешал приёму, но мяч отскочил сопернику.',
        poor: 'Не успел к мячу — нападающий бьёт без помех...',
      }},
      { label: 'Играть строго по мячу', stat: 'defending', outcomes: {
        great: 'Точно по мячу — атака сорвана.',
        ok: 'Заблокировал удар корпусом.',
        poor: 'Прыгнул неудачно — фол и опасный штрафной...',
      }},
    ],
  },
  {
    id: 'att_holdup', name: 'Игра корпусом', chain: true, type: 'attacking', group: 'counter', positions: ['ATT'],
    context: (o) => [
      'Мяч летит к тебе, ты спиной к воротам.',
      `Защитник ${o.name} давит вплотную сзади.`,
      'Партнёры поднимаются в атаку.',
    ],
    options: [
      { label: 'Развернуться и пойти в обводку', stat: 'dribbling', outcomes: {
        clean: 'Мгновенный разворот — ты развернулся лицом к воротам!',
        contested: 'Развернулся, но защитник зацепил тебя корпусом.',
        lost: 'Защитник не дал развернуться — мяч потерян.',
      }},
      { label: 'Скинуть мяч партнёру и открыться', stat: 'passing', outcomes: {
        clean: 'Точная скидка на партнёра — атака развивается быстро!',
        contested: 'Скидка получилась неточной, партнёру пришлось подстраиваться.',
        lost: 'Защитник перехватил скидку.',
      }},
      { label: 'Удержать корпусом и дождаться поддержки', stat: 'physical', outcomes: {
        clean: 'Удержал мяч, партнёры подключились к атаке!',
        contested: 'Удержал с трудом — момент почти упущен.',
        lost: 'Защитник вытолкнул тебя от мяча.',
      }},
    ],
    stage2Context: {
      clean: (o) => ['Ты лицом к воротам, партнёры рядом.', `Один защитник ${o.name} ещё возвращается.`],
      contested: (o) => ['Ситуация напряжённая, защита успела перестроиться.', 'Пространства почти нет.'],
    },
    stage2Options: [
      { label: 'Пробить самому', stat: 'shooting', outcomes: {
        goal: 'Удар точно в угол — ГОЛ!',
        chance: 'Вратарь тащит удар на угловой.',
        lost: 'Удар заблокирован.',
      }},
      { label: 'Отдать под удар партнёру', stat: 'passing', outcomes: {
        goal: 'Партнёр не оставляет шансов вратарю — ГОЛ!',
        chance: 'Партнёр бьёт мимо в сложной ситуации.',
        lost: 'Пас перехвачен на подступах к штрафной.',
      }},
      { label: 'Обыграть последнего защитника', stat: 'dribbling', outcomes: {
        goal: 'Финт — и ты один на один с пустыми воротами! ГОЛ!',
        chance: 'Обыграл, но угол сузился — вратарь спасает.',
        lost: 'Защитник выбивает мяч в подкате.',
      }},
    ],
  },
];

// How much each of the 6 stats counts toward OVR, per position group — a CB's defending matters
// far more than his shooting, a striker's shooting matters far more than his defending, etc.
const OVR_WEIGHTS = {
  GK: { pace: 0.5, shooting: 0.2, passing: 1, dribbling: 0.5, physical: 1.3, defending: 1.5 },
  DEF: { pace: 0.8, shooting: 0.3, passing: 0.9, dribbling: 0.6, physical: 1.3, defending: 1.5 },
  MID: { pace: 0.8, shooting: 0.8, passing: 1.4, dribbling: 1.2, physical: 0.9, defending: 0.7 },
  WING: { pace: 1.3, shooting: 1, passing: 0.8, dribbling: 1.4, physical: 0.6, defending: 0.4 },
  ATT: { pace: 1, shooting: 1.5, passing: 0.6, dribbling: 1.1, physical: 0.9, defending: 0.3 },
};
function calcOvr(stats, group) {
  const weights = OVR_WEIGHTS[group] || { pace: 1, shooting: 1, passing: 1, dribbling: 1, physical: 1, defending: 1 };
  let sum = 0, total = 0;
  Object.keys(stats).forEach((k) => { sum += stats[k] * weights[k]; total += weights[k]; });
  return Math.round(sum / total);
}
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

// Gradual growth: progress accumulates 0-100 per stat; only when it overflows 100 does the
// underlying stat itself move by 1 point. This is what keeps OVR from jumping.
function addProgress(stats, progress, key, amount) {
  let p = progress[key] + amount;
  let s = stats[key];
  while (p >= 100) {
    if (s >= 99) { p = 99; break; }
    p -= 100;
    s += 1;
  }
  return { stats: { ...stats, [key]: s }, progress: { ...progress, [key]: Math.max(0, Math.round(p)) } };
}

function generatePlayer(name, surname, age, country, position, profile, difficulty) {
  const stats = {};
  const progress = {};
  Object.keys(position.stats).forEach((k) => {
    const base = position.stats[k] + difficulty.statBias + (profile.statBias[k] || 0);
    stats[k] = clamp(base + Math.floor(Math.random() * 9) - 4, 20, 95);
    progress[k] = Math.floor(Math.random() * 25);
  });
  const potential = clamp(55 + difficulty.potentialBias + Math.floor(Math.random() * 31) - 15, 15, 99);
  const group = positionGroup(position.code);
  return {
    name, surname, age, country: country.name, position: position.code, positionLabel: position.label, positionGroup: group,
    profileKey: profile.key, profileName: profile.name,
    stats, progress, potential,
    ovr: calcOvr(stats, group),
    form: 60, readiness: 85, fatigue: 15,
    careerStats: { goals: 0, assists: 0, apps: 0, ratings: [] },
  };
}

function rollBase(player, opponent, statVal, bonus) {
  const formMod = (player.form - 60) / 8;
  const readinessMod = (player.readiness - 70) / 10;
  const fatiguePenalty = player.fatigue > 85 ? -6 : player.fatigue > 70 ? -4 : player.fatigue > 50 ? -2 : 0;
  return (statVal - opponent.strength) + formMod + readinessMod + fatiguePenalty + (bonus || 0) + (Math.random() * 26 - 13);
}
function resolveAttack(option, player, opponent, bonus) {
  const roll = rollBase(player, opponent, player.stats[option.stat], bonus);
  if (roll > 14) return 'goal';
  if (roll > -6) return 'chance';
  return 'lost';
}
function resolveChainStage1(option, player, opponent) {
  const roll = rollBase(player, opponent, player.stats[option.stat], 0);
  if (roll > 10) return 'clean';
  if (roll > -10) return 'contested';
  return 'lost';
}
function resolveDefense(option, player, opponent) {
  const roll = rollBase(player, opponent, player.stats[option.stat], 0);
  if (roll > 8) return 'great';
  if (roll > -8) return 'ok';
  return 'poor';
}
function rollGoals(strength, oppStrength) {
  const p = clamp(0.32 + (strength - oppStrength) / 90, 0.08, 0.8);
  let g = 0;
  for (let i = 0; i < 3; i++) if (Math.random() < p) g++;
  return g;
}
function ambientLine(opponent) {
  const fn = AMBIENT_EVENTS[Math.floor(Math.random() * AMBIENT_EVENTS.length)];
  return fn(opponent);
}
function getStageData(match) {
  const { currentTemplate, stage, stage1Tier, opponent } = match;
  if (currentTemplate.chain && stage === 2) {
    const key = stage1Tier === 'clean' ? 'clean' : 'contested';
    return { context: currentTemplate.stage2Context[key](opponent), options: currentTemplate.stage2Options };
  }
  return { context: currentTemplate.context(opponent), options: currentTemplate.options };
}
function squadStatus(player) {
  const score = player.ovr * 0.5 + player.form * 0.25 + player.readiness * 0.25 - player.fatigue * 0.15;
  return score > 55 ? 'Основа' : 'Ротация';
}

// ===== UI =====

const OPTION_BTN = (active) => `text-left p-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 ${active ? 'bg-slate-800 border-amber-400' : 'bg-slate-900 border-slate-700'}`;

function StatBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="font-data text-slate-400 w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <span className="font-data text-slate-300 w-6 text-right">{value}</span>
    </div>
  );
}

function CreateWizard({ step, setStep, name, setName, surname, setSurname, age, setAge, country, setCountry, position, setPosition, profile, setProfile, difficulty, setDifficulty, onGenerate }) {
  const canNext =
    step === 1 ? name.trim().length > 0 :
    step === 2 ? true :
    step === 3 ? !!country :
    step === 4 ? !!position :
    step === 5 ? !!profile :
    !!difficulty;

  return (
    <div className="flex-1 flex flex-col p-5 gap-4 min-h-0">
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
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 font-body text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-400">Назад</button>
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
  );
}

function HomeScreen({ player, matchIndex, history, currentDate, prepDaysUsed, onDayAction, onPlay }) {
  const opponent = OPPONENTS[matchIndex];
  const status = squadStatus(player);
  const isMatchDay = prepDaysUsed >= 3;

  return (
    <div className="flex-1 flex flex-col p-5 gap-4">
      <div className="bg-slate-900 border border-amber-400/30 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-amber-400" />
          <p className="font-display text-lg font-semibold">{formatDate(currentDate)}</p>
        </div>
        {isMatchDay ? (
          <p className="font-data text-amber-400 text-sm mt-1 uppercase tracking-wide">Матч сегодня — {opponent.name}</p>
        ) : (
          <p className="font-data text-xs text-slate-400 mt-1">До матча с {opponent.name}: {3 - prepDaysUsed} дн. · Матч {matchIndex + 1} из 5</p>
        )}
      </div>

      <div>
        <h1 className="font-display text-2xl font-semibold">{player.name} {player.surname}</h1>
        <p className="font-data text-xs text-slate-400">{player.positionLabel} · {player.profileName} · {player.age} лет · {player.country}</p>
        <div className="flex gap-2 mt-2">
          <span className="font-data text-xs px-2 py-1 rounded bg-slate-800 text-slate-300">{CLUB_NAME}</span>
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
          {Object.entries(player.stats).map(([k, v]) => (
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

function DayResultScreen({ dayResult, onContinue }) {
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

function Ticker({ log }) {
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

function MatchScreen({ match, onSelectOption, onContinue }) {
  const { opponent, phase, currentTemplate, minute, scoreP, scoreO, log, resolutionText, resolutionTier, chosenLabel } = match;
  const positive = ['goal', 'great', 'clean'];
  const negative = ['poor', 'lost'];
  const tierColor = positive.includes(resolutionTier) ? 'text-emerald-400' : negative.includes(resolutionTier) ? 'text-rose-400' : 'text-amber-400';
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

function PostMatchScreen({ summary, onContinue }) {
  const { opponentName, scoreP, scoreO, minutesPlayed, goals, assists, goodActions, badActions, rating, statChanges, formDelta, fatigueDelta } = summary;
  const resultLabel = scoreP > scoreO ? 'Победа' : scoreP < scoreO ? 'Поражение' : 'Ничья';
  const resultColor = scoreP > scoreO ? 'text-emerald-400' : scoreP < scoreO ? 'text-rose-400' : 'text-slate-300';
  return (
    <div className="flex-1 flex flex-col p-5 gap-4">
      <div className="text-center">
        <p className={`font-data text-xs uppercase tracking-widest ${resultColor}`}>{resultLabel}</p>
        <p className="font-display text-2xl font-bold mt-1">{CLUB_NAME} {scoreP}–{scoreO} {opponentName}</p>
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

function SeasonEndScreen({ player, history, startOvr }) {
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
        {[['Матчи', player.careerStats.apps], ['Голы', player.careerStats.goals], ['Ассисты', player.careerStats.assists], ['Ср. оценка', avgRating]].map(([label, val]) => (
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

export default function FootballPrototype() {
  const [screen, setScreen] = useState('create');
  const [createStep, setCreateStep] = useState(1);
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [age, setAge] = useState(18);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const [player, setPlayer] = useState(null);
  const [startOvr, setStartOvr] = useState(0);
  const [matchIndex, setMatchIndex] = useState(0);
  const [history, setHistory] = useState([]);
  const [match, setMatch] = useState(null);
  const [postMatchSummary, setPostMatchSummary] = useState(null);

  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 7, 1));
  const [prepDaysUsed, setPrepDaysUsed] = useState(0);
  const [consecutiveTraining, setConsecutiveTraining] = useState(0);
  const [dayResult, setDayResult] = useState(null);

  function handleGenerate() {
    const p = generatePlayer(name.trim(), surname.trim(), age, selectedCountry, selectedPosition, selectedProfile, selectedDifficulty);
    setPlayer(p);
    setStartOvr(p.ovr);
    setScreen('home');
  }

  function handleDayAction(actionType) {
    const dateLabel = formatDate(currentDate);
    const fatigueBefore = player.fatigue;
    const readinessBefore = player.readiness;
    let newPlayer = { ...player };
    let statEffect = null;

    if (actionType === 'train') {
      const fatigueMult = player.fatigue > 70 ? 0.5 : player.fatigue > 50 ? 0.75 : 1;
      const potentialFactor = 0.7 + (player.potential / 100) * 0.6;
      const keys = Object.keys(player.stats);
      const profileDef = PROFILES.find((p) => p.key === player.profileKey);
      const pool = (profileDef && Math.random() < 0.6) ? profileDef.favoredStats : keys;
      const k = pool[Math.floor(Math.random() * pool.length)];
      const gain = Math.max(1, Math.round((7 + Math.floor(Math.random() * 5)) * potentialFactor * fatigueMult));
      const progressBefore = player.progress[k];
      const statBefore = player.stats[k];
      const { stats: ns, progress: np } = addProgress(player.stats, player.progress, k, gain);
      const fatigueCost = clamp(12 + consecutiveTraining * 4, 10, 30);
      newPlayer = { ...player, stats: ns, progress: np, ovr: calcOvr(ns, player.positionGroup), fatigue: clamp(player.fatigue + fatigueCost, 0, 100) };
      statEffect = { key: k, label: STAT_LABELS[k], progressBefore, progressAfter: np[k], statBefore, statAfter: ns[k], leveledUp: ns[k] > statBefore };
      setConsecutiveTraining((c) => c + 1);
    } else if (actionType === 'recover') {
      newPlayer = { ...player, fatigue: clamp(player.fatigue - 25, 0, 100), readiness: clamp(player.readiness + 20, 0, 100) };
      setConsecutiveTraining(0);
    } else {
      newPlayer = { ...player, fatigue: clamp(player.fatigue - 10, 0, 100), readiness: clamp(player.readiness + 8, 0, 100) };
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
    const pool = TEMPLATES.filter((t) => t.positions.includes(player.positionGroup));
    const firstTemplate = pool[Math.floor(Math.random() * pool.length)];
    setMatch({
      opponent, slotIdx: 0, usedTemplateIds: [], currentTemplate: firstTemplate, stage: 1, stage1Tier: null,
      minute: 12 + Math.floor(Math.random() * 8), phase: 'moment', chosenLabel: null, resolutionText: null, resolutionTier: null,
      log: ['Матч начался'], scoreP: 0, scoreO: 0, playerGoals: 0, playerAssists: 0, moments: [],
    });
    setScreen('match');
  }

  function handleSelectOption(option) {
    const { currentTemplate, stage, opponent, minute, stage1Tier } = match;
    let tier;
    if (currentTemplate.chain && stage === 1) tier = resolveChainStage1(option, player, opponent);
    else if (currentTemplate.type === 'defensive') tier = resolveDefense(option, player, opponent);
    else {
      const bonus = (currentTemplate.chain && stage === 2 && stage1Tier === 'clean') ? 10 : 0;
      tier = resolveAttack(option, player, opponent, bonus);
    }
    const resolutionText = option.outcomes[tier];

    let logLines = [`${minute}' ${resolutionText}`];
    let dScoreP = 0, dScoreO = 0, dGoals = 0, dAssists = 0;

    if (currentTemplate.type === 'defensive') {
      if (tier === 'poor') {
        if (Math.random() < 0.55) { dScoreO = 1; logLines.push(`${minute}' Гол — ${opponent.name}`); }
        else { logLines.push(`${minute}' Соперник не реализует момент!`); }
      }
    } else if (!(currentTemplate.chain && stage === 1)) {
      if (tier === 'goal') { dScoreP = 1; dGoals = 1; }
      else if (tier === 'chance' && Math.random() < 0.45) {
        dScoreP = 1; dAssists = 1; logLines.push(`${minute}' Гол — партнёр (пас: ${player.name})`);
      }
    }

    setMatch((m) => ({
      ...m, phase: 'resolved', chosenLabel: option.label, resolutionText, resolutionTier: tier,
      stage1Tier: (m.currentTemplate.chain && m.stage === 1) ? tier : m.stage1Tier,
      log: [...m.log, ...logLines],
      scoreP: m.scoreP + dScoreP, scoreO: m.scoreO + dScoreO,
      playerGoals: m.playerGoals + dGoals, playerAssists: m.playerAssists + dAssists,
      moments: [...m.moments, { statKey: option.stat, tier }],
    }));
  }

  function handleContinueAfterMoment() {
    setMatch((m) => {
      const isChainContinuing = m.currentTemplate.chain && m.stage === 1 && m.resolutionTier !== 'lost';
      if (isChainContinuing) {
        return { ...m, stage: 2, phase: 'moment', chosenLabel: null };
      }
      const nextSlot = m.slotIdx + 1;
      if (nextSlot >= 3) {
        const teamExtra = rollGoals(CLUB_BASE_STRENGTH, m.opponent.strength);
        const oppExtra = rollGoals(m.opponent.strength, CLUB_BASE_STRENGTH);
        const extraLog = [];
        for (let i = 0; i < teamExtra; i++) extraLog.push('Гол — партнёр');
        for (let i = 0; i < oppExtra; i++) extraLog.push(`Гол — ${m.opponent.name}`);
        return { ...m, phase: 'fulltime', scoreP: m.scoreP + teamExtra, scoreO: m.scoreO + oppExtra, log: [...m.log, ...extraLog, 'Финальный свисток'] };
      }
      const usedIds = [...m.usedTemplateIds, m.currentTemplate.id];
      const pool = TEMPLATES.filter((t) => t.positions.includes(player.positionGroup));
      const available = pool.filter((t) => !usedIds.includes(t.id));
      const nextTemplate = available[Math.floor(Math.random() * available.length)];
      const minute = [12, 40, 68][nextSlot] + Math.floor(Math.random() * 10);
      const ambientMinute = Math.max(1, minute - 4 - Math.floor(Math.random() * 4));
      return {
        ...m, slotIdx: nextSlot, usedTemplateIds: usedIds, currentTemplate: nextTemplate, stage: 1, stage1Tier: null,
        minute, phase: 'moment', chosenLabel: null, log: [...m.log, `${ambientMinute}' ${ambientLine(m.opponent)}`],
      };
    });
  }

  function handleFinishMatch() {
    const GOOD_TIERS = ['goal', 'chance', 'great', 'ok', 'clean'];
    const BAD_TIERS = ['lost', 'poor'];
    let rating = 6.0;
    let goodActions = 0, badActions = 0;
    let progressGains = {};
    match.moments.forEach((mo) => {
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

    const potentialFactor = 0.7 + (player.potential / 100) * 0.6;
    let statsAcc = { ...player.stats };
    let progressAcc = { ...player.progress };
    const statChanges = [];
    Object.keys(progressGains).forEach((k) => {
      const statBefore = statsAcc[k];
      const progressBefore = progressAcc[k];
      const scaledGain = Math.round(progressGains[k] * potentialFactor);
      const result = addProgress(statsAcc, progressAcc, k, scaledGain);
      statsAcc = result.stats; progressAcc = result.progress;
      statChanges.push({ key: k, label: STAT_LABELS[k], progressBefore, progressAfter: progressAcc[k], statBefore, statAfter: statsAcc[k], leveledUp: statsAcc[k] > statBefore });
    });
    const newOvr = calcOvr(statsAcc, player.positionGroup);
    const newForm = clamp(Math.round(player.form + (rating - 6) * 6), 0, 100);
    const newFatigue = clamp(player.fatigue + 20, 0, 100);
    const newReadiness = clamp(player.readiness - 15, 0, 100);
    const formDelta = newForm - player.form;
    const fatigueDelta = newFatigue - player.fatigue;

    const updatedPlayer = {
      ...player, stats: statsAcc, progress: progressAcc, ovr: newOvr, form: newForm, fatigue: newFatigue, readiness: newReadiness,
      careerStats: {
        goals: player.careerStats.goals + match.playerGoals,
        assists: player.careerStats.assists + match.playerAssists,
        apps: player.careerStats.apps + 1,
        ratings: [...player.careerStats.ratings, rating],
      },
    };
    const minutesPlayed = Math.random() < 0.15 ? 78 + Math.floor(Math.random() * 10) : 90;
    const nextIndex = matchIndex + 1;

    setPlayer(updatedPlayer);
    setHistory((h) => [...h, { opponent: match.opponent.name, scoreP: match.scoreP, scoreO: match.scoreO, rating, goals: match.playerGoals, assists: match.playerAssists }]);
    setPostMatchSummary({
      opponentName: match.opponent.name, scoreP: match.scoreP, scoreO: match.scoreO, minutesPlayed,
      goals: match.playerGoals, assists: match.playerAssists, goodActions, badActions, rating, statChanges, formDelta, fatigueDelta,
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
    if (match.phase === 'resolved') handleContinueAfterMoment();
    else if (match.phase === 'fulltime') handleFinishMatch();
  }
  function handlePostMatchContinue() {
    setScreen(postMatchSummary.nextScreen);
    setPostMatchSummary(null);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex justify-center font-body">
      <style>{FONT_IMPORT}</style>
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
          />
        )}
        {screen === 'home' && player && (
          <HomeScreen player={player} matchIndex={matchIndex} history={history} currentDate={currentDate} prepDaysUsed={prepDaysUsed} onDayAction={handleDayAction} onPlay={handlePlay} />
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
