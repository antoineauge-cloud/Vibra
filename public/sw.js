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

  // 5. PRIORITY AUDIO STREAMS & MEDIA CACHING with Range Requests support
  // Caches audio streams & files to prevent buffer underrun/stoppage when device enters sleep mode
  self.workbox.routing.registerRoute(
    ({ request, url }) =>
      request.destination === 'audio' ||
      url.pathname.startsWith('/api/music/stream') ||
      /\.(?:mp3|m4a|aac|ogg|wav|flac)$/i.test(url.pathname) ||
      /^https:\/\/cdn\.pixabay\.com\/.*audio.*/i.test(url.href) ||
      /^https:\/\/.*\.deezer\.com\/.*\.mp3/i.test(url.href) ||
      /^https:\/\/audio-ssl\.itunes\.apple\.com\/.*/i.test(url.href),
    new self.workbox.strategies.CacheFirst({
      cacheName: 'vibra-audio-cache',
      plugins: [
        new self.workbox.rangeRequests.RangeRequestsPlugin(),
        new self.workbox.expiration.ExpirationPlugin({
          maxEntries: 80,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        }),
        new self.workbox.cacheableResponse.CacheableResponsePlugin({
          statuses: [0, 200, 206],
        }),
      ],
    })
  );

  // 6. Offline Catch Fallback
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

// ============================================================================
// AUDIO PLAYER LIFECYCLE MANAGEMENT & SLEEP INTERRUPTION PREVENTION
// ============================================================================
let currentAudioLifecycle = {
  isPlaying: false,
  track: null,
  lastHeartbeat: Date.now(),
};

// Listen to lifecycle & heartbeat messages from PlayerContext in the main application
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'VIBRA_AUDIO_STATUS') {
    const { isPlaying, track } = event.data.payload || {};
    currentAudioLifecycle.isPlaying = Boolean(isPlaying);
    currentAudioLifecycle.track = track || null;
    currentAudioLifecycle.lastHeartbeat = Date.now();

    // Synchronize native notification controls on lockscreen and notification drawer if permitted
    if (self.Notification && self.Notification.permission === 'granted' && track) {
      const isPlay = Boolean(isPlaying);
      self.registration.showNotification(track.title || 'Vibra Music', {
        body: `${track.artist || 'Artiste'} • ${isPlay ? 'En cours de lecture' : 'En pause'}`,
        icon: track.coverUrl || '/pwa-192x192.png',
        badge: '/icon.svg',
        tag: 'vibra-media-player',
        silent: true,
        renotify: false,
        data: { url: '/?tab=music' },
        actions: [
          { action: 'prev', title: '⏮ Précédent' },
          { action: isPlay ? 'pause' : 'play', title: isPlay ? '⏸ Pause' : '▶ Lecture' },
          { action: 'next', title: '⏭ Suivant' },
        ],
      }).catch(() => {});
    }
  } else if (event.data.type === 'VIBRA_KEEP_ALIVE') {
    // Keepalive ping: updates timestamp to confirm the audio session is active
    currentAudioLifecycle.lastHeartbeat = Date.now();
    if (event.source && event.source.postMessage) {
      event.source.postMessage({
        type: 'VIBRA_KEEP_ALIVE_ACK',
        timestamp: Date.now(),
      });
    }
  }
});

// Dispatch media control action from Notification back to the web application
self.addEventListener('notificationclick', (event) => {
  const action = event.action;
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        const client = clientList[0];
        if (action) {
          client.postMessage({ type: 'VIBRA_MEDIA_ACTION', action });
        } else {
          client.focus();
        }
      } else if (self.clients.openWindow) {
        self.clients.openWindow('/?tab=music');
      }
    })
  );
});
