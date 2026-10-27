import { Track } from '../types/player';

export interface SearchResponse {
  tracks: Track[];
}

export async function searchMusic(
  query: string,
  source: 'all' | 'youtube' | 'spotify' | 'deezer' = 'all',
  limit = 25
): Promise<Track[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `/api/music/search?q=${encodeURIComponent(query.trim())}&source=${source}&limit=${limit}`
    );
    if (!res.ok) {
      throw new Error(`Search error ${res.status}`);
    }
    const data: SearchResponse = await res.json();
    return data.tracks || [];
  } catch (err) {
    console.warn('Backend music search fallback to client:', err);

    // Client-side fallback if backend route is unavailable
    try {
      if (source === 'deezer' || source === 'all') {
        const dzRes = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}`);
        if (dzRes.ok) {
          const dzData = await dzRes.json();
          if (dzData.data && Array.isArray(dzData.data)) {
            return dzData.data.map((item: any) => ({
              id: `dz-${item.id}`,
              title: item.title,
              artist: item.artist?.name || 'Artiste Deezer',
              album: item.album?.title || 'Deezer',
              coverUrl: item.album?.cover_big || item.album?.cover_medium,
              duration: item.duration || 180,
              source: 'deezer' as const,
              deezerId: `${item.id}`,
              audioUrl: item.preview,
            }));
          }
        }
      }

      const itunesRes = await fetch(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}`
      );
      if (itunesRes.ok) {
        const itunesData = await itunesRes.json();
        if (itunesData.results && Array.isArray(itunesData.results)) {
          return itunesData.results.map((item: any) => ({
            id: `sp-${item.trackId}`,
            title: item.trackName,
            artist: item.artistName,
            album: item.collectionName || 'Single',
            coverUrl: (item.artworkUrl100 || '').replace('100x100bb.jpg', '600x600bb.jpg'),
            duration: Math.round((item.trackTimeMillis || 180000) / 1000),
            source: 'spotify' as const,
            spotifyId: `${item.trackId}`,
            audioUrl: item.previewUrl,
          }));
        }
      }
    } catch (fallbackErr) {
      console.error('Client fallback failed:', fallbackErr);
    }
    return [];
  }
}

export async function getDeezerChart(limit = 25): Promise<Track[]> {
  try {
    const res = await fetch(`/api/deezer/chart?limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      if (data.tracks && data.tracks.length > 0) return data.tracks;
    }
  } catch (err) {
    console.warn('Deezer chart proxy notice:', err);
  }

  // Fallback to direct Deezer chart
  try {
    const dzRes = await fetch(`https://api.deezer.com/chart/0/tracks?limit=${limit}`);
    if (dzRes.ok) {
      const data = await dzRes.json();
      return (data.data || []).map((item: any) => ({
        id: `dz-${item.id}`,
        title: item.title,
        artist: item.artist?.name || 'Artiste Deezer',
        album: item.album?.title || 'Top Deezer France',
        coverUrl: item.album?.cover_big || item.album?.cover_medium,
        duration: item.duration || 180,
        source: 'deezer' as const,
        deezerId: `${item.id}`,
        audioUrl: item.preview,
      }));
    }
  } catch (e) {}

  return [];
}

export async function getAutocompleteSuggestions(query: string): Promise<string[]> {
  if (!query.trim() || query.length < 2) return [];
  try {
    const res = await fetch(`/api/music/suggestions?q=${encodeURIComponent(query.trim())}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {}
  return [];
}

export async function importSpotifyLink(url: string): Promise<{
  title: string;
  provider: string;
  thumbnail: string;
  embedUrl: string;
} | null> {
  if (!url.trim()) return null;
  try {
    const res = await fetch(`/api/spotify/oembed?url=${encodeURIComponent(url.trim())}`);
    if (res.ok) {
      const data = await res.json();
      return {
        title: data.title || 'Playlist Spotify Importée',
        provider: data.provider_name || 'Spotify',
        thumbnail: data.thumbnail_url || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        embedUrl: data.iframe_url || url,
      };
    }
  } catch (err) {
    console.warn('Spotify oEmbed import failed:', err);
  }
  return null;
}

// Curated Top Trending tracks for initial catalog display
export const TOP_TRENDING_CATALOG: Track[] = [
  {
    id: 'yt-dX3k_QDnzHE',
    title: 'Midnight City (Futuristic Remix)',
    artist: 'M83',
    album: "Hurry Up, We're Dreaming",
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
    duration: 244,
    source: 'youtube',
    youtubeId: 'dX3k_QDnzHE',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
  },
  {
    id: 'yt-5NV6Rdv1a3I',
    title: 'Get Lucky (Radio Edit)',
    artist: 'Daft Punk ft. Pharrell Williams',
    album: 'Random Access Memories',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    duration: 248,
    source: 'youtube',
    youtubeId: '5NV6Rdv1a3I',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/11/24/audio_347318ffea.mp3?filename=lofi-study-112191.mp3',
  },
  {
    id: 'sp-0VjIjW4GlUZAMYd2vXMi3b',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    duration: 200,
    source: 'spotify',
    spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
  },
  {
    id: 'yt-8GW6sLrK40k',
    title: 'Cyberpunk Neon Dreams 2099',
    artist: 'Vibra AI Synthesis',
    album: 'Future Wave Vol. 1',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
    duration: 198,
    source: 'youtube',
    youtubeId: '8GW6sLrK40k',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=cyberpunk-2099-10701.mp3',
  },
  {
    id: 'sp-463CkQjx2Zk1yXoBuierM9',
    title: 'Levitating',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80',
    duration: 203,
    source: 'spotify',
    spotifyId: '463CkQjx2Zk1yXoBuierM9',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=tuesday-glitch-122413.mp3',
  },
  {
    id: 'yt-p7f8976sdh7',
    title: 'Mélanine & Nuits d’été',
    artist: 'SDM & Ninho',
    album: 'Liens du 100',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&q=80',
    duration: 215,
    source: 'youtube',
    youtubeId: 'b8KekvP1s1s',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c7f73584.mp3?filename=trap-future-10741.mp3',
  },
  {
    id: 'sp-starboy-vibra',
    title: 'Starboy (Synthwave Edit)',
    artist: 'The Weeknd & Daft Punk',
    album: 'Starboy',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
    duration: 230,
    source: 'spotify',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
  },
  {
    id: 'yt-kavinsky-nightcall',
    title: 'Nightcall (Drive Soundtrack)',
    artist: 'Kavinsky',
    album: 'OutRun',
    coverUrl: 'https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&q=80',
    duration: 259,
    source: 'youtube',
    youtubeId: 'MV_3Dpw-BRY',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=chill-abstract-intention-12099.mp3',
  },
];
