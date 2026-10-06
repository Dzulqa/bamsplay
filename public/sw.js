// =====================================================================
// Bamsplay Service Worker - PWA Offline Support
// =====================================================================
const CACHE_NAME = 'bamsplay-v3';
const STATIC_ASSETS = [
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/bamsplay-icon.svg',
  '/default-cover.svg',
];

// ─── Install: cache static assets ────────────────────────────────────
self.addEventListener('install', (event) => {
  // If running on localhost, skip and do not cache anything
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    self.skipWaiting();
    return;
  }
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

// ─── Fetch: network-first for API & navigation, stale-while-revalidate for static ──
self.addEventListener('fetch', (event) => {
  // Never intercept requests on localhost in development
  if (self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1') {
    return;
  }
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser-extension requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) return;

  // Skip cross-origin requests (e.g. Google avatars, external CDNs) so browser handles them natively
  if (url.origin !== self.location.origin) {
    return;
  }

  // API routes: network only, no caching
  if (url.pathname.startsWith('/api/')) {
    return; // let it fall through to network
  }

  // Music files: network only (too large to cache)
  if (url.pathname.startsWith('/music/') || url.pathname.match(/\.(mp3|flac|wav|ogg|m4a)$/i)) {
    return;
  }

  // Navigation requests (HTML pages): ALWAYS network-first so new releases appear immediately without hard refresh
  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            return response;
          }
          return caches.match(request).then((cached) => cached || response);
        })
        .catch(() => {
          return caches.match(request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // Static assets: Stale-While-Revalidate strategy
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (
            response &&
            response.ok &&
            (url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|woff2|woff)$/) ||
              url.pathname.startsWith('/_next/'))
          ) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || fetchPromise;
    })
  );
});

// ─── Background sync placeholder ─────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
