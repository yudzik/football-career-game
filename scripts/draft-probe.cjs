#!/usr/bin/env node
// FC Draft Online — data source probe (runs in GitHub Actions): saves short samples of candidate sources to probe/
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(process.cwd(), 'probe'); fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const T = [
  ['tm_league', 'https://www.transfermarkt.com/premier-league/startseite/wettbewerb/GB1/saison_id/2026'],
  ['tm_squad', 'https://www.transfermarkt.com/fc-arsenal/kader/verein/11/saison_id/2026/plus/1'],
  ['tm_by', 'https://www.transfermarkt.com/vysheyshaya-liga/startseite/wettbewerb/WER1/saison_id/2026'],
  ['tm_rpl', 'https://www.transfermarkt.com/premier-liga/startseite/wettbewerb/RU1/saison_id/2026'],
  ['tmapi', 'https://transfermarkt-api.fly.dev/clubs/11/players'],
  ['dcaribou', 'https://pub-e682421888d945d684bcae8890b0ec20.r2.dev/data/players.csv.gz'],
];
(async () => {
  const rep = {};
  for (const [k, u] of T) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8', 'Accept-Language': 'en-US,en;q=0.9' }, signal: AbortSignal.timeout(25000) });
      const txt = await r.text(); rep[k] = { status: r.status, len: txt.length, ct: r.headers.get('content-type') };
      let s = txt;
      const nd = txt.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/); if (nd) { rep[k].next = nd[1].length; s = nd[1] }
      fs.writeFileSync(path.join(OUT, k + '.txt'), s.slice(0, 60000));
      if (nd) { // ratings pages: where the player items are and how the page loads them
        const hits = []; let i = -1; for (const key of ['overallRating', 'drop-api', '/rating/', 'avatarUrl', 'totalItems', 'leagueId', 'FC27', 'FC26']) { i = s.indexOf(key); hits.push([key, i, i >= 0 ? s.slice(Math.max(0, i - 400), i + 1200) : '']) }
        fs.writeFileSync(path.join(OUT, k + '.hits.json'), JSON.stringify(hits, null, 1));
        try { const j = JSON.parse(s), found = []; const walk = (o, p, d) => { if (!o || typeof o != 'object' || d > 12 || found.length > 6) return; if (Array.isArray(o) && o.length && o[0] && typeof o[0] == 'object' && 'overallRating' in o[0]) { found.push({ path: p, n: o.length, first: o[0] }); return } for (const kk of Object.keys(o)) walk(o[kk], p + '.' + kk, d + 1) }; walk(j, '', 0); fs.writeFileSync(path.join(OUT, k + '.items.json'), JSON.stringify(found, null, 1).slice(0, 40000)) } catch (e) { fs.writeFileSync(path.join(OUT, k + '.items.json'), String(e)) }
      }
    } catch (e) { rep[k] = { err: String(e) } }
  }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(rep, null, 1)); console.log(JSON.stringify(rep, null, 1));
})();
