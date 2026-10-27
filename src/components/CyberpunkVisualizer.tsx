import React, { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { Activity, BarChart2, Radio, Disc } from 'lucide-react';

interface CyberpunkVisualizerProps {
  height?: number;
  className?: string;
  showControls?: boolean;
}

type VisualizerMode = 'bars' | 'wave' | 'radial';

export const CyberpunkVisualizer: React.FC<CyberpunkVisualizerProps> = ({
  height = 140,
  className = '',
  showControls = true,
}) => {
  const { isPlaying, getFrequencyData, equalizer } = usePlayer();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [mode, setMode] = useState<VisualizerMode>('bars');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let dpr = window.devicePixelRatio || 1;

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      const w = rect.width;
      const h = rect.height;

      // Clear with dark subtle neon tint
      ctx.clearRect(0, 0, w, h);

      const freqData = getFrequencyData();
      const count = freqData.length || 32;

      if (mode === 'bars') {
        const barWidth = Math.max(3, (w / count) - 2.5);
        const maxBarH = h - 14;

        for (let i = 0; i < count; i++) {
          const val = isPlaying ? freqData[i] || 0 : 6;
          const normalized = val / 255;
          const barH = Math.max(4, normalized * maxBarH);
          const x = i * (barWidth + 2.5) + (w - count * (barWidth + 2.5)) / 2;
          const y = h - barH - 4;

          // Cyberpunk gradient: Cyan -> Magenta -> Yellow
          const grad = ctx.createLinearGradient(0, y + barH, 0, y);
          grad.addColorStop(0, '#00f0ff');
          grad.addColorStop(0.65, '#d946ef');
          grad.addColorStop(1, '#f43f5e');

          ctx.fillStyle = grad;
          ctx.shadowColor = i % 2 === 0 ? 'rgba(0, 240, 255, 0.6)' : 'rgba(217, 70, 239, 0.6)';
          ctx.shadowBlur = isPlaying ? 10 : 2;

          // Draw rounded pill bar
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barH, [3, 3, 0, 0]);
          ctx.fill();

          // Top highlight cap
          if (isPlaying && barH > 15) {
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, 2.5, [1, 1, 1, 1]);
            ctx.fill();
          }
        }
      } else if (mode === 'wave') {
        ctx.beginPath();
        ctx.moveTo(0, h / 2);

        for (let i = 0; i < count; i++) {
          const x = (i / (count - 1)) * w;
          const val = isPlaying ? (freqData[i] || 128) - 128 : 0;
          const amp = (val / 128) * (h * 0.42);
          const y = (h / 2) + amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 3;
        ctx.shadowColor = 'rgba(0, 240, 255, 0.8)';
        ctx.shadowBlur = 15;
        ctx.stroke();

        // Mirrored bottom glow wave
        ctx.beginPath();
        for (let i = 0; i < count; i++) {
          const x = (i / (count - 1)) * w;
          const val = isPlaying ? (freqData[i] || 128) - 128 : 0;
          const amp = -(val / 128) * (h * 0.28);
          const y = (h / 2) + amp;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.shadowColor = 'rgba(236, 72, 153, 0.8)';
        ctx.shadowBlur = 12;
        ctx.stroke();
      } else if (mode === 'radial') {
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(cx, cy) * 0.48;

        // Inner pulsing core
        let avg = 0;
        for (let i = 0; i < count; i++) avg += freqData[i] || 0;
        avg = avg / count;
        const pulse = isPlaying ? (avg / 255) * 12 : 0;

        ctx.beginPath();
        ctx.arc(cx, cy, radius + pulse, 0, Math.PI * 2);
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Radiating rays
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const val = isPlaying ? freqData[i] || 0 : 10;
          const rayLength = 6 + (val / 255) * (Math.min(cx, cy) * 0.42);

          const x1 = cx + Math.cos(angle) * (radius + pulse);
          const y1 = cy + Math.sin(angle) * (radius + pulse);
          const x2 = cx + Math.cos(angle) * (radius + pulse + rayLength);
          const y2 = cy + Math.sin(angle) * (radius + pulse + rayLength);

          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.strokeStyle = i % 2 === 0 ? '#ec4899' : '#00f0ff';
          ctx.lineWidth = 2;
          ctx.shadowColor = i % 2 === 0 ? '#ec4899' : '#00f0ff';
          ctx.shadowBlur = 8;
          ctx.stroke();
        }
      }

      ctx.restore();
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, getFrequencyData, mode, equalizer.bassBoost]);

  return (
    <div className={`relative flex flex-col rounded-2xl overflow-hidden bg-black/40 border border-cyan-500/20 backdrop-blur-md p-2.5 ${className}`}>
      {/* Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="w-full block"
      />

      {/* Cyberpunk HUD Mode Selector */}
      {showControls && (
        <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5 font-mono text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>SPECTRE NÉON HUD</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setMode('bars')}
              className={`p-1.5 rounded-lg transition ${
                mode === 'bars'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-xs shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Barres de fréquence"
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMode('wave')}
              className={`p-1.5 rounded-lg transition ${
                mode === 'wave'
                  ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-xs shadow-pink-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Onde oscillographique"
            >
              <Activity className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setMode('radial')}
              className={`p-1.5 rounded-lg transition ${
                mode === 'radial'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-xs shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title="Pulsation radiale"
            >
              <Disc className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
