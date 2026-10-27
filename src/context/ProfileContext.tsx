import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserProfile, Track, Playlist, ListeningHistoryItem } from '../types/player';
import { 
  pushProfileToSupabase, 
  fetchProfileFromSupabase, 
  CloudSyncStatus 
} from '../services/supabaseSyncService';

interface ProfileContextType {
  activeProfile: UserProfile;
  profiles: UserProfile[];
  switchProfile: (profileId: string) => void;
  createProfile: (data: { name: string; avatar: string; preferredGenres: string[]; themeColor: string; email?: string; password?: string }) => UserProfile;
  updateActiveProfile: (updates: Partial<UserProfile>) => void;
  deleteProfile: (profileId: string) => void;
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  createPlaylist: (name: string, description?: string, coverUrl?: string) => Playlist;
  addTrackToPlaylist: (playlistId: string, track: Track) => void;
  removeTrackFromPlaylist: (playlistId: string, trackId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  logTrackPlay: (track: Track) => void;
  // Account & Authentication state
  isAuthenticated: boolean;
  login: (emailOrName: string, password?: string) => { success: boolean; message: string };
  signup: (data: { name: string; email: string; password?: string; avatar?: string; preferredGenres?: string[]; themeColor?: string }) => { success: boolean; message: string };
  logout: () => void;
  // Supabase Cloud Sync & Encrypted Session State
  cloudSyncStatus: CloudSyncStatus;
  lastCloudSyncTime: number | null;
  isCloudEncrypted: boolean;
  sessionPassphrase: string;
  setSessionPassphrase: (passphrase: string) => void;
  forceCloudSync: () => Promise<boolean>;
  restoreFromCloud: () => Promise<boolean>;
}

const STORAGE_PROFILES_KEY = 'vibra_user_profiles_v2';
const STORAGE_ACTIVE_ID_KEY = 'vibra_active_profile_id_v2';
const STORAGE_SESSION_PASSPHRASE_KEY = 'vibra_session_passphrase_v1';

const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'profile-antoine',
    name: 'Antoine',
    email: 'antoine.auge@outlook.fr',
    password: '',
    isAuthenticated: true,
    avatar: '🎧',
    badge: 'Vip Studio',
    themeColor: 'purple',
    preferredGenres: ['Rap Français', 'Pop', 'Électro & Synthwave', 'Tendances YouTube'],
    favoriteTrackIds: ['yt-dX3k_QDnzHE', 'sp-0VjIjW4GlUZAMYd2vXMi3b'],
    favorites: [
      {
        id: 'yt-dX3k_QDnzHE',
        title: 'Midnight City (Futuristic Remix)',
        artist: 'M83',
        album: "Hurry Up, We're Dreaming",
        coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
        duration: 244,
        source: 'youtube',
        youtubeId: 'dX3k_QDnzHE',
      },
      {
        id: 'sp-0VjIjW4GlUZAMYd2vXMi3b',
        title: 'Blinding Lights (Acoustic VIP)',
        artist: 'The Weeknd',
        album: 'After Hours',
        coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&q=80',
        duration: 200,
        source: 'spotify',
        spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
      },
    ],
    playlists: [
      {
        id: 'pl-coups-de-coeur',
        name: 'Mes Pépites 2026',
        description: 'Les meilleurs sons YouTube et Spotify réunis sans pub',
        coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
        createdAt: Date.now() - 86400000 * 5,
        tracks: [
          {
            id: 'yt-dX3k_QDnzHE',
            title: 'Midnight City (Futuristic Remix)',
            artist: 'M83',
            album: "Hurry Up, We're Dreaming",
            coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
            duration: 244,
            source: 'youtube',
            youtubeId: 'dX3k_QDnzHE',
          },
        ],
      },
      {
        id: 'pl-night-drive',
        name: 'Night Drive & Synth',
        description: 'Ambiance néon cyberpunk et autoroute nocturne',
        coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&q=80',
        createdAt: Date.now() - 86400000 * 2,
        tracks: [],
      },
    ],
    history: [
      {
        id: 'hist-1',
        track: {
          id: 'yt-dX3k_QDnzHE',
          title: 'Midnight City (Futuristic Remix)',
          artist: 'M83',
          album: "Hurry Up, We're Dreaming",
          coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
          duration: 244,
          source: 'youtube',
          youtubeId: 'dX3k_QDnzHE',
        },
        playedAt: Date.now() - 1000 * 60 * 30,
        playCount: 4,
      },
    ],
    stats: {
      totalListenedMinutes: 184,
      totalTracksPlayed: 45,
      favoriteGenre: 'Rap Français',
      topArtists: { 'M83': 14, 'The Weeknd': 8, 'Daft Punk': 6 },
    },
    createdAt: Date.now() - 86400000 * 30,
  },
  {
    id: 'profile-party',
    name: 'Party & Électro',
    avatar: '🔥',
    badge: 'Clubbing',
    themeColor: 'rose',
    preferredGenres: ['Électro & Club', 'Dance', 'Reggaeton & Latina', 'Hits 2026'],
    favoriteTrackIds: [],
    favorites: [],
    playlists: [
      {
        id: 'pl-party-club',
        name: 'Warm Up Club',
        description: 'Bangers pour faire monter la température',
        coverUrl: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&q=80',
        createdAt: Date.now(),
        tracks: [],
      },
    ],
    history: [],
    stats: {
      totalListenedMinutes: 120,
      totalTracksPlayed: 32,
      favoriteGenre: 'Électro Club',
      topArtists: { 'David Guetta': 12, 'Calvin Harris': 8 },
    },
    createdAt: Date.now() - 86400000 * 15,
  },
  {
    id: 'profile-chill',
    name: 'Focus & Détente',
    avatar: '🌿',
    badge: 'Chill Zone',
    themeColor: 'emerald',
    preferredGenres: ['Lo-Fi Study', 'Chillout', 'Jazz & Instrumental', 'Ambient'],
    favoriteTrackIds: [],
    favorites: [],
    playlists: [
      {
        id: 'pl-deep-focus',
        name: 'Concentration Profonde',
        description: 'Beats lofi calmes pour réviser ou travailler sans distraction',
        coverUrl: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?w=500&q=80',
        createdAt: Date.now(),
        tracks: [],
      },
    ],
    history: [],
    stats: {
      totalListenedMinutes: 95,
      totalTracksPlayed: 25,
      favoriteGenre: 'Lo-Fi Chill',
      topArtists: { 'ChilledCow': 10, 'Kavinsky': 6 },
    },
    createdAt: Date.now() - 86400000 * 10,
  },
];

export const ProfileContext = createContext<ProfileContextType | null>(null);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    if (typeof window === 'undefined') return INITIAL_PROFILES;
    try {
      const saved = localStorage.getItem(STORAGE_PROFILES_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved profiles:', e);
    }
    return INITIAL_PROFILES;
  });

  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    if (typeof window === 'undefined') return INITIAL_PROFILES[0].id;
    try {
      const savedId = localStorage.getItem(STORAGE_ACTIVE_ID_KEY);
      if (savedId) return savedId;
    } catch {}
    return INITIAL_PROFILES[0].id;
  });

  // Cryptographically secure token generator using CSPRNG
  const generateCryptographicKey = (profileId: string): string => {
    if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
      const bytes = new Uint8Array(24);
      window.crypto.getRandomValues(bytes);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const token = window.btoa(binary).replace(/[+/=]/g, (m) => ({ '+': '-', '/': '_', '=': '' }[m] || ''));
      return `vibra_enc_${profileId.slice(-6)}_${token}`;
    }
    return `vibra_enc_${profileId.slice(-6)}_${Date.now()}`;
  };

  // Supabase Cloud Sync & Encrypted Session Secret isolated per profile
  const [sessionPassphrase, setSessionPassphraseState] = useState<string>(() => {
    if (typeof window === 'undefined') return 'vibra_ephemeral_key';
    try {
      const profileKey = `vibra_profile_key_${activeProfileId}`;
      const saved = localStorage.getItem(profileKey);
      if (saved && saved.trim().length > 10) return saved;
      const secureKey = generateCryptographicKey(activeProfileId);
      localStorage.setItem(profileKey, secureKey);
      return secureKey;
    } catch {
      return generateCryptographicKey(activeProfileId);
    }
  });

  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>('synced');
  const [lastCloudSyncTime, setLastCloudSyncTime] = useState<number | null>(null);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update session passphrase whenever active profile switches
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const profileKey = `vibra_profile_key_${activeProfileId}`;
      const saved = localStorage.getItem(profileKey);
      if (saved && saved.trim().length > 10) {
        setSessionPassphraseState(saved);
      } else {
        const secureKey = generateCryptographicKey(activeProfileId);
        localStorage.setItem(profileKey, secureKey);
        setSessionPassphraseState(secureKey);
      }
    } catch (e) {
      console.warn('Profile key isolation notice:', e);
    }
  }, [activeProfileId]);

  const setSessionPassphrase = useCallback((passphrase: string) => {
    const trimmed = passphrase.trim() || generateCryptographicKey(activeProfileId);
    setSessionPassphraseState(trimmed);
    try {
      localStorage.setItem(`vibra_profile_key_${activeProfileId}`, trimmed);
    } catch (e) {
      console.warn('Failed to save session passphrase:', e);
    }
  }, [activeProfileId]);

  // Save profiles to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILES_KEY, JSON.stringify(profiles));
      localStorage.setItem(STORAGE_ACTIVE_ID_KEY, activeProfileId);
    } catch (e) {
      console.warn('Failed to save profiles to localStorage:', e);
    }
  }, [profiles, activeProfileId]);

  const activeProfile = profiles.find((p) => p.id === activeProfileId) || profiles[0] || INITIAL_PROFILES[0];

  // Automatic background debounced sync to Supabase Cloud with AES-GCM encryption
  useEffect(() => {
    if (!activeProfile) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    setCloudSyncStatus('syncing');

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await pushProfileToSupabase(activeProfile, sessionPassphrase);
        if (res.success) {
          setCloudSyncStatus('synced');
          setLastCloudSyncTime(res.timestamp);
        } else {
          setCloudSyncStatus('error');
        }
      } catch (err) {
        console.warn('Background sync notice:', err);
        setCloudSyncStatus('offline');
      }
    }, 1500);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [activeProfile, sessionPassphrase]);

  const forceCloudSync = useCallback(async (): Promise<boolean> => {
    if (!activeProfile) return false;
    setCloudSyncStatus('syncing');
    try {
      const res = await pushProfileToSupabase(activeProfile, sessionPassphrase);
      if (res.success) {
        setCloudSyncStatus('synced');
        setLastCloudSyncTime(res.timestamp);
        return true;
      }
      setCloudSyncStatus('error');
      return false;
    } catch (err) {
      console.error('forceCloudSync failed:', err);
      setCloudSyncStatus('error');
      return false;
    }
  }, [activeProfile, sessionPassphrase]);

  const restoreFromCloud = useCallback(async (): Promise<boolean> => {
    if (!activeProfile) return false;
    setCloudSyncStatus('syncing');
    try {
      const res = await fetchProfileFromSupabase(activeProfile.id, sessionPassphrase);
      if (res.success && res.data) {
        const cloudData = res.data;
        setProfiles((prev) =>
          prev.map((p) => {
            if (p.id !== activeProfile.id) return p;
            return {
              ...p,
              name: cloudData.preferences.name || p.name,
              avatar: cloudData.preferences.avatar || p.avatar,
              themeColor: cloudData.preferences.themeColor || p.themeColor,
              preferredGenres: cloudData.preferences.preferredGenres || p.preferredGenres,
              favoriteTrackIds: cloudData.preferences.favoriteTrackIds || p.favoriteTrackIds,
              favorites: cloudData.preferences.favorites || p.favorites,
              playlists: cloudData.preferences.playlists || p.playlists,
              history: cloudData.history || p.history,
            };
          })
        );
        setCloudSyncStatus('synced');
        setLastCloudSyncTime(cloudData.syncedAt);
        return true;
      }
      setCloudSyncStatus('error');
      return false;
    } catch (err) {
      console.error('restoreFromCloud failed:', err);
      setCloudSyncStatus('error');
      return false;
    }
  }, [activeProfile, sessionPassphrase]);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem('vibra_is_authenticated_v1');
      if (saved !== null) return saved === 'true';
    } catch {}
    return true;
  });

  const switchProfile = (profileId: string) => {
    if (profiles.some((p) => p.id === profileId)) {
      setActiveProfileId(profileId);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('vibra_is_authenticated_v1', 'true');
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, profileId);
      } catch {}
    }
  };

  const createProfile = useCallback((data: {
    name: string;
    avatar: string;
    preferredGenres: string[];
    themeColor: string;
    email?: string;
    password?: string;
  }): UserProfile => {
    const newProfile: UserProfile = {
      id: `profile-${Date.now()}`,
      name: data.name.trim() || 'Mon Profil',
      email: data.email || `${data.name.trim().toLowerCase()}@vibra.app`,
      password: data.password || '',
      isAuthenticated: true,
      avatar: data.avatar || '🎵',
      badge: 'Membre VIP',
      themeColor: data.themeColor || 'purple',
      preferredGenres: data.preferredGenres.length > 0 ? data.preferredGenres : ['Pop', 'Rap Français', 'Électro'],
      favoriteTrackIds: [],
      favorites: [],
      playlists: [
        {
          id: `pl-${Date.now()}-1`,
          name: 'Mes Coups de Cœur',
          description: 'Playlist privée et personnelle',
          coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
          createdAt: Date.now(),
          tracks: [],
        },
      ],
      history: [],
      stats: {
        totalListenedMinutes: 0,
        totalTracksPlayed: 0,
        favoriteGenre: data.preferredGenres[0] || 'Général',
        topArtists: {},
      },
      createdAt: Date.now(),
    };

    setProfiles((prev) => [...prev, newProfile]);
    setActiveProfileId(newProfile.id);
    setIsAuthenticated(true);
    return newProfile;
  }, []);

  const login = useCallback(
    (emailOrName: string, password?: string): { success: boolean; message: string } => {
      const query = emailOrName.trim().toLowerCase();
      const found = profiles.find(
        (p) => p.name.toLowerCase() === query || (p.email && p.email.toLowerCase() === query)
      );
      if (found) {
        setActiveProfileId(found.id);
        setIsAuthenticated(true);
        try {
          localStorage.setItem('vibra_is_authenticated_v1', 'true');
          localStorage.setItem(STORAGE_ACTIVE_ID_KEY, found.id);
        } catch {}
        return { success: true, message: `Connexion réussie ! Bienvenue ${found.name}.` };
      }
      const newName = emailOrName.includes('@') ? emailOrName.split('@')[0] : emailOrName;
      const capitalized = newName.charAt(0).toUpperCase() + newName.slice(1);
      const newP = createProfile({
        name: capitalized,
        email: emailOrName.includes('@') ? emailOrName : `${emailOrName.toLowerCase()}@vibra.app`,
        password: password || '',
        avatar: '🎧',
        themeColor: 'purple',
        preferredGenres: ['Rap Français', 'Pop', 'Électro & Club'],
      });
      setActiveProfileId(newP.id);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('vibra_is_authenticated_v1', 'true');
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, newP.id);
      } catch {}
      return { success: true, message: `Nouveau compte créé et connecté pour ${newP.name} !` };
    },
    [profiles, createProfile]
  );

  const signup = useCallback(
    (data: {
      name: string;
      email: string;
      password?: string;
      avatar?: string;
      preferredGenres?: string[];
      themeColor?: string;
    }): { success: boolean; message: string } => {
      const existing = profiles.find(
        (p) =>
          (p.email && p.email.toLowerCase() === data.email.toLowerCase()) ||
          p.name.toLowerCase() === data.name.toLowerCase()
      );
      if (existing) {
        setActiveProfileId(existing.id);
        setIsAuthenticated(true);
        return { success: true, message: `Compte existant retrouvé pour ${existing.name}. Vous êtes connecté !` };
      }
      const newP = createProfile({
        name: data.name,
        email: data.email,
        password: data.password || '',
        avatar: data.avatar || '🎧',
        themeColor: data.themeColor || 'purple',
        preferredGenres:
          data.preferredGenres && data.preferredGenres.length > 0
            ? data.preferredGenres
            : ['Rap Français', 'Pop', 'Électro & Club'],
      });
      setActiveProfileId(newP.id);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('vibra_is_authenticated_v1', 'true');
        localStorage.setItem(STORAGE_ACTIVE_ID_KEY, newP.id);
      } catch {}
      return { success: true, message: `Bienvenue, ${newP.name} ! Votre compte privé a été créé.` };
    },
    [profiles, createProfile]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('vibra_is_authenticated_v1', 'false');
    } catch {}
  }, []);

  const updateActiveProfile = (updates: Partial<UserProfile>) => {
    setProfiles((prev) =>
      prev.map((p) => (p.id === activeProfileId ? { ...p, ...updates } : p))
    );
  };

  const deleteProfile = (profileId: string) => {
    if (profiles.length <= 1) return; // Keep at least one
    const remaining = profiles.filter((p) => p.id !== profileId);
    setProfiles(remaining);
    if (activeProfileId === profileId) {
      setActiveProfileId(remaining[0].id);
    }
  };

  const toggleFavorite = (track: Track) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfileId) return p;
        const exists = p.favoriteTrackIds.includes(track.id);
        const updatedIds = exists
          ? p.favoriteTrackIds.filter((id) => id !== track.id)
          : [track.id, ...p.favoriteTrackIds];
        const updatedFavs = exists
          ? p.favorites.filter((f) => f.id !== track.id)
          : [track, ...p.favorites];

        return {
          ...p,
          favoriteTrackIds: updatedIds,
          favorites: updatedFavs,
        };
      })
    );
  };

  const isFavorite = (trackId: string): boolean => {
    return activeProfile.favoriteTrackIds.includes(trackId);
  };

  const createPlaylist = (name: string, description?: string, coverUrl?: string): Playlist => {
    const newPl: Playlist = {
      id: `pl-${Date.now()}`,
      name: name.trim(),
      description: description?.trim() || 'Playlist créée sur Vibra',
      coverUrl: coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&q=80',
      createdAt: Date.now(),
      tracks: [],
      isCustom: true,
    };

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfileId) return p;
        return {
          ...p,
          playlists: [newPl, ...p.playlists],
        };
      })
    );

    return newPl;
  };

  const addTrackToPlaylist = (playlistId: string, track: Track) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfileId) return p;
        return {
          ...p,
          playlists: p.playlists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            if (pl.tracks.some((t) => t.id === track.id)) return pl;
            return {
              ...pl,
              tracks: [...pl.tracks, track],
            };
          }),
        };
      })
    );
  };

  const removeTrackFromPlaylist = (playlistId: string, trackId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfileId) return p;
        return {
          ...p,
          playlists: p.playlists.map((pl) => {
            if (pl.id !== playlistId) return pl;
            return {
              ...pl,
              tracks: pl.tracks.filter((t) => t.id !== trackId),
            };
          }),
        };
      })
    );
  };

  const deletePlaylist = (playlistId: string) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfileId) return p;
        return {
          ...p,
          playlists: p.playlists.filter((pl) => pl.id !== playlistId),
        };
      })
    );
  };

  const logTrackPlay = (track: Track) => {
    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id !== activeProfileId) return p;
        const existingIdx = p.history.findIndex((h) => h.track.id === track.id);
        let updatedHist: ListeningHistoryItem[] = [];

        if (existingIdx !== -1) {
          const item = p.history[existingIdx];
          const updatedItem = {
            ...item,
            playedAt: Date.now(),
            playCount: item.playCount + 1,
          };
          updatedHist = [updatedItem, ...p.history.filter((_, idx) => idx !== existingIdx)];
        } else {
          const newItem: ListeningHistoryItem = {
            id: `hist-${Date.now()}`,
            track,
            playedAt: Date.now(),
            playCount: 1,
          };
          updatedHist = [newItem, ...p.history.slice(0, 49)];
        }

        const currentTop = { ...(p.stats?.topArtists || {}) };
        if (track.artist) {
          currentTop[track.artist] = (currentTop[track.artist] || 0) + 1;
        }

        const updatedStats = {
          totalListenedMinutes: (p.stats?.totalListenedMinutes || 0) + Math.round((track.duration || 180) / 60),
          totalTracksPlayed: (p.stats?.totalTracksPlayed || 0) + 1,
          favoriteGenre: p.preferredGenres[0] || 'Pop & Rap',
          topArtists: currentTop,
        };

        return {
          ...p,
          history: updatedHist,
          stats: updatedStats,
        };
      })
    );
  };

  return (
    <ProfileContext.Provider
      value={{
        activeProfile,
        profiles,
        switchProfile,
        createProfile,
        updateActiveProfile,
        deleteProfile,
        toggleFavorite,
        isFavorite,
        createPlaylist,
        addTrackToPlaylist,
        removeTrackFromPlaylist,
        deletePlaylist,
        logTrackPlay,
        isAuthenticated,
        login,
        signup,
        logout,
        cloudSyncStatus,
        lastCloudSyncTime,
        isCloudEncrypted: true,
        sessionPassphrase,
        setSessionPassphrase,
        forceCloudSync,
        restoreFromCloud,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};
