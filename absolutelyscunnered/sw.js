// Offline support for Leave It On Read.
// Bump VERSION whenever any file below changes so players get the update.
const VERSION = 'lior-v4';
const FONT_CACHE = 'lior-fonts';
const SHELL = [
  './',
  'index.html',
  'play/',
  'play/index.html',
  'manifest.webmanifest',
  'img/logo.png',
  'img/logo-wordmark.png',
  'img/front.png',
  'img/front-blink.png',
  'img/unimpressed.png',
  'img/sideeye.png',
  'img/eyeroll.png',
  'img/sceptical.png',
  'img/angry.png',
  'img/shocked.png',
  'img/asleep.png',
  'img/blank.png',
  'img/ooh.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-192.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== FONT_CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Google Fonts: serve the cached copy, refresh it in the background.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(
      caches.open(FONT_CACHE).then(async (cache) => {
        const hit = await cache.match(req);
        const fresh = fetch(req).then((res) => { if (res.ok || res.type === 'opaque') cache.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || fresh;
      })
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Game files: cache first, fall back to the network.
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then((hit) => hit || fetch(req))
  );
});
