#!/usr/bin/env node
// FC Draft Online — builds the 2026/27 player database from live sources (runs in GitHub Actions):
//  • clubs of 11 leagues: the «Teams» section of each 2026–27 season article on English Wikipedia
//  • squads: the «Current squad» template ({{Fs player}}) of every club article
//  • age / position: Wikidata (P569, P413); Russian names: ru.wikipedia language links
//  • ratings: EA SPORTS FC ratings database where the player is found, otherwise an estimate from the club level
// Output: public/draft/db.json (+ archived copy public/draft/db/<v>.json) and public/draft/db-report.json
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'public/draft');
const UA = 'FCDraftOnline/1.0 (https://github.com/yudzik/football-career-game; squad database build)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const ST = {};
async function get(u, json = true) {
  for (let i = 0; i < 5; i++) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json' }, signal: AbortSignal.timeout(40000) });
      const h = u.split('/')[2]; ST[h] = ST[h] || {}; ST[h][r.status] = (ST[h][r.status] || 0) + 1;
      if (r.status === 429 || r.status >= 500) { await sleep(8000 * (i + 1)); continue }
      if (!r.ok) return null;
      return json ? await r.json() : await r.text();
    } catch (e) { await sleep(3000 * (i + 1)) }
  }
  return null;
}
const WP = 'https://en.wikipedia.org/w/api.php?format=json&formatversion=2&';
const enc = encodeURIComponent;

const LEAGUES = [
  ['APL', '2026–27 Premier League', 'АПЛ', 20],
  ['LL', '2026–27 La Liga', 'Ла Лига', 20],
  ['SA', '2026–27 Serie A', 'Серия А', 20],
  ['L1', '2026–27 Ligue 1', 'Лига 1', 18],
  ['BL', '2026–27 Bundesliga', 'Бундеслига', 18],
  ['RPL', '2026–27 Russian Premier League', 'РПЛ', 16],
  ['BPL', '2026 Belarusian Premier League', 'Чемпионат Беларуси', 16],
  ['TUR', '2026–27 Süper Lig', 'Суперлига Турции', 18],
  ['POR', '2026–27 Primeira Liga', 'Лига Португалии', 18],
  ['NED', '2026–27 Eredivisie', 'Эредивизи', 18],
  ['BEL', '2026–27 Belgian Pro League', 'Про Лига Бельгии', 16],
];
// club level for leagues without EA ratings (and as a fallback): rating of a typical starter
const LBASE = { APL: 77, LL: 75, SA: 75, BL: 75, L1: 73, POR: 71, TUR: 71, NED: 70, BEL: 69, RPL: 69, BPL: 61 };
const CBASE = { // RPL / Belarus by club (English article title fragments)
  'Zenit': 76, 'Krasnodar': 75, 'Spartak Moscow': 74, 'Lokomotiv Moscow': 73, 'CSKA Moscow': 73, 'Dynamo Moscow': 73, 'Rubin': 70, 'Rostov': 70,
  'Akhmat': 69, 'Krylia Sovetov': 69, 'Baltika': 69, 'Orenburg': 68, 'Dynamo Makhachkala': 68, 'Akron': 67, 'Rodina': 67, 'Fakel': 67, 'Pari Nizhny': 67, 'Sochi': 67,
  'Dinamo Minsk': 64, 'BATE': 62, 'Shakhtyor Soligorsk': 63, 'Neman': 62, 'Dynamo Brest': 62, 'Torpedo-BelAZ': 61, 'Isloch': 60, 'Slavia Mozyr': 60, 'Gomel': 60, 'Dnepr': 58, 'Vitebsk': 59,
};

// FIFA / Wikipedia country codes -> two-letter flag codes used by the game (EN/SC/WA/NI for the home nations)
const NAT = { ENG: 'EN', SCO: 'SC', WAL: 'WA', NIR: 'NI', IRL: 'IE', ESP: 'ES', FRA: 'FR', GER: 'DE', ITA: 'IT', POR: 'PT', NED: 'NL', BEL: 'BE', BRA: 'BR', ARG: 'AR', URU: 'UY', COL: 'CO', CHI: 'CL', PER: 'PE', ECU: 'EC', PAR: 'PY', VEN: 'VE', BOL: 'BO', MEX: 'MX', USA: 'US', CAN: 'CA', CRC: 'CR', JAM: 'JM', HON: 'HN', PAN: 'PA', HAI: 'HT', CUW: 'CW', SUR: 'SR', TRI: 'TT',
  CRO: 'HR', SRB: 'RS', SVN: 'SI', BIH: 'BA', MNE: 'ME', MKD: 'MK', ALB: 'AL', KOS: 'XK', GRE: 'GR', TUR: 'TR', CYP: 'CY', BUL: 'BG', ROU: 'RO', HUN: 'HU', SVK: 'SK', CZE: 'CZ', POL: 'PL', AUT: 'AT', SUI: 'CH', DEN: 'DK', NOR: 'NO', SWE: 'SE', FIN: 'FI', ISL: 'IS', EST: 'EE', LVA: 'LV', LTU: 'LT',
  UKR: 'UA', BLR: 'BY', RUS: 'RU', MDA: 'MD', GEO: 'GE', ARM: 'AM', AZE: 'AZ', KAZ: 'KZ', UZB: 'UZ', TJK: 'TJ', KGZ: 'KG', TKM: 'TM', ISR: 'IL', LUX: 'LU', MLT: 'MT', AND: 'AD', FRO: 'FO', LIE: 'LI', SMR: 'SM', GIB: 'GI',
  MAR: 'MA', ALG: 'DZ', TUN: 'TN', EGY: 'EG', LBY: 'LY', SEN: 'SN', CIV: 'CI', GHA: 'GH', NGA: 'NG', CMR: 'CM', MLI: 'ML', BFA: 'BF', GUI: 'GN', GNB: 'GW', GAM: 'GM', TOG: 'TG', BEN: 'BJ', NIG: 'NE', COD: 'CD', CGO: 'CG', GAB: 'GA', EQG: 'GQ', CPV: 'CV', ANG: 'AO', MOZ: 'MZ', ZAM: 'ZM', ZIM: 'ZW',
  RSA: 'ZA', KEN: 'KE', TAN: 'TZ', UGA: 'UG', ETH: 'ET', SDN: 'SD', MAD: 'MG', COM: 'KM', MTN: 'MR', SLE: 'SL', LBR: 'LR', BDI: 'BI', RWA: 'RW', CTA: 'CF', CHA: 'TD',
  JPN: 'JP', KOR: 'KR', PRK: 'KP', CHN: 'CN', AUS: 'AU', NZL: 'NZ', IRN: 'IR', IRQ: 'IQ', KSA: 'SA', UAE: 'AE', QAT: 'QA', SYR: 'SY', JOR: 'JO', LBN: 'LB', PLE: 'PS', IDN: 'ID', THA: 'TH', VIE: 'VN', PHI: 'PH', MAS: 'MY', IND: 'IN', OMA: 'OM', BHR: 'BH', KUW: 'KW',
  GLP: 'GP', MTQ: 'MQ', GUF: 'GF', NCL: 'NC', REU: 'RE', DOM: 'DO', CUB: 'CU', SLV: 'SV', GUA: 'GT', NCA: 'NI', GRN: 'GD', ATG: 'AG', SKN: 'KN', BER: 'BM', ARU: 'AW', MSR: 'MS', GUY: 'GY' };
const natOf = c => NAT[(c || '').toUpperCase()] || ((c || '').length === 2 ? c.toUpperCase() : 'XX');

// template parsing helpers
function splitTop(s) { const out = []; let d = 0, cur = ''; for (let i = 0; i < s.length; i++) { const c = s[i], n = s[i + 1]; if ((c == '[' && n == '[') || (c == '{' && n == '{')) { d++; cur += c + n; i++; continue } if ((c == ']' && n == ']') || (c == '}' && n == '}')) { d--; cur += c + n; i++; continue } if (c == '|' && d == 0) { out.push(cur); cur = ''; continue } cur += c } out.push(cur); return out }
function tmplArgs(t) { const a = {}; splitTop(t).slice(1).forEach(x => { const k = x.indexOf('='); if (k > 0) a[x.slice(0, k).trim().toLowerCase()] = x.slice(k + 1).trim() }); return a }
function findTemplates(text, names) { const out = [], re = new RegExp('\\{\\{\\s*(' + names.join('|') + ')\\s*\\|', 'gi'); let m; while ((m = re.exec(text))) { let d = 0, i = m.index; for (; i < text.length; i++) { if (text[i] == '{' && text[i + 1] == '{') { d++; i++ } else if (text[i] == '}' && text[i + 1] == '}') { d--; i++; if (!d) break } } out.push({ at: m.index, body: text.slice(m.index + 2, i - 1) }) } return out }
const link = s => { const m = (s || '').match(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]+))?\]\]/); return m ? { t: m[1].trim(), d: (m[2] || m[1]).replace(/\s*\([^)]*\)\s*$/, '').trim() } : { t: null, d: (s || '').replace(/<[^>]+>|'''?|\{\{[^}]*\}\}/g, '').trim() } };
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[ßø]/g, x => x == 'ß' ? 'ss' : 'o').replace(/[đ]/g, 'd').replace(/[ł]/g, 'l').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
const hash = s => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619) } return h >>> 0 };

async function pagesContent(titles) { // title -> {title (resolved), text}
  const out = {};
  for (let i = 0; i < titles.length; i += 8) {
    const ch = titles.slice(i, i + 8), j = await get(WP + 'action=query&prop=revisions&rvprop=content&rvslots=main&redirects=1&titles=' + enc(ch.join('|')));
    if (!j) continue; const q = j.query || {}, mp = {};
    [...(q.normalized || []), ...(q.redirects || [])].forEach(x => mp[x.from] = x.to);
    const pg = {}; (q.pages || []).forEach(p => { if (p.revisions) pg[p.title] = p.revisions[0].slots.main.content });
    ch.forEach(t => { let x = t; x = mp[x] || x; x = mp[x] || x; if (pg[x]) out[t] = { title: x, text: pg[x] } });
    await sleep(300);
  }
  return out;
}
async function pagesInfo(titles) { // title -> {title, qid, img, ru, desc}
  const out = {};
  for (let i = 0; i < titles.length; i += 50) {
    const ch = titles.slice(i, i + 50); let cont = {}, base = WP + 'action=query&redirects=1&prop=pageprops|pageimages|langlinks|description&ppprop=wikibase_item&piprop=thumbnail&pithumbsize=240&pilicense=any&pilimit=50&lllang=ru&lllimit=max&titles=' + enc(ch.join('|'));
    const mp = {}, pg = {};
    for (let g = 0; g < 20; g++) {
      const j = await get(base + Object.entries(cont).map(([k, v]) => '&' + k + '=' + enc(v)).join('')); if (!j) break; const q = j.query || {};
      [...(q.normalized || []), ...(q.redirects || [])].forEach(x => mp[x.from] = x.to);
      (q.pages || []).forEach(p => { const o = pg[p.title] = pg[p.title] || { title: p.title }; if (p.pageprops && p.pageprops.wikibase_item) o.qid = p.pageprops.wikibase_item; if (p.thumbnail) o.img = p.thumbnail.source; if (p.langlinks && p.langlinks.length) o.ru = p.langlinks[0].title; if (p.description) o.desc = p.description; if (p.missing) o.missing = 1 });
      if (!j.continue) break; cont = j.continue; await sleep(200);
    }
    ch.forEach(t => { let x = t; x = mp[x] || x; x = mp[x] || x; if (pg[x]) out[t] = pg[x] });
    await sleep(300);
  }
  return out;
}
async function wikidata(qids) { // qid -> {born: year+month, pos: [qid]}
  const out = {};
  for (let i = 0; i < qids.length; i += 50) {
    const j = await get('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=' + qids.slice(i, i + 50).join('|')); if (!j) continue;
    Object.entries(j.entities || {}).forEach(([q, e]) => { const c = e.claims || {}, b = ((((c.P569 || [])[0] || {}).mainsnak || {}).datavalue || {}).value; const pos = (c.P413 || []).map(x => (((x.mainsnak || {}).datavalue || {}).value || {}).id).filter(Boolean);
      const m = b && String(b.time).match(/^\+(\d{4})-(\d{2})/); out[q] = { by: m ? +m[1] : null, bm: m ? +m[2] : null, pos } });
    await sleep(250);
  }
  return out;
}
async function labels(qids) { const out = {}; for (let i = 0; i < qids.length; i += 50) { const j = await get('https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=en&ids=' + qids.slice(i, i + 50).join('|')); Object.entries((j || {}).entities || {}).forEach(([q, e]) => out[q] = ((e.labels || {}).en || {}).value || '') } return out }
const POSL = [[/goalkeeper/, 'G'], [/left[- ]back|left wing[- ]back|left full/, 'L'], [/right[- ]back|right wing[- ]back|right full/, 'R'], [/centre[- ]back|center[- ]back|central defender|sweeper/, 'C'], [/defensive midfield/, 'D'], [/attacking midfield|playmaker|second striker/, 'A'], [/left winger|left midfield/, 'W'], [/right winger|right midfield/, 'X'], [/winger|wide midfield/, 'W'], [/centre[- ]forward|center[- ]forward|striker|forward/, 'S'], [/central midfield|midfielder|box-to-box/, 'M'], [/full[- ]back|wing[- ]back/, 'L'], [/defender/, 'C']];
const EAPOS = { GK: 'G', CB: 'C', LB: 'L', RB: 'R', LWB: 'L', RWB: 'R', CDM: 'D', CM: 'M', CAM: 'A', LM: 'Y', RM: 'Z', LW: 'W', RW: 'X', ST: 'S', CF: 'S' };

(async () => {
  const T0 = Date.now(), rep = { leagues: {}, http: ST };
  // ---- 1. EA ratings database (for ratings, exact positions and birth dates)
  const EA = []; for (let off = 0; off < 30000; off += 100) { const j = await get(`https://drop-api.ea.com/rating/ea-sports-fc?locale=en&limit=100&offset=${off}`); if (!j || !j.items || !j.items.length) break; j.items.forEach(x => EA.push({ n: norm(x.commonName || (x.firstName + ' ' + x.lastName)), f: norm(x.firstName + ' ' + x.lastName), l: norm(x.lastName), o: x.overallRating, p: (x.position || {}).shortLabel, s: ((x.alternatePositions || [])[0] || {}).shortLabel, by: +((x.birthdate || '').match(/(\d{4})/) || [])[1] || null, team: norm((x.team || {}).label) })); if (off / 100 >= (j.totalItems || 0) / 100) break; await sleep(150) }
  rep.ea = EA.length;
  const byName = new Map(), byLast = new Map(); EA.forEach(e => { [e.n, e.f].forEach(k => { if (!byName.has(k)) byName.set(k, []); byName.get(k).push(e) }); if (!byLast.has(e.l)) byLast.set(e.l, []); byLast.get(e.l).push(e) });
  const eaFind = (display, title, by) => { const ks = [norm(display), norm(title.replace(/\s*\(.*\)$/, ''))]; for (const k of ks) { const L = byName.get(k); if (L) { const x = by ? L.filter(e => !e.by || Math.abs(e.by - by) <= 1) : L; if (x.length) return x.sort((a, b) => b.o - a.o)[0] } }
    if (by) { const parts = ks[1].split(' '), last = parts[parts.length - 1], L = (byLast.get(last) || []).filter(e => e.by && Math.abs(e.by - by) <= 0 && (e.f.includes(parts[0]) || e.n.includes(parts[0]))); if (L.length == 1) return L[0] } return null };

  // ---- 2. clubs of every league
  const leaguePages = await pagesContent(LEAGUES.map(l => l[1]));
  const clubsAll = []; // {lg, title, short}
  for (const [lg, page, ru, N] of LEAGUES) {
    const P = leaguePages[page]; if (!P) { rep.leagues[lg] = { error: 'no page ' + page }; continue }
    const w = P.text, s0 = w.search(/\n==\s*(Teams|Clubs|Participating teams|Team changes)\s*==/i), e0 = s0 >= 0 ? w.slice(s0 + 1).search(/\n==[^=]/) : -1, sec = s0 < 0 ? w : e0 >= 0 ? w.slice(s0, s0 + 1 + e0) : w.slice(s0);
    const cnt = new Map(), short = {};
    sec.split('\n').filter(l => /^\s*[|!]/.test(l) || /Location map~/.test(l)).forEach(l => { const re = /\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g; let m; while ((m = re.exec(l))) { const t = m[1].trim(); if (/^(File|Image|Category):/i.test(t)) continue; cnt.set(t, (cnt.get(t) || 0) + 1); if (!short[t]) short[t] = (m[2] || m[1]).replace(/<[^>]+>/g, ' ').trim() } });
    const cands = [...cnt.keys()], info = await pagesInfo(cands);
    const isClub = i => i && /football club|association football club|soccer club|football team|sports club|multi-sports club|sports society/i.test(i.desc || '') && !/stadium|league|season|national team|women/i.test(i.desc || '');
    const clubs = cands.filter(t => isClub(info[t])).sort((a, b) => cnt.get(b) - cnt.get(a)).slice(0, N);
    const seen = new Set(); const L = []; clubs.forEach(t => { const r = info[t].title; if (seen.has(r)) return; seen.add(r); L.push({ lg, title: r, short: short[t], ru: info[t].ru, img: info[t].img }) });
    rep.leagues[lg] = { page: P.title, found: L.length, want: N, clubs: L.map(c => c.short) };
    clubsAll.push(...L);
  }
  // ---- 3. squads
  const clubPages = await pagesContent(clubsAll.map(c => c.title));
  const players = [];
  for (const c of clubsAll) {
    const P = clubPages[c.title]; if (!P) { c.err = 'no page'; continue }
    const w = P.text, heads = [...w.matchAll(/\n(={2,4})\s*([^=\n]+?)\s*\1/g)].map(m => ({ at: m.index, t: m[2] }));
    const bad = /loan|reserve|youth|academy|former|notable|retired|women|ladies|under|u-?\d\d|\bii\b|\bb\b|-2|second team|development|records|staff|management/i;
    const fsStarts = [...w.matchAll(/\{\{\s*(Fs start|football squad start)/gi)].map(m => m.index);
    let start = null; for (const s of fsStarts) { const h = heads.filter(x => x.at < s).pop(); if (!h || !bad.test(h.t)) { start = s; break } }
    if (start == null) { c.err = 'no squad'; continue }
    const end = w.slice(start).search(/\{\{\s*(Fs end|football squad end)/i), block = w.slice(start, end > 0 ? start + end : start + 20000);
    const T = findTemplates(block, ['Fs player', 'football squad player', 'Fs player2']);
    T.forEach(x => { const a = tmplArgs(x.body), L = link(a.name || ''); if (!L.d) return; players.push({ club: c, title: L.t, d: L.d, nat: natOf(a.nat), fp: (a.pos || '').toUpperCase(), no: a.no || '' }) });
    c.n = T.length;
  }
  rep.clubs = clubsAll.length; rep.players = players.length; rep.clubErr = clubsAll.filter(c => c.err).map(c => c.title + ': ' + c.err);
  // ---- 4. player pages: Wikidata id, photo, Russian name; Wikidata: birth date, positions
  const titles = [...new Set(players.filter(p => p.title).map(p => p.title))], PI = await pagesInfo(titles);
  const qids = [...new Set(Object.values(PI).map(x => x.qid).filter(Boolean))], WD = await wikidata(qids);
  const posQ = [...new Set(Object.values(WD).flatMap(x => x.pos))], PL = await labels(posQ);
  const posOf = q => { const l = (PL[q] || '').toLowerCase(); for (const [re, c] of POSL) if (re.test(l)) return c; return null };
  // ---- 5. assemble
  const clubLevel = {}; const out = [];
  players.forEach(p => { const i = p.title ? PI[p.title] : null; p.qid = i && i.qid; p.img = i && i.img; p.ruT = i && i.ru; const wd = p.qid ? WD[p.qid] : null; p.by = wd && wd.by; p.bm = wd && wd.bm; p.wpos = wd ? wd.pos.map(posOf).filter(Boolean) : [];
    p.ea = eaFind(p.d, p.title || p.d, p.by) });
  players.forEach(p => { if (p.ea) { const k = p.club.title; (clubLevel[k] = clubLevel[k] || []).push(p.ea.o) } });
  const med = a => { const s = a.slice().sort((x, y) => y - x).slice(0, 14); return s.length ? s[Math.floor(s.length / 2)] : null };
  const baseOf = c => { const k = Object.keys(CBASE).find(x => c.title.includes(x)); if (k) return CBASE[k]; const a = clubLevel[c.title]; return a && a.length >= 6 ? med(a) : LBASE[c.lg] || 68 };
  const FP = { GK: ['G'], DF: ['C', 'C', 'L', 'R'], MF: ['M', 'D', 'A', 'Y', 'Z'], FW: ['S', 'W', 'X'] };
  const SEC = { G: '', C: 'R', L: 'Y', R: 'Z', D: 'M', M: 'D', A: 'M', Y: 'W', Z: 'X', W: 'Y', X: 'Z', S: 'A' };
  const age = p => p.by ? 2026 - p.by - ((p.bm || 1) > 7 ? 1 : 0) : (p.ea && p.ea.by ? 2026 - p.ea.by : null);
  const ruName = p => { if (!p.ruT) return null; let t = p.ruT.replace(/\s*\([^)]*\)\s*$/, ''); if (t.includes(',')) { const [last, first] = t.split(',').map(s => s.trim()); return last } return t };
  const seenQ = new Set(); let est = 0, eaN = 0;
  players.forEach(p => {
    if (p.qid && seenQ.has(p.qid)) return; if (p.qid) seenQ.add(p.qid);
    const h = hash(p.title || p.d), a = age(p) || 20 + h % 12;
    let pos = p.ea && EAPOS[p.ea.p] || p.wpos[0] || (FP[p.fp] || FP.MF)[h % (FP[p.fp] || FP.MF).length];
    if (p.fp == 'GK') pos = 'G'; else if (pos == 'G' && p.fp && p.fp != 'GK') pos = (FP[p.fp] || FP.MF)[0];
    let sec = p.ea && EAPOS[p.ea.s] || p.wpos.find(x => x != pos && x != 'G') || SEC[pos] || '';
    if (sec == pos || pos == 'G') sec = '';
    let o; if (p.ea) { o = p.ea.o; eaN++ } else { const b = baseOf(p.club), ag = a < 19 ? -8 : a < 21 ? -5 : a < 23 ? -2 : a <= 30 ? 0 : a <= 33 ? -1 : -3; o = Math.max(48, Math.min(84, b - 2 + ag + (h % 7) - 3)); est++ }
    out.push({ e: p.d, r: ruName(p) || p.d, c: p.club.title, lg: p.club.lg, nat: p.nat, o, p: pos, s: sec, age: a, q: p.qid || null, img: p.img || null, src: p.ea ? 'ea' : 'est' });
  });
  rep.out = out.length; rep.fromEA = eaN; rep.estimated = est; rep.minutes = +((Date.now() - T0) / 60000).toFixed(1);
  rep.byLeague = {}; LEAGUES.forEach(([lg]) => { const L = out.filter(x => x.lg == lg); rep.byLeague[lg] = { players: L.length, ea: L.filter(x => x.src == 'ea').length, avg: +(L.reduce((s, x) => s + x.o, 0) / (L.length || 1)).toFixed(1), top: L.sort((a, b) => b.o - a.o).slice(0, 5).map(x => `${x.r} ${x.o} (${x.c})`) } });
  rep.clubsDetail = clubsAll.map(c => ({ lg: c.lg, t: c.title, ru: c.ru, n: c.n || 0, err: c.err }));
  const v = Date.now(), db = { v, season: '2026/27', leagues: Object.fromEntries(LEAGUES.map(l => [l[0], l[2]])),
    clubs: clubsAll.filter(c => !c.err).map(c => ({ t: c.title, short: c.short, ru: (c.ru || c.short).replace(/\s*\([^)]*\)\s*$/, '').replace(/^ФК\s+|^Футбольный клуб\s+/, ''), lg: c.lg, img: c.img || null })), players: out };
  fs.mkdirSync(path.join(OUT, 'db'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'db-src.json'), JSON.stringify(db));
  fs.writeFileSync(path.join(OUT, 'db-report.json'), JSON.stringify(rep, null, 1));
  console.log(JSON.stringify({ clubs: rep.clubs, players: rep.out, ea: eaN, est, minutes: rep.minutes, errs: rep.clubErr.length }));
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
