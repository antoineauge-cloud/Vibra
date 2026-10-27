import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  Search, 
  Radio, 
  Music2, 
  SlidersHorizontal, 
  Sparkles, 
  Download, 
  Volume2, 
  CheckCircle2, 
  Smartphone, 
  FileArchive, 
  ChevronRight, 
  Flame, 
  RadioTower, 
  ShieldCheck, 
  Layers, 
  User, 
  Zap,
  ArrowRight,
  Headphones,
  HardDrive,
  Mic,
  Clock,
  ListMusic,
  Activity,
  History,
  Check,
  Wifi,
  Gauge
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { useProfile } from '../context/ProfileContext';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { POPULAR_FRENCH_RADIOS, RadioStation } from '../data/radioStations';
import { Track } from '../types/player';
import { CyberWaveformVisualizer } from './CyberWaveformVisualizer';

interface HomeDashboardViewProps {
  onNavigate: (tab: 'home' | 'music' | 'radio' | 'equalizer' | 'hub' | 'audio-guide', subView?: string) => void;
  onOpenInstallModal: () => void;
  onOpenApkStudio: () => void;
  onOpenProfileModal?: () => void;
  onOpenAuthModal?: () => void;
  onSearchSubmit: (query: string) => void;
  onOpenLocalAudio?: () => void;
  onOpenSoundboard?: () => void;
  onOpenRecorder?: () => void;
  onOpenSleepTimer?: () => void;
  onOpenLyrics?: () => void;
}

export const HomeDashboardView: React.FC<HomeDashboardViewProps> = ({
  onNavigate,
  onOpenInstallModal,
  onOpenApkStudio,
  onOpenProfileModal,
  onOpenAuthModal,
  onSearchSubmit,
  onOpenLocalAudio,
  onOpenSoundboard,
  onOpenRecorder,
  onOpenSleepTimer,
  onOpenLyrics,
}) => {
  const { 
    currentTrack, 
    isPlaying, 
    togglePlay, 
    playTrack, 
    queue,
    isBuffering,
    audioQuality,
    setAudioQuality,
    history,
    isTrackCached,
    cacheTrackForOffline
  } = usePlayer();
  const { activeProfile } = useProfile();
  const { isInstalled } = usePWAInstall();
  const [searchInputValue, setSearchInputValue] = useState('');
  const [showOscilloscope, setShowOscilloscope] = useState(true);
  const [isCaching, setIsCaching] = useState(false);

  // Top quick stations for 1-click play from Home
  const quickStations: RadioStation[] = POPULAR_FRENCH_RADIOS.slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInputValue.trim()) {
      onSearchSubmit(searchInputValue.trim());
      onNavigate('music');
    }
  };

  const handlePlayStation = (station: RadioStation) => {
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

  const handleResumePlay = () => {
    if (currentTrack) {
      togglePlay();
    } else if (queue.length > 0) {
      playTrack(queue[0]);
    } else {
      // Default fallback track
      onNavigate('music');
    }
  };

  const mainModules = [
    {
      id: 'music',
      title: 'Musique & Recherche YouTube',
      subtitle: 'Streaming sans pub • Pochettes HD',
      desc: 'Accédez au catalogue complet, explorez les tendances mondiales et importez vos titres Spotify.',
      icon: Music2,
      badge: 'Illimité',
      gradient: 'from-purple-600 via-indigo-600 to-purple-800',
      action: () => onNavigate('music'),
      pillColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'radio',
      title: 'Radios FM France Direct',
      subtitle: '24 Stations Nationales • Live AAC',
      desc: 'Écoutez NRJ, Skyrock, Fun Radio, France Inter, RTL et Nostalgie en streaming continu haute fidélité.',
      icon: Radio,
      badge: 'Direct FM',
      gradient: 'from-blue-600 via-cyan-600 to-blue-800',
      action: () => onNavigate('radio'),
      pillColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    },
    {
      id: 'equalizer',
      title: 'Studio Égaliseur Audio',
      subtitle: 'Courbe Spline • Traitement Matériel',
      desc: 'Curseurs motorisés temps réel, boost des basses (+7 dB), clarté vocale et préréglages club.',
      icon: SlidersHorizontal,
      badge: 'DSP Studio',
      gradient: 'from-pink-600 via-rose-600 to-purple-800',
      action: () => onNavigate('equalizer'),
      pillColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
    },
    {
      id: 'ai',
      title: 'Découvertes & IA Musicale',
      subtitle: 'Algorithme Prédictif Sur-Mesure',
      desc: 'Générez des mix et recommandations intelligentes basés sur votre historique et profil d\'écoute.',
      icon: Sparkles,
      badge: 'IA Générative',
      gradient: 'from-violet-600 via-purple-700 to-fuchsia-800',
      action: () => onNavigate('music', 'ai'),
      pillColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    },
    ...(isInstalled
      ? [
          {
            id: 'playlists',
            title: 'Mes Playlists & Favoris',
            subtitle: `${activeProfile.playlists.length} Playlists • Mode Autonome`,
            desc: 'Accédez directement à vos sélections privées, vos morceaux favoris et écoutez sans distraction.',
            icon: ListMusic,
            badge: 'Mode Autonome',
            gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
            action: () => onNavigate('music', 'playlists'),
            pillColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          },
        ]
      : [
          {
            id: 'hub',
            title: 'Installer l\'Application APK',
            subtitle: 'WebAPK Android • 100% Autonome',
            desc: 'Installez l\'app sur votre smartphone sans passer par un navigateur ou téléchargez le package ZIP.',
            icon: Download,
            badge: 'Certifié Android',
            gradient: 'from-emerald-600 via-teal-600 to-emerald-800',
            action: () => onNavigate('hub'),
            pillColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          },
        ]),
    {
      id: 'audio-guide',
      title: 'Audio en Arrière-plan & PiP',
      subtitle: 'Écran Verrouillé • Notifications',
      desc: 'Contrôlez la musique depuis l\'écran de veille de votre téléphone grâce à l\'API MediaSession.',
      icon: Volume2,
      badge: 'Système OS',
      gradient: 'from-amber-600 via-orange-600 to-amber-800',
      action: () => onNavigate('audio-guide'),
      pillColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <div className="w-full h-full overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-7 max-w-6xl mx-auto pb-32">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-cyan-500/20">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-sm shadow-cyan-400" />
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-500 dark:text-cyan-400">
              Vibra v2.5 • CYBERPUNK AUDIO STUDIO
            </span>
            {isInstalled ? (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>Application Installée (Mode Autonome)</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-cyan-400" />
                <span>Chiffrement Isolé AES-GCM</span>
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bienvenue{activeProfile ? `, ${activeProfile.name}` : ''} <span className="dark:neon-text-cyan">⚡</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Studio Cyberpunk ultra-fluide • Écoute sans latence et égaliseur DSP matériel.
          </p>
        </div>

        {/* Account & Quick Actions */}
        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <button
            onClick={onOpenAuthModal || onOpenProfileModal}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-500/15 dark:bg-purple-950/40 hover:bg-purple-500/25 border border-purple-500/40 text-xs font-bold text-purple-900 dark:text-purple-200 transition shadow-sm"
            title="Connexion ou gestion du compte personnel (playlists et favoris isolés)"
          >
            <div className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-extrabold shadow-xs">
              {activeProfile?.avatar || <User className="w-3 h-3" />}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold max-w-[110px] truncate leading-tight">
                {activeProfile?.name || 'Mon Compte'}
              </span>
              <span className="text-[9px] text-cyan-500 dark:text-cyan-400 font-mono font-semibold">
                {activeProfile?.email ? 'Connecté' : 'Connexion'}
              </span>
            </div>
          </button>

          {isInstalled ? (
            <button
              onClick={() => onNavigate('music')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/25 hover:opacity-95 transition neon-glow-cyan"
            >
              <Music2 className="w-3.5 h-3.5" />
              <span>Lancer la Musique</span>
            </button>
          ) : (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-400 via-purple-600 to-pink-500 text-slate-950 font-extrabold text-xs shadow-md shadow-cyan-500/25 hover:opacity-95 transition neon-glow-cyan"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Installer l'APK</span>
            </button>
          )}
        </div>
      </div>

      {/* Global Quick Search Bar */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          <Search className="absolute left-4 w-5 h-5 text-cyan-400 pointer-events-none" />
          <input
            type="text"
            value={searchInputValue}
            onChange={(e) => setSearchInputValue(e.target.value)}
            placeholder="Rechercher un son YouTube, un artiste, une radio FM..."
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-white/50 dark:bg-[#060818]/55 border border-slate-200/60 dark:border-cyan-500/35 backdrop-blur-2xl text-slate-950 dark:text-cyan-100 placeholder:text-slate-400 dark:placeholder:text-cyan-500/50 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 shadow-md transition"
          />
          <button
            type="submit"
            className="absolute right-2 px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-extrabold transition shadow-xs neon-glow-cyan"
          >
            Rechercher
          </button>
        </div>
      </form>

      {/* Cyberpunk Studio Tools Bar (Nouveautés) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {onOpenLocalAudio && (
          <button
            type="button"
            onClick={onOpenLocalAudio}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 text-xs font-bold shrink-0 transition hover:scale-105 active:scale-95 shadow-sm neon-border-cyan"
          >
            <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
            <span>📂 Mes MP3 Locaux</span>
          </button>
        )}

        {onOpenSoundboard && (
          <button
            type="button"
            onClick={onOpenSoundboard}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-pink-950/40 hover:bg-pink-900/50 border border-pink-500/40 text-pink-300 text-xs font-bold shrink-0 transition hover:scale-105 active:scale-95 shadow-sm neon-border-pink"
          >
            <Zap className="w-3.5 h-3.5 text-pink-400" />
            <span>⚡ Soundboard DJ</span>
          </button>
        )}

        {onOpenRecorder && (
          <button
            type="button"
            onClick={onOpenRecorder}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-500/40 text-rose-300 text-xs font-bold shrink-0 transition hover:scale-105 active:scale-95 shadow-sm"
          >
            <Mic className="w-3.5 h-3.5 text-rose-400" />
            <span>🎙️ Enregistreur Radio</span>
          </button>
        )}

        {onOpenLyrics && (
          <button
            type="button"
            onClick={onOpenLyrics}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-300 text-xs font-bold shrink-0 transition hover:scale-105 active:scale-95 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>🎤 Karaoké & Paroles</span>
          </button>
        )}

        {onOpenSleepTimer && (
          <button
            type="button"
            onClick={onOpenSleepTimer}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-950/40 hover:bg-indigo-900/50 border border-indigo-500/40 text-indigo-300 text-xs font-bold shrink-0 transition hover:scale-105 active:scale-95 shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>⏱️ Minuteur Sommeil</span>
          </button>
        )}
      </div>

      {/* Quick Resume Listening / Active Track Spotlight Card */}
      <div className="relative p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0c0d1c]/80 via-[#080914]/85 to-[#170a1a]/80 text-white border border-cyan-500/40 overflow-hidden shadow-2xl backdrop-blur-2xl neon-border-cyan group">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 pt-2 pb-1">
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden shadow-lg border border-cyan-500/30 shrink-0 bg-black/60">
              <img
                src={currentTrack?.coverUrl || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80'}
                alt="Pochette"
                className="w-full h-full object-cover"
              />
              {isPlaying && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <div className="flex items-end gap-1 h-5">
                    <span className="w-1 bg-cyan-400 rounded-full animate-bounce h-3 shadow-xs shadow-cyan-400" />
                    <span className="w-1 bg-pink-400 rounded-full animate-bounce h-5 shadow-xs shadow-pink-400" style={{ animationDelay: '0.15s' }} />
                    <span className="w-1 bg-cyan-300 rounded-full animate-bounce h-4 shadow-xs shadow-cyan-300" style={{ animationDelay: '0.3s' }} />
                  </div>
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5">
                  {isBuffering ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                      <span>Chargement du flux...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>En cours de lecture</span>
                    </>
                  ) : (
                    <span>Lecteur prêt</span>
                  )}
                </span>
                {currentTrack?.source && (
                  <span className="text-[11px] text-pink-400 uppercase font-mono">
                    {currentTrack.source}
                  </span>
                )}
                {/* Audio Quality Mode Switcher */}
                <div className="flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg border border-white/10 text-[9px] font-mono">
                  <Gauge className="w-3 h-3 text-cyan-400" />
                  <button 
                    onClick={() => {
                      const next = audioQuality === 'auto' ? 'high' : audioQuality === 'high' ? 'eco' : 'auto';
                      setAudioQuality(next);
                    }}
                    className="text-slate-300 hover:text-white uppercase transition"
                    title="Basculer la qualité audio (Auto 320k / HD 320k / Éco 128k)"
                  >
                    {audioQuality === 'auto' ? 'Qualité : Auto (320k)' : audioQuality === 'high' ? 'Qualité : HD (320k)' : 'Qualité : Éco (128k)'}
                  </button>
                </div>
              </div>
              <h2 className="text-base sm:text-lg font-extrabold text-white truncate mt-1 dark:neon-text-cyan">
                {currentTrack?.title || 'Aucun titre en lecture'}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {currentTrack?.artist || 'Sélectionnez un son pour activer le moteur audio'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
            {/* 1-Tap Offline Cache Button */}
            {currentTrack && (
              <button
                onClick={async () => {
                  if (isTrackCached(currentTrack.id)) return;
                  setIsCaching(true);
                  await cacheTrackForOffline(currentTrack);
                  setIsCaching(false);
                }}
                disabled={isCaching}
                className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-xs font-bold border transition ${
                  isTrackCached(currentTrack.id)
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                }`}
                title={isTrackCached(currentTrack.id) ? 'Morceau stocké dans le cache hors-ligne' : 'Télécharger pour écoute hors-ligne'}
              >
                {isTrackCached(currentTrack.id) ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="hidden xl:inline">Hors-ligne prêt</span>
                  </>
                ) : (
                  <>
                    <Download className={`w-4 h-4 ${isCaching ? 'animate-bounce text-cyan-400' : 'text-slate-400'}`} />
                    <span className="hidden xl:inline">{isCaching ? 'Enregistrement...' : 'Télécharger'}</span>
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleResumePlay}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-teal-400 hover:from-cyan-300 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-lg shadow-cyan-500/25 active:scale-95 transition neon-glow-cyan"
            >
              {isPlaying ? <Pause className="w-4 h-4 text-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 text-slate-950" />}
              <span>{isPlaying ? 'Pause' : 'Reprendre la lecture'}</span>
            </button>

            <button
              onClick={() => onNavigate('equalizer')}
              className="flex items-center justify-center gap-1.5 px-4 py-3 rounded-2xl bg-pink-950/40 hover:bg-pink-900/50 text-pink-300 font-bold text-xs border border-pink-500/40 transition neon-border-pink"
              title="Ajuster l'égaliseur"
            >
              <SlidersHorizontal className="w-4 h-4 text-pink-400" />
              <span className="hidden sm:inline">Égaliseur DSP</span>
            </button>

            <button
              onClick={() => setShowOscilloscope(!showOscilloscope)}
              className={`flex items-center justify-center gap-1.5 px-3 py-3 rounded-2xl text-xs font-bold border transition ${
                showOscilloscope 
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/80 shadow-[0_0_12px_rgba(0,240,255,0.3)]' 
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 border-white/10'
              }`}
              title="Afficher/masquer l'oscilloscope temps réel Web Audio API"
            >
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">{showOscilloscope ? 'Masquer Onde' : 'Onde Audio'}</span>
            </button>
          </div>
        </div>

        {/* Real-time Web Audio API Waveform Oscilloscope Visualizer */}
        {showOscilloscope && (
          <div className="mt-4 pt-3 border-t border-cyan-500/20 animate-in fade-in duration-300">
            <CyberWaveformVisualizer
              height={115}
              showTelemetry={true}
              themeColor="cyan"
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Récemment Écoutés (Recently Played) Quick Resume Row */}
      {history && history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                Récemment Écoutés
              </h3>
            </div>
            <button
              onClick={() => onNavigate('music')}
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
            >
              <span>Bibliothèque</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
            {history.slice(0, 8).map((item, idx) => {
              const track = item.track;
              if (!track) return null;
              const isThisPlaying = currentTrack?.id === track.id && isPlaying;
              return (
                <div
                  key={`${track.id}-${idx}`}
                  onClick={() => playTrack(track)}
                  className={`flex items-center gap-3 p-2.5 rounded-2xl border transition group cursor-pointer shrink-0 w-60 backdrop-blur-xl ${
                    isThisPlaying
                      ? 'bg-purple-600/30 border-purple-400 shadow-md ring-1 ring-purple-400'
                      : 'bg-white/40 dark:bg-[#090b1e]/50 border-slate-200/60 dark:border-white/10 hover:border-purple-400/50 hover:bg-white/60 dark:hover:bg-[#0d0f28]/60 shadow-xs'
                  }`}
                >
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-sm border border-white/10">
                    <img src={track.coverUrl} alt={track.title} className="w-full h-full object-cover" />
                    <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition ${
                      isThisPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}>
                      {isThisPlaying ? <Pause className="w-4 h-4 text-white" /> : <Play className="w-4 h-4 text-white fill-current translate-x-0.2" />}
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-purple-400 transition">
                      {track.title}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {track.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 1-Tap French Radios Live Bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RadioTower className="w-4 h-4 text-cyan-400 animate-pulse" />
            <h3 className="font-bold text-slate-900 dark:text-white text-sm">
              Radios FM France en Direct (1 clic)
            </h3>
          </div>
          <button
            onClick={() => onNavigate('radio')}
            className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>Voir les 24 stations</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
          {quickStations.map((station) => {
            const isThisPlaying = currentTrack?.id === `radio-${station.id}` && isPlaying;
            return (
              <button
                key={station.id}
                onClick={() => handlePlayStation(station)}
                className={`p-3 rounded-2xl text-left border relative overflow-hidden group flex flex-col justify-between backdrop-blur-xl neon-card-hover ${
                  isThisPlaying
                    ? 'bg-blue-600/30 border-cyan-400 shadow-lg shadow-cyan-500/25 dark:bg-blue-900/40 ring-1 ring-cyan-400'
                    : 'bg-white/45 dark:bg-[#090b1e]/50 border-slate-200/60 dark:border-white/10 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl overflow-hidden bg-slate-900 border border-white/10 shrink-0">
                    <img src={station.coverUrl} alt={station.name} className="w-full h-full object-cover" />
                  </div>
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isThisPlaying ? 'bg-cyan-400 text-black' : 'bg-slate-100/70 dark:bg-white/10 text-slate-700 dark:text-white group-hover:bg-cyan-500 group-hover:text-white transition'
                  }`}>
                    {isThisPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current ml-0.5" />}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {station.name}
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    {station.frequency}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 6 Modules Grid (Navigation Hub) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">
            Tous les modules Vibra
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            6 rubriques principales
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainModules.map((module) => {
            const Icon = module.icon;
            return (
              <div
                key={module.id}
                onClick={module.action}
                className="group relative p-5 rounded-3xl bg-white/50 dark:bg-[#090b1e]/55 border border-slate-200/60 dark:border-cyan-500/25 neon-card-hover shadow-lg cursor-pointer flex flex-col justify-between backdrop-blur-2xl overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${module.gradient} text-white flex items-center justify-center shadow-md shadow-purple-600/20 group-hover:scale-105 transition`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${module.pillColor}`}>
                      {module.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                    {module.title}
                  </h4>
                  <p className="text-[11px] font-medium text-purple-600 dark:text-purple-300 mt-0.5">
                    {module.subtitle}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                    {module.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100/60 dark:border-white/5 flex items-center justify-between text-xs font-bold text-purple-600 dark:text-purple-400 group-hover:translate-x-1 transition">
                  <span>Accéder au module</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* APK & Google Play WebAPK Status Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-pink-950/70 border border-purple-500/40 text-white flex flex-col md:flex-row items-center justify-between gap-5 shadow-2xl backdrop-blur-2xl">
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Score PWABuilder 100/100 • Prêt pour Android & Play Store</span>
          </div>
          <h4 className="text-lg font-bold text-white">
            Générez votre fichier APK ou installez directement l'application
          </h4>
          <p className="text-xs text-purple-200 max-w-xl">
            Vibra respecte l'ensemble des critères Google Digital Asset Links, manifest officiel et Service Worker pour une installation native sans barre d'adresse de navigateur.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto shrink-0">
          <button
            onClick={onOpenApkStudio}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition"
          >
            <FileArchive className="w-4 h-4 text-pink-300" />
            <span>Studio APK (.ZIP)</span>
          </button>
          <button
            onClick={onOpenInstallModal}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-purple-900 hover:bg-purple-50 font-bold text-xs shadow-md transition"
          >
            <Smartphone className="w-4 h-4 text-purple-700" />
            <span>Guide d'installation</span>
          </button>
        </div>
      </div>
    </div>
  );
};
