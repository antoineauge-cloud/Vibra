import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'icon.svg',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'manifest.json',
          'manifest.webmanifest',
          '.well-known/assetlinks.json',
          'assetlinks.json',
          'pwabuilder-sw.js',
          'sw.js',
          'offline.html',
          'screenshot-mobile.jpg',
          'screenshot-desktop.jpg',
          'pwa-splash-icon.jpg',
          'apple-splash-screen.jpg',
          'splash-screen.jpg',
        ],
        manifest: {
          id: '/',
          name: 'Vibra - Musique & Égaliseur IA',
          short_name: 'Vibra',
          description: "Application officielle Vibra : Écoutez en toute liberté YouTube, Spotify et toutes les radios FM de France avec égaliseur studio et IA.",
          dir: 'ltr',
          lang: 'fr-FR',
          theme_color: '#07070e',
          background_color: '#07070e',
          display: 'standalone',
          display_override: [
            'standalone',
            'minimal-ui',
          ],
          orientation: 'any',
          start_url: '/?source=pwa',
          scope: '/',
          categories: ['music', 'audio', 'entertainment'],
          prefer_related_applications: false,
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
            },
            {
              src: '/apple-touch-icon.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any',
            },
            {
              src: '/pwa-splash-icon.jpg',
              sizes: '1024x1024',
              type: 'image/jpeg',
              purpose: 'any',
            },
          ],
          screenshots: [
            {
              src: '/screenshot-mobile.jpg',
              sizes: '768x1376',
              type: 'image/jpeg',
              form_factor: 'narrow',
              label: 'Lecteur audio haute fidélité avec égaliseur dynamique Vibra',
            },
            {
              src: '/screenshot-desktop.jpg',
              sizes: '1376x768',
              type: 'image/jpeg',
              form_factor: 'wide',
              label: 'Studio complet Vibra avec égaliseur et sélection de flux',
            },
          ],
          shortcuts: [
            {
              name: 'Radios FM France',
              short_name: 'Radios FM',
              description: 'Écouter les stations radios en direct haute fidélité',
              url: '/?tab=radio',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Catalogue Musique',
              short_name: 'Musique',
              description: 'Catalogue universel sans pub YouTube et Spotify',
              url: '/?tab=music',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Égaliseur Audio Studio',
              short_name: 'Égaliseur',
              description: 'Personnaliser les basses, médiums et aigus en temps réel',
              url: '/?tab=equalizer',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/qtrypzzcjebvfcihiynt\.supabase\.co\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'vibra-supabase-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/images\.unsplash\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'vibra-images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7, // 7 days
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      dedupe: ['react', 'react-dom'],
      alias: {
        '@': path.resolve('.'),
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react/jsx-runtime', 'lucide-react', 'jszip'],
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
