import React, { useState, useRef } from 'react';
import { X, FolderOpen, Music, Play, Plus, HardDrive, CheckCircle2, Sparkles, AlertCircle, FileAudio } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';
import { Track } from '../types/player';

interface LocalAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalAudioModal: React.FC<LocalAudioModalProps> = ({ isOpen, onClose }) => {
  const { playTrack, queue } = usePlayer();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadedFiles, setLoadedFiles] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFilesSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsLoading(true);
    const newTracks: Track[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|ogg|m4a|flac|aac)$/i)) {
        continue;
      }

      const audioUrl = URL.createObjectURL(file);
      const cleanName = file.name.replace(/\.[^/.]+$/, '');
      const parts = cleanName.split(' - ');
      const artist = parts.length > 1 ? parts[0].trim() : 'Fichier Local';
      const title = parts.length > 1 ? parts.slice(1).join(' - ').trim() : cleanName;

      // Estimate or read duration
      let duration = 210;
      try {
        const tempAudio = new Audio(audioUrl);
        await new Promise((resolve) => {
          tempAudio.onloadedmetadata = () => {
            duration = Math.round(tempAudio.duration) || 210;
            resolve(true);
          };
          tempAudio.onerror = () => resolve(true);
          setTimeout(() => resolve(true), 600);
        });
      } catch (e) {
        // fallback duration
      }

      const track: Track = {
        id: `local-${Date.now()}-${i}-${Math.random().toString(36).slice(2, 6)}`,
        title,
        artist,
        album: 'Stockage Téléphone / PC',
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
        duration,
        source: 'local' as any,
        audioUrl,
        isOfflineAvailable: true,
        lyrics: [
          `[Morceau Local : ${title}]`,
          `Artiste : ${artist}`,
          `Format : ${file.type || 'Audio numérique'}`,
          `Taille : ${(file.size / (1024 * 1024)).toFixed(2)} Mo`,
          "",
          "Lecture locale haute fidélité avec égaliseur 10 bandes Vibra.",
          "Aucune connexion Internet requise."
        ]
      };

      newTracks.push(track);
    }

    setLoadedFiles((prev) => [...newTracks, ...prev]);
    setIsLoading(false);
    setSuccessMessage(`${newTracks.length} morceau(x) importé(s) avec succès !`);
    setTimeout(() => setSuccessMessage(null), 3000);

    // If tracks were loaded, automatically play the first one
    if (newTracks.length > 0) {
      playTrack(newTracks[0]);
    }
  };

  const handlePlayLocalTrack = (track: Track) => {
    playTrack(track);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-[#07081a]/80 backdrop-blur-2xl border border-cyan-500/40 rounded-3xl shadow-2xl p-6 text-white overflow-hidden max-h-[85vh] flex flex-col neon-border-cyan"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-cyan-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <HardDrive className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                Lecteur MP3 & Musique Locale
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  OFFLINE 100%
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Écoutez les fichiers audio de votre téléphone avec le son Cyberpunk et l'égaliseur
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success toast */}
        {successMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Content body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {/* File Picker Hero Card */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-6 text-center cursor-pointer bg-cyan-950/20 hover:bg-cyan-950/30 transition group flex flex-col items-center justify-center gap-3"
          >
            <input 
              ref={fileInputRef}
              type="file" 
              accept="audio/*,.mp3,.wav,.ogg,.m4a,.flac,.aac" 
              multiple 
              onChange={handleFilesSelected}
              className="hidden" 
            />
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 group-hover:scale-110 transition shadow-lg shadow-cyan-500/20">
              <FolderOpen className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-sm text-white group-hover:text-cyan-300 transition">
                Cliquez pour choisir des morceaux sur votre appareil
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Formats acceptés : MP3, WAV, FLAC, M4A, OGG, AAC (sans limite de taille)
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold text-xs shadow-md shadow-cyan-500/30 pointer-events-none"
            >
              Parcourir mes fichiers audio
            </button>
          </div>

          {/* List of imported tracks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                <FileAudio className="w-3.5 h-3.5 text-cyan-400" />
                Morceaux locaux disponibles ({loadedFiles.length})
              </span>
            </div>

            {loadedFiles.length === 0 ? (
              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center text-xs text-slate-400">
                Aucun fichier local sélectionné pour l'instant. Choisissez vos MP3 pour en profiter hors-ligne avec l'égaliseur !
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {loadedFiles.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => handlePlayLocalTrack(track)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-cyan-950/40 border border-white/5 hover:border-cyan-500/30 cursor-pointer transition group"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0 group-hover:scale-105 transition">
                        <Play className="w-4 h-4 fill-current" />
                      </div>
                      <div className="truncate">
                        <p className="font-bold text-xs text-white group-hover:text-cyan-300 transition truncate">
                          {track.title}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {track.artist} • {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayLocalTrack(track);
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-semibold shrink-0"
                    >
                      Écouter
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Lecture 100% hors-ligne dans la mémoire du navigateur
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
