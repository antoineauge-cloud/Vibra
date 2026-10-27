import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Repeat1, 
  Volume2, 
  VolumeX, 
  Radio, 
  Sparkles, 
  ListMusic, 
  ShieldCheck, 
  Tv, 
  Music2,
  ChevronDown,
  Mic,
  Clock,
  Zap,
  Gauge,
  Share2,
  Check,
  Download,
  Loader2,
  Keyboard
} from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { CyberWaveformVisualizer } from './CyberWaveformVisualizer';

interface ExpandedPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  onOpenDiagnostics: () => void;
  onOpenLyrics?: () => void;
  onOpenSleepTimer?: () => void;
  onOpenSoundboard?: () => void;
  onOpenRecorder?: () => void;
}

export const ExpandedPlayerModal: React.FC<ExpandedPlayerModalProps> = ({
  isOpen,
  onClose,
  onOpenHistory,
  onOpenDiagnostics,
  onOpenLyrics,
  onOpenSleepTimer,
  onOpenSoundboard,
  onOpenRecorder,
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
    queue,
    playbackRate,
    setPlaybackRate,
    sleepTimerRemaining,
    playTrack,
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

  const [showVideo, setShowVideo] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isCaching, setIsCaching] = useState(false);

  if (!isOpen || !currentTrack) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-[#07081a]/90 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-white neon-border-cyan"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient background glow matching album art */}
        <div 
          className="absolute -top-32 -left-32 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"
        />
        <div 
          className="absolute -bottom-32 -right-32 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl pointer-events-none"
        />

        {/* Top bar */}
        <div className="relative z-10 px-6 py-4 flex items-center justify-between border-b border-cyan-500/25 bg-black/40 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-purple-300">
            <Music2 className="w-4 h-4 text-purple-400" />
            <span>Lecteur Haute Fidélité Vibra</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Quality Switcher */}
            <button
              onClick={() => {
                const next = audioQuality === 'auto' ? 'high' : audioQuality === 'high' ? 'eco' : 'auto';
                setAudioQuality(next);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-cyan-300 hover:text-white transition"
              title="Changer la qualité audio de streaming"
            >
              <Gauge className="w-3.5 h-3.5 text-cyan-400" />
              <span className="uppercase">{audioQuality === 'auto' ? 'Auto 320k' : audioQuality === 'high' ? 'HD 320k' : 'Éco 128k'}</span>
            </button>

            {/* Offline Cache Button */}
            <button
              onClick={async () => {
                if (isTrackCached(currentTrack.id)) return;
                setIsCaching(true);
                await cacheTrackForOffline(currentTrack);
                setIsCaching(false);
              }}
              disabled={isCaching}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border transition ${
                isTrackCached(currentTrack.id)
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20 border-white/10'
              }`}
              title={isTrackCached(currentTrack.id) ? 'Titre disponible hors-ligne' : 'Sauvegarder dans le cache pour écoute hors-ligne'}
            >
              {isTrackCached(currentTrack.id) ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Hors-ligne</span>
                </>
              ) : (
                <>
                  <Download className={`w-3.5 h-3.5 ${isCaching ? 'animate-bounce text-cyan-400' : ''}`} />
                  <span className="hidden sm:inline">{isCaching ? 'En cours...' : 'Télécharger'}</span>
                </>
              )}
            </button>

            {currentTrack.youtubeId && (
              <button
                onClick={() => setShowVideo(!showVideo)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition ${
                  showVideo ? 'bg-red-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
                title="Afficher le flux vidéo YouTube sans pub"
              >
                <Tv className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showVideo ? 'Masquer vidéo' : 'Vue YouTube'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
              title="Réduire"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="relative z-10 p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col md:flex-row items-center gap-8">
          {/* Left: Giant Album Art or Clean YouTube View */}
          <div className="w-full md:w-1/2 flex flex-col items-center justify-center">
            {showVideo && currentTrack.youtubeId ? (
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-black">
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${currentTrack.youtubeId}?autoplay=1&enablejsapi=1&iv_load_policy=3&modestbranding=1&rel=0`}
                  title={currentTrack.title}
                  className="w-full h-full border-none"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/15 group">
                <img
                  src={currentTrack.coverUrl}
                  alt={currentTrack.title}
                  className={`w-full h-full object-cover transition-transform duration-700 ${
                    isPlaying ? 'scale-105' : 'scale-100'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                  <span className="text-xs font-semibold text-purple-300">
                    Source: {currentTrack.source.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {currentTrack.album || 'Single'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Detailed Controls, Scrubber and Track Queue */}
          <div className="w-full md:w-1/2 flex flex-col justify-center space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  currentTrack.source === 'youtube'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                    : currentTrack.source === 'spotify'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {currentTrack.source}
                </span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Sans interruption
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                {currentTrack.title}
              </h2>
              <p className="text-base text-purple-200 mt-1">
                {currentTrack.artist}
              </p>
            </div>

            {/* Time scrubber */}
            <div className="space-y-2">
              <div className="relative w-full h-2 rounded-full bg-white/10 overflow-hidden cursor-pointer">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Real-Time Audio Waveform Oscilloscope (Web Audio API) */}
            <div className="w-full">
              <CyberWaveformVisualizer
                height={85}
                showTelemetry={false}
                themeColor="cyan"
                className="w-full"
              />
            </div>

            {/* Big Main Playback Controls */}
            <div className="flex items-center justify-center gap-6 py-2">
              <button
                onClick={toggleShuffle}
                className={`p-2.5 rounded-xl transition ${
                  isShuffling ? 'text-purple-400 bg-purple-950/40' : 'text-slate-400 hover:text-white'
                }`}
                title="Lecture aléatoire"
              >
                <Shuffle className="w-5 h-5" />
              </button>

              <button
                onClick={prevTrack}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 active:scale-95"
                title="Précédent"
              >
                <SkipBack className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={togglePlay}
                className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-600 hover:scale-105 active:scale-95 text-white flex items-center justify-center shadow-2xl shadow-purple-600/50 transition relative"
                title={isBuffering ? 'Mise en mémoire tampon...' : isPlaying ? 'Pause' : 'Lecture'}
              >
                {isBuffering ? (
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                ) : isPlaying ? (
                  <Pause className="w-8 h-8 fill-current" />
                ) : (
                  <Play className="w-8 h-8 fill-current translate-x-0.5" />
                )}
              </button>

              <button
                onClick={nextTrack}
                className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition hover:scale-105 active:scale-95"
                title="Suivant"
              >
                <SkipForward className="w-6 h-6 fill-current" />
              </button>

              <button
                onClick={toggleRepeat}
                className={`p-2.5 rounded-xl transition ${
                  repeatMode !== 'off' ? 'text-purple-400 bg-purple-950/40' : 'text-slate-400 hover:text-white'
                }`}
                title="Répétition"
              >
                {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
              </button>
            </div>

            {/* Keyboard Shortcuts Hint */}
            <div className="hidden sm:flex items-center justify-center gap-3 text-[10px] font-mono text-slate-400 py-0.5">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">Espace</kbd>
                <span>Play/Pause</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">← / →</kbd>
                <span>±5s</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">↑ / ↓</kbd>
                <span>Volume</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[9px]">M</kbd>
                <span>Muet</span>
              </span>
            </div>

            {/* Cyberpunk Tools & Speed Bar */}
            <div className="flex flex-wrap items-center justify-center gap-2 py-1">
              {/* Playback speed toggle */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    playbackRate !== 1.0
                      ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/50 shadow-sm'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                  title="Changer la vitesse de lecture (Nightcore, Slowed+Reverb)"
                >
                  <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{playbackRate === 1.25 ? '⚡ Nightcore (1.25x)' : playbackRate === 0.85 ? '🌙 Slowed (0.85x)' : `${playbackRate}x`}</span>
                </button>

                {showSpeedMenu && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-44 rounded-xl bg-[#121326] border border-cyan-500/40 shadow-xl py-1 z-30 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-400 border-b border-white/5">
                      Vitesse & Effets
                    </div>
                    {[
                      { rate: 0.85, label: '🌙 Slowed & Reverb (0.85x)' },
                      { rate: 1.0, label: '🎧 Normal (1.0x)' },
                      { rate: 1.15, label: '🔥 Dynamic (1.15x)' },
                      { rate: 1.25, label: '⚡ Nightcore Neon (1.25x)' },
                      { rate: 1.5, label: '🚀 Hyperdrive (1.5x)' },
                    ].map((item) => (
                      <button
                        key={item.rate}
                        type="button"
                        onClick={() => {
                          setPlaybackRate(item.rate);
                          setShowSpeedMenu(false);
                        }}
                        className={`w-full text-left px-3 py-1.5 hover:bg-cyan-500/20 transition ${
                          playbackRate === item.rate ? 'text-cyan-300 font-bold bg-cyan-950/40' : 'text-slate-300'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {onOpenLyrics && (
                <button
                  type="button"
                  onClick={onOpenLyrics}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Mic className="w-3.5 h-3.5 text-pink-400" />
                  <span>Paroles</span>
                </button>
              )}

              {onOpenSoundboard && (
                <button
                  type="button"
                  onClick={onOpenSoundboard}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>DJ SFX</span>
                </button>
              )}

              {onOpenRecorder && (
                <button
                  type="button"
                  onClick={onOpenRecorder}
                  className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                  <span>Enregistrer</span>
                </button>
              )}

              {onOpenSleepTimer && (
                <button
                  type="button"
                  onClick={onOpenSleepTimer}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                    sleepTimerRemaining !== null
                      ? 'bg-indigo-600/30 border-indigo-400/50 text-indigo-300'
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                  }`}
                  title="Minuteur de mise en veille"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{sleepTimerRemaining !== null ? `${Math.ceil(sleepTimerRemaining / 60)} min` : 'Veille'}</span>
                </button>
              )}
            </div>

            {/* Quick Queue Preview */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2.5">
                <span className="font-semibold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                  <ListMusic className="w-3.5 h-3.5" />
                  File de lecture ({queue.length})
                </span>
                <button
                  onClick={onOpenHistory}
                  className="text-purple-400 hover:underline"
                >
                  Voir l'historique complet
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {queue.slice(0, 4).map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition ${
                      track.id === currentTrack.id
                        ? 'bg-purple-600/30 border border-purple-500/40 font-bold text-white'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                      <span className="truncate">{track.title}</span>
                      <span className="text-slate-500 text-[10px]">— {track.artist}</span>
                    </div>
                    <span className="text-slate-500 font-mono text-[10px] shrink-0 ml-2">
                      {formatTime(track.duration)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
