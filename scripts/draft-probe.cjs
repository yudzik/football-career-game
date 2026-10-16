#!/usr/bin/env node
// FC Draft Online — data source probe (runs in GitHub Actions): saves short samples of candidate sources to probe/
'use strict';
const fs = require('fs'), path = require('path');
const OUT = path.join(process.cwd(), 'probe'); fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const T = [
  ['ea_api', 'https://drop-api.ea.com/rating/ea-sports-fc?locale=en&limit=5&offset=0'],
  ['ea_api27', 'https://drop-api.ea.com/rating/ea-sports-fc-27?locale=en&limit=5&offset=0'],
  ['ea_page_p2', 'https://www.ea.com/games/ea-sports-fc/ratings?page=2'],
  ['ea_api_league', 'https://drop-api.ea.com/rating/ea-sports-fc?locale=en&limit=5&offset=0&league=53'],
  ['ea_page', 'https://www.ea.com/games/ea-sports-fc/ratings'],
  ['ea_page_league', 'https://www.ea.com/games/ea-sports-fc/ratings/leagues-ratings/laliga-ea-sports/53'],
  ['wiki_squad', 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=FC_Zenit_Saint_Petersburg'],
  ['wiki_squad_by', 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=FC_Dinamo_Brest'],
  ['wiki_league', 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=2026%E2%80%9327_Russian_Premier_League'],
  ['wiki_bpl', 'https://en.wikipedia.org/w/api.php?action=parse&format=json&prop=wikitext&page=2026_Belarusian_Premier_League'],
];
(async () => {
  const rep = {};
  for (const [k, u] of T) {
    try {
      const r = await fetch(u, { headers: { 'User-Agent': UA, 'Accept': 'application/json,text/html' }, signal: AbortSignal.timeout(25000) });
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
