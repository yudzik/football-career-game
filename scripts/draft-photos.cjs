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
fs.mkdirSync(OUT, { recursive: true });

const ufetch = async (u, o = {}) => {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(u, { ...o, headers: { 'User-Agent': UA, ...(o.headers || {}) } });
      if (r.status === 429 || r.status >= 500) { await sleep(20000 * (i + 1)); continue }
      return r;
    } catch (e) { await sleep(3000 * (i + 1)) }
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
const fail = fs.existsSync(failF) ? JSON.parse(fs.readFileSync(failF, 'utf8')) : {};
const M = { ...(old.m || {}) };
const fileOf = k => k.replace(/[^A-Za-z0-9]/g, '_') + '.webp';
const have = k => M[k] && fs.existsSync(path.join(OUT, M[k]));
const retry = k => !fail[k] || Date.now() - fail[k] > 14 * 864e5;
const SIZE = { p: [160, 160, 'contain', 72], c: [160, 160, 'cover', 72], T: [96, 96, 'contain', 80], s: [640, 360, 'cover', 62] };
let api = 0, made = 0, missed = 0;

async function save(k, url) {
  if (!url) { fail[k] = Date.now(); missed++; return }
  const r = await ufetch(url); if (!r.ok) { fail[k] = Date.now(); missed++; return }
  const buf = Buffer.from(await r.arrayBuffer()); if (buf.length < 200) { fail[k] = Date.now(); missed++; return }
  const [w, h, fit, q] = SIZE[k[0]] || SIZE.p;
  try {
    const out = await sharp(buf).resize(w, h, { fit, background: { r: 0, g: 0, b: 0, alpha: 0 }, withoutEnlargement: false }).webp({ quality: q }).toBuffer();
    fs.writeFileSync(path.join(OUT, fileOf(k)), out); M[k] = fileOf(k); delete fail[k]; made++;
  } catch (e) { fail[k] = Date.now(); missed++ }
}

(async () => {
  // coaches + stadiums: Wikipedia lead photos (the game's own loaders)
  const co = G('CO').filter(c => !have('c' + c.i) && retry('c' + c.i));
  if (co.length) { try { await G('loadCoaches()') } catch (e) {} const IMG = G('IMG'); for (const c of co) await save('c' + c.i, c.ph || IMG['c' + c.i] || '') }
  const st = G('STAD').filter(s => !have('s' + s.i) && retry('s' + s.i));
  if (st.length) { try { await G('loadStadImgs()') } catch (e) {} const SI = G('STIMG'); for (const s of st) await save('s' + s.i, SI[s.i] || '') }
  // club crests (league clubs + every club of the player database)
  const teams = [...new Set([...G('Object.values(CLUBS).map(c=>c[2]).filter(Boolean)'), ...G('CL.map(c=>c[4])')])];
  for (const n of teams) { const k = 'T:' + n; if (have(k) || !retry(k) || api >= LIMIT) continue; let u = ''; try { u = await G(`findTeam(${JSON.stringify(n)})`) || '' } catch (e) {} api++; await save(k, u); await sleep(2100) }
  // players
  const DB = G('DB');
  for (const p of DB) { const k = 'p' + p.id; if (have(k) || !retry(k)) continue; let u = p.ph || '';
    if (!u) { if (api >= LIMIT) continue; try { u = await G(`findPlayer(DB[${p.id}])`) || '' } catch (e) {} api++; await sleep(2100) }
    await save(k, u); if ((made + missed) % 25 === 0) console.log(`… ${made} saved, ${missed} missed, ${api} lookups`) }
  // clean files no longer referenced, write the map
  const keep = new Set(Object.values(M)); keep.add('map.json'); keep.add('fail.json');
  for (const f of fs.readdirSync(OUT)) if (!keep.has(f)) fs.unlinkSync(path.join(OUT, f));
  let bytes = 0; for (const f of keep) { const fp = path.join(OUT, f); if (f.endsWith('.webp') && fs.existsSync(fp)) bytes += fs.statSync(fp).size }
  const ks = Object.keys(M).sort(), m = {}; ks.forEach(k => m[k] = M[k]);
  const same = JSON.stringify(m) === JSON.stringify(old.m || {});
  fs.writeFileSync(mapF, JSON.stringify({ v: same && old.v ? old.v : Date.now(), n: ks.length, bytes, m }));
  fs.writeFileSync(failF, JSON.stringify(fail));
  console.log(`photo pack: ${ks.length} photos (${(bytes / 1048576).toFixed(1)} MB) · new ${made} · missed ${missed} · lookups ${api}`);
  console.log('players', DB.filter(p => M['p' + p.id]).length + '/' + DB.length, '· coaches', G('CO').filter(c => M['c' + c.i]).length + '/' + G('CO.length'), '· stadiums', G('STAD').filter(s => M['s' + s.i]).length + '/' + G('STAD.length'), '· crests', teams.filter(n => M['T:' + n]).length + '/' + teams.length);
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1) });
