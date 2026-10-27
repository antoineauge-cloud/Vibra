import React, { useEffect, useRef, useState, memo } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Activity, Radio, Sparkles, Sliders, Disc, BarChart2, Waves } from 'lucide-react';

interface CyberWaveformVisualizerProps {
  className?: string;
  themeColor?: 'cyan' | 'magenta' | 'amber';
  height?: number;
  showTelemetry?: boolean;
}

export type WaveformMode = 'oscilloscope' | 'dual-wave' | 'spectrum-bars' | 'circular-radar';

export const CyberWaveformVisualizer: React.FC<CyberWaveformVisualizerProps> = memo(({
  className = '',
  themeColor = 'cyan',
  height = 140,
  showTelemetry = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isPlaying, getWaveformData, getFrequencyData, currentTrack } = usePlayer();
  const [visualMode, setVisualMode] = useState<WaveformMode>('oscilloscope');
  const [peakLevel, setPeakLevel] = useState<number>(0);

  // Color profiles matching the ATH HUD
  const colorMap = {
    cyan: {
      primary: '#00f0ff',
      secondary: '#ff007f',
      glow: 'rgba(0, 240, 255, 0.85)',
      gradientTop: 'rgba(0, 240, 255, 0.35)',
      gradientBottom: 'rgba(0, 240, 255, 0.0)',
      border: 'border-cyan-500/30',
      text: 'text-cyan-400',
    },
    magenta: {
      primary: '#ff007f',
      secondary: '#00f0ff',
      glow: 'rgba(255, 0, 127, 0.85)',
      gradientTop: 'rgba(255, 0, 127, 0.35)',
      gradientBottom: 'rgba(255, 0, 127, 0.0)',
      border: 'border-pink-500/30',
      text: 'text-pink-400',
    },
    amber: {
      primary: '#f59e0b',
      secondary: '#00f0ff',
      glow: 'rgba(245, 158, 11, 0.85)',
      gradientTop: 'rgba(245, 158, 11, 0.35)',
      gradientBottom: 'rgba(245, 158, 11, 0.0)',
      border: 'border-amber-500/30',
      text: 'text-amber-400',
    },
  }[themeColor];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas, { passive: true });

    let lastPeakTime = 0;

    const render = (now: number) => {
      animId = requestAnimationFrame(render);

      const width = canvas.width / dpr;
      const h = canvas.height / dpr;

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, h);

      // Web Audio API Data Acquisition
      const waveData = getWaveformData();
      const freqData = getFrequencyData();

      // Calculate peak amplitude for telemetry
      if (now - lastPeakTime > 150) {
        lastPeakTime = now;
        let maxVal = 0;
        for (let i = 0; i < waveData.length; i++) {
          const diff = Math.abs(waveData[i] - 128);
          if (diff > maxVal) maxVal = diff;
        }
        setPeakLevel(Math.min(100, Math.round((maxVal / 128) * 100)));
      }

      // Draw subtle tactical oscilloscope grid background
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.lineWidth = 1;

      // Horizontal zero & dB grid lines
      const midY = h / 2;
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.stroke();

      ctx.setLineDash([4, 6]);
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
      ctx.beginPath();
      ctx.moveTo(0, midY - h * 0.3);
      ctx.lineTo(width, midY - h * 0.3);
      ctx.moveTo(0, midY + h * 0.3);
      ctx.lineTo(width, midY + h * 0.3);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertical sample slices
      const vGridStep = width / 8;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = vGridStep; x < width; x += vGridStep) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      if (visualMode === 'oscilloscope' || visualMode === 'dual-wave') {
        // 1. Draw Lower Mirrored Fill Gradient
        const fillGrad = ctx.createLinearGradient(0, midY - 40, 0, h);
        fillGrad.addColorStop(0, colorMap.gradientTop);
        fillGrad.addColorStop(1, colorMap.gradientBottom);

        ctx.beginPath();
        ctx.moveTo(0, midY);
        const sliceWidth = width / (waveData.length - 1);
        for (let i = 0; i < waveData.length; i++) {
          const v = waveData[i] / 128.0;
          const y = (v * h) / 2;
          ctx.lineTo(i * sliceWidth, y);
        }
        ctx.lineTo(width, midY);
        ctx.closePath();
        ctx.fillStyle = fillGrad;
        ctx.fill();

        // 2. Secondary Chromatic Aberration Shadow Wave (Dual Wave Mode)
        if (visualMode === 'dual-wave') {
          ctx.strokeStyle = colorMap.secondary;
          ctx.lineWidth = 1.8;
          ctx.shadowBlur = 6;
          ctx.shadowColor = colorMap.secondary;
          ctx.beginPath();
          for (let i = 0; i < waveData.length; i++) {
            const v = waveData[i] / 128.0;
            const y = (v * h) / 2 + Math.sin(i * 0.2 + now / 200) * 3;
            if (i === 0) ctx.moveTo(i * sliceWidth, y);
            else ctx.lineTo(i * sliceWidth, y);
          }
          ctx.stroke();
        }

        // 3. Primary Glowing Cyber Waveform Line
        ctx.shadowBlur = isPlaying ? 12 : 4;
        ctx.shadowColor = colorMap.glow;
        ctx.strokeStyle = colorMap.primary;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        ctx.beginPath();
        for (let i = 0; i < waveData.length; i++) {
          const v = waveData[i] / 128.0;
          const y = (v * h) / 2;
          if (i === 0) ctx.moveTo(i * sliceWidth, y);
          else ctx.lineTo(i * sliceWidth, y);
        }
        ctx.stroke();

        // Draw active tracking cursor dots on wave peaks
        if (isPlaying) {
          const peakIdx = Math.floor((waveData.length * 0.45));
          const peakY = (waveData[peakIdx] / 128.0) * (h / 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#ffffff';
          ctx.beginPath();
          ctx.arc(peakIdx * sliceWidth, peakY, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (visualMode === 'spectrum-bars') {
        // 3. Cyber Spectral Frequency Bars
        const barCount = Math.min(64, freqData.length);
        const barWidth = (width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const percent = freqData[i] / 255;
          const barHeight = Math.max(3, percent * (h - 16));
          const x = i * (barWidth + 2);
          const y = h - barHeight;

          const barGrad = ctx.createLinearGradient(0, y, 0, h);
          barGrad.addColorStop(0, colorMap.primary);
          barGrad.addColorStop(0.7, colorMap.secondary);
          barGrad.addColorStop(1, 'rgba(0, 0, 0, 0.4)');

          ctx.fillStyle = barGrad;
          ctx.shadowBlur = percent > 0.6 ? 8 : 0;
          ctx.shadowColor = colorMap.primary;
          ctx.fillRect(x, y, barWidth, barHeight);

          // Top Neon Cap
          if (percent > 0.4) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, y - 2, barWidth, 2);
          }
        }
      } else if (visualMode === 'circular-radar') {
        // 4. Circular Audio Radar / Sonar Wave
        const centerX = width / 2;
        const centerY = h / 2;
        const baseRadius = Math.min(centerX, centerY) * 0.48;
        const points = Math.min(64, freqData.length);
        const angleStep = (Math.PI * 2) / points;

        // Inner glowing core
        const coreGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, baseRadius);
        coreGrad.addColorStop(0, colorMap.gradientTop);
        coreGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, baseRadius * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Audio reactive circular perimeter
        ctx.beginPath();
        ctx.strokeStyle = colorMap.primary;
        ctx.lineWidth = 2.2;
        ctx.shadowBlur = isPlaying ? 14 : 3;
        ctx.shadowColor = colorMap.glow;

        for (let i = 0; i <= points; i++) {
          const idx = i % points;
          const amp = (freqData[idx] / 255) * (baseRadius * 0.65);
          const r = baseRadius + (isPlaying ? amp : Math.sin(i * 0.5 + now / 300) * 2);
          const angle = i * angleStep;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();

        // Rotating radar sweep line
        const sweepAngle = (now / 1200) % (Math.PI * 2);
        ctx.beginPath();
        ctx.strokeStyle = colorMap.secondary;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 8;
        ctx.shadowColor = colorMap.secondary;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(sweepAngle) * (baseRadius * 1.5),
          centerY + Math.sin(sweepAngle) * (baseRadius * 1.5)
        );
        ctx.stroke();
      }

      ctx.restore();
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isPlaying, getWaveformData, getFrequencyData, visualMode, colorMap]);

  return (
    <div className={`relative flex flex-col rounded-2xl bg-black/70 border ${colorMap.border} backdrop-blur-xl overflow-hidden shadow-2xl ${className}`}>
      {/* Top Waveform Header & Controls */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-white/10 bg-black/40 text-[10px] font-mono">
        <div className="flex items-center gap-2">
          <Activity className={`w-3.5 h-3.5 ${colorMap.text} ${isPlaying ? 'animate-pulse' : ''}`} />
          <span className={`font-bold tracking-wider ${colorMap.text}`}>
            Visualiseur Audio Haute Résolution
          </span>
          <span className="text-white/30 hidden sm:inline">|</span>
          <span className="text-white/60 hidden sm:inline">
            {isPlaying ? 'DSP 48kHz • 32-bit Float' : 'Prêt pour lecture'}
          </span>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/10">
          <button
            onClick={() => setVisualMode('oscilloscope')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
              visualMode === 'oscilloscope' ? 'bg-cyan-500 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Onde
          </button>
          <button
            onClick={() => setVisualMode('dual-wave')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
              visualMode === 'dual-wave' ? 'bg-pink-500 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Harmoniques
          </button>
          <button
            onClick={() => setVisualMode('spectrum-bars')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
              visualMode === 'spectrum-bars' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Spectre
          </button>
          <button
            onClick={() => setVisualMode('circular-radar')}
            className={`px-2 py-0.5 rounded text-[9px] font-bold transition cursor-pointer ${
              visualMode === 'circular-radar' ? 'bg-teal-400 text-slate-950 shadow-xs' : 'text-slate-300 hover:text-white'
            }`}
          >
            Radar
          </button>
        </div>
      </div>

      {/* Main Canvas Waveform View */}
      <div className="relative w-full overflow-hidden" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
        />

        {/* Clean audio level markers */}
        <div className="absolute top-2 left-3 text-[9px] font-mono text-cyan-400/70 pointer-events-none">
          +6 dB
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 left-3 text-[9px] font-mono text-cyan-400/50 pointer-events-none">
          0 dB
        </div>
        <div className="absolute bottom-2 left-3 text-[9px] font-mono text-cyan-400/70 pointer-events-none">
          -12 dB
        </div>

        {/* Dynamic Peak Meter */}
        <div className="absolute top-2 right-3 flex items-center gap-1.5 text-[9px] font-mono bg-black/60 px-2 py-0.5 rounded border border-white/10 text-slate-300 pointer-events-none">
          <span className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
          <span>Crête : {isPlaying ? `${peakLevel}%` : '0%'}</span>
        </div>
      </div>

      {/* Bottom Info Bar */}
      {showTelemetry && (
        <div className="flex items-center justify-between px-3.5 py-1.5 border-t border-white/5 bg-black/50 text-[10px] font-mono text-slate-400">
          <div className="flex items-center gap-3">
            <span>Titre : <strong className="text-white font-sans">{currentTrack?.title.slice(0, 26) || 'Aucun signal'}</strong></span>
            <span className="hidden sm:inline">Source : <strong className="text-cyan-400 uppercase">{currentTrack?.source || 'Direct'}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-medium">Flux Web Audio Actif</span>
          </div>
        </div>
      )}
    </div>
  );
});

CyberWaveformVisualizer.displayName = 'CyberWaveformVisualizer';
