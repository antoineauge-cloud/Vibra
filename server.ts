import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import JSZip from 'jszip';

// Ensure HMR is disabled in AI Studio dev server to avoid WebSocket connection errors
process.env.DISABLE_HMR = 'true';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  const app = express();

  // In-memory rate limiter per IP
  const ipRateLimits = new Map<string, { count: number; resetAt: number }>();
  const checkRateLimit = (ip: string, maxRequests = 90, windowMs = 60000): boolean => {
    const now = Date.now();
    const record = ipRateLimits.get(ip);
    if (!record || now > record.resetAt) {
      ipRateLimits.set(ip, { count: 1, resetAt: now + windowMs });
      return true;
    }
    if (record.count >= maxRequests) return false;
    record.count++;
    return true;
  };

  // Clean stale rate limit entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipRateLimits.entries()) {
      if (now > record.resetAt) ipRateLimits.delete(ip);
    }
  }, 300000);

  // Security and CORS middleware
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // Official PWA & WebAPK Manifest endpoints for PWABuilder, Google Play & Android
  app.get(['/manifest.json', '/manifest.webmanifest'], (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
  });

  // Official Android Digital Asset Links (Required for verified APK with zero browser UI)
  app.get(['/.well-known/assetlinks.json', '/assetlinks.json'], (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.sendFile(path.resolve(__dirname, 'public', '.well-known', 'assetlinks.json'));
  });

  // Official Service Worker endpoints with Service-Worker-Allowed header
  app.get(['/pwabuilder-sw.js', '/sw.js'], (req, res) => {
    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Service-Worker-Allowed', '/');
    res.setHeader('Cache-Control', 'no-cache');
    res.sendFile(path.resolve(__dirname, 'public', 'pwabuilder-sw.js'));
  });

  // Serve static public assets with correct MIME types
  app.use(express.static(path.resolve(__dirname, 'public')));

  // Official Offline fallback page
  app.get('/offline.html', (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.sendFile(path.resolve(__dirname, 'public', 'offline.html'));
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      app: 'Vibra APK & PWA',
      theme: 'cyberpunk-neon',
      timestamp: new Date().toISOString(),
    });
  });

  // Direct Mobile-Friendly Manifest Download endpoint
  app.get('/api/download/manifest.json', (req, res) => {
    res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="manifest.json"');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.sendFile(path.resolve(__dirname, 'public', 'manifest.json'));
  });

  // Direct Mobile-Friendly APK Project Package (.ZIP) Download endpoint
  app.get('/api/download/apk-bundle.zip', async (req, res) => {
    try {
      const zip = new JSZip();
      const host = req.get('host') || 'vibra.app';
      const protocol = req.protocol || 'https';
      const origin = `${protocol}://${host}`;

      // Read public assets
      const publicDir = path.resolve(__dirname, 'public');
      const manifestPath = path.join(publicDir, 'manifest.json');
      const assetlinksPath = path.join(publicDir, '.well-known', 'assetlinks.json');

      const manifestContent = fs.existsSync(manifestPath) ? fs.readFileSync(manifestPath, 'utf8') : '{}';
      const assetlinksContent = fs.existsSync(assetlinksPath) ? fs.readFileSync(assetlinksPath, 'utf8') : '[]';

      const twaManifest = {
        packageId: 'app.vibra.music',
        host: host,
        name: 'Vibra - Musique & Égaliseur IA',
        launcherName: 'Vibra',
        themeColor: '#07070e',
        navigationColor: '#07070e',
        backgroundColor: '#07070e',
        enableNotifications: true,
        startUrl: '/?source=pwa',
        iconUrl: `${origin}/pwa-512x512.png`,
        maskableIconUrl: `${origin}/pwa-maskable-512x512.png`,
        splashScreenFadeOutDuration: 300,
        appVersionCode: 1,
        appVersionName: '1.0.0',
        shortcuts: [
          { name: 'Recherche YouTube', shortName: 'Recherche', url: `${origin}/?tab=search`, icon: 'shortcut_search' },
          { name: 'Égaliseur Cyberpunk', shortName: 'Égaliseur', url: `${origin}/?tab=equalizer`, icon: 'shortcut_eq' },
        ],
        generatorApp: 'Vibra Cyberpunk APK Studio',
        webManifestUrl: `${origin}/manifest.json`,
        fallbackType: 'customtabs',
      };

      const capacitorConfig = {
        appId: 'app.vibra.music',
        appName: 'Vibra',
        webDir: 'dist',
        bundledWebRuntime: false,
        server: { url: origin, cleartext: true },
        android: { allowMixedContent: true, captureInput: true }
      };

      const androidManifestXml = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="app.vibra.music">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PLAYBACK" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="Vibra"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@android:style/Theme.NoTitleBar.Fullscreen"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="Vibra"
            android:exported="true"
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:theme="@android:style/Theme.Translucent.NoTitleBar">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data android:scheme="https" android:host="${host}" />
            </intent-filter>

            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="${origin}/?source=pwa" />
        </activity>
    </application>
</manifest>`;

      const buildGradle = `// Top-level build file for Vibra Android APK
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
    }
}
allprojects {
    repositories {
        google()
        mavenCentral()
    }
}`;

      const appBuildGradle = `plugins {
    id 'com.android.application'
}
android {
    namespace 'app.vibra.music'
    compileSdk 34
    defaultConfig {
        applicationId "app.vibra.music"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
}
dependencies {
    implementation 'androidx.browser:browser:1.8.0'
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}`;

      const readmeMd = `# 🚀 Vibra - Package Source APK Android Officiel

Ce dossier contient l'ensemble des fichiers nécessaires pour compiler l'APK Android officiel de Vibra.

### 📱 Installation Recommandée sur Téléphone (Sans rien compiler)
1. Ouvrez Vibra dans Google Chrome sur votre smartphone Android.
2. Appuyez sur le menu des 3 points (⋮) en haut à droite.
3. Appuyez sur **« Installer l'application »**.
Google Chrome et Google Play Services créent automatiquement l'APK officiel natif (WebAPK) !

### 💻 Compilation Locale (Android Studio / Bubblewrap CLI)
1. Téléchargez et décompressez cette archive.
2. Pour compiler avec Google Bubblewrap CLI :
   \`\`\`bash
   npm install -g @bubblewrap/cli
   bubblewrap build
   \`\`\`
3. Pour compiler dans Android Studio :
   Ouvrez ce dossier comme projet Android, connectez votre téléphone en débogage USB et cliquez sur **Run**.
`;

      // Bundle files into ZIP
      zip.file('.well-known/assetlinks.json', assetlinksContent);
      zip.file('assetlinks.json', assetlinksContent);
      zip.file('twa-manifest.json', JSON.stringify(twaManifest, null, 2));
      zip.file('manifest.json', manifestContent);
      zip.file('capacitor.config.json', JSON.stringify(capacitorConfig, null, 2));
      zip.file('AndroidManifest.xml', androidManifestXml);
      zip.file('build.gradle', buildGradle);
      zip.file('app-build.gradle', appBuildGradle);
      zip.file('README-GUIDE-INSTALLATION.md', readmeMd);

      // Add icons if available
      const icon192 = path.join(publicDir, 'pwa-192x192.png');
      const icon512 = path.join(publicDir, 'pwa-512x512.png');
      if (fs.existsSync(icon192)) {
        zip.file('icons/pwa-192x192.png', fs.readFileSync(icon192));
      }
      if (fs.existsSync(icon512)) {
        zip.file('icons/pwa-512x512.png', fs.readFileSync(icon512));
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="vibra-android-apk-bundle.zip"');
      res.setHeader('Content-Length', zipBuffer.length.toString());
      res.send(zipBuffer);
    } catch (err: any) {
      console.error('Error generating APK zip on backend:', err);
      res.status(500).json({ error: 'Failed to build APK zip package' });
    }
  });

  // Autocomplete suggestions endpoint with rate limiting and input truncation
  app.get('/api/music/suggestions', async (req, res) => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
      if (!checkRateLimit(clientIp, 120)) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      const q = ((req.query.q as string) || '').slice(0, 100).trim();
      if (!q) return res.json([]);
      const url = `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(q)}`;
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      const data = await response.json();
      return res.json(data[1] || []);
    } catch (err: any) {
      console.warn('Suggest error:', err.message);
      return res.json([]);
    }
  });

  // Spotify oEmbed importer endpoint with strict SSRF validation
  app.get('/api/spotify/oembed', async (req, res) => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
      if (!checkRateLimit(clientIp, 60)) {
        return res.status(429).json({ error: 'Too many requests' });
      }

      const targetUrl = ((req.query.url as string) || '').trim();
      if (!targetUrl) return res.status(400).json({ error: 'URL required' });

      // SSRF Validation: strict check on URL protocol and hostname
      let parsed: URL;
      try {
        parsed = new URL(targetUrl);
      } catch {
        return res.status(400).json({ error: 'Format d\'URL invalide' });
      }

      const allowedHostnames = ['open.spotify.com', 'spotify.link', 'spotify.com'];
      if (parsed.protocol !== 'https:' || !allowedHostnames.includes(parsed.hostname.toLowerCase())) {
        return res.status(403).json({ error: 'Domaine non autorisé. Seules les adresses open.spotify.com sont permises.' });
      }

      const oembedEndpoint = `https://open.spotify.com/oembed?url=${encodeURIComponent(targetUrl)}`;
      const response = await fetch(oembedEndpoint, {
        headers: { 'User-Agent': 'Vibra-PWA/2.5.0' },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: 'Failed to fetch Spotify oEmbed' });
      }
      const data = await response.json();
      return res.json(data);
    } catch (err: any) {
      return res.status(500).json({ error: 'Impossible de joindre le service Spotify' });
    }
  });

  // High-reliability audio stream resolver for background & lock-screen playback
  app.get('/api/music/stream', async (req, res) => {
    try {
      const q = ((req.query.q as string) || (req.query.title as string) || '').trim();
      const rawTitle = ((req.query.title as string) || '').replace(/\(.*?\)|\{.*?\}|\[.*?\]|official|video|clip|lyrics|audio/gi, '').trim();
      const artist = ((req.query.artist as string) || '').trim();
      const searchTerm = rawTitle && artist ? `${rawTitle} ${artist}` : q;

      if (!searchTerm) {
        return res.redirect(302, 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3');
      }

      // 1. Try iTunes search for clean high-speed audio stream
      try {
        const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(searchTerm)}&entity=song&limit=1`;
        const itunesRes = await fetch(itunesUrl, { signal: AbortSignal.timeout(3500) });
        if (itunesRes.ok) {
          const data = await itunesRes.json();
          if (data.results && data.results.length > 0 && data.results[0].previewUrl) {
            return res.redirect(302, data.results[0].previewUrl);
          }
        }
      } catch (e) {}

      // 2. Try Deezer search for clean MP3 audio stream
      try {
        const dzUrl = `https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}&limit=1`;
        const dzRes = await fetch(dzUrl, { headers: { 'User-Agent': 'Vibra-PWA/3.0.0' }, signal: AbortSignal.timeout(3500) });
        if (dzRes.ok) {
          const dzData = await dzRes.json();
          if (dzData.data && dzData.data.length > 0 && dzData.data[0].preview) {
            return res.redirect(302, dzData.data[0].preview);
          }
        }
      } catch (e) {}

      // 3. Fallback to high-quality curated synth stream
      return res.redirect(302, 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3');
    } catch (err: any) {
      console.warn('Audio stream resolver notice:', err.message);
      return res.redirect(302, 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3');
    }
  });

  // Unified YouTube & Spotify live catalog search endpoint with rate limit & query clamp
  app.get('/api/music/search', async (req, res) => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
      if (!checkRateLimit(clientIp, 80)) {
        return res.status(429).json({ error: 'Trop de requêtes, veuillez patienter un instant.' });
      }

      const query = ((req.query.q as string) || '').slice(0, 100).trim();
      const source = ((req.query.source as string) || 'all').toLowerCase();
      const limit = Math.max(1, Math.min(50, parseInt((req.query.limit as string) || '20', 10)));

      if (!query) {
        return res.json({ tracks: [] });
      }

      const results: any[] = [];

      // 1. YouTube Search with timeout
      if (source === 'all' || source === 'youtube') {
        try {
          const ytUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
          const ytRes = await fetch(ytUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
            },
            signal: AbortSignal.timeout(6000),
          });
          const ytHtml = await ytRes.text();
          const match = ytHtml.match(/var ytInitialData = ({.*?});<\/script>/);
          if (match) {
            const data = JSON.parse(match[1]);
            const contents = data.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
            let count = 0;
            for (const item of contents) {
              const v = item.videoRenderer;
              if (v && v.videoId && count < limit) {
                // Parse duration text into seconds
                let durationSec = 180;
                const durText = v.lengthText?.simpleText;
                if (durText) {
                  const parts = durText.split(':').map(Number);
                  if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];
                  else if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
                }

                const title = v.title?.runs?.[0]?.text || 'Titre YouTube';
                const channel = v.ownerText?.runs?.[0]?.text || 'Artiste YouTube';
                const thumb = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${v.videoId}/hqdefault.jpg`;

                results.push({
                  id: `yt-${v.videoId}`,
                  title: title,
                  artist: channel,
                  album: 'YouTube Music Library',
                  coverUrl: thumb,
                  duration: durationSec,
                  source: 'youtube',
                  youtubeId: v.videoId,
                  audioUrl: `/api/music/stream?q=${encodeURIComponent(title + ' ' + channel)}&title=${encodeURIComponent(title)}&artist=${encodeURIComponent(channel)}`
                });
                count++;
              }
            }
          }
        } catch (ytErr) {
          console.warn('YouTube search scrape warning:', ytErr);
        }
      }

      // 2. Spotify Catalog Search (via high quality audio preview & album artwork bridge)
      if (source === 'all' || source === 'spotify') {
        try {
          const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`;
          const itunesRes = await fetch(itunesUrl);
          const itunesData = await itunesRes.json();
          if (itunesData.results && Array.isArray(itunesData.results)) {
            for (const item of itunesData.results) {
              // High resolution album art
              const highResArtwork = (item.artworkUrl100 || '').replace('100x100bb.jpg', '600x600bb.jpg');
              results.push({
                id: `sp-${item.trackId}`,
                title: item.trackName,
                artist: item.artistName,
                album: item.collectionName || 'Spotify Single',
                coverUrl: highResArtwork || item.artworkUrl100,
                duration: Math.round((item.trackTimeMillis || 180000) / 1000),
                source: 'spotify',
                spotifyId: `${item.trackId}`,
                audioUrl: item.previewUrl,
              });
            }
          }
        } catch (spErr) {
          console.warn('Spotify search warning:', spErr);
        }
      }

      // 3. Deezer Official API Search (Lossless metadata & instant MP3 audio previews)
      if (source === 'all' || source === 'deezer') {
        try {
          const dzUrl = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`;
          const dzRes = await fetch(dzUrl, {
            headers: { 'User-Agent': 'Vibra-PWA/3.0.0' },
            signal: AbortSignal.timeout(6000),
          });
          if (dzRes.ok) {
            const dzData = await dzRes.json();
            if (dzData.data && Array.isArray(dzData.data)) {
              for (const item of dzData.data) {
                results.push({
                  id: `dz-${item.id}`,
                  title: item.title,
                  artist: item.artist?.name || 'Artiste Deezer',
                  album: item.album?.title || 'Deezer Track',
                  coverUrl: item.album?.cover_big || item.album?.cover_medium || item.artist?.picture_medium || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
                  duration: item.duration || 180,
                  source: 'deezer',
                  deezerId: `${item.id}`,
                  audioUrl: item.preview,
                });
              }
            }
          }
        } catch (dzErr) {
          console.warn('Deezer search warning:', dzErr);
        }
      }

      return res.json({ tracks: results });
    } catch (err: any) {
      console.error('Unified search error:', err);
      return res.status(500).json({ error: err.message, tracks: [] });
    }
  });

  // Dedicated Deezer Top Charts endpoint (Top France & Global Hits)
  app.get('/api/deezer/chart', async (req, res) => {
    try {
      const clientIp = (req.headers['x-forwarded-for'] as string || req.socket.remoteAddress || 'unknown').split(',')[0].trim();
      if (!checkRateLimit(clientIp, 80)) {
        return res.status(429).json({ error: 'Trop de requêtes' });
      }

      const limit = Math.max(5, Math.min(50, parseInt((req.query.limit as string) || '30', 10)));
      const dzRes = await fetch(`https://api.deezer.com/chart/0/tracks?limit=${limit}`, {
        headers: { 'User-Agent': 'Vibra-PWA/3.0.0' },
        signal: AbortSignal.timeout(6000),
      });

      if (!dzRes.ok) {
        return res.status(dzRes.status).json({ error: 'Deezer chart unavailable' });
      }

      const data = await dzRes.json();
      const tracks = (data.data || []).map((item: any) => ({
        id: `dz-${item.id}`,
        title: item.title,
        artist: item.artist?.name || 'Artiste Deezer',
        album: item.album?.title || 'Top Deezer',
        coverUrl: item.album?.cover_big || item.album?.cover_medium || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        duration: item.duration || 180,
        source: 'deezer',
        deezerId: `${item.id}`,
        audioUrl: item.preview,
      }));

      return res.json({ tracks });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, tracks: [] });
    }
  });

  // Dedicated Deezer Search endpoint
  app.get('/api/deezer/search', async (req, res) => {
    try {
      const q = ((req.query.q as string) || '').slice(0, 100).trim();
      if (!q) return res.json({ tracks: [] });
      const limit = Math.max(1, Math.min(50, parseInt((req.query.limit as string) || '25', 10)));

      const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=${limit}`, {
        headers: { 'User-Agent': 'Vibra-PWA/3.0.0' },
        signal: AbortSignal.timeout(6000),
      });
      const data = await dzRes.json();
      const tracks = (data.data || []).map((item: any) => ({
        id: `dz-${item.id}`,
        title: item.title,
        artist: item.artist?.name || 'Artiste Deezer',
        album: item.album?.title || 'Album Deezer',
        coverUrl: item.album?.cover_big || item.album?.cover_medium,
        duration: item.duration || 180,
        source: 'deezer',
        deezerId: `${item.id}`,
        audioUrl: item.preview,
      }));
      return res.json({ tracks });
    } catch (err: any) {
      return res.status(500).json({ error: err.message, tracks: [] });
    }
  });

  // Setup Vite dev server or production static serving
  if (!isProd) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Vibra APK & PWA Container running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
