export type TrackSource = 'youtube' | 'spotify' | 'deezer' | 'radio' | 'local';

export interface Track {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl: string;
  duration: number; // in seconds
  source: TrackSource;
  youtubeId?: string;
  spotifyId?: string;
  deezerId?: string;
  audioUrl?: string; // direct audio stream fallback or preview
  channel?: string;
  views?: string;
  lyrics?: string[]; // lyrics lines
  isOfflineAvailable?: boolean;
}

export interface ListeningHistoryItem {
  id: string;
  track: Track;
  playedAt: number; // timestamp
  playCount: number;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  coverUrl: string;
  tracks: Track[];
  createdAt: number;
  isCustom?: boolean;
}

export interface ProfileStats {
  totalListenedMinutes: number;
  totalTracksPlayed: number;
  favoriteGenre: string;
  topArtists: { [artist: string]: number };
}

export interface UserProfile {
  id: string;
  name: string;
  email?: string;
  password?: string;
  isAuthenticated?: boolean;
  avatar: string; // emoji or image url
  badge?: string;
  preferredGenres: string[];
  favoriteTrackIds: string[];
  favorites: Track[];
  playlists: Playlist[];
  history: ListeningHistoryItem[];
  stats: ProfileStats;
  themeColor: string; // e.g. 'purple', 'emerald', 'cyan', 'rose', 'amber'
  createdAt: number;
}

export type RepeatMode = 'off' | 'all' | 'one';

export interface ApiStatus {
  youtube: {
    status: 'ready' | 'loading' | 'error';
    version: string;
    adFreeMode: boolean;
    features: string[];
  };
  spotify: {
    status: 'ready' | 'loading' | 'error';
    mode: string;
    features: string[];
  };
  deezer: {
    status: 'ready' | 'loading' | 'error';
    mode: string;
    features: string[];
  };
}

export interface EqualizerSettings {
  isEnabled: boolean;
  bass: number; // in dB: -12 to +12
  mid: number;  // in dB: -12 to +12
  treble: number; // in dB: -12 to +12
  preset: string; // 'flat' | 'bass-boost' | 'vocal' | 'rock' | 'electro' | 'clarity' | 'custom'
  // Pro 10-band parameters (frequencies: 32Hz, 64Hz, 125Hz, 250Hz, 500Hz, 1kHz, 2kHz, 4kHz, 8kHz, 16kHz)
  bands10?: number[];
  is10BandMode?: boolean;
  bassBoost?: boolean; // +10dB dynamic Sub-Bass enhancer
  spatialAudio?: boolean; // 3D surround sound widening
  loudnessBoost?: boolean; // +5dB clean gain boost
}

export interface EqualizerPreset {
  id: string;
  name: string;
  bass: number;
  mid: number;
  treble: number;
  bands10?: number[];
  icon?: string;
}
