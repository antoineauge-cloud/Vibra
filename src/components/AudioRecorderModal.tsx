import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, Radio, Download, Square, Play, Trash2, CheckCircle2, Clock, Sparkles, Volume2 } from 'lucide-react';
import { usePlayer } from '../context/PlayerContext';

interface AudioRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AudioRecorderModal: React.FC<AudioRecorderModalProps> = ({ isOpen, onClose }) => {
  const { currentTrack, isPlaying } = usePlayer();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedDuration, setRecordedDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [recordings, setRecordings] = useState<Array<{ id: string; url: string; title: string; duration: number; date: string }>>([]);

  const timerRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      // Try to capture from microphone or system audio
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm; codecs=opus' });
        const url = URL.createObjectURL(blob);
        const name = currentTrack ? `Enregistrement - ${currentTrack.title}` : `Enregistrement Vibra FM ${new Date().toLocaleTimeString()}`;
        
        setRecordings((prev) => [
          {
            id: `rec-${Date.now()}`,
            url,
            title: name,
            duration: recordedDuration,
            date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...prev
        ]);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current.start(250);
      setIsRecording(true);
      setRecordedDuration(0);

      timerRef.current = setInterval(() => {
        setRecordedDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Audio recording failed to initialize:', err);
      alert('Impossible d\'accéder à l\'entrée audio. Veuillez autoriser l\'accès au microphone dans les réglages de votre navigateur.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const formatSecs = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-[#07081a]/80 backdrop-blur-2xl border border-rose-500/40 rounded-3xl shadow-2xl p-6 text-white overflow-hidden max-h-[85vh] flex flex-col neon-border-rose"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-rose-500/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
              <Mic className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                Enregistreur Audio Studio
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  LIVE CAPTURE
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Capturez la radio en direct, vos notes vocales ou vos sessions
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

        {/* Recording Visualizer Centerpiece */}
        <div className="py-6 flex flex-col items-center justify-center gap-4">
          <div className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording 
              ? 'bg-rose-500/20 border-2 border-rose-500 shadow-xl shadow-rose-500/40 animate-pulse'
              : 'bg-white/5 border border-white/10'
          }`}>
            {isRecording ? (
              <span className="w-12 h-12 rounded-full bg-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/50">
                <Square className="w-5 h-5 text-white fill-current" />
              </span>
            ) : (
              <span className="w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 to-purple-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                <Mic className="w-6 h-6 text-white" />
              </span>
            )}
          </div>

          <div className="text-center">
            <div className="font-mono text-3xl font-extrabold tracking-wider text-white">
              {formatSecs(recordedDuration)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {isRecording 
                ? '🔴 Enregistrement en cours (Haute définition WebM / Opus)...' 
                : 'Appuyez pour lancer l\'enregistrement'}
            </p>
          </div>

          {/* Action Button */}
          {isRecording ? (
            <button
              onClick={stopRecording}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-2 transition"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Arrêter et Sauvegarder</span>
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 via-pink-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-rose-500/30 flex items-center gap-2 transition"
            >
              <Mic className="w-4 h-4" />
              <span>Démarrer l'enregistrement</span>
            </button>
          )}
        </div>

        {/* Saved Recordings list */}
        <div className="space-y-2 overflow-y-auto flex-1 border-t border-white/10 pt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>Enregistrements récents ({recordings.length})</span>
          </div>

          {recordings.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">
              Aucun extrait enregistré pour le moment.
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {recordings.map((rec) => (
                <div
                  key={rec.id}
                  className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="truncate">
                    <p className="font-bold text-white truncate">{rec.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {formatSecs(rec.duration)} • {rec.date}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={rec.url}
                      download={`${rec.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.webm`}
                      className="p-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold flex items-center gap-1 transition"
                      title="Télécharger le fichier audio sur votre appareil"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Télécharger</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300 text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            Fichiers sauvegardés localement sur votre téléphone
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold transition text-xs"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
