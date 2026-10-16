#!/usr/bin/env node
// FC Draft Online — builds the photo pack (players, coaches, stadiums, club crests) next to the game:
//   public/draft/ph/<key>.webp  +  public/draft/ph/map.json
// Runs in GitHub Actions (the game's own lookup code is reused from public/draft/index.html).
// Incremental: files already in the pack are kept; failed lookups are retried after 14 days.
// The game loads these files from its own site and can save them on the phone for offline play.
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const sharp = require(process.env.SHARP || 'sharp');
const ROOT = path.join(__dirname, '..'), OUT = path.join(ROOT, 'public/draft/ph');
const UA = 'FCDraftOnline/1.0 (https://github.com/yudzik/football-career-game; photo pack build)';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const LIMIT = +(process.env.PH_LIMIT || 1e9);   // max new API lookups per run (rate limits)
const T0 = Date.now(), BUDGET = +(process.env.PH_MINUTES || 40) * 60000;   // stop in time and keep what is done; the next run continues
const late = () => Date.now() - T0 > BUDGET;
const ST = {};   // request outcomes per host, saved in report.json
const note = (u, k) => { const h = /^https?:/.test(String(u)) ? String(u).split('/')[2] : 'data'; ST[h] = ST[h] || {}; ST[h][k] = (ST[h][k] || 0) + 1 };
fs.mkdirSync(OUT, { recursive: true });

const ufetch = async (u, o = {}) => {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(u, { ...o, headers: { 'User-Agent': UA, ...(o.headers || {}) }, signal: AbortSignal.timeout(20000) });
      note(u, r.status);
      if (r.status === 429 || r.status >= 500) { await sleep(15000 * (i + 1)); continue }
      return r;
    } catch (e) { note(u, 'err'); await sleep(3000 * (i + 1)) }
  }
  return { ok: false, status: 0, json: async () => ({}), arrayBuffer: async () => new ArrayBuffer(0) };
};

// ---- load the game in a sandbox (no timers, no DOM rendering) to reuse its data and lookup functions
const html = fs.readFileSync(path.join(ROOT, 'public/draft/index.html'), 'utf8');
const src = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].pop()[1];
const el = () => ({ innerHTML: '', value: '', style: {}, textContent: '' });
const ctx = {
  console: { log() {}, warn() {}, error() {} }, Math, JSON, Date, Array, Object, String, Number, Set, Map, Promise, URLSearchParams, TextEncoder, TextDecoder,
  setTimeout: () => 0, clearTimeout: () => {}, setInterval: () => 0, clearInterval: () => {}, fetch: ufetch,
  navigator: {}, location: { search: '', hostname: 'build', origin: 'https://build', pathname: '/' },
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  document: { getElementById: el, addEventListener() {}, visibilityState: 'visible' }, addEventListener() {},
};
ctx.window = ctx; vm.createContext(ctx); vm.runInContext(src + '\n;globalThis.__=e=>eval(e)', ctx);
const G = e => ctx.__(e);

const mapF = path.join(OUT, 'map.json'), failF = path.join(OUT, 'fail.json');
const old = fs.existsSync(mapF) ? JSON.parse(fs.readFileSync(mapF, 'utf8')) : { m: {} };
const REV = 3;   // lookup method version: failures from an older method are retried at once
let fail = fs.existsSync(failF) ? JSON.parse(fs.readFileSync(failF, 'utf8')) : {}; if (fail._rev !== REV) fail = { _rev: REV };
const M = { ...(old.m || {}) };
const fileOf = k => k.replace(/[^A-Za-z0-9]/g, '_') + '.webp';
const have = k => M[k] && fs.existsSync(path.join(OUT, M[k]));
const retry = k => !fail[k] || Date.now() - fail[k] > 14 * 864e5;
const miss = k => { fail[k] = Date.now(); missed++ };
const SIZE = { m: [120, 120, 'cover', 62], p: [160, 160, 'contain', 72], c: [160, 160, 'cover', 72], T: [96, 96, 'contain', 80], s: [640, 360, 'cover', 62] };
let api = 0, made = 0, missed = 0;

async function save(k, url) {
  if (!url) { fail[k] = Date.now(); missed++; return }
  const r = await ufetch(url); if (!r.ok) { fail[k] = Date.now(); missed++; return }
  let buf; try { buf = Buffer.from(await r.arrayBuffer()) } catch (e) { fail[k] = Date.now(); missed++; return } if (buf.length < 200) { fail[k] = Date.now(); missed++; return }
  const [w, h, fit, q] = SIZE[k[0]] || SIZE.p;
  try {
    const out = await sharp(buf).resize(w, h, { fit, position: k[0] == 'm' ? 'north' : 'centre', background: { r: 0, g: 0, b: 0, alpha: 0 }, withoutEnlargement: false }).webp({ quality: q }).toBuffer();
    fs.writeFileSync(path.join(OUT, fileOf(k)), out); M[k] = fileOf(k); delete fail[k]; made++;
  } catch (e) { fail[k] = Date.now(); missed++ }
}

function writeOut(final) {
  const keep = new Set(Object.values(M)); keep.add('map.json'); keep.add('fail.json'); keep.add('report.json');
  if (final) for (const f of fs.readdirSync(OUT)) if (!keep.has(f)) fs.unlinkSync(path.join(OUT, f));
  let bytes = 0; for (const f of keep) { const fp = path.join(OUT, f); if (f.endsWith('.webp') && fs.existsSync(fp)) bytes += fs.statSync(fp).size }
  const ks = Object.keys(M).sort(), m = {}; ks.forEach(k => m[k] = M[k]);
  const same = JSON.stringify(m) === JSON.stringify(old.m || {});
  fs.writeFileSync(mapF, JSON.stringify({ v: same && old.v ? old.v : Date.now(), n: ks.length, bytes, m }));
  fs.writeFileSync(failF, JSON.stringify(fail));
  return { n: ks.length, bytes };
}
let lastW = Date.now();
const tick = () => { if (Date.now() - lastW > 60000) { writeOut(false); lastW = Date.now() } };
// ---- Wikipedia: lead image + short description for up to 40 titles per request (pilicense=any also returns club logos)
async function wp(titles, size) {
  const out = {};
  for (let i = 0; i < titles.length; i += 40) {
    const chunk = titles.slice(i, i + 40), r = await ufetch('https://en.wikipedia.org/w/api.php?action=query&format=json&redirects=1&prop=pageimages|description&piprop=thumbnail&pilicense=any&pilimit=50&pithumbsize=' + size + '&titles=' + encodeURIComponent(chunk.join('|')));
    let j = {}; try { j = await r.json() } catch (e) {}
    const q = j.query || {}, mp = {}, pg = {};
    [...(q.normalized || []), ...(q.redirects || [])].forEach(x => mp[x.from] = x.to);
    Object.values(q.pages || {}).forEach(p => pg[p.title] = { src: (p.thumbnail || {}).source || '', desc: p.description || '' });
    chunk.forEach(t => { let x = t.replace(/_/g, ' '); x = mp[x] || x; x = mp[x] || x; if (pg[x]) out[t] = pg[x] });
    api++; await sleep(400);
  }
  return out;
}
async function wpSearch(q, size) {
  const r = await ufetch('https://en.wikipedia.org/w/api.php?action=query&format=json&generator=search&gsrlimit=1&gsrsearch=' + encodeURIComponent(q) + '&prop=pageimages|description&piprop=thumbnail&pilicense=any&pithumbsize=' + size);
  let j = {}; try { j = await r.json() } catch (e) {} api++; await sleep(400);
  const p = Object.values((j.query || {}).pages || {})[0]; return p ? { src: (p.thumbnail || {}).source || '', desc: p.description || '' } : null;
}
const isFoot = d => /football|soccer/i.test(d || '');
const rep2 = {};
(async () => {
  const DB = G('DB'), CO = G('CO'), STAD = G('STAD');
  const teams = [...new Set([...G('Object.values(CLUBS).map(c=>c[2]).filter(Boolean)'), ...G('CL.map(c=>c[4])')])];
  // coaches: their Wikipedia articles
  { const L = CO.filter(c => !have('c' + c.i) && retry('c' + c.i)), W = await wp(L.filter(c => c.wk).map(c => c.wk), 300);
    for (const c of L) { const x = c.wk && W[c.wk]; await save('c' + c.i, c.ph || (x && x.src) || ''); await sleep(250) } }
  // stadiums: article photo, then the game's own Commons search
  { const L = STAD.filter(s => !have('s' + s.i) && retry('s' + s.i)), W = await wp(L.map(s => s.wk), 960);
    let SI = {}; if (L.some(s => !(W[s.wk] || {}).src)) { try { await G('loadStadImgs()') } catch (e) {} SI = G('STIMG') }
    for (const s of L) { await save('s' + s.i, (W[s.wk] || {}).src || SI[s.i] || ''); await sleep(250) } }
  // crests: Wikipedia club article logo, TheSportsDB as a fallback
  for (const n of teams) { const k = 'T:' + n; if (have(k) || !retry(k) || late()) continue; tick();
    let x = (await wp([n + ' F.C.', n], 200)); let u = [n + ' F.C.', n].map(t => x[t]).find(v => v && v.src && isFoot(v.desc));
    if (!u) { const s2 = await wpSearch(n + ' football club', 200); if (s2 && s2.src && isFoot(s2.desc)) u = s2 }
    let url = u ? u.src : ''; if (!url && api < LIMIT) { try { url = await G(`findTeam(${JSON.stringify(n)})`) || '' } catch (e) {} api++; await sleep(2100) }
    await save(k, url); await sleep(250) }
  // players: «Name», then «Name (footballer)»; only football articles count; TheSportsDB as the last resort
  { const L = DB.filter(p => !have('p' + p.id) && retry('p' + p.id)), found = {};
    L.filter(p => p.ph).forEach(p => found[p.id] = p.ph);
    const pass = async suffix => { const rest = L.filter(p => !found[p.id] && p.e); const W = await wp(rest.map(p => p.e + suffix), 240); rest.forEach(p => { const x = W[p.e + suffix]; if (x && x.src && isFoot(x.desc)) found[p.id] = x.src }) };
    await pass(''); await pass(' (footballer)'); await pass(' (soccer)');
    for (const p of L.filter(p => !found[p.id] && p.e)) { if (late()) break; const x = await wpSearch(p.e + ' footballer ' + ((G(`CLUBS[${JSON.stringify(p.c)}]`) || [])[2] || ''), 240); if (x && x.src && isFoot(x.desc)) found[p.id] = x.src }
    let blocked = 0;
    for (const p of L) { const k = 'p' + p.id; if (late()) break; tick(); let url = found[p.id] || '';
      if (!url && blocked < 5 && api < LIMIT) { try { url = await G(`findPlayer(DB[${p.id}])`) || '' } catch (e) {} api++; const sd = ST['www.thesportsdb.com'] || {}; blocked = (sd[403] || 0) + (sd[429] || 0) > (sd[200] || 0) + 3 ? blocked + 1 : 0; await sleep(2100) }
      await save(k, url); await sleep(200); if ((made + missed) % 25 === 0) console.log(`… ${made} saved, ${missed} missed, ${api} lookups`) } }
  // ---- the 2026/27 database (db.json): Transfermarkt portraits ('m' + player id) and club crests ('T:' + club name)
  { const IF = path.join(ROOT, 'public/draft/db-img.json'), DF = path.join(ROOT, 'public/draft/db.json');
    if (fs.existsSync(IF) && fs.existsSync(DF)) { const I = JSON.parse(fs.readFileSync(IF, 'utf8')), D = JSON.parse(fs.readFileSync(DF, 'utf8'));
      for (const [id, c] of Object.entries(D.cl)) { const k = 'T:' + c[2]; if (have(k) || !retry(k) || late() || !I.c[id]) continue; tick(); await save(k, I.c[id]); await sleep(120) }
      const order = D.p.slice().sort((a, b) => b[6] - a[6]);   // best players first: the ones people see most
      for (const a of order) { const k = 'm' + a[0], u = I.p[a[0]]; if (have(k) || !retry(k) || !u) continue; if (late()) break; tick(); await save(k, u); await sleep(150) }
      rep2.dbPlayers = D.p.filter(a => M['m' + a[0]]).length + '/' + D.p.length; rep2.dbTodo = D.p.filter(a => !M['m' + a[0]] && I.p[a[0]] && retry('m' + a[0])).length } }
  const w = writeOut(true), todo = (rep2.dbTodo || 0) + DB.filter(p => !M['p' + p.id] && retry('p' + p.id)).length + teams.filter(n => !M['T:' + n] && retry('T:' + n)).length;
  const rep = { at: new Date().toISOString(), minutes: +((Date.now() - T0) / 60000).toFixed(1), photos: w.n, mb: +(w.bytes / 1048576).toFixed(2), made, missed, lookups: api, todo,
    players: DB.filter(p => M['p' + p.id]).length + '/' + DB.length, coaches: CO.filter(c => M['c' + c.i]).length + '/' + CO.length, stadiums: STAD.filter(s => M['s' + s.i]).length + '/' + STAD.length, crests: teams.filter(n => M['T:' + n]).length + '/' + teams.length, ...rep2, http: ST };
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(rep, null, 1));
  console.log(JSON.stringify(rep));
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `more=${todo > 0 && late() ? 1 : 0}\n`);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
