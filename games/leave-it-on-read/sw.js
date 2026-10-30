// The game moved to /absolutelyscunnered/. This replaces the old offline worker:
// it clears the old cache, removes itself and reloads open tabs onto the redirect.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k.startsWith('lior-')).map((k) => caches.delete(k)));
    await self.registration.unregister();
    const tabs = await self.clients.matchAll({ type: 'window' });
    tabs.forEach((t) => t.navigate(t.url));
  })());
});
