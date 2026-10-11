// FC Draft Online — offline cache: after the first visit the game opens even in airplane mode (Pass & Play).
const C = 'fcdraft-v14';
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => c.addAll(['./', './index.html'])).then(() => self.skipWaiting())) });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))).then(() => self.clients.claim())) });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return; const u = new URL(r.url);
  // the game page: network first (always the latest version online), cached copy when offline
  if (u.origin === location.origin) { e.respondWith(fetch(r.mode === 'navigate' ? new Request(r.url, { cache: 'no-cache', credentials: 'same-origin' }) : r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)) } return res }).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || caches.match('./')))); return }
  // the styling script: cache first
  if (u.hostname === 'cdn.tailwindcss.com') e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); return res })));
});
