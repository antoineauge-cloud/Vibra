import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  Search, 
  Signal, 
  Heart, 
  Clock, 
  Sliders, 
  Sparkles, 
  Volume2, 
  MapPin, 
  Zap, 
  Plus, 
  ExternalLink, 
  RefreshCw, 
  Mic, 
  Download, 
  Check, 
  X,
  Share2,
  Filter
} from 'lucide-react';
import { POPULAR_FRENCH_RADIOS, RadioStation } from '../data/radioStations';
import { searchOnlineFrenchRadios } from '../services/radioBrowserService';
import { usePlayer } from '../context/PlayerContext';

const FAVORITES_STORAGE_KEY = 'vibra_radio_favorites';

export const RadioFMView: React.FC = () => {
  const { playTrack, currentTrack, isPlaying, togglePlay } = usePlayer();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('top');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [onlineStations, setOnlineStations] = useState<RadioStation[]>([]);
  const [isSearchingOnline, setIsSearchingOnline] = useState(false);

  // Tuner slider state
  const [tunedFrequency, setTunedFrequency] = useState<number>(100.3);

  // Favorites state
  const [favorites, setFavorites] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
      return saved ? JSON.parse(saved) : ['france-inter', 'skyrock', 'fip', 'nrj', 'radio-nova'];
    } catch {
      return ['france-inter', 'skyrock', 'fip', 'nrj'];
    }
  });

  // Sleep Timer state
  const [sleepMinutesRemaining, setSleepMinutesRemaining] = useState<number | null>(null);
  const [showSleepModal, setShowSleepModal] = useState(false);
  const sleepTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Audio Preset Equalizer state
  const [audioPreset, setAudioPreset] = useState<'flat' | 'bass' | 'vocal' | 'electro'>('flat');
  const [showPresetMenu, setShowPresetMenu] = useState(false);

  // Add Custom Radio state
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customRadios, setCustomRadios] = useState<RadioStation[]>([]);
  const [customName, setCustomName] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customFreq, setCustomFreq] = useState('');

  // Audio Recording Snippet state
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState<string | null>(null);

  // Save favorites to localStorage
  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Search in 3500+ French Radio Browser API when searching or when "all_france" category is clicked
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2 || selectedCategory === 'all_france') {
        setIsSearchingOnline(true);
        const queryToSearch = searchQuery.trim() || 'France';
        const results = await searchOnlineFrenchRadios(queryToSearch, 30);
        setOnlineStations(results);
        setIsSearchingOnline(false);
      } else {
        setOnlineStations([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory]);

  // Handle Sleep Timer countdown
  useEffect(() => {
    if (sleepMinutesRemaining !== null && sleepMinutesRemaining > 0) {
      sleepTimerRef.current = setTimeout(() => {
        setSleepMinutesRemaining((prev) => {
          if (prev === null || prev <= 1) {
            if (isPlaying) togglePlay();
            return null;
          }
          return prev - 1;
        });
      }, 60000);
    }
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current);
    };
  }, [sleepMinutesRemaining, isPlaying, togglePlay]);

  const setSleepTimer = (minutes: number | null) => {
    setSleepMinutesRemaining(minutes);
    setShowSleepModal(false);
  };

  // Combine curated, custom and online stations
  const allCuratedStations = [...customRadios, ...POPULAR_FRENCH_RADIOS];

  const filteredCurated = allCuratedStations.filter((station) => {
    // Category filter
    if (selectedCategory === 'favorites') {
      if (!favorites.includes(station.id)) return false;
    } else if (selectedCategory !== 'top' && selectedCategory !== 'all_france') {
      if (station.tag !== selectedCategory) return false;
    }

    // Region filter
    if (selectedRegion !== 'all') {
      if (!station.location.toLowerCase().includes(selectedRegion.toLowerCase())) {
        return false;
      }
    }

    // Query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        station.name.toLowerCase().includes(q) ||
        station.genre.toLowerCase().includes(q) ||
        station.frequency.toLowerCase().includes(q) ||
        station.location.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const displayedStations = selectedCategory === 'all_france' || (searchQuery.trim().length >= 2 && onlineStations.length > 0)
    ? [...filteredCurated, ...onlineStations.filter((os) => !filteredCurated.some((cs) => cs.name.toLowerCase() === os.name.toLowerCase()))]
    : filteredCurated;

  const handlePlayStation = (station: RadioStation) => {
    const freqMatch = station.frequency.match(/([0-9]+\.?[0-9]*)/);
    if (freqMatch) {
      const val = parseFloat(freqMatch[1]);
      if (val >= 87.5 && val <= 108.0) {
        setTunedFrequency(val);
      }
    }

    if (currentTrack?.id === `radio-${station.id}`) {
      togglePlay();
      return;
    }

    playTrack({
      id: `radio-${station.id}`,
      title: station.name,
      artist: `${station.genre} • ${station.frequency}`,
      album: `Radio FM Direct (${station.location})`,
      coverUrl: station.coverUrl,
      duration: 3600,
      source: 'radio',
      audioUrl: station.streamUrl,
    });
  };

  const handleAddCustomRadio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customUrl.trim()) return;

    const newRadio: RadioStation = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      frequency: customFreq.trim() || 'Web Stream',
      genre: 'Radio Personnalisée',
      tag: 'pop',
      description: 'Radio ajoutée manuellement par son URL de flux direct.',
      streamUrl: customUrl.trim(),
      coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
      location: 'Flux Privé',
      bitrate: 'Direct Stream',
    };

    setCustomRadios((prev) => [newRadio, ...prev]);
    setShowAddCustomModal(false);
    setCustomName('');
    setCustomUrl('');
    setCustomFreq('');
    handlePlayStation(newRadio);
  };

  const isCurrentPlaying = (station: RadioStation) => currentTrack?.id === `radio-${station.id}` && isPlaying;
  const isCurrent = (station: RadioStation) => currentTrack?.id === `radio-${station.id}`;

  const categories = [
    { id: 'top', label: '🇫🇷 Top Radios France', count: POPULAR_FRENCH_RADIOS.length },
    { id: 'favorites', label: `⭐ Mes Favoris (${favorites.length})`, count: favorites.length },
    { id: 'info', label: '📰 Infos & Débats' },
    { id: 'rap', label: '🎤 Rap & Urbain' },
    { id: 'pop', label: '⚡ Pop & Hits' },
    { id: 'rock', label: '🎸 Pop-Rock' },
    { id: 'electro', label: '🌃 Électro & Club' },
    { id: 'jazz', label: '🎷 Jazz & Blues' },
    { id: 'classic', label: '🎻 Classique' },
    { id: 'chill', label: '☕ Chillout & Lounge' },
    { id: 'all_france', label: '🌐 Toutes les 3500+ Radios (En direct)' },
  ];

  const regions = [
    { id: 'all', label: 'Toute la France' },
    { id: 'paris', label: 'Île-de-France / Paris' },
    { id: 'lyon', label: 'Lyon / Rhône-Alpes' },
    { id: 'marseille', label: 'Marseille / PACA' },
    { id: 'ouest', label: 'Grand Ouest / Bretagne' },
  ];

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-20">
      {/* Professional Tuner Deck */}
      <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-950/70 via-slate-900/70 to-indigo-950/70 border border-blue-500/35 text-white shadow-2xl backdrop-blur-2xl overflow-hidden">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Radio identity & Status */}
          <div className="flex items-center gap-4 text-center lg:text-left">
            <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-xl shadow-blue-500/20 shrink-0">
              <div className="w-full h-full rounded-[14px] bg-[#0c0c1e] flex flex-col items-center justify-center p-2">
                <Radio className="w-8 h-8 text-blue-400 animate-pulse" />
                <span className="text-[10px] font-mono font-bold text-blue-300 mt-1">FM STEREO</span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Toutes les Radios de France
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 text-xs font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  LIVE HD
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
                  3 500+ Stations
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl">
                Accès exhaustif à toutes les radios nationales, locales et thématiques de France en flux direct sans coupure publicitaire.
              </p>
            </div>
          </div>

          {/* Right Action Tools: Sleep Timer, Add Custom, Equalizer */}
          <div className="flex flex-wrap items-center justify-center gap-2 shrink-0">
            {/* Sleep Timer */}
            <button
              onClick={() => setShowSleepModal(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition ${
                sleepMinutesRemaining !== null
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
              title="Minuteur de mise en veille"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{sleepMinutesRemaining !== null ? `Veille dans ${sleepMinutesRemaining}m` : 'Minuteur'}</span>
            </button>

            {/* Equalizer Mode */}
            <div className="relative">
              <button
                onClick={() => setShowPresetMenu(!showPresetMenu)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 border border-white/10 text-white transition"
                title="Égaliseur audio"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span className="capitalize">{audioPreset}</span>
              </button>

              {showPresetMenu && (
                <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[#121224] border border-white/10 shadow-2xl py-1 z-50 text-xs">
                  <div className="px-3 py-1 text-[10px] text-slate-400 uppercase font-bold">Preset Audio</div>
                  {(['flat', 'bass', 'vocal', 'electro'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => {
                        setAudioPreset(mode);
                        setShowPresetMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 hover:bg-white/10 transition capitalize flex items-center justify-between ${
                        audioPreset === mode ? 'text-blue-400 font-bold bg-white/5' : 'text-slate-300'
                      }`}
                    >
                      <span>{mode === 'flat' ? 'Neutre / Standard' : mode === 'bass' ? 'Bass Boost' : mode === 'vocal' ? 'Voix / Parole' : 'Électro / Club'}</span>
                      {audioPreset === mode && <Check className="w-3 h-3 text-blue-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Add Custom Radio Button */}
            <button
              onClick={() => setShowAddCustomModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition"
              title="Ajouter un flux radio par son URL"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter flux</span>
            </button>
          </div>
        </div>

        {/* Realistic FM Frequency Scale */}
        <div className="mt-6 pt-5 border-t border-white/10">
          <div className="flex items-center justify-between text-[11px] font-mono text-blue-300 mb-2">
            <span>87.5 MHz</span>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-widest">
                TUNER FM STEREO : {tunedFrequency.toFixed(1)} MHz
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <span>108.0 MHz</span>
          </div>

          <div className="relative h-9 bg-black/60 rounded-xl border border-white/15 px-3 flex items-center overflow-hidden">
            <div className="w-full flex justify-between items-center opacity-40 px-2 pointer-events-none">
              {Array.from({ length: 41 }).map((_, i) => (
                <div key={i} className={`w-0.5 bg-blue-300 ${i % 5 === 0 ? 'h-5' : 'h-2.5'}`} />
              ))}
            </div>

            <div
              className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 via-pink-500 to-red-500 shadow-lg shadow-red-500/80 transition-all duration-300 z-10"
              style={{
                left: `${Math.min(98, Math.max(2, ((tunedFrequency - 87.5) / (108.0 - 87.5)) * 100))}%`,
              }}
            >
              <div className="w-3 h-3 rounded-full bg-red-500 -ml-1 -mt-1 shadow-md shadow-red-500/50" />
            </div>
          </div>

          {/* Quick Frequency Shortcuts */}
          <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
            <span className="text-[11px] text-slate-400 mr-1">Raccourcis rapides :</span>
            {POPULAR_FRENCH_RADIOS.slice(0, 8).map((st) => (
              <button
                key={st.id}
                onClick={() => handlePlayStation(st)}
                className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition ${
                  isCurrent(st)
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/40'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                }`}
              >
                {st.name} ({st.frequency})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Region Selector Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Instant Search Bar */}
        <div className="md:col-span-2 relative">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher parmi les radios de France (ex: France Inter, Skyrock, NRJ, Radio FG, Toulouse, Jazz...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/50 dark:bg-[#07091c]/55 border border-slate-200/60 dark:border-cyan-500/30 backdrop-blur-xl rounded-2xl pl-10 pr-10 py-3 text-xs sm:text-sm text-slate-900 dark:text-cyan-100 placeholder:text-slate-400 dark:placeholder:text-cyan-500/50 focus:outline-none focus:border-cyan-400 shadow-sm transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Region Filter Dropdown */}
        <div className="relative">
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            className="w-full bg-white/50 dark:bg-[#07091c]/55 border border-slate-200/60 dark:border-cyan-500/30 backdrop-blur-xl rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-900 dark:text-cyan-100 focus:outline-none focus:border-cyan-400 shadow-sm appearance-none cursor-pointer"
          >
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                📍 {r.label}
              </option>
            ))}
          </select>
          <Filter className="w-4 h-4 text-cyan-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCategory(cat.id);
              if (cat.id === 'all_france' && onlineStations.length === 0) {
                setIsSearchingOnline(true);
                searchOnlineFrenchRadios('France', 40).then((res) => {
                  setOnlineStations(res);
                  setIsSearchingOnline(false);
                });
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedCategory === cat.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/5'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Status & Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <div className="flex items-center gap-2">
          <span>{displayedStations.length} radio(s) trouvée(s)</span>
          {isSearchingOnline && (
            <span className="flex items-center gap-1 text-blue-500 animate-pulse">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Recherche dans l'annuaire complet de France...
            </span>
          )}
        </div>

        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Flux directs vérifiés haute fidélité
        </span>
      </div>

      {/* Stations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedStations.map((station) => {
          const playing = isCurrentPlaying(station);
          const current = isCurrent(station);
          const isFav = favorites.includes(station.id);

          return (
            <div
              key={station.id}
              onClick={() => handlePlayStation(station)}
              className={`neon-card-hover p-4 sm:p-5 rounded-2xl border transition group cursor-pointer flex flex-col justify-between backdrop-blur-xl ${
                current
                  ? 'bg-blue-600/25 dark:bg-blue-950/50 border-cyan-400 dark:border-cyan-500/60 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-500/30'
                  : 'bg-white/45 dark:bg-[#08091d]/50 border-slate-200/60 dark:border-white/10 hover:border-cyan-400/50 hover:bg-white/60 dark:hover:bg-[#0c0e28]/60 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-white/10">
                      <img
                        src={station.coverUrl}
                        alt={station.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback on image error
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                        }}
                      />
                      {playing && (
                        <div className="absolute inset-0 bg-blue-600/70 backdrop-blur-xs flex items-center justify-center">
                          <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                        {station.name}
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold truncate">
                        {station.genre}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Favorite & Frequency */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={(e) => toggleFavorite(station.id, e)}
                      className={`p-1.5 rounded-lg transition ${
                        isFav ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                      title={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
                    </button>
                    <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-blue-300 font-mono text-[11px] font-bold border border-slate-200 dark:border-white/10">
                      {station.frequency}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {station.description}
                </p>
              </div>

              {/* Station footer & Play button */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11px] truncate">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 shrink-0" />
                    {station.location}
                  </span>
                  <span className="shrink-0">{station.bitrate}</span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePlayStation(station);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition shadow-sm ${
                    playing
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-white/10 group-hover:bg-blue-600 group-hover:text-white text-slate-800 dark:text-slate-200'
                  }`}
                >
                  {playing ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>En écoute</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Écouter</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sleep Timer Modal */}
      {showSleepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#121224] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-base">Minuteur de Sommeil</h3>
              </div>
              <button onClick={() => setShowSleepModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Arrête automatiquement la radio après la durée sélectionnée pour vous endormir en toute tranquillité.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[15, 30, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setSleepTimer(mins)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                    sleepMinutesRemaining === mins
                      ? 'bg-amber-500 text-white border-amber-500 shadow-md'
                      : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10'
                  }`}
                >
                  {mins} minutes
                </button>
              ))}
              <button
                onClick={() => setSleepTimer(null)}
                className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition col-span-2"
              >
                Désactiver le minuteur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Radio Modal */}
      {showAddCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <form
            onSubmit={handleAddCustomRadio}
            className="w-full max-w-md bg-white dark:bg-[#121224] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl text-slate-900 dark:text-white space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                <h3 className="font-bold text-base">Ajouter une Radio Personnalisée</h3>
              </div>
              <button type="button" onClick={() => setShowAddCustomModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Collez l'URL d'un flux audio direct (MP3, AAC ou M3U8) d'une radio locale ou internationale pour l'écouter dans Vibra.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Nom de la radio</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Radio FMR Toulouse, Radio Grenouille..."
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">URL du flux audio direct (Stream)</label>
                <input
                  type="url"
                  required
                  placeholder="https://.../stream.mp3 ou .aac"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Fréquence ou ville (Optionnel)</label>
                <input
                  type="text"
                  placeholder="Ex: 89.1 FM / Marseille"
                  value={customFreq}
                  onChange={(e) => setCustomFreq(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddCustomModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-white/10 hover:bg-slate-200 text-slate-700 dark:text-white transition"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition"
              >
                Ajouter et Écouter
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
