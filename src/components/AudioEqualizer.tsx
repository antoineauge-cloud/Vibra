import React, { useState } from 'react';
import { 
  Sliders, 
  X, 
  RotateCcw, 
  Sparkles, 
  Flame, 
  Zap, 
  Mic, 
  Music, 
  Check, 
  Power,
  Volume2,
  Headphones,
  Maximize2,
  SlidersHorizontal,
  Disc3,
  Activity
} from 'lucide-react';
import { usePlayer, EQUALIZER_PRESETS, FREQUENCIES_10_BAND } from '../context/PlayerContext';
import { FluidEqSlider } from './FluidEqSlider';
import { CyberpunkVisualizer } from './CyberpunkVisualizer';

interface AudioEqualizerProps {
  isOpen?: boolean;
  onClose?: () => void;
  isEmbedded?: boolean;
}

export const AudioEqualizer: React.FC<AudioEqualizerProps> = ({ 
  isOpen = true, 
  onClose = () => {}, 
  isEmbedded = false 
}) => {
  const { 
    equalizer, 
    setEqualizerBand, 
    setEqualizerBand10,
    toggle10BandMode,
    toggleBassBoost,
    toggleSpatialAudio,
    toggleLoudnessBoost,
    setEqualizerPreset, 
    toggleEqualizer, 
    resetEqualizer,
    currentTrack 
  } = usePlayer();

  const [activeVisualizer, setActiveVisualizer] = useState(true);

  if (!isEmbedded && !isOpen) return null;

  const { bass, mid, treble, isEnabled, preset, bands10, is10BandMode, bassBoost, spatialAudio, loudnessBoost } = equalizer;
  const currentBands10 = bands10 && bands10.length === 10 ? bands10 : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  // Calculate SVG curve coordinates for real-time frequency curve visualizer
  // viewBox: 0 0 300 80. Center is y=40 (0 dB). +12dB -> y=10, -12dB -> y=70.
  const getY = (val: number) => 40 - (val / 12) * 28;
  const yBass = getY(isEnabled ? bass : 0);
  const yMid = getY(isEnabled ? mid : 0);
  const yTreble = getY(isEnabled ? treble : 0);

  const curvePath = `M 15 ${yBass} C 60 ${yBass}, 90 ${yMid}, 150 ${yMid} C 210 ${yMid}, 240 ${yTreble}, 285 ${yTreble}`;
  const fillPath = `${curvePath} L 285 75 L 15 75 Z`;

  const getPresetIcon = (id: string) => {
    switch (id) {
      case 'bass-boost':
        return <Flame className="w-3.5 h-3.5 text-rose-400" />;
      case 'electro':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'vocal':
        return <Mic className="w-3.5 h-3.5 text-cyan-400" />;
      case 'rock':
        return <Music className="w-3.5 h-3.5 text-purple-400" />;
      case 'clarity':
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Volume2 className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const cardContent = (
    <div 
      className={`relative w-full ${isEmbedded ? 'max-w-3xl mx-auto shadow-2xl' : 'max-w-lg shadow-2xl'} bg-white/60 dark:bg-[#07091e]/75 backdrop-blur-2xl border border-slate-200/60 dark:border-cyan-500/35 rounded-3xl overflow-hidden flex flex-col text-slate-800 dark:text-slate-100 transition-colors duration-200`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500" />

      {/* Modal/Panel Header */}
      <div className="px-6 py-4.5 border-b border-slate-200/80 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 via-pink-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Égaliseur Audio Studio
              </h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider transition ${
                isEnabled 
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-slate-400'
              }`}>
                {isEnabled ? 'Actif' : 'Désactivé'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Traitement matériel Web Audio • Basses, Médiums & Aigus
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Master Toggle Button */}
          <button
            onClick={toggleEqualizer}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
              isEnabled
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95 shadow-emerald-600/30'
                : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-white/20'
            }`}
            title={isEnabled ? 'Désactiver l\'égaliseur' : 'Activer l\'égaliseur'}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isEnabled ? 'Activé' : 'Activer'}</span>
          </button>

          {!isEmbedded && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition"
              aria-label="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Modal / Panel Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {/* Audio FX Toolbar (Mega Bass, Spatial 3D, Loudness, Visualizer) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <button
              onClick={toggleBassBoost}
              disabled={!isEnabled}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition ${
                bassBoost
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-lg shadow-rose-500/20 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Flame className={`w-4 h-4 ${bassBoost ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-xs">Mega Bass</div>
                <div className="text-[10px] text-slate-500">{bassBoost ? '+8 dB Actif' : 'Désactivé'}</div>
              </div>
            </button>

            <button
              onClick={toggleSpatialAudio}
              disabled={!isEnabled}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition ${
                spatialAudio
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-lg shadow-cyan-500/20 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Headphones className={`w-4 h-4 ${spatialAudio ? 'text-cyan-400' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-xs">Spatial 3D</div>
                <div className="text-[10px] text-slate-500">{spatialAudio ? 'Surround ON' : 'Stéréo'}</div>
              </div>
            </button>

            <button
              onClick={toggleLoudnessBoost}
              disabled={!isEnabled}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition ${
                loudnessBoost
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${loudnessBoost ? 'text-amber-400' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-xs">Loudness</div>
                <div className="text-[10px] text-slate-500">{loudnessBoost ? '+5 dB Gain' : 'Normal'}</div>
              </div>
            </button>

            <button
              onClick={() => setActiveVisualizer(!activeVisualizer)}
              className={`p-3 rounded-2xl border flex items-center gap-2.5 transition ${
                activeVisualizer
                  ? 'bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/20 font-bold'
                  : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Activity className={`w-4 h-4 ${activeVisualizer ? 'text-purple-400' : 'text-slate-400'}`} />
              <div className="text-left">
                <div className="text-xs">Visualiseur</div>
                <div className="text-[10px] text-slate-500">{activeVisualizer ? 'Spectre HD' : 'Masqué'}</div>
              </div>
            </button>
          </div>

          {/* Embedded Real-time Cyberpunk Visualizer */}
          {activeVisualizer && (
            <CyberpunkVisualizer height={110} />
          )}

          {/* Mode Switcher: 3-Band vs 10-Band Pro */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <button
                onClick={toggle10BandMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  !is10BandMode
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>3 Bandes Rapide</span>
              </button>
              <button
                onClick={toggle10BandMode}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  is10BandMode
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-500/30'
                    : 'bg-white/10 text-slate-300 hover:bg-white/15'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>10 Bandes Studio Pro</span>
              </button>
            </div>

            <button
              onClick={resetEqualizer}
              className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition"
            >
              <RotateCcw className="w-3 h-3" />
              <span>0 dB</span>
            </button>
          </div>

          {/* Sliders Container: 3 Bands or 10 Bands */}
          {!is10BandMode ? (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-4">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2">
                <FluidEqSlider
                  label="BASSES"
                  frequency="60 - 250 Hz"
                  subLabel="Grave & Impact"
                  value={bass}
                  onChange={(val) => setEqualizerBand('bass', val)}
                  disabled={!isEnabled}
                  color="rose"
                  orientation="vertical"
                />

                <FluidEqSlider
                  label="MÉDIUMS"
                  frequency="1 000 Hz"
                  subLabel="Voix & Clarté"
                  value={mid}
                  onChange={(val) => setEqualizerBand('mid', val)}
                  disabled={!isEnabled}
                  color="purple"
                  orientation="vertical"
                />

                <FluidEqSlider
                  label="AIGUS"
                  frequency="6 - 16 kHz"
                  subLabel="Brillance & Ciels"
                  value={treble}
                  onChange={(val) => setEqualizerBand('treble', val)}
                  disabled={!isEnabled}
                  color="cyan"
                  orientation="vertical"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs pb-1">
                <span className="font-bold text-pink-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Console Studio 10 Bandes Précision
                </span>
                <span className="text-[10px] text-slate-400">Échelle -12 à +12 dB</span>
              </div>

              {/* 10 horizontal/vertical sliders */}
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-1">
                {FREQUENCIES_10_BAND.map((freq, idx) => {
                  const val = currentBands10[idx] || 0;
                  const label = freq >= 1000 ? `${freq / 1000}k` : `${freq}`;
                  return (
                    <div key={freq} className="flex flex-col items-center gap-1.5 p-2 rounded-xl bg-white/5 border border-white/5">
                      <span className="text-[10px] font-mono text-cyan-300 font-bold">{label}</span>
                      <input
                        type="range"
                        min="-12"
                        max="12"
                        step="1"
                        value={val}
                        disabled={!isEnabled}
                        onChange={(e) => setEqualizerBand10(idx, parseInt(e.target.value, 10))}
                        className="w-full accent-pink-500 cursor-pointer"
                      />
                      <span className={`text-[10px] font-mono ${val > 0 ? 'text-pink-400' : val < 0 ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {val > 0 ? `+${val}` : val}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Presets List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Profils Préréglés (Presets)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Profil actuel : <strong className="text-purple-600 dark:text-purple-400 capitalize">{preset}</strong>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {EQUALIZER_PRESETS.map((p) => {
                const isSelected = preset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setEqualizerPreset(p.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition group ${
                      isSelected
                        ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-600/30 font-bold'
                        : 'bg-white dark:bg-black/30 border-slate-200 dark:border-white/10 hover:border-purple-400 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg shrink-0 ${isSelected ? 'bg-white/20' : 'bg-slate-100 dark:bg-white/5'}`}>
                      {getPresetIcon(p.id)}
                    </div>
                    <div className="min-w-0 flex-1 truncate">
                      <div className="truncate">{p.name}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-purple-200' : 'text-slate-400'}`}>
                        B:{p.bass > 0 ? `+${p.bass}` : p.bass} M:{p.mid > 0 ? `+${p.mid}` : p.mid} A:{p.treble > 0 ? `+${p.treble}` : p.treble}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200/80 dark:border-white/10 bg-slate-50/50 dark:bg-black/30 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            Réglages sauvegardés automatiquement
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition"
          >
            Appliquer & Fermer
          </button>
        </div>
      </div>
    );

  if (isEmbedded) {
    return (
      <div className="w-full h-full overflow-y-auto p-3 sm:p-6 pb-28">
        {cardContent}
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      {cardContent}
    </div>
  );
};
