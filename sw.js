/* Service worker: guarda l'app al mòbil perquè funcioni sense connexió.
   Puja el número de CAU cada cop que publiquis una versió nova. */
const CAU = 'gimcana-v49';
const FITXERS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CAU).then(c => c.addAll(FITXERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(k => Promise.all(k.filter(n => n !== CAU).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

/* Primer la xarxa (per veure sempre l'última versió), i si no hi ha connexió, el que tinguem guardat. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(r => {
        if (r && r.ok && new URL(e.request.url).origin === location.origin) {
          const copia = r.clone();
          caches.open(CAU).then(c => c.put(e.request, copia));
        }
        return r;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
