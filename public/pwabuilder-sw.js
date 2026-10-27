// Vibra Official Service Worker powered by Workbox
// Implements strict Workbox caching from vite.config.ts with CacheFirst priority for essential assets

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const PRECACHE_ASSETS = [
  { url: '/', revision: 'v6-app' },
  { url: '/index.html', revision: 'v6-app' },
  { url: '/offline.html', revision: 'v6-app' },
  { url: '/manifest.json', revision: 'v6-app' },
  { url: '/manifest.webmanifest', revision: 'v6-app' },
  { url: '/.well-known/assetlinks.json', revision: 'v6-app' },
  { url: '/assetlinks.json', revision: 'v6-app' },
  { url: '/pwa-192x192.png', revision: 'v6-app' },
  { url: '/pwa-maskable-192x192.png', revision: 'v6-app' },
  { url: '/pwa-512x512.png', revision: 'v6-app' },
  { url: '/pwa-maskable-512x512.png', revision: 'v6-app' },
  { url: '/apple-touch-icon.png', revision: 'v6-app' },
  { url: '/icon.svg', revision: 'v6-app' },
  { url: '/favicon.ico', revision: 'v6-app' },
];

if (self.workbox) {
  // Silent production logging
  self.workbox.setConfig({ debug: false });

  // Activate immediately
  self.workbox.core.skipWaiting();
  self.workbox.core.clientsClaim();

  // Precaching core app shell for full offline installability
  self.workbox.precaching.precacheAndRoute(PRECACHE_ASSETS);

  // 1. PRIORITY CACHEFIRST: Essential Static Assets (matches globPatterns: **/*.{js,css,html,ico,png,svg,woff,woff2})
  self.workbox.routing.registerRoute(
    ({ request, url }) => {
      // Exclude development Vite endpoints and server APIs
      if (
        url.pathname.startsWith('/api/') ||
        url.pathname.includes('/@vite') ||
        url.pathname.includes('/@react-refresh') ||
        url.pathname.includes('/@fs/') ||
        request.method !== 'GET'
      ) {
        return false;
      }
      return (
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font' ||
        /\.(?:js|css|woff2?|ttf|otf|ico|png|svg|webp)$/i.test(url.pathname)
      );
    },
    new self.workbox.strategies.CacheFirst({
      cacheName: 'vibra-essential-assets',
      plugins: [
        new self.workbox.expiration.ExpirationPlugin({
          maxEntries: 120,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
        new self.workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 2. PRIORITY CACHEFIRST: Supabase API & Cloud Sync (Strictly matching vite.config.ts)
  self.workbox.routing.registerRoute(
    /^https:\/\/qtrypzzcjebvfcihiynt\.supabase\.co\/.*/i,
    new self.workbox.strategies.CacheFirst({
      cacheName: 'vibra-supabase-cache',
      plugins: [
        new self.workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
        }),
        new self.workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 3. StaleWhileRevalidate: Unsplash and Image Media (Strictly matching vite.config.ts)
  self.workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'image' ||
      /^https:\/\/images\.unsplash\.com\/.*/i.test(url.href) ||
      /^https:\/\/i\.ytimg\.com\/.*/i.test(url.href) ||
      /^https:\/\/.*\.deezer\.com\/.*/i.test(url.href),
    new self.workbox.strategies.StaleWhileRevalidate({
      cacheName: 'vibra-images-cache',
      plugins: [
        new self.workbox.expiration.ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
        }),
        new self.workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200],
        }),
      ],
    })
  );

  // 4. Navigation Requests: NetworkFirst with timeout, fallback to cached index or offline.html
  self.workbox.routing.registerRoute(
    ({ request }) => request.mode === 'navigate',
    new self.workbox.strategies.NetworkFirst({
      cacheName: 'vibra-pages-cache',
      networkTimeoutSeconds: 2,
      plugins: [
        new self.workbox.expiration.ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        }),
      ],
    })
  );

  // 5. Offline Catch Fallback
  self.workbox.routing.setCatchHandler(async ({ request }) => {
    if (request.mode === 'navigate') {
      const cachedPage = await caches.match('/');
      if (cachedPage) return cachedPage;
      const cachedOffline = await caches.match('/offline.html');
      if (cachedOffline) return cachedOffline;
      return new Response('Vibra est actuellement hors-ligne', {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 200,
      });
    }
    return Response.error();
  });
} else {
  // Native fallback if Workbox CDN is unreachable
  const FALLBACK_CACHE = 'vibra-fallback-v6';
  self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
      caches.open(FALLBACK_CACHE).then((cache) =>
        cache.addAll(PRECACHE_ASSETS.map((a) => a.url)).catch(() => {})
      )
    );
  });
  self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
  });
  self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
      event.respondWith(
        fetch(event.request).catch(async () => {
          const match = await caches.match(event.request);
          if (match) return match;
          const offline = await caches.match('/offline.html');
          return offline || new Response('Vibra Hors-Ligne', { headers: { 'Content-Type': 'text/html' } });
        })
      );
    }
  });
}
