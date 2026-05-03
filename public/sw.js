// Service Worker — habilita instalação PWA com estratégia network-first.
// IMPORTANTE: bump CACHE_NAME a cada release para forçar invalidação.
const CACHE_NAME = 'mania-album-v3';

self.addEventListener('install', (event) => {
  // Ativa imediatamente, sem esperar abas antigas fecharem
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Não interceptar chamadas de API/Supabase
  if (url.origin !== self.location.origin) return;

  // Network-first: sempre buscar versão fresca; cai para cache só se offline.
  event.respondWith(
    fetch(req)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        return res;
      })
      .catch(() => caches.match(req).then((c) => c || caches.match('/index.html')))
  );
});