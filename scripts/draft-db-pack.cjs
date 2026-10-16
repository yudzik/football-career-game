#!/usr/bin/env node
// FC Draft Online — packs the reviewed database (db-src.json from the draft-data branch) for the game:
//   public/draft/db.json        compact database the game loads (also archived as db/<v>.json for rooms started on it)
//   public/draft/db-img.json    photo sources for the photo pack build (player portraits, club crests)
// Usage: node scripts/draft-db-pack.cjs <db-src.json>
'use strict';
const fs = require('fs'), path = require('path');
const src = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), OUT = path.join(__dirname, '..', 'public/draft');
const cl = {}, img = { p: {}, c: {} };
src.clubs.forEach(c => { cl[c.id] = [c.r, c.lg, c.e]; img.c[c.id] = c.img });
const fixName = p => { if (/^(Жуниор|Жуниор Младший|Нето|Филью)$/.test(p.r) && p.rf) return p.rf.split(/\s+/)[0]; return p.r };
const P = src.players.filter(p => p.o >= 50).map(p => { p.r = fixName(p); if (p.img && !/default/i.test(p.img)) img.p[p.tm] = p.img; return [+p.tm, p.e, p.r, p.rf || 0, +p.c, p.nat, p.o, p.p, p.s || '', p.age, Math.round((p.mv || 0) / 1e4)] });
const db = { v: src.v, season: src.season, src: src.src, lg: src.leagues, cl, p: P };
fs.mkdirSync(path.join(OUT, 'db'), { recursive: true });
const j = JSON.stringify(db);
fs.writeFileSync(path.join(OUT, 'db.json'), j); fs.writeFileSync(path.join(OUT, 'db', src.v + '.json'), j);
fs.writeFileSync(path.join(OUT, 'db-img.json'), JSON.stringify(img));
console.log(`db.json: ${P.length} players, ${Object.keys(cl).length} clubs, ${(j.length / 1024).toFixed(0)} KB, v=${src.v}`);
