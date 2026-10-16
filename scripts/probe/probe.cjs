// one-off: look at how the EA ratings pages and a few open APIs answer from a CI server
const fs = require('fs'), path = require('path'); const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36';
const U = {
  team: 'https://www.ea.com/games/ea-sports-fc/ratings/teams-ratings/fc-barcelona/241',
  league: 'https://www.ea.com/games/ea-sports-fc/ratings/leagues-ratings/laliga-ea-sports/53?page=2',
  player: 'https://www.ea.com/games/ea-sports-fc/ratings/player-ratings/lamine-yamal/277643',
  api1: 'https://drop-api.ea.com/rating/ea-sports-fc?locale=en&limit=5&offset=0',
  api2: 'https://drop-api.ea.com/rating/ea-sports-fc?locale=en&limit=5&offset=0&filter=league:53',
  wd: 'https://www.wikidata.org/w/api.php?action=wbgetentities&sites=enwiki&titles=Lamine_Yamal|Rodri_(footballer,_born_1996)&props=labels|claims&languages=ru|en&format=json',
  rpl: 'https://en.wikipedia.org/w/api.php?action=parse&page=FC_Zenit_Saint_Petersburg&prop=wikitext&section=0&format=json',
  zenitSquad: 'https://en.wikipedia.org/w/index.php?title=FC_Zenit_Saint_Petersburg&action=raw',
  by: 'https://en.wikipedia.org/w/index.php?title=FC_Dinamo_Minsk&action=raw',
};
(async () => { const rep = {};
  for (const [k, u] of Object.entries(U)) { try { const r = await fetch(u, { headers: { 'User-Agent': k.startsWith('wd') || k == 'rpl' || k.endsWith('Squad') || k == 'by' ? 'FCDraftOnline/1.0 (github.com/yudzik/football-career-game)' : UA, 'Accept-Language': 'en' }, signal: AbortSignal.timeout(30000) }); const t = await r.text(); rep[k] = { status: r.status, len: t.length, type: r.headers.get('content-type') }; fs.writeFileSync(path.join(OUT, k + '.txt'), t.slice(0, 1500000)) } catch (e) { rep[k] = { err: String(e) } } }
  fs.writeFileSync(path.join(OUT, 'report.json'), JSON.stringify(rep, null, 1)); console.log(rep) })();
