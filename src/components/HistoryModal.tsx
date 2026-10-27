import React, { useState } from 'react';
import { X, History, Play, Trash2, Clock, Music, Headphones, Radio, Sparkles, Check, AlertCircle } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Track, TrackSource } from '../types/player';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({ isOpen, onClose }) => {
  const { history, playTrack, clearHistory, removeHistoryItem, currentTrack, isPlaying } = usePlayer();
  const [filter, setFilter] = useState<'all' | TrackSource>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filter === 'all') return true;
    return item.track.source === filter;
  });

  const formatRelativeTime = (timestamp: number) => {
    const diff = Math.floor((Date.now() - timestamp) / 1000);
    if (diff < 60) return "À l'instant";
    if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const getSourceBadge = (source: TrackSource) => {
    switch (source) {
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
            YouTube
          </span>
        );
      case 'spotify':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-500/15 text-green-700 dark:text-green-400 border border-green-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            Spotify
          </span>
        );
      case 'radio':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Radio FM
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white/75 dark:bg-[#07081a]/85 border border-slate-200/60 dark:border-purple-500/40 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-800 dark:text-slate-100 transition-colors duration-200 neon-border-purple ath-modal-glitch"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-gradient-to-r dark:from-purple-950/50 dark:via-indigo-950/40 dark:to-pink-950/50 backdrop-blur-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 ath-header-glitch">
                Historique d'écoute
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 font-medium">
                  {history.length} titres
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Vos musiques lues sur YouTube, Spotify et Radio FM avec reprise instantanée
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar & Actions */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-white/5 bg-white dark:bg-black/20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              Tous ({history.length})
            </button>
            <button
              onClick={() => setFilter('youtube')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                filter === 'youtube'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              YouTube ({history.filter((i) => i.track.source === 'youtube').length})
            </button>
            <button
              onClick={() => setFilter('spotify')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                filter === 'spotify'
                  ? 'bg-green-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Spotify ({history.filter((i) => i.track.source === 'spotify').length})
            </button>
            <button
              onClick={() => setFilter('radio')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                filter === 'radio'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              Radio ({history.filter((i) => i.track.source === 'radio').length})
            </button>
          </div>

          {history.length > 0 && (
            <div>
              {showClearConfirm ? (
                <div className="flex items-center gap-1.5 animate-in fade-in duration-150">
                  <span className="text-xs text-red-600 dark:text-red-400 font-medium">Confirmer ?</span>
                  <button
                    onClick={() => {
                      clearHistory();
                      setShowClearConfirm(false);
                    }}
                    className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition"
                  >
                    Oui
                  </button>
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="px-2 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-xs text-slate-700 dark:text-slate-300 transition"
                  >
                    Non
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                  title="Effacer tout l'historique"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Effacer</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* List of played tracks */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filteredHistory.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Music className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Aucun titre dans cet historique</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Lancez des musiques via la barre de recherche YouTube ou la bibliothèque Spotify pour les retrouver ici.
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const isCurrent = currentTrack?.id === item.track.id;
              return (
                <div
                  key={item.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition group ${
                    isCurrent
                      ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-500/40 shadow-xs'
                      : 'bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:border-purple-300 dark:hover:border-purple-500/30 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Cover art with play trigger */}
                    <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 group/cover">
                      <img src={item.track.coverUrl} alt={item.track.title} className="w-full h-full object-cover" />
                      <button
                        onClick={() => playTrack(item.track)}
                        className={`absolute inset-0 bg-black/60 flex items-center justify-center text-white transition ${
                          isCurrent && isPlaying ? 'opacity-100' : 'opacity-0 group-hover/cover:opacity-100'
                        }`}
                        title="Écouter maintenant"
                      >
                        <Play className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h5 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {item.track.title}
                        </h5>
                        {getSourceBadge(item.track.source)}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {item.track.artist} • {item.track.album || 'Single'}
                      </p>
                      <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelativeTime(item.playedAt)}
                        </span>
                        {item.playCount > 1 && (
                          <span className="text-purple-600 dark:text-purple-400 font-semibold">
                            {item.playCount} écoutes
                          </span>
                        )}
                        <span>{formatDuration(item.track.duration)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    <button
                      onClick={() => playTrack(item.track)}
                      className={`p-2 rounded-xl transition ${
                        isCurrent
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-white/10 hover:bg-purple-600 hover:text-white text-slate-700 dark:text-slate-300'
                      }`}
                      title="Rejouer ce titre"
                    >
                      <Play className="w-4 h-4 fill-current" />
                    </button>
                    <button
                      onClick={() => removeHistoryItem(item.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-white/10 transition opacity-0 group-hover:opacity-100"
                      title="Supprimer de l'historique"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/30 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>
            Sauvegarde automatique locale • Conforme PWA & Offline
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-slate-800 dark:text-white font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
