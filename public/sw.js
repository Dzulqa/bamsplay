// =====================================================================
// Bamsplay Service Worker - PWA Offline Support
// =====================================================================
const CACHE_NAME = 'bamsplay-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/bamsplay-icon.svg',
  '/default-cover.svg',
];

// ─── Install: cache static assets ────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Bamsplay service worker...');
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ─── Activate: clean up old caches ───────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Bamsplay service worker...');
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// ─── Fetch: network-first for API, cache-first for static ────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser-extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // API routes: network only, no caching
  if (url.pathname.startsWith('/api/')) {
    return; // let it fall through to network
  }

  // Music files: network only (too large to cache)
  if (url.pathname.startsWith('/music/') || url.pathname.match(/\.(mp3|flac|wav|ogg|m4a)$/i)) {
    return;
  }

  // Static assets: cache-first strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          // Cache successful responses for static assets
          if (
            response.ok &&
            (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|woff2|woff)$/) ||
              url.pathname === '/')
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});

// ─── Background sync placeholder ─────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
