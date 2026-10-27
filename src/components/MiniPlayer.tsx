import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  History, 
  ShieldCheck, 
  Maximize2, 
  ChevronDown, 
  ChevronUp, 
  Music2, 
  Radio,
  RadioTower,
  Sliders,
  X,
  RotateCcw,
  Power,
  Sparkles,
  ExternalLink,
  Flame,
  Zap,
  Mic,
  Music,
  Check,
  Download,
  Loader2,
  Gauge
} from 'lucide-react';
import { usePlayer, EQUALIZER_PRESETS } from '../context/PlayerContext';
import { TrackSource } from '../types/player';
import { AudioEqualizer } from './AudioEqualizer';
import { FluidEqSlider } from './FluidEqSlider';

interface MiniPlayerProps {
  onOpenHistory: () => void;
  onOpenDiagnostics: () => void;
  onOpenExpanded: () => void;
}

export const MiniPlayer: React.FC<MiniPlayerProps> = ({
  onOpenHistory,
  onOpenDiagnostics,
  onOpenExpanded,
}) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffling,
    repeatMode,
    history,
    equalizer,
    setEqualizerBand,
    setEqualizerPreset,
    toggleEqualizer,
    resetEqualizer,
    togglePlay,
    nextTrack,
    prevTrack,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    isBuffering,
    audioQuality,
    setAudioQuality,
    isTrackCached,
    cacheTrackForOffline,
  } = usePlayer();

  const [isMinimized, setIsMinimized] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [showEqDrawer, setShowEqDrawer] = useState(false);
  const [showEqualizerModal, setShowEqualizerModal] = useState(false);
  const [isCaching, setIsCaching] = useState(false);

  // When a new track or radio station is played, automatically slide up the MiniPlayer
  useEffect(() => {
    if (currentTrack) {
      setHasInteracted(true);
      setIsMinimized(false);
    }
  }, [currentTrack]);

  if (!currentTrack && !hasInteracted) {
    return null;
  }

  const isLiveRadio = currentTrack?.source === 'radio';

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isLiveRadio) return;
    const val = parseFloat(e.target.value);
    seekTo(val);
  };

  const getSourceBadge = (source?: TrackSource) => {
    if (!source) return null;
    switch (source) {
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/25">
            YouTube
          </span>
        );
      case 'spotify':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/25">
            Spotify
          </span>
        );
      case 'deezer':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border border-cyan-500/25">
            Deezer
          </span>
        );
      case 'local':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-500/25">
            Local MP3
          </span>
        );
      case 'radio':
        return (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/25">
            <RadioTower className="w-2.5 h-2.5 animate-pulse" />
            FM Direct
          </span>
        );
    }
  };

  const isVisible = currentTrack !== null && !isMinimized;

  return (
    <>
      {/* Floating Restore Pill (Visible when MiniPlayer is slid down / minimized) */}
      <div 
        className={`fixed bottom-4 right-4 z-50 transition-all duration-300 ease-out transform ${
          isMinimized && currentTrack 
            ? 'translate-y-0 opacity-100 pointer-events-auto scale-100' 
            : 'translate-y-6 opacity-0 pointer-events-none scale-95'
        }`}
      >
        {currentTrack && (
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/60 dark:bg-[#08091e]/65 text-slate-800 dark:text-white border border-purple-500/40 shadow-2xl backdrop-blur-2xl hover:border-purple-400 transition">
            <div 
              onClick={() => setIsMinimized(false)}
              className="flex items-center gap-2.5 cursor-pointer select-none"
              title="Agrandir le lecteur"
            >
              <div className="relative w-8 h-8 rounded-lg overflow-hidden shrink-0 shadow-sm border border-slate-200 dark:border-white/10">
                <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
                {isPlaying && (
                  <span className="absolute inset-0 bg-purple-600/30 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  </span>
                )}
              </div>
              <div className="max-w-[130px] truncate text-left">
                <p className="text-xs font-bold truncate text-slate-900 dark:text-white">{currentTrack.title}</p>
                <p className="text-[10px] text-purple-600 dark:text-purple-300 truncate">{currentTrack.artist}</p>
              </div>
            </div>

            <button
              onClick={togglePlay}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition shadow-sm"
              title={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current translate-x-0.2" />}
            </button>

            <button
              onClick={() => setIsMinimized(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              title="Déplier le MiniPlayer"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>



      {/* Main Persistent MiniPlayer Docked at bottom with Fluid Slide Up / Down Animation */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-40 bg-white/50 dark:bg-[#060716]/65 border-t border-slate-200/50 dark:border-cyan-500/35 backdrop-blur-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform select-none neon-border-cyan ${
          isVisible 
            ? 'translate-y-0 opacity-100 pointer-events-auto shadow-[0_-10px_40px_rgba(0,240,255,0.15)]' 
            : 'translate-y-full opacity-0 pointer-events-none shadow-none'
        }`}
      >
        {/* Top Interactive Progress Scrubber / Live Indicator */}
        <div className="relative w-full h-1 group cursor-pointer bg-slate-200 dark:bg-white/10">
          {isLiveRadio ? (
            <div className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 w-full relative">
              {isPlaying && (
                <div className="absolute inset-0 bg-white/30 animate-[pulse_1.5s_ease-in-out_infinite]" />
              )}
            </div>
          ) : (
            <>
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 relative transition-all duration-100 shadow-xs shadow-cyan-400"
                style={{ width: `${progressPercent}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-cyan-300 shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <input
                type="range"
                min="0"
                max={duration || 100}
                value={currentTime}
                onChange={handleSeek}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </>
          )}
        </div>

        {/* Inline Quick Equalizer Drawer with Fluid Animated Sliders */}
        <div
          className={`overflow-hidden transition-all duration-350 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            showEqDrawer
              ? 'max-h-[500px] opacity-100 border-b border-slate-200/90 dark:border-white/10'
              : 'max-h-0 opacity-0 pointer-events-none border-b-0'
          }`}
        >
          <div className="p-3 sm:p-4 max-w-7xl mx-auto space-y-3 bg-slate-50/90 dark:bg-[#0f0f1c]/90 backdrop-blur-md">
            {/* Header of Quick Equalizer */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-xs">
                  <Sliders className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Égaliseur Fréquences Direct
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase ${
                        equalizer.isEnabled
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {equalizer.isEnabled ? 'Actif' : 'Off'}
                    </span>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold bg-purple-500/10 px-1.5 py-0.2 rounded">
                      {equalizer.preset}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    Curseurs motorisés à transition fluide • Basses, Médiums, Aigus
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleEqualizer}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition shadow-2xs ${
                    equalizer.isEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                      : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                  }`}
                  title={equalizer.isEnabled ? 'Désactiver égaliseur' : 'Activer égaliseur'}
                >
                  <Power className="w-3 h-3" />
                  <span>{equalizer.isEnabled ? 'Actif' : 'Inactif'}</span>
                </button>

                <button
                  onClick={resetEqualizer}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-purple-400 transition"
                  title="Réinitialiser à 0 dB"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">0 dB</span>
                </button>

                <button
                  onClick={() => setShowEqualizerModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-100/80 dark:bg-purple-950/50 hover:bg-purple-200 dark:hover:bg-purple-900/60 border border-purple-300 dark:border-purple-500/30 transition"
                  title="Ouvrir le studio complet avec courbe de réponse dynamique"
                >
                  <Sparkles className="w-3 h-3 text-purple-500" />
                  <span className="hidden sm:inline">Studio Complet</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  onClick={() => setShowEqDrawer(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                  title="Fermer le panneau égaliseur"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* The 3 Motorized Fluid Sliders: Basses, Médiums, Aigus */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <FluidEqSlider
                label="Basses"
                frequency="150 Hz"
                subLabel="Graves & Impact"
                value={equalizer.bass}
                onChange={(val) => setEqualizerBand('bass', val)}
                disabled={!equalizer.isEnabled}
                color="rose"
                orientation="horizontal"
              />

              <FluidEqSlider
                label="Médiums"
                frequency="1 kHz"
                subLabel="Voix & Clarté"
                value={equalizer.mid}
                onChange={(val) => setEqualizerBand('mid', val)}
                disabled={!equalizer.isEnabled}
                color="purple"
                orientation="horizontal"
              />

              <FluidEqSlider
                label="Aigus"
                frequency="6 kHz"
                subLabel="Brillance & Ciels"
                value={equalizer.treble}
                onChange={(val) => setEqualizerBand('treble', val)}
                disabled={!equalizer.isEnabled}
                color="cyan"
                orientation="horizontal"
              />
            </div>

            {/* Quick Preset Chips with Smooth Gliding Sliders */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 shrink-0 mr-1">
                Presets :
              </span>
              {EQUALIZER_PRESETS.map((p) => {
                const isSelected = equalizer.preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setEqualizerPreset(p.id)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all duration-300 shrink-0 ${
                      isSelected
                        ? 'bg-purple-600 text-white shadow-xs font-bold ring-2 ring-purple-400/50'
                        : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-purple-300 hover:bg-slate-50 dark:hover:bg-white/10'
                    }`}
                    title={`${p.name} (B:${p.bass > 0 ? '+' + p.bass : p.bass} M:${p.mid > 0 ? '+' + p.mid : p.mid} A:${p.treble > 0 ? '+' + p.treble : p.treble})`}
                  >
                    <span>{p.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 sm:gap-4 max-w-7xl mx-auto">
          {/* Left Section: Track Info & Animated Equalizer */}
          <div className="flex items-center gap-3 min-w-0 flex-1 sm:max-w-xs">
            <div 
              onClick={onOpenExpanded}
              className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 shadow-md cursor-pointer group/art border border-slate-200 dark:border-white/10"
              title="Agrandir la pochette"
            >
              <img
                src={currentTrack?.coverUrl}
                alt={currentTrack?.title}
                className={`w-full h-full object-cover transition-transform duration-500 ${
                  isPlaying ? 'scale-105' : 'scale-100'
                }`}
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80';
                }}
              />
              <div className="absolute inset-0 bg-black/20 group-hover/art:bg-black/40 flex items-center justify-center transition">
                <Maximize2 className="w-4 h-4 text-white opacity-0 group-hover/art:opacity-100 transition-opacity" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 
                  onClick={onOpenExpanded}
                  className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate cursor-pointer hover:underline"
                >
                  {currentTrack?.title}
                </h4>
                {getSourceBadge(currentTrack?.source)}
                {currentTrack && (
                  <button
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (isTrackCached(currentTrack.id)) return;
                      setIsCaching(true);
                      await cacheTrackForOffline(currentTrack);
                      setIsCaching(false);
                    }}
                    disabled={isCaching}
                    className={`p-1 rounded-lg text-xs transition shrink-0 ${
                      isTrackCached(currentTrack.id)
                        ? 'text-emerald-400 hover:text-emerald-300'
                        : 'text-slate-400 hover:text-cyan-300'
                    }`}
                    title={isTrackCached(currentTrack.id) ? 'Disponible hors-ligne' : 'Télécharger pour écoute hors-ligne'}
                  >
                    {isTrackCached(currentTrack.id) ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Download className={`w-3.5 h-3.5 ${isCaching ? 'animate-bounce text-cyan-400' : ''}`} />
                    )}
                  </button>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                {currentTrack?.artist}
              </p>
            </div>

            {/* Equalizer Waveform bars */}
            {isPlaying && (
              <div className="hidden lg:flex items-end gap-1 h-4 shrink-0 px-1">
                <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_0.6s_ease-in-out_infinite] h-3 shadow-xs shadow-cyan-400" />
                <span className="w-1 bg-pink-500 rounded-full animate-[bounce_0.8s_ease-in-out_infinite] h-4 shadow-xs shadow-pink-500" />
                <span className="w-1 bg-teal-400 rounded-full animate-[bounce_0.5s_ease-in-out_infinite] h-2 shadow-xs shadow-teal-400" />
                <span className="w-1 bg-cyan-300 rounded-full animate-[bounce_0.7s_ease-in-out_infinite] h-3.5 shadow-xs shadow-cyan-300" />
              </div>
            )}
          </div>

          {/* Center Section: Main Playback Controls */}
          <div className="flex flex-col items-center justify-center gap-1 shrink-0">
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Shuffle (only for music) */}
              {!isLiveRadio && (
                <button
                  onClick={toggleShuffle}
                  className={`p-1.5 rounded-lg text-xs hidden sm:block transition ${
                    isShuffling
                      ? 'text-cyan-400 bg-cyan-950/40 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-cyan-300'
                  }`}
                  title="Lecture aléatoire"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              )}

              {/* Prev */}
              <button
                onClick={prevTrack}
                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-cyan-500/10 transition"
                title="Piste précédente"
              >
                <SkipBack className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              {/* Play / Pause button */}
              <button
                onClick={togglePlay}
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full text-slate-950 font-extrabold flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition relative ${
                  isLiveRadio
                    ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-teal-400 shadow-cyan-500/30 neon-glow-cyan'
                    : 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 shadow-cyan-400/30 neon-glow-cyan'
                }`}
                title={isBuffering ? 'Mise en mémoire tampon...' : isPlaying ? 'Mettre en pause' : 'Lecture'}
              >
                {isBuffering ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                title="Piste suivante"
              >
                <SkipForward className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              </button>

              {/* Repeat (only for music) */}
              {!isLiveRadio && (
                <button
                  onClick={toggleRepeat}
                  className={`p-1.5 rounded-lg text-xs hidden sm:block transition ${
                    repeatMode !== 'off'
                      ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                  title={`Répétition: ${repeatMode === 'off' ? 'Désactivée' : repeatMode === 'all' ? 'Toutes les pistes' : 'Piste unique'}`}
                >
                  {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
                </button>
              )}
            </div>

            {/* Time Scrubber (desktop view) */}
            <div className="hidden md:flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400 w-72 lg:w-96">
              {isLiveRadio ? (
                <div className="w-full flex items-center justify-center gap-2 py-0.5">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="font-bold text-red-600 dark:text-red-400 tracking-wider text-[11px]">EN DIRECT FM</span>
                  <span className="text-slate-400">• Flux stéréo haute fidélité</span>
                </div>
              ) : (
                <>
                  <span className="w-9 text-right">{formatTime(currentTime)}</span>
                  <div className="relative flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-white/10 overflow-hidden cursor-pointer">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <span className="w-9">{formatTime(duration)}</span>
                </>
              )}
            </div>
          </div>

          {/* Right Section: Volume, History trigger & Diagnostics */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Volume Control (desktop) */}
            <div className="hidden lg:flex items-center gap-2 mr-1">
              <button
                onClick={toggleMute}
                className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
                title={isMuted ? 'Activer le son' : 'Couper le son'}
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1.5 accent-purple-600 bg-slate-200 dark:bg-white/10 rounded-lg cursor-pointer"
                title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              />
            </div>

              {/* Audio Quality Mode Quick Switcher */}
              <button
                onClick={() => {
                  const next = audioQuality === 'auto' ? 'high' : audioQuality === 'high' ? 'eco' : 'auto';
                  setAudioQuality(next);
                }}
                className="hidden sm:flex items-center gap-1 px-2 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-mono text-slate-600 dark:text-slate-300 hover:text-cyan-500 dark:hover:text-cyan-400 transition"
                title={`Qualité de stream: ${audioQuality.toUpperCase()} (Cliquer pour basculer)`}
              >
                <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold uppercase">{audioQuality}</span>
              </button>

              {/* Audio Equalizer Button */}
              <button
                onClick={() => setShowEqDrawer((prev) => !prev)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition ${
                  showEqDrawer || equalizer.isEnabled
                    ? 'bg-purple-100 dark:bg-purple-950/60 border-purple-400 dark:border-purple-500/50 text-purple-700 dark:text-purple-300 shadow-2xs hover:bg-purple-200 dark:hover:bg-purple-900/40'
                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
                title={`Égaliseur Audio (${equalizer.isEnabled ? 'Actif: ' + equalizer.preset : 'Désactivé'}) - Personnaliser Basses, Médiums, Aigus`}
              >
                <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Égaliseur</span>
                {equalizer.isEnabled && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
                {showEqDrawer ? (
                  <ChevronDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 transition-transform" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400 transition-transform" />
                )}
              </button>

              {/* History Button */}
              <button
                onClick={onOpenHistory}
                className="relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 text-xs font-semibold transition"
                title="Historique d'écoute"
              >
                <History className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden sm:inline">Historique</span>
                {history.length > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-purple-600 text-white text-[10px] font-bold">
                    {history.length}
                  </span>
                )}
              </button>

              {/* API Diagnostics Button */}
              <button
                onClick={onOpenDiagnostics}
                className="flex items-center gap-1 px-2 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 text-xs font-semibold transition"
                title="État des APIs YouTube et Spotify (Sans pub)"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden md:inline">APIs</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>

              {/* Expand Fullscreen Player */}
              <button
                onClick={onOpenExpanded}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
                title="Agrandir le lecteur"
              >
                <Maximize2 className="w-4 h-4" />
              </button>

              {/* Slide Down / Minimize Toggle (Smoothly slides down) */}
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10 transition"
                title="Réduire le lecteur (Slide down)"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

      {/* Audio Equalizer Modal Component */}
      <AudioEqualizer 
        isOpen={showEqualizerModal} 
        onClose={() => setShowEqualizerModal(false)} 
      />
    </>
  );
};
