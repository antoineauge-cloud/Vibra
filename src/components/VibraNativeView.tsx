import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Sparkles, 
  Music2, 
  Radio, 
  ListMusic, 
  Headphones, 
  Flame, 
  Play, 
  Pause, 
  Clock, 
  Heart, 
  ExternalLink, 
  Plus, 
  Check, 
  Layers, 
  Zap,
  TrendingUp,
  X,
  User,
  FolderPlus,
  Share2,
  Trash2,
  CheckCircle2,
  ListPlus,
  Shuffle,
  ShieldCheck,
  Disc3,
  Tv,
  Download
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useProfile } from '../context/ProfileContext';
import { Track, Playlist } from '../types/player';
import { 
  searchMusic, 
  getAutocompleteSuggestions, 
  importSpotifyLink, 
  getDeezerChart,
  TOP_TRENDING_CATALOG 
} from '../services/musicSearchService';

export const VibraNativeView: React.FC<{ 
  onSwitchToRadio: () => void;
  onOpenProfileModal?: () => void;
  initialTab?: 'discover' | 'search' | 'deezer' | 'offline' | 'playlists' | 'favorites' | 'spotify';
  initialQuery?: string;
}> = ({ onSwitchToRadio, onOpenProfileModal, initialTab = 'discover', initialQuery = '' }) => {
  const { 
    playTrack, 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    cachedTrackIds, 
    isTrackCached, 
    cacheTrackForOffline 
  } = usePlayer();
  const { 
    activeProfile, 
    toggleFavorite, 
    isFavorite, 
    createPlaylist, 
    addTrackToPlaylist,
    removeTrackFromPlaylist,
    deletePlaylist
  } = useProfile();

  // Navigation Sub-Tabs
  const [activeTab, setActiveTab] = useState<'discover' | 'search' | 'deezer' | 'offline' | 'playlists' | 'favorites' | 'spotify'>(initialTab);

  // Search State
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchSource, setSearchSource] = useState<'all' | 'youtube' | 'spotify' | 'deezer'>('all');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [deezerTracks, setDeezerTracks] = useState<Track[]>([]);
  const [isLoadingDeezer, setIsLoadingDeezer] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    if (initialQuery) {
      setSearchQuery(initialQuery);
      setActiveTab('search');
    }
  }, [initialQuery]);

  // Lazy load Deezer Top Charts when Deezer tab is accessed
  useEffect(() => {
    if (activeTab === 'deezer' && deezerTracks.length === 0) {
      setIsLoadingDeezer(true);
      getDeezerChart().then((tracks) => {
        setDeezerTracks(tracks);
        setIsLoadingDeezer(false);
      }).catch((err) => {
        console.error('Failed to load Deezer chart:', err);
        setIsLoadingDeezer(false);
      });
    }
  }, [activeTab, deezerTracks.length]);
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Playlists State
  const [showCreatePlaylistModal, setShowCreatePlaylistModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [newPlaylistDesc, setNewPlaylistDesc] = useState('');
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);

  // Add to Playlist Dropdown / Modal
  const [trackToAddToPlaylist, setTrackToAddToPlaylist] = useState<Track | null>(null);
  const [addedToast, setAddedToast] = useState<string | null>(null);

  // Spotify Import State
  const [spotifyImportUrl, setSpotifyImportUrl] = useState('');
  const [isImportingSpotify, setIsImportingSpotify] = useState(false);
  const [spotifyImportSuccess, setSpotifyImportSuccess] = useState<string | null>(null);

  // Debounced search when user types
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchMusic(searchQuery, searchSource, 30);
        setSearchResults(results);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, searchSource]);

  // Suggestions for autocomplete
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      getAutocompleteSuggestions(searchQuery).then((suggs) => {
        setSuggestions(suggs.slice(0, 5));
      });
    } else {
      setSuggestions([]);
    }
  }, [searchQuery]);

  const handleCreatePlaylistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    const pl = createPlaylist(newPlaylistName.trim(), newPlaylistDesc.trim());
    setNewPlaylistName('');
    setNewPlaylistDesc('');
    setShowCreatePlaylistModal(false);
    setSelectedPlaylist(pl);
    setAddedToast(`Playlist "${pl.name}" créée pour ${activeProfile.name} !`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleAddTrackToUserPlaylist = (playlistId: string, track: Track) => {
    addTrackToPlaylist(playlistId, track);
    setTrackToAddToPlaylist(null);
    const targetPl = activeProfile.playlists.find((p) => p.id === playlistId);
    setAddedToast(`Ajouté à "${targetPl?.name || 'Playlist'}" !`);
    setTimeout(() => setAddedToast(null), 3000);
  };

  const handleSpotifyImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!spotifyImportUrl.trim()) return;

    setIsImportingSpotify(true);
    setSpotifyImportSuccess(null);

    const imported = await importSpotifyLink(spotifyImportUrl);
    setIsImportingSpotify(false);

    if (imported) {
      const newPl = createPlaylist(
        imported.title,
        `Importé depuis Spotify (${imported.provider})`,
        imported.thumbnail
      );
      setSpotifyImportUrl('');
      setSpotifyImportSuccess(`La playlist "${imported.title}" a été synchronisée dans votre profil ${activeProfile.name} !`);
      setSelectedPlaylist(newPl);
    } else {
      setSpotifyImportSuccess("Impossible d'importer ce lien. Vérifiez que le lien Spotify est public.");
    }
  };

  // AI Mood Generators tailored to the active profile
  const aiMoods = [
    { name: 'Futuriste & Synth', color: 'from-purple-600 to-indigo-600', query: 'synthwave cyberpunk futuristic hits', desc: 'Synthétiseurs néon et ambiances cyberpunk' },
    { name: 'Énergie & Nuit', color: 'from-pink-600 to-rose-600', query: 'rap francais hits booba ninho sdm', desc: 'Rap percutant et hits énergiques' },
    { name: 'Focus & Concentration', color: 'from-blue-600 to-cyan-600', query: 'lofi hip hop chill beats study', desc: 'Sons apaisants pour travailler ou réviser' },
    { name: 'Détente & Chillout', color: 'from-emerald-600 to-teal-600', query: 'chillout lounge ambient relaxation', desc: 'Rythmes doux pour déconnecter' },
  ];

  const handleLaunchAiMood = async (moodQuery: string) => {
    setActiveTab('search');
    setSearchQuery(moodQuery);
    setIsSearching(true);
    const results = await searchMusic(moodQuery, 'all', 25);
    setSearchResults(results);
    setIsSearching(false);
    if (results.length > 0) {
      playTrack(results[0]);
    }
  };

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-28">
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed top-16 right-4 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 text-white text-xs font-bold shadow-xl border border-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{addedToast}</span>
          </div>
        </div>
      )}

      {/* Personalized Header Banner for this User Profile */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/70 to-slate-900/70 border border-purple-500/35 text-white shadow-2xl backdrop-blur-2xl overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-0.5 shadow-xl shadow-purple-600/30 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0c0c1e] flex items-center justify-center text-3xl">
                {activeProfile.avatar}
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold uppercase tracking-wider">
                  Profil Musical Personnalisé
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                  Bibliothèque YouTube & Spotify Complète
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Bienvenue, {activeProfile.name}
              </h2>

              <p className="text-xs sm:text-sm text-purple-200 mt-1 max-w-xl">
                Accédez à l'intégralité des millions de titres, clips et albums de YouTube et Spotify sans pub. Votre historique, playlists et recommandations sont 100% dédiés à votre profil.
              </p>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3 text-xs text-purple-200">
                <span>⭐ {activeProfile.favorites.length} favoris</span>
                <span>•</span>
                <span>📁 {activeProfile.playlists.length} playlists</span>
                <span>•</span>
                <span>⏱️ {activeProfile.stats.totalListenedMinutes} min d'écoute</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
            {onOpenProfileModal && (
              <button
                onClick={onOpenProfileModal}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-purple-950 font-bold text-xs shadow-md hover:bg-purple-50 active:scale-95 transition"
              >
                <User className="w-4 h-4 text-purple-700" />
                <span>Changer / Gérer Profils ({activeProfile.name})</span>
              </button>
            )}

            <button
              onClick={() => {
                setActiveTab('playlists');
                setShowCreatePlaylistModal(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
            >
              <FolderPlus className="w-4 h-4 text-pink-300" />
              <span>+ Nouvelle Playlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Global Real-Time Search Bar for YouTube & Spotify */}
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher n'importe quel titre, artiste, remix ou album sur YouTube et Spotify..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full bg-white/50 dark:bg-[#07091c]/55 border border-slate-200/60 dark:border-cyan-500/30 backdrop-blur-xl rounded-2xl pl-11 pr-24 py-3.5 text-xs sm:text-sm text-slate-900 dark:text-cyan-100 placeholder:text-slate-400 dark:placeholder:text-cyan-500/50 focus:outline-none focus:border-cyan-400 shadow-sm transition"
          />

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="absolute right-24 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Source toggle filter inside search bar */}
          <div className="absolute right-2.5 flex items-center gap-1 p-1 bg-slate-100 dark:bg-black/40 rounded-xl text-[10px] font-bold">
            <button
              onClick={() => setSearchSource('all')}
              className={`px-2 py-1 rounded-lg transition ${
                searchSource === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-white'
              }`}
            >
              Tout
            </button>
            <button
              onClick={() => setSearchSource('youtube')}
              className={`px-2 py-1 rounded-lg transition ${
                searchSource === 'youtube'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-red-400'
              }`}
            >
              YouTube
            </button>
            <button
              onClick={() => setSearchSource('spotify')}
              className={`px-2 py-1 rounded-lg transition ${
                searchSource === 'spotify'
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-green-400'
              }`}
            >
              Spotify
            </button>
            <button
              onClick={() => setSearchSource('deezer')}
              className={`px-2 py-1 rounded-lg transition ${
                searchSource === 'deezer'
                  ? 'bg-amber-500 text-black shadow-xs font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-amber-400'
              }`}
            >
              Deezer
            </button>
          </div>
        </div>

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-1 bg-white dark:bg-[#121224] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl py-1.5 z-40 text-xs">
            {suggestions.map((sugg, i) => (
              <button
                key={i}
                onClick={() => {
                  setSearchQuery(sugg);
                  setShowSuggestions(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-purple-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 flex items-center gap-2 transition"
              >
                <Search className="w-3.5 h-3.5 text-purple-500" />
                <span>{sugg}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'discover'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Pour Vous & Tendances</span>
        </button>

        <button
          onClick={() => setActiveTab('deezer')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'deezer'
              ? 'bg-amber-500 text-black font-extrabold shadow-md shadow-amber-500/30'
              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
          }`}
        >
          <Flame className="w-4 h-4 text-amber-500" />
          <span>Top Deezer</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'search'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>Recherche ({searchResults.length > 0 ? `${searchResults.length} résultats` : 'Catalogue'})</span>
        </button>

        <button
          onClick={() => setActiveTab('playlists')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'playlists'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
          }`}
        >
          <ListMusic className="w-4 h-4 text-pink-400" />
          <span>Mes Playlists ({activeProfile.playlists.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'favorites'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-current" />
          <span>Mes Favoris ({activeProfile.favorites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('offline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'offline'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
          }`}
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Hors-ligne ({cachedTrackIds.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('spotify')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
            activeTab === 'spotify'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
              : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
          }`}
        >
          <Headphones className="w-4 h-4 text-emerald-400" />
          <span>Import Spotify</span>
        </button>

        <button
          onClick={onSwitchToRadio}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap bg-blue-600/10 hover:bg-blue-600/20 text-blue-700 dark:text-blue-300 border border-blue-400/30 transition"
        >
          <Radio className="w-4 h-4 text-blue-500 animate-pulse" />
          <span>Radio FM Direct</span>
        </button>
      </div>

      {/* TAB 1: DISCOVER & PERSONALIZED AI FOR ACTIVE PROFILE */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* AI Moods Adapted for User */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Générateur d'Ambiances IA (Profil {activeProfile.name})
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">Génération adaptative</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {aiMoods.map((mood, idx) => (
                <div
                  key={idx}
                  onClick={() => handleLaunchAiMood(mood.query)}
                  className={`p-4 rounded-2xl bg-gradient-to-br ${mood.color} text-white cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition shadow-lg shadow-black/10 flex flex-col justify-between h-32`}
                >
                  <div className="flex items-center justify-between">
                    <Sparkles className="w-5 h-5 text-white/90" />
                    <span className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                      <Play className="w-3.5 h-3.5 fill-current" />
                    </span>
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{mood.name}</h4>
                    <p className="text-[11px] text-white/80 mt-0.5 line-clamp-1">{mood.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Music Catalog (YouTube Trends & Spotify Hits) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-500" />
                Titres Phares & Tendances du Moment
              </h3>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                Flux audio sans interruption
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOP_TRENDING_CATALOG.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  isCurrent={currentTrack?.id === track.id}
                  isFav={isFavorite(track.id)}
                  isCached={isTrackCached(track.id)}
                  onPlay={() => playTrack(track)}
                  onToggleFavorite={() => toggleFavorite(track)}
                  onOpenAddToPlaylist={() => setTrackToAddToPlaylist(track)}
                  onDownload={() => cacheTrackForOffline(track)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB: DEEZER TOP CHARTS & HITS */}
      {activeTab === 'deezer' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider">
                  Deezer France & International
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold">
                  Previews Audio 128 kbps Stéréo
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl mt-1 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                Top 50 Deezer France
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Les titres les plus écoutés en France en temps réel, avec pré-écoute instantanée haute qualité
              </p>
            </div>

            <button
              onClick={() => {
                setIsLoadingDeezer(true);
                getDeezerChart().then((tracks) => {
                  setDeezerTracks(tracks);
                  setIsLoadingDeezer(false);
                }).catch(() => setIsLoadingDeezer(false));
              }}
              disabled={isLoadingDeezer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-bold transition disabled:opacity-50 self-start sm:self-auto"
            >
              <Zap className="w-4 h-4" />
              <span>{isLoadingDeezer ? 'Actualisation...' : 'Actualiser le Top'}</span>
            </button>
          </div>

          {isLoadingDeezer && deezerTracks.length === 0 ? (
            <div className="p-16 text-center rounded-3xl bg-white/40 dark:bg-white/[0.02] border border-amber-500/20 space-y-3">
              <div className="w-12 h-12 rounded-full border-3 border-amber-400 border-t-transparent animate-spin mx-auto" />
              <p className="text-sm font-semibold text-amber-300">Chargement du Top Charts Deezer...</p>
            </div>
          ) : deezerTracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {deezerTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  isCurrent={currentTrack?.id === track.id}
                  isFav={isFavorite(track.id)}
                  isCached={isTrackCached(track.id)}
                  onPlay={() => playTrack(track)}
                  onToggleFavorite={() => toggleFavorite(track)}
                  onOpenAddToPlaylist={() => setTrackToAddToPlaylist(track)}
                  onDownload={() => cacheTrackForOffline(track)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
              <p className="text-sm text-slate-400">Aucun titre disponible pour le moment.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE SEARCH RESULTS (YOUTUBE, SPOTIFY & DEEZER COMPLETE LIBRARY) */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Search className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              {searchQuery ? `Résultats pour "${searchQuery}"` : 'Recherchez parmi des millions de titres'}
            </h3>
            {isSearching && (
              <span className="text-xs text-purple-600 dark:text-purple-400 animate-pulse font-semibold">
                Recherche sur YouTube & Spotify...
              </span>
            )}
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {searchResults.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  isCurrent={currentTrack?.id === track.id}
                  isFav={isFavorite(track.id)}
                  isCached={isTrackCached(track.id)}
                  onPlay={() => playTrack(track)}
                  onToggleFavorite={() => toggleFavorite(track)}
                  onOpenAddToPlaylist={() => setTrackToAddToPlaylist(track)}
                  onDownload={() => cacheTrackForOffline(track)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-2xl">
                🔍
              </div>
              <h4 className="font-bold text-base text-slate-900 dark:text-white">
                {searchQuery ? 'Aucun résultat direct' : 'Recherchez un titre ou artiste'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                Tapez le nom d'une chanson, d'un rappeur, d'un DJ ou collez un lien YouTube / Spotify dans la barre de recherche ci-dessus.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB: OFFLINE CACHED MUSIC */}
      {activeTab === 'offline' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Mode Hors-ligne
                </span>
                <span className="text-xs text-slate-400">
                  {cachedTrackIds.length} titre(s) en cache
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">
                Bibliothèque Audio Hors-ligne
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ces morceaux sont stockés localement sur votre téléphone ou ordinateur et fonctionnent sans aucune connexion Internet.
              </p>
            </div>
          </div>

          {/* List of cached tracks */}
          {TOP_TRENDING_CATALOG.filter((t) => isTrackCached(t.id)).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TOP_TRENDING_CATALOG.filter((t) => isTrackCached(t.id)).map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  isCurrent={currentTrack?.id === track.id}
                  isFav={isFavorite(track.id)}
                  isCached={true}
                  onPlay={() => playTrack(track)}
                  onToggleFavorite={() => toggleFavorite(track)}
                  onOpenAddToPlaylist={() => setTrackToAddToPlaylist(track)}
                  onDownload={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="p-8 sm:p-12 text-center rounded-3xl bg-white/40 dark:bg-[#08091d]/50 border border-slate-200/60 dark:border-white/10 space-y-4 backdrop-blur-xl">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-2xl shadow-lg border border-emerald-500/30">
                <Download className="w-7 h-7" />
              </div>
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Aucun morceau hors-ligne pour le moment
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Cliquez sur l'icône de téléchargement sur n'importe quel morceau pour l'enregistrer dans votre cache hors-ligne.
                </p>
              </div>

              {/* Quick download pack suggestions */}
              <div className="pt-2">
                <p className="text-xs font-semibold text-slate-400 mb-3">
                  Suggestion de titres populaires à enregistrer en 1 clic :
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-w-2xl mx-auto">
                  {TOP_TRENDING_CATALOG.slice(0, 3).map((sampleTrack) => (
                    <button
                      key={sampleTrack.id}
                      onClick={() => cacheTrackForOffline(sampleTrack)}
                      className="flex items-center gap-2.5 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition text-xs group cursor-pointer"
                    >
                      <img src={sampleTrack.coverUrl} alt={sampleTrack.title} className="w-8 h-8 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate text-[11px]">{sampleTrack.title}</p>
                        <p className="text-slate-400 text-[10px] truncate">{sampleTrack.artist}</p>
                      </div>
                      <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: USER'S PERSONAL PLAYLISTS */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                  {activeProfile.avatar} Profil {activeProfile.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Données 100% Privées & Isolées
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl">
                Playlists de {activeProfile.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vos playlists personnelles vous sont exclusivement réservées (aucun mélange avec les autres profils).
              </p>
            </div>
            <button
              onClick={() => setShowCreatePlaylistModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Créer une playlist</span>
            </button>
          </div>

          {/* Selected Playlist Detail View */}
          {selectedPlaylist ? (
            <div className="p-6 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-5">
                <div className="w-28 h-28 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 shrink-0">
                  <img src={selectedPlaylist.coverUrl} alt={selectedPlaylist.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                    Playlist Personnelle • {activeProfile.name}
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">{selectedPlaylist.name}</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{selectedPlaylist.description}</p>
                  <p className="text-xs text-slate-400 pt-1">{selectedPlaylist.tracks.length} morceau(x)</p>
                </div>
                <div className="flex items-center gap-2">
                  {selectedPlaylist.tracks.length > 0 && (
                    <button
                      onClick={() => playTrack(selectedPlaylist.tracks[0])}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Tout lire</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedPlaylist(null)}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-xs hover:bg-slate-100 dark:hover:bg-white/10 transition"
                  >
                    Retour aux playlists
                  </button>
                </div>
              </div>

              {/* Tracks in Playlist */}
              <div className="space-y-2">
                {selectedPlaylist.tracks.length > 0 ? (
                  selectedPlaylist.tracks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-3 rounded-2xl border border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5 transition"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img src={t.coverUrl} alt={t.title} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">{t.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{t.artist}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => playTrack(t)}
                          className="p-2 rounded-xl bg-purple-600 text-white"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </button>
                        <button
                          onClick={() => removeTrackFromPlaylist(selectedPlaylist.id, t.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                          title="Retirer de la playlist"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 text-center py-6">
                    Aucun morceau dans cette playlist. Utilisez le bouton « + » sur n'importe quel morceau pour l'ajouter !
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeProfile.playlists.map((pl) => (
                <div
                  key={pl.id}
                  onClick={() => setSelectedPlaylist(pl)}
                  className="p-4 rounded-2xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-purple-500/40 cursor-pointer shadow-sm hover:shadow-md transition group"
                >
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black/20">
                    <img src={pl.coverUrl} alt={pl.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <span className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-lg">
                        <Play className="w-4 h-4 fill-current translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{pl.name}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{pl.description}</p>
                  <div className="flex items-center justify-between text-[11px] text-purple-600 dark:text-purple-400 font-semibold mt-3 pt-2 border-t border-slate-100 dark:border-white/5">
                    <span>{pl.tracks.length} morceau(x)</span>
                    {activeProfile.playlists.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePlaylist(pl.id);
                        }}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Supprimer la playlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: USER'S PERSONAL FAVORITES */}
      {activeTab === 'favorites' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-bold">
                  {activeProfile.avatar} {activeProfile.name}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Favoris Personnels Isolés
                </span>
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-xl flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500 fill-current" />
                Titres Favoris de {activeProfile.name} ({activeProfile.favorites.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vos morceaux préférés enregistrés et synchronisés uniquement dans votre profil.
              </p>
            </div>
            {activeProfile.favorites.length > 0 && (
              <button
                onClick={() => playTrack(activeProfile.favorites[0])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm self-start sm:self-auto"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Tout écouter</span>
              </button>
            )}
          </div>

          {activeProfile.favorites.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activeProfile.favorites.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                  isCurrent={currentTrack?.id === track.id}
                  isFav={true}
                  isCached={isTrackCached(track.id)}
                  onPlay={() => playTrack(track)}
                  onToggleFavorite={() => toggleFavorite(track)}
                  onOpenAddToPlaylist={() => setTrackToAddToPlaylist(track)}
                  onDownload={() => cacheTrackForOffline(track)}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-2">
              <Heart className="w-10 h-10 text-rose-500 mx-auto" />
              <h4 className="font-bold text-base text-slate-900 dark:text-white">Aucun favori pour le moment</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cliquez sur le cœur à côté de n'importe quel morceau pour l'ajouter aux favoris de votre profil.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: SPOTIFY PLAYLIST IMPORTER */}
      {activeTab === 'spotify' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
              <Headphones className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Synchronisation & Import Spotify</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Importez n'importe quelle playlist, album ou titre public Spotify directement dans votre profil {activeProfile.name}
              </p>
            </div>
          </div>

          <form onSubmit={handleSpotifyImport} className="space-y-3 max-w-xl">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Collez le lien Spotify (ex: https://open.spotify.com/playlist/...)"
                value={spotifyImportUrl}
                onChange={(e) => setSpotifyImportUrl(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-green-500 shadow-inner"
              />
              <button
                type="submit"
                disabled={isImportingSpotify || !spotifyImportUrl.trim()}
                className="px-5 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-bold transition shadow-md shadow-green-600/20 shrink-0"
              >
                {isImportingSpotify ? 'Importation...' : 'Importer dans mon profil'}
              </button>
            </div>

            {spotifyImportSuccess && (
              <p className="text-xs font-semibold text-green-600 dark:text-green-400">
                {spotifyImportSuccess}
              </p>
            )}
          </form>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
            <h4 className="font-bold text-slate-900 dark:text-white">💡 Astuce d'importation :</h4>
            <p>
              Sur l'application Spotify, cliquez sur les 3 petits points « ... » de votre playlist préférée &gt; <strong>Partager &gt; Copier le lien</strong>, puis collez-le ici pour la retrouver instantanément sans publicité.
            </p>
          </div>
        </div>
      )}

      {/* CREATE PLAYLIST MODAL */}
      {showCreatePlaylistModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#121224] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base">Nouvelle Playlist ({activeProfile.name})</h3>
              <button onClick={() => setShowCreatePlaylistModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePlaylistSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Titre de la playlist</label>
                <input
                  type="text"
                  placeholder="Ex: Mes Favoris 2026, Soirée Rap, Synthwave..."
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">Description (facultative)</label>
                <input
                  type="text"
                  placeholder="Ex: Titres favoris sélectionnés sur YouTube et Spotify"
                  value={newPlaylistDesc}
                  onChange={(e) => setNewPlaylistDesc(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePlaylistModal(false)}
                  className="px-4 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-white/10"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!newPlaylistName.trim()}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md disabled:opacity-50"
                >
                  Créer la playlist
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TO PLAYLIST SELECTION MODAL */}
      {trackToAddToPlaylist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#121224] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">Ajouter à une playlist</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                  {trackToAddToPlaylist.title}
                </p>
              </div>
              <button onClick={() => setTrackToAddToPlaylist(null)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {activeProfile.playlists.map((pl) => (
                <button
                  key={pl.id}
                  onClick={() => handleAddTrackToUserPlaylist(pl.id, trackToAddToPlaylist)}
                  className="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-white/5 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-400 flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={pl.coverUrl} alt={pl.name} className="w-8 h-8 rounded-lg object-cover" />
                    <span className="font-semibold truncate">{pl.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">{pl.tracks.length} titres</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                setTrackToAddToPlaylist(null);
                setShowCreatePlaylistModal(true);
              }}
              className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-white/20 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Créer une nouvelle playlist</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for individual track row
interface TrackCardProps {
  track: Track;
  isPlaying: boolean;
  isCurrent: boolean;
  isFav: boolean;
  isCached?: boolean;
  onPlay: () => void;
  onToggleFavorite: () => void;
  onOpenAddToPlaylist: () => void;
  onDownload?: () => void;
}

const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isPlaying,
  isCurrent,
  isFav,
  isCached = false,
  onPlay,
  onToggleFavorite,
  onOpenAddToPlaylist,
  onDownload,
}) => {
  const formatSec = (secs: number) => {
    if (!secs) return '3:20';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div
      onClick={onPlay}
      className={`neon-card-hover flex items-center justify-between p-3.5 rounded-2xl border transition group cursor-pointer backdrop-blur-xl ${
        isCurrent
          ? 'bg-purple-600/25 dark:bg-purple-950/50 border-purple-400 dark:border-purple-500/60 shadow-lg shadow-purple-500/20 ring-1 ring-purple-500/30'
          : 'bg-white/45 dark:bg-[#08091d]/50 border-slate-200/60 dark:border-white/10 hover:border-purple-400/50 hover:bg-white/60 dark:hover:bg-[#0c0e28]/60 shadow-xs'
      }`}
    >
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-md border border-slate-200 dark:border-white/10">
          <img
            src={track.coverUrl}
            alt={track.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
            }}
          />
          <button
            className={`absolute inset-0 bg-black/50 flex items-center justify-center text-white transition ${
              isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current translate-x-0.5" />}
          </button>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-600 dark:group-hover:text-purple-300 transition">
              {track.title}
            </h4>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                track.source === 'youtube'
                  ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20'
                  : track.source === 'deezer'
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                  : 'bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/20'
              }`}
            >
              {track.source}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {track.artist} {track.album ? `• ${track.album}` : ''}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-3">
        <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">
          {formatSec(track.duration)}
        </span>

        {/* Offline Cache Download Button */}
        {onDownload && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDownload();
            }}
            className={`p-1.5 rounded-lg transition ${
              isCached 
                ? 'text-emerald-500 hover:text-emerald-400' 
                : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/10'
            }`}
            title={isCached ? 'Morceau disponible hors-ligne' : 'Télécharger pour écoute hors-ligne'}
          >
            {isCached ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <Download className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Add to Playlist */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenAddToPlaylist();
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-white/10 transition"
          title="Ajouter à une playlist"
        >
          <ListPlus className="w-4 h-4" />
        </button>

        {/* Favorite */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-1.5 rounded-lg transition ${
            isFav
              ? 'text-rose-500'
              : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10'
          }`}
          title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
        </button>

        {/* Play */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPlay();
          }}
          className={`p-2 rounded-xl transition shadow-xs ${
            isPlaying
              ? 'bg-purple-600 text-white'
              : 'bg-slate-100 dark:bg-white/10 group-hover:bg-purple-600 group-hover:text-white text-slate-800 dark:text-slate-200'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.2" />}
        </button>
      </div>
    </div>
  );
};
