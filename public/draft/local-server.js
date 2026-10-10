#!/usr/bin/env node
// FC Draft Online — local server for playing over one Wi-Fi hotspot WITHOUT internet.
// Put this file next to the game file (draft-online.html or index.html) and run:  node local-server.js [port]
// Then everybody on the same Wi-Fi opens  http://<this device's IP>:<port>  (the addresses are printed below).
// No dependencies: plain Node.js (laptop, or Android via Termux: `pkg install nodejs`).
// It serves the game page and relays the game messages (a tiny MQTT 3.1.1 broker over WebSocket at /mqtt).
'use strict';
const http = require('http'), crypto = require('crypto'), fs = require('fs'), path = require('path'), os = require('os');
const PORT = +(process.argv[2] || process.env.PORT || 8080);
const GAME = ['draft-online.html', 'index.html'].map(f => path.join(__dirname, f)).find(f => fs.existsSync(f));
if (!GAME) { console.error('Положите рядом с этим файлом игру: draft-online.html (или index.html)'); process.exit(1) }

// ---------- MQTT broker state ----------
const subs = new Map();            // topic filter -> Set(client)
const retained = new Map();        // topic -> Buffer
const match = (f, t) => f === t || (f.endsWith('/#') && t.startsWith(f.slice(0, -1))) || f === '#';
const vlenc = n => { const r = []; do { let d = n % 128; n = Math.floor(n / 128); if (n > 0) d |= 128; r.push(d) } while (n > 0); return r };
const frame = (h, body) => Buffer.concat([Buffer.from([h, ...vlenc(body.length)]), body]);
const u16s = s => { const b = Buffer.from(s, 'utf8'); return Buffer.concat([Buffer.from([b.length >> 8, b.length & 255]), b]) };
const str = (b, o) => { const l = b.readUInt16BE(o); return [b.slice(o + 2, o + 2 + l).toString('utf8'), o + 2 + l] };

function mqttIn(c, data) {
  c.min = Buffer.concat([c.min, data]);
  for (;;) {
    const b = c.min; if (b.length < 2) return;
    let i = 1, m = 1, v = 0, x; do { if (i >= b.length) return; x = b[i++]; v += (x & 127) * m; m *= 128 } while (x & 128);
    if (b.length < i + v) return;
    const h = b[0], p = b.slice(i, i + v), ty = h >> 4; c.min = b.slice(i + v);
    try {
      if (ty === 1) c.send(Buffer.from([0x20, 2, 0, 0]));                                    // CONNECT -> CONNACK
      else if (ty === 8) {                                                                     // SUBSCRIBE
        const id = p.readUInt16BE(0); let o = 2; const topics = [];
        while (o < p.length) { const [t, n] = str(p, o); o = n + 1; topics.push(t) }
        c.send(frame(0x90, Buffer.from([id >> 8, id & 255, ...topics.map(() => 0)])));
        for (const t of topics) { if (!subs.has(t)) subs.set(t, new Set()); subs.get(t).add(c); for (const [rt, rv] of retained) if (match(t, rt)) c.send(frame(0x31, Buffer.concat([u16s(rt), rv]))) }
      } else if (ty === 3) {                                                                   // PUBLISH (QoS 0)
        const [t, o] = str(p, 0), payload = p.slice(o);
        if (h & 1) { if (payload.length) retained.set(t, payload); else retained.delete(t) }
        const out = frame(0x30, Buffer.concat([u16s(t), payload])), sent = new Set();
        for (const [f, set] of subs) if (match(f, t)) for (const w of set) if (!sent.has(w)) { sent.add(w); w.send(out) }
      } else if (ty === 12) c.send(Buffer.from([0xD0, 0]));                                  // PINGREQ -> PINGRESP
      else if (ty === 14) c.close();                                                           // DISCONNECT
    } catch (e) { }
  }
}

// ---------- WebSocket (RFC 6455) ----------
function wsUpgrade(req, sock) {
  const key = req.headers['sec-websocket-key']; if (!key) return sock.destroy();
  const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  const proto = (req.headers['sec-websocket-protocol'] || '').split(',').map(s => s.trim()).includes('mqtt') ? 'Sec-WebSocket-Protocol: mqtt\r\n' : '';
  sock.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ' + acc + '\r\n' + proto + '\r\n');
  sock.setNoDelay(true);
  const c = { min: Buffer.alloc(0), win: Buffer.alloc(0), frag: [], alive: true,
    send(buf) { if (!c.alive) return; const n = buf.length, hd = n < 126 ? Buffer.from([0x82, n]) : n < 65536 ? Buffer.from([0x82, 126, n >> 8, n & 255]) : (() => { const x = Buffer.alloc(10); x[0] = 0x82; x[1] = 127; x.writeBigUInt64BE(BigInt(n), 2); return x })(); sock.write(Buffer.concat([hd, buf])) },
    close() { if (!c.alive) return; c.alive = false; for (const s of subs.values()) s.delete(c); try { sock.end(Buffer.from([0x88, 0])) } catch (e) { } } };
  sock.on('data', d => {
    c.win = Buffer.concat([c.win, d]);
    for (;;) {
      const b = c.win; if (b.length < 2) return;
      const fin = b[0] & 128, op = b[0] & 15, masked = b[1] & 128; let len = b[1] & 127, o = 2;
      if (len === 126) { if (b.length < 4) return; len = b.readUInt16BE(2); o = 4 } else if (len === 127) { if (b.length < 10) return; len = Number(b.readBigUInt64BE(2)); o = 10 }
      const mk = masked ? b.slice(o, o + 4) : null; if (masked) o += 4; if (b.length < o + len) return;
      let pl = b.slice(o, o + len); c.win = b.slice(o + len);
      if (mk) { pl = Buffer.from(pl); for (let i = 0; i < pl.length; i++) pl[i] ^= mk[i & 3] }
      if (op === 8) return c.close();
      if (op === 9) { sock.write(Buffer.concat([Buffer.from([0x8A, pl.length]), pl])); continue }
      if (op === 10) continue;
      c.frag.push(pl); if (!fin) continue;
      const msg = Buffer.concat(c.frag); c.frag = []; mqttIn(c, msg);
    }
  });
  sock.on('close', () => { c.alive = false; for (const s of subs.values()) s.delete(c) });
  sock.on('error', () => c.close());
}

// ---------- HTTP ----------
const srv = http.createServer((req, res) => {
  const u = req.url.split('?')[0];
  if (u === '/' || u === '/index.html' || u === '/draft-online.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' }); return fs.createReadStream(GAME).pipe(res);
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found');
});
srv.on('upgrade', (req, sock) => { if (req.url.split('?')[0] === '/mqtt') wsUpgrade(req, sock); else sock.destroy() });
srv.listen(PORT, '0.0.0.0', () => {
  const ips = Object.values(os.networkInterfaces()).flat().filter(x => x && x.family === 'IPv4' && !x.internal).map(x => x.address);
  console.log('⚽ FC Draft Online — локальный сервер запущен (интернет не нужен)');
  console.log('Откройте в браузере на всех телефонах, подключённых к этому Wi-Fi:');
  (ips.length ? ips : ['127.0.0.1']).forEach(ip => console.log('   http://' + ip + ':' + PORT));
  console.log('Остановить: Ctrl+C');
});
