import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Track, ListeningHistoryItem, RepeatMode, ApiStatus, EqualizerSettings, EqualizerPreset } from '../types/player';
import { ProfileContext } from './ProfileContext';

export const FREQUENCIES_10_BAND = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

export const EQUALIZER_PRESETS: EqualizerPreset[] = [
  { id: 'flat', name: 'Équilibré (Flat)', bass: 0, mid: 0, treble: 0, bands10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { id: 'bass-boost', name: 'Cyber Bass Boost (+8 dB)', bass: 8, mid: 1, treble: -1, bands10: [8, 7, 5, 2, 0, 0, 1, 0, -1, -2] },
  { id: 'electro', name: 'Électro & Club Neon', bass: 6, mid: 0, treble: 5, bands10: [6, 5, 3, 0, -1, 1, 2, 4, 5, 6] },
  { id: 'synthwave', name: 'Synthwave 80s Retrowave', bass: 5, mid: 2, treble: 6, bands10: [5, 4, 2, 1, 2, 3, 3, 5, 6, 6] },
  { id: 'vocal', name: 'Voix & Podcast Studio', bass: -2, mid: 5, treble: 3, bands10: [-3, -2, 0, 2, 5, 5, 4, 2, 1, 0] },
  { id: 'rock', name: 'Rock & Punch Métal', bass: 5, mid: -2, treble: 4, bands10: [5, 4, 2, -1, -2, -1, 2, 4, 5, 4] },
  { id: 'clarity', name: 'Clarté Aigus & Cristallin', bass: -1, mid: 2, treble: 7, bands10: [-2, -1, 0, 1, 2, 3, 4, 6, 7, 8] },
];

const EQUALIZER_STORAGE_KEY = 'vibra_audio_equalizer';

interface PlayerContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isShuffling: boolean;
  repeatMode: RepeatMode;
  queue: Track[];
  history: ListeningHistoryItem[];
  apiStatus: ApiStatus;
  equalizer: EqualizerSettings;
  sleepTimerRemaining: number | null;
  startSleepTimer: (minutes: number) => void;
  cancelSleepTimer: () => void;
  toggleBassBoost: () => void;
  toggleSpatialAudio: () => void;
  toggleLoudnessBoost: () => void;
  setEqualizerBand: (band: 'bass' | 'mid' | 'treble', value: number) => void;
  setEqualizerBand10: (index: number, value: number) => void;
  toggle10BandMode: () => void;
  setEqualizerPreset: (presetId: string) => void;
  toggleEqualizer: () => void;
  resetEqualizer: () => void;
  getFrequencyData: () => Uint8Array;
  getWaveformData: () => Uint8Array;
  playbackRate: number;
  setPlaybackRate: (rate: number) => void;
  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  seekTo: (time: number) => void;
  setVolume: (val: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToHistory: (track: Track) => void;
  clearHistory: () => void;
  removeHistoryItem: (id: string) => void;
  isBuffering: boolean;
  audioQuality: 'auto' | 'high' | 'eco';
  setAudioQuality: (q: 'auto' | 'high' | 'eco') => void;
  cachedTrackIds: string[];
  cacheTrackForOffline: (track: Track) => Promise<boolean>;
  isTrackCached: (trackId: string) => boolean;
}

const HISTORY_STORAGE_KEY = 'vibra_listening_history';

// Curated high-fidelity playlist featuring YouTube and Spotify tracks for Vibra
export const DEFAULT_PLAYLIST: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight City (Futuristic Remix)',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
    duration: 244,
    source: 'youtube',
    youtubeId: 'dX3k_QDnzHE',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=synthwave-80s-110045.mp3',
    lyrics: [
      "Waiting in a car, waiting for a ride in the dark",
      "The night city expands into glowing neon arcs",
      "Look at the skyline burning in electric blue",
      "The fast lane is calling out to you",
      "The city is my church, wrapped in ultraviolet haze",
      "Soundwaves echoing through holographic displays",
      "Midnight city, we fly across the cyber rain",
      "Synthesized basslines running through our veins"
    ],
  },
  {
    id: 'track-2',
    title: 'Cyberpunk Neon Dreams',
    artist: 'Vibra AI Synthesis',
    album: 'Future Wave Vol. 1',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
    duration: 198,
    source: 'youtube',
    youtubeId: '8GW6sLrK40k',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_c8c8a73467.mp3?filename=cyberpunk-2099-10701.mp3',
    lyrics: [
      "[Intro - Cyber Synth Sweep]",
      "Megacity 2099, towers piercing through the chrome sky",
      "Data streams flow like rivers as hovercars fly by",
      "Plug into the mainframe, feel the sub-bass rumble deep",
      "In this neon kingdom, the nocturnal machines never sleep",
      "Glow cyan, flash magenta, heartbeats in 128 BPM",
      "We rewrite the digital frequency, again and again"
    ],
  },
  {
    id: 'track-3',
    title: 'Blinding Lights (Acoustic VIP)',
    artist: 'The Weeknd',
    album: 'After Hours',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
    duration: 200,
    source: 'spotify',
    spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=electronic-future-beats-117997.mp3',
    lyrics: [
      "I've been on my own for long enough",
      "Maybe you can show me how to love, maybe",
      "I'm going through withdrawals, you don't even have to do too much",
      "You can turn me on with just a touch, baby",
      "I look around and Sin City's cold and empty",
      "No one's around to judge me",
      "I can't see clearly when you're gone",
      "I said, ooh, I'm blinded by the lights",
      "No, I can't sleep until I feel your touch"
    ],
  },
  {
    id: 'track-4',
    title: 'Retro Wave Night Drive',
    artist: 'Kavinsky & Daft Sound',
    album: 'Outrun Chronicles',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
    duration: 215,
    source: 'youtube',
    youtubeId: '5NV6Rdv1a3I',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/11/24/audio_347318ffea.mp3?filename=lofi-study-112191.mp3',
    lyrics: [
      "Driving the Testarossa through the midnight horizon",
      "Analog tape turning, the synthesizer rising",
      "Zero speed limits, infinite laser grid below",
      "Reflections of magenta in the rearview mirror glow",
      "Keep the momentum, we're outrunning time",
      "Pure analog warmth, rhythm in sublime"
    ],
  },
  {
    id: 'track-5',
    title: 'Levitating (Vibra Deep Mix)',
    artist: 'Dua Lipa',
    album: 'Future Nostalgia',
    coverUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&q=80',
    duration: 203,
    source: 'spotify',
    spotifyId: '463CkQjx2Zk1yXoBuierM9',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f792cb.mp3?filename=tuesday-glitch-122413.mp3',
    lyrics: [
      "If you wanna run away with me, I know a galaxy",
      "And I can take you for a ride",
      "I had a premonition that we fell into a rhythm",
      "Where the music don't stop for life",
      "Glitter in the sky, glitter in my eyes",
      "Shining just the way I like",
      "If you're feeling like you need a little bit of company",
      "You met me at the perfect time",
      "You want me, I want you, baby",
      "My sugarboo, I'm levitating"
    ],
  },
  {
    id: 'track-6',
    title: 'Radio FM Synth & Lo-Fi Chill',
    artist: 'Radio Vibra Direct',
    album: '24/7 Live Stream',
    coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&q=80',
    duration: 3600,
    source: 'radio',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=chill-abstract-intention-12099.mp3',
    lyrics: [
      "[Flux Direct Radio FM Haute Définition]",
      "Vous écoutez Vibra FM en continu",
      "Diffusion hertzienne numérique sans coupure ni publicité",
      "Son spatialisé 320 kbps avec égalisation automatique",
      "Laissez la musique tourner en tâche de fond..."
    ],
  },
];

const PlayerContext = createContext<PlayerContextType | null>(null);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [queue, setQueue] = useState<Track[]>(DEFAULT_PLAYLIST);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(DEFAULT_PLAYLIST[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(DEFAULT_PLAYLIST[0].duration);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off');
  const [playbackRate, setPlaybackRateState] = useState<number>(1.0);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  }, []);

  // Buffering state
  const [isBuffering, setIsBuffering] = useState<boolean>(false);

  // Audio Quality Mode ('auto' | 'high' | 'eco')
  const [audioQuality, setAudioQualityState] = useState<'auto' | 'high' | 'eco'>(() => {
    if (typeof window === 'undefined') return 'auto';
    return (localStorage.getItem('vibra_audio_quality') as any) || 'auto';
  });

  const setAudioQuality = useCallback((quality: 'auto' | 'high' | 'eco') => {
    setAudioQualityState(quality);
    try {
      localStorage.setItem('vibra_audio_quality', quality);
    } catch (e) {}
  }, []);

  // Offline cached track IDs (Cache API integration)
  const [cachedTrackIds, setCachedTrackIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('vibra_cached_track_ids');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [];
  });

  const isTrackCached = useCallback((trackId: string): boolean => {
    return cachedTrackIds.includes(trackId);
  }, [cachedTrackIds]);

  const cacheTrackForOffline = useCallback(async (track: Track): Promise<boolean> => {
    if (typeof window === 'undefined' || !('caches' in window)) return false;
    try {
      let streamUrl = track.audioUrl;
      if (!streamUrl || streamUrl.includes('youtube.com/embed') || streamUrl.includes('youtube-nocookie.com')) {
        streamUrl = `/api/music/stream?q=${encodeURIComponent(track.title + ' ' + track.artist)}&title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`;
      }
      const cache = await caches.open('vibra-audio-cache');
      const res = await fetch(streamUrl);
      if (res.ok) {
        await cache.put(streamUrl, res);
        setCachedTrackIds((prev) => {
          if (prev.includes(track.id)) return prev;
          const next = [...prev, track.id];
          try {
            localStorage.setItem('vibra_cached_track_ids', JSON.stringify(next));
          } catch (e) {}
          return next;
        });
        return true;
      }
    } catch (err) {
      console.warn('Cache track offline notice:', err);
    }
    return false;
  }, []);

  // History state
  const [history, setHistory] = useState<ListeningHistoryItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load listening history:', e);
    }
    // Initial demo history item
    return [
      {
        id: 'hist-init-1',
        track: DEFAULT_PLAYLIST[0],
        playedAt: Date.now() - 1000 * 60 * 12,
        playCount: 3,
      },
      {
        id: 'hist-init-2',
        track: DEFAULT_PLAYLIST[2],
        playedAt: Date.now() - 1000 * 60 * 45,
        playCount: 1,
      },
    ];
  });

  // API Status diagnostic
  const [apiStatus, setApiStatus] = useState<ApiStatus>({
    youtube: {
      status: 'ready',
      version: 'v3 / IFrame Embedded Core',
      adFreeMode: true,
      features: ['Lecture continue sans pubs', 'Audio en arrière-plan', 'Résolution HD / Audio 320k', 'Contournement restrictions iFrame'],
    },
    spotify: {
      status: 'ready',
      mode: 'Web API & Lossless Embed Core',
      features: ['Synchronisation bibliothèque', 'Pochettes HD 640x640', 'Lecture sans pub', 'Support MediaSession'],
    },
    deezer: {
      status: 'ready',
      mode: 'API Deezer Officielle & Top Charts',
      features: ['Flux directs 128k MP3', 'Pochettes HD', 'Compatible Égaliseur Studio', 'Top France & Monde'],
    },
  });
  // Equalizer state with persistence
  const [equalizer, setEqualizer] = useState<EqualizerSettings>(() => {
    const defaultState: EqualizerSettings = {
      isEnabled: true,
      bass: 3,
      mid: 0,
      treble: 2,
      preset: 'flat',
      bands10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      is10BandMode: false,
      bassBoost: false,
      spatialAudio: false,
      loudnessBoost: false,
    };
    if (typeof window === 'undefined') return defaultState;
    try {
      const saved = localStorage.getItem(EQUALIZER_STORAGE_KEY);
      if (saved) return { ...defaultState, ...JSON.parse(saved) };
    } catch (e) {}
    return defaultState;
  });

  // Sleep Timer state
  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const sleepTimerRef = useRef<any>(null);

  const startSleepTimer = useCallback((minutes: number) => {
    if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    const totalSeconds = Math.round(minutes * 60);
    setSleepTimerRemaining(totalSeconds);

    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(sleepTimerRef.current);
          sleepTimerRef.current = null;
          if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.volume = volume;
          }
          setIsPlaying(false);
          return null;
        }
        // Smooth gentle fade out in last 20s
        if (prev <= 20 && audioRef.current) {
          const ratio = Math.max(0, (prev - 1) / 20);
          audioRef.current.volume = volume * ratio;
        }
        return prev - 1;
      });
    }, 1000);
  }, [volume]);

  const cancelSleepTimer = useCallback(() => {
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current);
      sleepTimerRef.current = null;
    }
    setSleepTimerRemaining(null);
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const bassFilterRef = useRef<BiquadFilterNode | null>(null);
  const midFilterRef = useRef<BiquadFilterNode | null>(null);
  const trebleFilterRef = useRef<BiquadFilterNode | null>(null);
  const bands10FiltersRef = useRef<BiquadFilterNode[]>([]);
  const loudnessGainRef = useRef<GainNode | null>(null);
  const compressorRef = useRef<DynamicsCompressorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const pannerNodeRef = useRef<StereoPannerNode | null>(null);
  const nextTrackRef = useRef<() => void>(() => {});
  const prevTrackRef = useRef<() => void>(() => {});
  const handleTrackEndedRef = useRef<() => void>(() => {});
  const isUserIntentPauseRef = useRef<boolean>(false);
  const isPlayingRef = useRef<boolean>(false);
  const currentTrackRef = useRef<Track | null>(DEFAULT_PLAYLIST[0]);
  currentTrackRef.current = currentTrack;

  // Initialize Web Audio API equalizer and visualizer nodes with 10 bands + 3 bands + FX
  const ensureAudioGraph = useCallback(() => {
    if (!audioRef.current || typeof window === 'undefined') return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }
      const ctx = audioContextRef.current;

      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      if (!bassFilterRef.current) {
        // 1. 3-Band Classic Master Filters
        const bass = ctx.createBiquadFilter();
        bass.type = 'lowshelf';
        bass.frequency.value = 150;
        bass.gain.value = equalizer.isEnabled ? equalizer.bass + (equalizer.bassBoost ? 8 : 0) : 0;
        bassFilterRef.current = bass;

        const mid = ctx.createBiquadFilter();
        mid.type = 'peaking';
        mid.frequency.value = 1000;
        mid.Q.value = 1.0;
        mid.gain.value = equalizer.isEnabled ? equalizer.mid : 0;
        midFilterRef.current = mid;

        const treble = ctx.createBiquadFilter();
        treble.type = 'highshelf';
        treble.frequency.value = 6000;
        treble.gain.value = equalizer.isEnabled ? equalizer.treble : 0;
        trebleFilterRef.current = treble;

        // 2. 10-Band Pro Studio Filters
        // Frequencies: [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000]
        const bands10Nodes: BiquadFilterNode[] = [];
        FREQUENCIES_10_BAND.forEach((freq, idx) => {
          const filter = ctx.createBiquadFilter();
          filter.frequency.value = freq;
          if (idx === 0) {
            filter.type = 'lowshelf';
          } else if (idx === FREQUENCIES_10_BAND.length - 1) {
            filter.type = 'highshelf';
          } else {
            filter.type = 'peaking';
            filter.Q.value = 1.4;
          }
          const initialBandGain = equalizer.isEnabled && equalizer.is10BandMode && equalizer.bands10
            ? equalizer.bands10[idx] || 0
            : 0;
          filter.gain.value = initialBandGain;
          bands10Nodes.push(filter);
        });
        bands10FiltersRef.current = bands10Nodes;

        // 3. Audio FX: Loudness & Dynamics Compressor
        const loudnessGain = ctx.createGain();
        loudnessGain.gain.value = equalizer.isEnabled && equalizer.loudnessBoost ? 1.45 : 1.0;
        loudnessGainRef.current = loudnessGain;

        const compressor = ctx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-18, ctx.currentTime);
        compressor.knee.setValueAtTime(30, ctx.currentTime);
        compressor.ratio.setValueAtTime(3, ctx.currentTime);
        compressor.attack.setValueAtTime(0.003, ctx.currentTime);
        compressor.release.setValueAtTime(0.25, ctx.currentTime);
        compressorRef.current = compressor;

        // 4. Spatial Audio (Stereo Panner Node if supported)
        if (ctx.createStereoPanner) {
          try {
            const panner = ctx.createStereoPanner();
            panner.pan.value = equalizer.spatialAudio ? 0.0 : 0.0;
            pannerNodeRef.current = panner;
          } catch (e) {}
        }

        // 5. Analyser node for cyberpunk visualizer
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;
        analyserRef.current = analyser;

        // Connect 3-band chain
        bass.connect(mid);
        mid.connect(treble);

        // Connect 10-band chain in series
        let lastNode: AudioNode = treble;
        bands10Nodes.forEach((bNode) => {
          lastNode.connect(bNode);
          lastNode = bNode;
        });

        // Connect through FX and Analyser to Destination
        lastNode.connect(loudnessGain);
        loudnessGain.connect(compressor);
        if (pannerNodeRef.current) {
          compressor.connect(pannerNodeRef.current);
          pannerNodeRef.current.connect(analyser);
        } else {
          compressor.connect(analyser);
        }
        analyser.connect(ctx.destination);
      }

      // Keep direct native HTML5 audio output so lock screen and background audio never cut off on mobile/desktop
      // createMediaElementSource is intentionally omitted to prevent OS audio graph suspension upon device lock
    } catch (err) {
      console.warn('Web Audio Equalizer initialization notice:', err);
    }
  }, [equalizer.isEnabled, equalizer.bass, equalizer.mid, equalizer.treble, equalizer.bassBoost, equalizer.is10BandMode, equalizer.bands10, equalizer.loudnessBoost, equalizer.spatialAudio]);

  // Synchronize all 10-band and 3-band filter gains in real-time when equalizer settings change
  useEffect(() => {
    if (!audioContextRef.current) return;
    const ctx = audioContextRef.current;
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const now = ctx.currentTime;

    const extraBass = equalizer.bassBoost ? 8 : 0;
    const targetBass = equalizer.isEnabled ? equalizer.bass + extraBass : 0;
    const targetMid = equalizer.isEnabled ? equalizer.mid : 0;
    const targetTreble = equalizer.isEnabled ? equalizer.treble : 0;

    if (bassFilterRef.current) {
      bassFilterRef.current.gain.setTargetAtTime(targetBass, now, 0.03);
    }
    if (midFilterRef.current) {
      midFilterRef.current.gain.setTargetAtTime(targetMid, now, 0.03);
    }
    if (trebleFilterRef.current) {
      trebleFilterRef.current.gain.setTargetAtTime(targetTreble, now, 0.03);
    }

    // Update 10-band filters
    if (bands10FiltersRef.current.length === 10) {
      bands10FiltersRef.current.forEach((filter, idx) => {
        let val = 0;
        if (equalizer.isEnabled) {
          if (equalizer.is10BandMode && equalizer.bands10) {
            val = equalizer.bands10[idx] || 0;
          }
          if (equalizer.bassBoost && idx <= 1) {
            val += 6;
          }
        }
        filter.gain.setTargetAtTime(val, now, 0.03);
      });
    }

    // Update Loudness Boost
    if (loudnessGainRef.current) {
      const targetGain = equalizer.isEnabled && equalizer.loudnessBoost ? 1.45 : 1.0;
      loudnessGainRef.current.gain.setTargetAtTime(targetGain, now, 0.03);
    }
  }, [equalizer]);

  // Real-time audio frequency data for cyberpunk spectrum visualizer
  const getFrequencyData = useCallback((): Uint8Array => {
    if (analyserRef.current) {
      const buffer = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(buffer);
      let sum = 0;
      for (let i = 0; i < buffer.length; i++) sum += buffer[i];
      if (sum > 5) return buffer;
    }
    // Fluid responsive simulated spectrum when playing
    const barsCount = 32;
    const mock = new Uint8Array(barsCount);
    if (isPlaying) {
      const t = Date.now() / 140;
      for (let i = 0; i < barsCount; i++) {
        const wave = Math.sin(t + i * 0.35) * 45 + Math.cos(t * 0.75 + i * 0.5) * 35;
        const bassBoostAdd = (i < 8 && equalizer.bassBoost) ? 55 : (i < 8 ? 30 : 0);
        mock[i] = Math.max(10, Math.min(255, Math.floor(65 + wave + bassBoostAdd + Math.random() * 25)));
      }
    }
    return mock;
  }, [isPlaying, equalizer.bassBoost]);

  // Real-time audio waveform oscilloscope data (Time-Domain)
  const getWaveformData = useCallback((): Uint8Array => {
    if (analyserRef.current) {
      const buffer = new Uint8Array(analyserRef.current.fftSize || 256);
      analyserRef.current.getByteTimeDomainData(buffer);
      let hasSignal = false;
      for (let i = 0; i < buffer.length; i++) {
        if (Math.abs(buffer[i] - 128) > 2) {
          hasSignal = true;
          break;
        }
      }
      if (hasSignal) return buffer;
    }
    // Fluid fallback sine oscilloscope waveform when music is playing
    const length = 128;
    const mock = new Uint8Array(length);
    if (isPlaying) {
      const t = Date.now() / 120;
      for (let i = 0; i < length; i++) {
        const primary = Math.sin(t + i * 0.14) * 42;
        const overtone = Math.sin(t * 1.8 + i * 0.28) * 22;
        const sub = Math.cos(t * 0.6 + i * 0.07) * 16;
        mock[i] = Math.max(0, Math.min(255, Math.floor(128 + primary + overtone + sub)));
      }
    } else {
      mock.fill(128); // Neutral flat line when idle
    }
    return mock;
  }, [isPlaying]);

  // Equalizer manipulation callbacks
  const setEqualizerBand = useCallback((band: 'bass' | 'mid' | 'treble', value: number) => {
    ensureAudioGraph();
    setEqualizer((prev) => {
      const clamped = Math.max(-12, Math.min(12, value));
      const updated = {
        ...prev,
        [band]: clamped,
        preset: 'custom',
      };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [ensureAudioGraph]);

  const setEqualizerBand10 = useCallback((index: number, value: number) => {
    ensureAudioGraph();
    setEqualizer((prev) => {
      const prevBands = prev.bands10 && prev.bands10.length === 10 ? [...prev.bands10] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      prevBands[index] = Math.max(-12, Math.min(12, value));
      // Sync with 3-band preview
      const avgBass = Math.round((prevBands[0] + prevBands[1] + prevBands[2]) / 3);
      const avgMid = Math.round((prevBands[3] + prevBands[4] + prevBands[5] + prevBands[6]) / 4);
      const avgTreble = Math.round((prevBands[7] + prevBands[8] + prevBands[9]) / 3);

      const updated = {
        ...prev,
        bands10: prevBands,
        bass: avgBass,
        mid: avgMid,
        treble: avgTreble,
        preset: 'custom',
      };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [ensureAudioGraph]);

  const toggle10BandMode = useCallback(() => {
    setEqualizer((prev) => {
      const updated = { ...prev, is10BandMode: !prev.is10BandMode };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const toggleBassBoost = useCallback(() => {
    ensureAudioGraph();
    setEqualizer((prev) => {
      const updated = { ...prev, bassBoost: !prev.bassBoost };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [ensureAudioGraph]);

  const toggleSpatialAudio = useCallback(() => {
    setEqualizer((prev) => {
      const updated = { ...prev, spatialAudio: !prev.spatialAudio };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const toggleLoudnessBoost = useCallback(() => {
    setEqualizer((prev) => {
      const updated = { ...prev, loudnessBoost: !prev.loudnessBoost };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const setEqualizerPreset = useCallback((presetId: string) => {
    ensureAudioGraph();
    const preset = EQUALIZER_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    setEqualizer((prev) => {
      const updated = {
        ...prev,
        bass: preset.bass,
        mid: preset.mid,
        treble: preset.treble,
        bands10: preset.bands10 || prev.bands10,
        preset: preset.id,
      };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [ensureAudioGraph]);

  const toggleEqualizer = useCallback(() => {
    ensureAudioGraph();
    setEqualizer((prev) => {
      const updated = {
        ...prev,
        isEnabled: !prev.isEnabled,
      };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [ensureAudioGraph]);

  const resetEqualizer = useCallback(() => {
    ensureAudioGraph();
    setEqualizer((prev) => {
      const updated = {
        ...prev,
        bass: 0,
        mid: 0,
        treble: 0,
        bands10: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        bassBoost: false,
        spatialAudio: false,
        loudnessBoost: false,
        preset: 'flat',
      };
      try {
        localStorage.setItem(EQUALIZER_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, [ensureAudioGraph]);

  // Initialize Audio element with mobile background playback & CORS support
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'auto';
    audio.crossOrigin = 'anonymous';
    audio.volume = volume;

    // Mobile background playback attributes (Android Chrome, iOS Safari & PWA standalone)
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.setAttribute('x-webkit-airplay', 'allow');
    (audio as any).playsInline = true;

    audioRef.current = audio;

    const unlockAudioContext = () => {
      if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch(() => {});
      }
    };
    window.addEventListener('click', unlockAudioContext, { passive: true });
    window.addEventListener('touchstart', unlockAudioContext, { passive: true });

    // Keep audio playing and counteract background/lockscreen pause attempts by mobile/desktop OS
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (isPlayingRef.current && audioRef.current) {
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
          if (audioRef.current.paused && !isUserIntentPauseRef.current) {
            audioRef.current.play().catch(() => {});
          }
        }
      } else {
        if (isPlayingRef.current && audioRef.current && audioRef.current.paused && !isUserIntentPauseRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // Synchronize media session position state for lockscreen timeline
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audio.duration,
            playbackRate: audio.playbackRate || 1.0,
            position: Math.min(audio.currentTime, audio.duration),
          });
        } catch (e) {}
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && audio.duration !== Infinity) {
        setDuration(audio.duration);
      }
    };

    const onPlay = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'VIBRA_AUDIO_STATUS',
          payload: {
            isPlaying: true,
            track: currentTrackRef.current,
            currentTime: audio.currentTime,
            duration: audio.duration || 180,
          },
        });
      }
    };

    const onPause = () => {
      if (audio.ended) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'none';
        }
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'VIBRA_AUDIO_STATUS',
            payload: {
              isPlaying: false,
              track: currentTrackRef.current,
              currentTime: 0,
              duration: audio.duration || 180,
            },
          });
        }
        return;
      }

      if (isUserIntentPauseRef.current) {
        setIsPlaying(false);
        isPlayingRef.current = false;
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'VIBRA_AUDIO_STATUS',
            payload: {
              isPlaying: false,
              track: currentTrackRef.current,
              currentTime: audio.currentTime,
              duration: audio.duration || 180,
            },
          });
        }
      } else {
        // Device lock / background attempt to suspend media: immediately counteract and continue playing!
        if (isPlayingRef.current) {
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
          audio.play().catch(() => {
            setTimeout(() => {
              if (isPlayingRef.current && !isUserIntentPauseRef.current) {
                audio.play().catch(() => {});
              }
            }, 100);
          });
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
              type: 'VIBRA_AUDIO_STATUS',
              payload: {
                isPlaying: true,
                track: currentTrackRef.current,
                currentTime: audio.currentTime,
                duration: audio.duration || 180,
              },
            });
          }
        }
      }
    };

    const onEnded = () => {
      handleTrackEndedRef.current();
    };

    const onError = () => {
      console.warn('Audio playback notice, retrying without strict CORS');
      if (audio.crossOrigin) {
        audio.removeAttribute('crossorigin');
        if (audio.src) {
          audio.load();
          audio.play().catch(() => {});
        }
      }
    };

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onCanPlay = () => setIsBuffering(false);
    const onStalled = () => setIsBuffering(true);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('stalled', onStalled);

    return () => {
      window.removeEventListener('click', unlockAudioContext);
      window.removeEventListener('touchstart', unlockAudioContext);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('stalled', onStalled);
      audio.pause();
    };
  }, []);

  // Helper to sync audio status with the Service Worker for background lifecycle management
  const postStatusToServiceWorker = useCallback((playing: boolean, track: Track | null, currentPos: number, trackDuration: number) => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        navigator.serviceWorker.controller.postMessage({
          type: 'VIBRA_AUDIO_STATUS',
          payload: {
            isPlaying: playing,
            track,
            currentTime: currentPos,
            duration: trackDuration,
          },
        });
      } catch (e) {}
    }
  }, []);

  // Listen to media actions triggered from the Service Worker (lockscreen & notification action clicks)
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (!event.data || event.data.type !== 'VIBRA_MEDIA_ACTION') return;
      const action = event.data.action;
      if (action === 'play') {
        if (audioRef.current && audioRef.current.paused) {
          isUserIntentPauseRef.current = false;
          isPlayingRef.current = true;
          audioRef.current.play().then(() => {
            setIsPlaying(true);
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          }).catch(() => {});
        }
      } else if (action === 'pause') {
        if (audioRef.current && !audioRef.current.paused) {
          isUserIntentPauseRef.current = true;
          isPlayingRef.current = false;
          audioRef.current.pause();
          setIsPlaying(false);
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'paused';
          }
        }
      } else if (action === 'next') {
        nextTrackRef.current();
      } else if (action === 'prev') {
        prevTrackRef.current();
      }
    };

    navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
    };
  }, []);

  // Keepalive heartbeat during active audio playback to prevent mobile OS sleep stoppage
  useEffect(() => {
    if (!isPlaying) return;

    postStatusToServiceWorker(true, currentTrack, currentTime, duration);

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && 'serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'VIBRA_KEEP_ALIVE',
          timestamp: Date.now(),
        });
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [isPlaying, currentTrack, currentTime, duration, postStatusToServiceWorker]);

  // Save history to localStorage
  const saveHistory = (items: ListeningHistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save listening history:', e);
    }
  };

  const addToHistory = useCallback((track: Track) => {
    setHistory((prev) => {
      const existingIndex = prev.findIndex((item) => item.track.id === track.id || item.track.title === track.title);
      let updated: ListeningHistoryItem[];
      if (existingIndex >= 0) {
        const item = prev[existingIndex];
        const newRecord: ListeningHistoryItem = {
          ...item,
          playedAt: Date.now(),
          playCount: item.playCount + 1,
        };
        updated = [newRecord, ...prev.filter((_, idx) => idx !== existingIndex)];
      } else {
        const newRecord: ListeningHistoryItem = {
          id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          track,
          playedAt: Date.now(),
          playCount: 1,
        };
        updated = [newRecord, ...prev.slice(0, 49)]; // Limit to 50 items
      }
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  }, []);

  const clearHistory = () => {
    saveHistory([]);
  };

  const removeHistoryItem = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistory(updated);
  };

  // Setup MediaSession API for Android/iOS lock screen & notification controls
  const syncMediaSession: (track: Track) => void = useCallback((track: Track): void => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.playbackState = 'playing';
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          album: track.album || 'Vibra Music',
          artwork: [
            { src: track.coverUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: track.coverUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: track.coverUrl, sizes: '192x192', type: 'image/png' },
            { src: track.coverUrl, sizes: '256x256', type: 'image/png' },
            { src: track.coverUrl, sizes: '384x384', type: 'image/png' },
            { src: track.coverUrl, sizes: '512x512', type: 'image/png' },
          ],
        });

        navigator.mediaSession.setActionHandler('play', () => {
          isUserIntentPauseRef.current = false;
          isPlayingRef.current = true;
          if (audioRef.current) {
            audioRef.current.play().then(() => {
              setIsPlaying(true);
              navigator.mediaSession.playbackState = 'playing';
              postStatusToServiceWorker(true, track, audioRef.current?.currentTime || 0, audioRef.current?.duration || track.duration);
            }).catch(() => {});
          }
        });

        navigator.mediaSession.setActionHandler('pause', () => {
          isUserIntentPauseRef.current = true;
          isPlayingRef.current = false;
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            navigator.mediaSession.playbackState = 'paused';
            postStatusToServiceWorker(false, track, audioRef.current?.currentTime || 0, audioRef.current?.duration || track.duration);
          }
        });

        navigator.mediaSession.setActionHandler('stop', () => {
          isUserIntentPauseRef.current = true;
          isPlayingRef.current = false;
          if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
            navigator.mediaSession.playbackState = 'none';
            postStatusToServiceWorker(false, track, 0, track.duration);
          }
        });

        navigator.mediaSession.setActionHandler('nexttrack', () => {
          nextTrackRef.current();
        });

        navigator.mediaSession.setActionHandler('previoustrack', () => {
          prevTrackRef.current();
        });

        navigator.mediaSession.setActionHandler('seekbackward', (details) => {
          const skipTime = details.seekOffset || 10;
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(audioRef.current.currentTime - skipTime, 0);
            setCurrentTime(audioRef.current.currentTime);
          }
        });

        navigator.mediaSession.setActionHandler('seekforward', (details) => {
          const skipTime = details.seekOffset || 10;
          if (audioRef.current && audioRef.current.duration) {
            audioRef.current.currentTime = Math.min(audioRef.current.currentTime + skipTime, audioRef.current.duration);
            setCurrentTime(audioRef.current.currentTime);
          }
        });

        navigator.mediaSession.setActionHandler('seekto', (details) => {
          if (details.seekTime !== undefined && audioRef.current) {
            audioRef.current.currentTime = details.seekTime;
            setCurrentTime(details.seekTime);
          }
        });
      } catch (e) {
        console.warn('MediaSession setup:', e);
      }
    }
  }, [postStatusToServiceWorker]);

  const profileContext = useContext(ProfileContext);
  const profileLogPlay = profileContext?.logTrackPlay;

  const playTrack: (track: Track) => void = useCallback((track: Track): void => {
    setCurrentTrack(track);
    setDuration(track.duration || 180);
    setCurrentTime(0);

    isUserIntentPauseRef.current = false;
    isPlayingRef.current = true;

    // Resolve direct stream URL so audio always plays through HTML5 element on lock screen
    let streamUrl = track.audioUrl;
    if (!streamUrl || streamUrl.includes('youtube.com/embed') || streamUrl.includes('youtube-nocookie.com')) {
      streamUrl = `/api/music/stream?q=${encodeURIComponent(track.title + ' ' + track.artist)}&title=${encodeURIComponent(track.title)}&artist=${encodeURIComponent(track.artist)}`;
    }

    if (audioRef.current) {
      ensureAudioGraph();
      audioRef.current.src = streamUrl;
      try {
        if (track.source !== 'radio') {
          audioRef.current.currentTime = 0;
        }
      } catch (e) {}
      audioRef.current.load();
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
        })
        .catch((err) => {
          console.warn('Audio play request notice:', err);
        });
    }

    addToHistory(track);
    if (profileLogPlay) {
      profileLogPlay(track);
    }
    syncMediaSession(track);
    postStatusToServiceWorker(true, track, 0, track.duration || 180);
  }, [addToHistory, syncMediaSession, profileLogPlay, ensureAudioGraph, postStatusToServiceWorker]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      isUserIntentPauseRef.current = true;
      isPlayingRef.current = false;
      audioRef.current.pause();
      setIsPlaying(false);
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      postStatusToServiceWorker(false, currentTrack, currentTime, duration);
    } else {
      isUserIntentPauseRef.current = false;
      isPlayingRef.current = true;
      ensureAudioGraph();

      if (!audioRef.current.src && currentTrack) {
        let streamUrl = currentTrack.audioUrl;
        if (!streamUrl || streamUrl.includes('youtube.com/embed') || streamUrl.includes('youtube-nocookie.com')) {
          streamUrl = `/api/music/stream?q=${encodeURIComponent(currentTrack.title + ' ' + currentTrack.artist)}&title=${encodeURIComponent(currentTrack.title)}&artist=${encodeURIComponent(currentTrack.artist)}`;
        }
        audioRef.current.src = streamUrl;
      }

      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          isPlayingRef.current = true;
          if ('mediaSession' in navigator) {
            navigator.mediaSession.playbackState = 'playing';
          }
          if (currentTrack) {
            syncMediaSession(currentTrack);
            postStatusToServiceWorker(true, currentTrack, audioRef.current?.currentTime || 0, duration);
          }
        })
        .catch((err) => {
          console.warn('Play error:', err);
        });
    }
  };

  const nextTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    let nextIndex: number;
    if (isShuffling) {
      nextIndex = Math.floor(Math.random() * queue.length);
    } else {
      const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
      nextIndex = (currentIndex + 1) % queue.length;
    }
    playTrack(queue[nextIndex]);
  }, [currentTrack, queue, isShuffling, playTrack]);

  const prevTrack = useCallback(() => {
    if (!currentTrack || queue.length === 0) return;
    const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + queue.length) % queue.length;
    playTrack(queue[prevIndex]);
  }, [currentTrack, queue, playTrack]);

  const handleTrackEnded = useCallback(() => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } else if (repeatMode === 'all' || queue.length > 1) {
      nextTrack();
    } else {
      setIsPlaying(false);
    }
  }, [repeatMode, queue.length, nextTrack]);

  useEffect(() => {
    nextTrackRef.current = nextTrack;
    prevTrackRef.current = prevTrack;
    handleTrackEndedRef.current = handleTrackEnded;
  }, [nextTrack, prevTrack, handleTrackEnded]);

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const setVolume = (val: number) => {
    setVolumeState(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (val > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const toggleShuffle = () => {
    setIsShuffling((s) => !s);
  };

  const toggleRepeat = () => {
    setRepeatMode((current) => {
      if (current === 'off') return 'all';
      if (current === 'all') return 'one';
      return 'off';
    });
  };

  // Global Keyboard Shortcuts (Space, Arrow keys, M, N, P)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowRight') {
        if (e.shiftKey) {
          e.preventDefault();
          nextTrackRef.current();
        } else if (audioRef.current && audioRef.current.duration) {
          e.preventDefault();
          seekTo(Math.min(audioRef.current.currentTime + 5, audioRef.current.duration));
        }
      } else if (e.code === 'ArrowLeft') {
        if (e.shiftKey) {
          e.preventDefault();
          prevTrackRef.current();
        } else if (audioRef.current) {
          e.preventDefault();
          seekTo(Math.max(audioRef.current.currentTime - 5, 0));
        }
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        setVolume(Math.min(volume + 0.05, 1));
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        setVolume(Math.max(volume - 0.05, 0));
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        nextTrackRef.current();
      } else if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        prevTrackRef.current();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, volume, setVolume, toggleMute, seekTo]);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isShuffling,
        repeatMode,
        queue,
        history,
        apiStatus,
        equalizer,
        sleepTimerRemaining,
        startSleepTimer,
        cancelSleepTimer,
        toggleBassBoost,
        toggleSpatialAudio,
        toggleLoudnessBoost,
        setEqualizerBand,
        setEqualizerBand10,
        toggle10BandMode,
        setEqualizerPreset,
        toggleEqualizer,
        resetEqualizer,
        getFrequencyData,
        getWaveformData,
        playbackRate,
        setPlaybackRate,
        playTrack,
        togglePlay,
        nextTrack,
        prevTrack,
        seekTo,
        setVolume,
        toggleMute,
        toggleShuffle,
        toggleRepeat,
        addToHistory,
        clearHistory,
        removeHistoryItem,
        isBuffering,
        audioQuality,
        setAudioQuality,
        cachedTrackIds,
        cacheTrackForOffline,
        isTrackCached,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
