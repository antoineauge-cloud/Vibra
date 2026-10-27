import React, { useState, useEffect } from 'react';
import { X, Mic, Music2, Copy, Check, Sparkles, Edit3, Save, RotateCcw } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LyricsModal: React.FC<LyricsModalProps> = ({ isOpen, onClose }) => {
  const { currentTrack, currentTime, duration, isPlaying } = usePlayer();
  const [copied, setCopied] = useState(false);
  const [activeVerseIndex, setActiveVerseIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [customLyricsText, setCustomLyricsText] = useState('');

  const defaultLyrics = currentTrack?.lyrics && currentTrack.lyrics.length > 0 ? currentTrack.lyrics : [
    `[Paroles de : ${currentTrack?.title || 'Titre inconnu'}]`,
    `Artiste : ${currentTrack?.artist || 'Artiste inconnu'}`,
    `Album : ${currentTrack?.album || 'Vibra Official'}`,
    "",
    "Écoute la basse vibrer au rythme du néon,",
    "Dans l'obscurité digitale, nous réécrivons les sons.",
    "Pas de publicités, pas de limites, juste la musique pure,",
    "Laisse les fréquences traverser l'armure.",
    "",
    "Vibra diffuse l'onde haute fidélité,",
    "Du crépuscule jusqu'à l'éternité."
  ];

  // Load custom saved lyrics from localStorage if user customized it
  const storageKey = currentTrack ? `vibra_lyrics_${currentTrack.id}` : '';
  
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setCustomLyricsText(saved);
      } else {
        setCustomLyricsText(defaultLyrics.join('\n'));
      }
    } catch (e) {
      setCustomLyricsText(defaultLyrics.join('\n'));
    }
  }, [storageKey, currentTrack?.id]);

  const rawLyrics = customLyricsText.trim() ? customLyricsText.split('\n') : defaultLyrics;

  // Dynamic verse highlighting based on playback progression
  useEffect(() => {
    if (duration > 0 && rawLyrics.length > 0) {
      const progress = currentTime / duration;
      const index = Math.min(rawLyrics.length - 1, Math.floor(progress * rawLyrics.length));
      setActiveVerseIndex(index);
    }
  }, [currentTime, duration, rawLyrics.length]);

  if (!isOpen || !currentTrack) return null;

  const copyLyrics = () => {
    navigator.clipboard.writeText(rawLyrics.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomLyrics = () => {
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, customLyricsText);
      } catch (e) {}
    }
    setIsEditing(false);
  };

  const handleResetLyrics = () => {
    if (storageKey) {
      try {
        localStorage.removeItem(storageKey);
      } catch (e) {}
    }
    setCustomLyricsText(defaultLyrics.join('\n'));
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#07081a]/80 backdrop-blur-2xl border border-purple-500/40 rounded-3xl shadow-2xl p-6 text-white overflow-hidden max-h-[85vh] flex flex-col neon-border-purple"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3 truncate pr-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-purple-500/30 shadow-md shrink-0">
              <img src={currentTrack.coverUrl} alt={currentTrack.title} className="w-full h-full object-cover" />
            </div>
            <div className="truncate">
              <h3 className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="truncate">{currentTrack.title}</span>
              </h3>
              <p className="text-xs text-purple-300 truncate">{currentTrack.artist}</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-2 rounded-xl text-xs transition flex items-center gap-1 ${
                isEditing ? 'bg-purple-600 text-white' : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
              title={isEditing ? 'Fermer l\'éditeur' : 'Éditer les paroles'}
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={copyLyrics}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition text-xs flex items-center gap-1"
              title="Copier les paroles"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lyrics body or Editor */}
        {isEditing ? (
          <div className="flex-1 overflow-y-auto py-4 space-y-3 flex flex-col">
            <div className="flex items-center justify-between text-xs text-purple-300">
              <span>Éditeur de paroles personnalisé :</span>
              <button
                onClick={handleResetLyrics}
                className="text-slate-400 hover:text-rose-400 flex items-center gap-1 text-[11px]"
              >
                <RotateCcw className="w-3 h-3" />
                Réinitialiser
              </button>
            </div>
            <textarea
              value={customLyricsText}
              onChange={(e) => setCustomLyricsText(e.target.value)}
              rows={12}
              className="w-full flex-1 p-3 rounded-2xl bg-black/60 border border-purple-500/40 text-xs font-mono text-purple-100 focus:outline-none focus:border-purple-400 resize-none leading-relaxed"
              placeholder="Collez ici les paroles de votre morceau..."
            />
            <button
              onClick={handleSaveCustomLyrics}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 transition"
            >
              <Save className="w-4 h-4" />
              Sauvegarder les paroles
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto py-6 space-y-4 text-center scrollbar-none">
            {rawLyrics.map((line, idx) => {
              const isCurrent = isPlaying && idx === activeVerseIndex;
              const isPast = idx < activeVerseIndex;

              if (!line.trim()) {
                return <div key={idx} className="h-4" />;
              }

              return (
                <p
                  key={idx}
                  className={`transition-all duration-300 font-medium ${
                    isCurrent
                      ? 'text-lg sm:text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-pink-400 to-purple-300 scale-105 shadow-xs'
                      : isPast
                      ? 'text-sm sm:text-base text-slate-400/80'
                      : 'text-sm sm:text-base text-slate-500'
                  }`}
                >
                  {line}
                </p>
              );
            })}
          </div>
        )}

        {/* Footer status */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
          <span className="flex items-center gap-1 text-cyan-400">
            <Sparkles className="w-3.5 h-3.5" />
            Karaoké Cyberpunk Synchronisé
          </span>
          <span className="font-mono">{currentTrack.source.toUpperCase()} HQ</span>
        </div>
      </div>
    </div>
  );
};
