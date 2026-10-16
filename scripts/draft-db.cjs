#!/usr/bin/env node
// FC Draft Online — builds the 2026/27 player database from Transfermarkt (runs in GitHub Actions):
//  • clubs of 11 leagues and their current squads: Transfermarkt via the open transfermarkt-api service
//  • rating: from the market value with age / position / league corrections (≈ FIFA-like scale 48–93)
//  • Russian names of players and clubs: Wikidata (Transfermarkt player ID P2446, team ID P7223)
// Output: public/draft/db-src.json (reviewed, then shipped as db.json) and public/draft/db-report.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'public/draft');
const UA = 'FCDraftOnline/1.0 (https://github.com/yudzik/football-career-game; squad database build)';
const API = process.env.TM_API || 'https://transfermarkt-api.fly.dev';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ST = {};
async function get(u, opt = {}) {
  for (let i = 0; i < 6; i++) {
    try {
      const r = await fetch(u, { ...opt, headers: { 'User-Agent': UA, 'Accept': 'application/json', ...(opt.headers || {}) }, signal: AbortSignal.timeout(60000) });
      const h = u.split('/')[2]; ST[h] = ST[h] || {}; ST[h][r.status] = (ST[h][r.status] || 0) + 1;
      if (r.status === 429 || r.status >= 500) { await sleep(6000 * (i + 1)); continue }
      if (!r.ok) return null;
      return await r.json();
    } catch (e) { const h = u.split('/')[2]; ST[h] = ST[h] || {}; ST[h].err = (ST[h].err || 0) + 1; await sleep(4000 * (i + 1)) }
  }
  return null;
}
const LEAGUES = [
  ['APL', 'GB1', 'АПЛ', [2026]], ['LL', 'ES1', 'Ла Лига', [2026]], ['SA', 'IT1', 'Серия А', [2026]], ['L1', 'FR1', 'Лига 1', [2026]], ['BL', 'L1', 'Бундеслига', [2026]],
  ['RPL', 'RU1', 'РПЛ', [2026]], ['BPL', 'WER1', 'Чемпионат Беларуси', [2025, 2026]], ['TUR', 'TR1', 'Суперлига Турции', [2026]], ['POR', 'PO1', 'Лига Португалии', [2026]],
  ['NED', 'NL1', 'Эредивизи', [2026]], ['BEL', 'BE1', 'Про Лига Бельгии', [2026]],
];
const POS = { 'Goalkeeper': 'G', 'Centre-Back': 'C', 'Left-Back': 'L', 'Right-Back': 'R', 'Defensive Midfield': 'D', 'Central Midfield': 'M', 'Attacking Midfield': 'A', 'Left Midfield': 'Y', 'Right Midfield': 'Z', 'Left Winger': 'W', 'Right Winger': 'X', 'Centre-Forward': 'S', 'Second Striker': 'A', 'Defender': 'C', 'Midfield': 'M', 'Attack': 'S', 'Sweeper': 'C' };
const SEC = { G: '', C: 'R', L: 'Y', R: 'Z', D: 'M', M: 'D', A: 'M', Y: 'W', Z: 'X', W: 'Y', X: 'Z', S: 'A' };
const NATN = { 'England': 'EN', 'Scotland': 'SC', 'Wales': 'WA', 'Northern Ireland': 'NI', 'Ireland': 'IE', 'Spain': 'ES', 'France': 'FR', 'Germany': 'DE', 'Italy': 'IT', 'Portugal': 'PT', 'Netherlands': 'NL', 'Belgium': 'BE', 'Brazil': 'BR', 'Argentina': 'AR', 'Uruguay': 'UY', 'Colombia': 'CO', 'Chile': 'CL', 'Peru': 'PE', 'Ecuador': 'EC', 'Paraguay': 'PY', 'Venezuela': 'VE', 'Bolivia': 'BO', 'Mexico': 'MX', 'United States': 'US', 'Canada': 'CA', 'Costa Rica': 'CR', 'Jamaica': 'JM', 'Honduras': 'HN', 'Panama': 'PA', 'Haiti': 'HT', 'Curacao': 'CW', 'Suriname': 'SR', 'Trinidad and Tobago': 'TT', 'Croatia': 'HR', 'Serbia': 'RS', 'Slovenia': 'SI', 'Bosnia-Herzegovina': 'BA', 'Montenegro': 'ME', 'North Macedonia': 'MK', 'Albania': 'AL', 'Kosovo': 'XK', 'Greece': 'GR', 'Türkiye': 'TR', 'Turkey': 'TR', 'Cyprus': 'CY', 'Bulgaria': 'BG', 'Romania': 'RO', 'Hungary': 'HU', 'Slovakia': 'SK', 'Czech Republic': 'CZ', 'Czechia': 'CZ', 'Poland': 'PL', 'Austria': 'AT', 'Switzerland': 'CH', 'Denmark': 'DK', 'Norway': 'NO', 'Sweden': 'SE', 'Finland': 'FI', 'Iceland': 'IS', 'Estonia': 'EE', 'Latvia': 'LV', 'Lithuania': 'LT', 'Ukraine': 'UA', 'Belarus': 'BY', 'Russia': 'RU', 'Moldova': 'MD', 'Georgia': 'GE', 'Armenia': 'AM', 'Azerbaijan': 'AZ', 'Kazakhstan': 'KZ', 'Uzbekistan': 'UZ', 'Tajikistan': 'TJ', 'Kyrgyzstan': 'KG', 'Turkmenistan': 'TM', 'Israel': 'IL', 'Luxembourg': 'LU', 'Malta': 'MT', 'Andorra': 'AD', 'Faroe Islands': 'FO', 'Liechtenstein': 'LI', 'Gibraltar': 'GI',
  'Morocco': 'MA', 'Algeria': 'DZ', 'Tunisia': 'TN', 'Egypt': 'EG', 'Libya': 'LY', 'Senegal': 'SN', "Cote d'Ivoire": 'CI', 'Ivory Coast': 'CI', 'Ghana': 'GH', 'Nigeria': 'NG', 'Cameroon': 'CM', 'Mali': 'ML', 'Burkina Faso': 'BF', 'Guinea': 'GN', 'Guinea-Bissau': 'GW', 'The Gambia': 'GM', 'Gambia': 'GM', 'Togo': 'TG', 'Benin': 'BJ', 'Niger': 'NE', 'DR Congo': 'CD', 'Congo': 'CG', 'Gabon': 'GA', 'Equatorial Guinea': 'GQ', 'Cape Verde': 'CV', 'Angola': 'AO', 'Mozambique': 'MZ', 'Zambia': 'ZM', 'Zimbabwe': 'ZW', 'South Africa': 'ZA', 'Kenya': 'KE', 'Tanzania': 'TZ', 'Uganda': 'UG', 'Ethiopia': 'ET', 'Sudan': 'SD', 'Madagascar': 'MG', 'Comoros': 'KM', 'Mauritania': 'MR', 'Sierra Leone': 'SL', 'Liberia': 'LR', 'Burundi': 'BI', 'Rwanda': 'RW', 'Central African Republic': 'CF', 'Chad': 'TD',
  'Japan': 'JP', 'Korea, South': 'KR', 'South Korea': 'KR', 'Korea, North': 'KP', 'China': 'CN', 'Australia': 'AU', 'New Zealand': 'NZ', 'Iran': 'IR', 'Iraq': 'IQ', 'Saudi Arabia': 'SA', 'United Arab Emirates': 'AE', 'Qatar': 'QA', 'Syria': 'SY', 'Jordan': 'JO', 'Lebanon': 'LB', 'Palestine': 'PS', 'Indonesia': 'ID', 'Thailand': 'TH', 'Vietnam': 'VN', 'Philippines': 'PH', 'Malaysia': 'MY', 'India': 'IN', 'Oman': 'OM', 'Bahrain': 'BH', 'Kuwait': 'KW',
  'Guadeloupe': 'GP', 'Martinique': 'MQ', 'French Guiana': 'GF', 'New Caledonia': 'NC', 'Reunion': 'RE', 'Dominican Republic': 'DO', 'Cuba': 'CU', 'El Salvador': 'SV', 'Guatemala': 'GT', 'Nicaragua': 'NI', 'Grenada': 'GD', 'Bermuda': 'BM', 'Aruba': 'AW', 'Montserrat': 'MS', 'Guyana': 'GY', 'Mauritius': 'MU', 'Eritrea': 'ER', 'South Sudan': 'SS', 'Namibia': 'NA', 'Botswana': 'BW', 'Malawi': 'MW', 'Lesotho': 'LS', 'Eswatini': 'SZ', 'Somalia': 'SO', 'Djibouti': 'DJ', 'Seychelles': 'SC', 'Hong Kong': 'HK', 'Singapore': 'SG', 'Mongolia': 'MN', 'Afghanistan': 'AF', 'Pakistan': 'PK', 'Bangladesh': 'BD', 'Sri Lanka': 'LK', 'Nepal': 'NP', 'Yemen': 'YE', 'Taiwan': 'TW', 'Chinese Taipei': 'TW', 'San Marino': 'SM' };
const natOf = a => { for (const n of (a || [])) { if (NATN[n]) return NATN[n] } return 'XX' };
// market value -> rating (log scale), then age / position / league corrections
const MV = [[2.5e4, 50], [5e4, 54], [1e5, 57], [2.5e5, 61], [5e5, 64], [1e6, 67], [2e6, 70], [4e6, 73], [8e6, 77], [1.5e7, 80], [2.5e7, 83], [4e7, 85], [6e7, 87], [9e7, 89], [1.3e8, 91], [2e8, 93]];
const mvBase = v => { if (!v || v <= MV[0][0]) return MV[0][1] - 2; for (let i = 1; i < MV.length; i++) if (v <= MV[i][0]) { const [a, x] = MV[i - 1], [b, y] = MV[i], t = (Math.log(v) - Math.log(a)) / (Math.log(b) - Math.log(a)); return x + (y - x) * t } return 93 };
const AGEF = a => a <= 18 ? -4 : a == 19 ? -3 : a == 20 ? -2 : a <= 22 ? -1 : a <= 29 ? 0 : a <= 31 ? 1 : a <= 33 ? 2 : 3;
const LGF = { RPL: 2, BPL: 2, TUR: 0, POR: 0, NED: 0, BEL: 0 };
const ratingOf = (v, age, pos, lg) => Math.max(50, Math.min(94, Math.round(mvBase(v) + AGEF(age) + (pos == 'G' ? 2 : 0) + (LGF[lg] || 0))));
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();

async function sparqlLabels(prop, ids) { // Transfermarkt id -> {ru, en}
  const out = {};
  for (let i = 0; i < ids.length; i += 250) {
    const vals = ids.slice(i, i + 250).map(x => `"${x}"`).join(' ');
    const q = `SELECT ?tm ?ru ?en WHERE { VALUES ?tm { ${vals} } ?item wdt:${prop} ?tm . OPTIONAL { ?item rdfs:label ?ru FILTER(LANG(?ru)="ru") } OPTIONAL { ?item rdfs:label ?en FILTER(LANG(?en)="en") } }`;
    const j = await get('https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(q), { headers: { 'Accept': 'application/sparql-results+json' } });
    ((j || {}).results || {}).bindings && j.results.bindings.forEach(b => { const k = b.tm.value; out[k] = out[k] || {}; if (b.ru) out[k].ru = b.ru.value; if (b.en) out[k].en = b.en.value });
    await sleep(1200);
  }
  return out;
}
// short Russian name from the full label, guided by the Transfermarkt name: «Габриэл Магальяйнс» + «Gabriel» -> «Габриэл»; «Вирджил ван Дейк» -> «ван Дейк»
function ruShort(ru, tm) { if (!ru || /[A-Za-z]/.test(ru)) return null; ru = ru.replace(/\s*\([^)]*\)\s*$/, '').trim(); if (ru.includes(',')) return ru.split(',')[0].trim(); const w = ru.split(/\s+/), k = String(tm || '').trim().split(/\s+/).length; if (w.length == 1) return ru; if (k == 1) return w[0]; return w.slice(-Math.max(1, k - 1)).join(' ') }

(async () => {
  const T0 = Date.now(), rep = { leagues: {}, http: ST, api: API };
  const clubs = [];
  for (const [lg, code, ru, seasons] of LEAGUES) {
    let L = null; for (const s of seasons) { const j = await get(`${API}/competitions/${code}/clubs?season_id=${s}`); if (j && j.clubs && j.clubs.length) { L = j.clubs; rep.leagues[lg] = { season: s, n: L.length }; break } await sleep(800) }
    if (!L) { rep.leagues[lg] = { error: 'no clubs' }; continue }
    L.forEach(c => clubs.push({ id: String(c.id), name: c.name, lg }));
    rep.leagues[lg].clubs = L.map(c => c.name); await sleep(800);
  }
  const CF = process.env.TM_CACHE || '', cache = CF && fs.existsSync(CF) ? JSON.parse(fs.readFileSync(CF, 'utf8')) : {};
  const good = j => j && j.players && j.players.length >= 15 && j.players.filter(p => p.marketValue).length >= j.players.length * .6;
  const fresh = j => j && j._t && Date.now() - j._t < 3 * 864e5;   // a squad fetched in the last 3 days is reused
  for (let pass = 0; pass < 4; pass++) {
    const todo = clubs.filter(c => !(good(cache[c.id]) && fresh(cache[c.id])) && !(pass && good(cache[c.id])));
    if (!todo.length) break; rep['pass' + pass] = todo.length;
    for (const c of todo) { const j = await get(`${API}/clubs/${c.id}/players`); if (j && j.players && (good(j) || !good(cache[c.id]))) cache[c.id] = { ...j, _t: Date.now() }; await sleep(2500 + pass * 1500) }
    if (clubs.every(c => good(cache[c.id]))) break; await sleep(45000);
  }
  if (CF) fs.writeFileSync(path.join(OUT, 'tm-cache.json'), JSON.stringify(cache));
  const players = [];
  for (const c of clubs) { const j = cache[c.id]; if (!j || !j.players) { c.err = 'no squad'; continue } c.n = j.players.length; c.upd = j.updatedAt; c.mvShare = +(j.players.filter(p => p.marketValue).length / (j.players.length || 1)).toFixed(2);
    j.players.forEach(p => players.push({ id: String(p.id), name: p.name, img: p.imageUrl || null, pos: p.position, no: p.shirtNumber, dob: p.dateOfBirth, age: p.age, nat: p.nationality, mv: p.marketValue || 0, club: c })) }
  rep.noMV = clubs.filter(c => c.mvShare < .6).map(c => c.name);
  rep.clubs = clubs.length; rep.clubErr = clubs.filter(c => c.err).map(c => c.name); rep.playersRaw = players.length;
  const PL = await sparqlLabels('P2446', [...new Set(players.map(p => p.id))]), CL = await sparqlLabels('P7223', clubs.map(c => c.id));
  const seen = new Set(), out = [];
  players.forEach(p => { if (seen.has(p.id)) return; seen.add(p.id);
    const pos = POS[p.pos] || 'M', age = p.age || (p.dob ? 2026 - +p.dob.slice(0, 4) : 25), o = ratingOf(p.mv, age, pos, p.club.lg), w = PL[p.id] || {};
    out.push({ tm: p.id, e: p.name, r: ruShort(w.ru, p.name) || p.name, rf: w.ru && !/[A-Za-z]/.test(w.ru) ? w.ru : null, c: p.club.id, lg: p.club.lg, nat: natOf(p.nat), nat2: p.nat && p.nat[1] ? natOf([p.nat[1]]) : null, o, p: pos, s: SEC[pos], age, mv: p.mv, img: p.img }) });
  const db = { v: Date.now(), season: '2026/27', src: 'Transfermarkt', leagues: Object.fromEntries(LEAGUES.map(l => [l[0], l[2]])),
    clubs: clubs.filter(c => !c.err).map(c => ({ id: c.id, e: c.name, r: (CL[c.id] && CL[c.id].ru || c.name).replace(/\s*\([^)]*\)\s*$/, '').replace(/^(ФК|ПФК|Футбольный клуб)\s+/, ''), lg: c.lg, img: `https://tmssl.akamaized.net/images/wappen/head/${c.id}.png` })), players: out };
  rep.players = out.length; rep.ruNames = out.filter(x => x.rf).length; rep.minutes = +((Date.now() - T0) / 60000).toFixed(1);
  rep.byLeague = {}; LEAGUES.forEach(([lg]) => { const L = out.filter(x => x.lg == lg).sort((a, b) => b.o - a.o); rep.byLeague[lg] = { players: L.length, avg: +(L.reduce((s, x) => s + x.o, 0) / (L.length || 1)).toFixed(1), top: L.slice(0, 6).map(x => `${x.r} ${x.o} (${db.clubs.find(c => c.id == x.c).r}, ${x.age}, €${(x.mv / 1e6).toFixed(1)}m)`), low: L.slice(-3).map(x => `${x.r} ${x.o}`) } });
  rep.clubsDetail = clubs.map(c => ({ lg: c.lg, e: c.name, r: (CL[c.id] || {}).ru, n: c.n || 0, mv: c.mvShare, upd: c.upd, err: c.err }));
  fs.writeFileSync(path.join(OUT, 'db-src.json'), JSON.stringify(db));
  fs.writeFileSync(path.join(OUT, 'db-report.json'), JSON.stringify(rep, null, 1));
  console.log(JSON.stringify({ clubs: rep.clubs, players: rep.players, ru: rep.ruNames, minutes: rep.minutes, errs: rep.clubErr.length }));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
