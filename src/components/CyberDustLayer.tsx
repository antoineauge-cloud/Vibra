import React, { useEffect, useRef, memo } from 'react';
import { usePlayer } from '../context/PlayerContext';

interface CyberDustMote {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  colorType: 'cyan' | 'magenta' | 'amber' | 'white';
  pulseSpeed: number;
  pulsePhase: number;
  oscillationSpeed: number;
  oscillationAmp: number;
  flickerCountdown: number;
}

interface CyberDustLayerProps {
  className?: string;
  densityMultiplier?: number;
  colorScheme?: 'cyan' | 'magenta' | 'amber' | 'mixed';
}

export const CyberDustLayer: React.FC<CyberDustLayerProps> = memo(({
  className = '',
  densityMultiplier = 1.0,
  colorScheme = 'mixed',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { isPlaying } = usePlayer();
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Gentle parallax target (-1 to +1 range)
      mouseRef.current.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Target particle count: 60-90 particles for a subtle holographic dust field
    const baseCount = Math.floor((width * height) / 22000);
    const count = Math.max(35, Math.min(100, Math.floor(baseCount * densityMultiplier)));
    const particles: CyberDustMote[] = [];

    const colorPalette = {
      cyan: 'rgba(0, 240, 255,',
      magenta: 'rgba(255, 0, 127,',
      amber: 'rgba(245, 158, 11,',
      white: 'rgba(210, 240, 255,',
    };

    for (let i = 0; i < count; i++) {
      let chosenColor: 'cyan' | 'magenta' | 'amber' | 'white' = 'cyan';
      if (colorScheme === 'mixed') {
        const rand = Math.random();
        if (rand < 0.5) chosenColor = 'cyan';
        else if (rand < 0.75) chosenColor = 'magenta';
        else if (rand < 0.9) chosenColor = 'amber';
        else chosenColor = 'white';
      } else {
        chosenColor = colorScheme;
      }

      const baseAlpha = 0.08 + Math.random() * 0.22; // Low opacity for subtle ATH immersion

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.12 - Math.random() * 0.28, // Slowly drift upward like dust in projector beams
        radius: 0.65 + Math.random() * 1.35, // Ultra-fine dust particles (sub-2px)
        baseAlpha,
        alpha: baseAlpha,
        colorType: chosenColor,
        pulseSpeed: 0.015 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
        oscillationSpeed: 0.008 + Math.random() * 0.015,
        oscillationAmp: 0.3 + Math.random() * 0.7,
        flickerCountdown: Math.floor(Math.random() * 300),
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const delta = Math.min(2.0, (time - lastTime) / 16.666);
      lastTime = time;

      // Smooth mouse parallax drift
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      ctx.clearRect(0, 0, width, height);

      const playingBoost = isPlaying ? 1.25 : 1.0;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Motion physics with sinusoidal atmospheric sway
        p.pulsePhase += p.pulseSpeed * delta * playingBoost;
        const sway = Math.sin(p.pulsePhase * p.oscillationSpeed * 10) * p.oscillationAmp;

        p.x += (p.vx + sway * 0.12 + mouseRef.current.x * 0.15) * delta;
        p.y += (p.vy + mouseRef.current.y * 0.15) * delta * (isPlaying ? 1.2 : 1.0);

        // Particle pulse oscillation
        const pulse = 0.7 + 0.3 * Math.sin(p.pulsePhase);
        p.alpha = p.baseAlpha * pulse * (isPlaying ? 1.2 : 1.0);

        // Random optical micro-flicker
        p.flickerCountdown--;
        if (p.flickerCountdown <= 0) {
          if (Math.random() < 0.4) {
            p.alpha *= 1.8; // Brief flash/spark
          } else {
            p.alpha *= 0.3; // Brief dim
          }
          p.flickerCountdown = 120 + Math.floor(Math.random() * 360);
        }

        // Screen wrap-around
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.y > height + 10) p.y = -10;

        // Render dust mote
        const prefix = colorPalette[p.colorType];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        // Soft glow for larger particles
        if (p.radius > 1.2) {
          ctx.shadowBlur = 4;
          ctx.shadowColor = `${prefix} ${Math.min(0.6, p.alpha * 1.5)})`;
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.fillStyle = `${prefix} ${Math.min(0.7, p.alpha)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isPlaying, densityMultiplier, colorScheme]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={`fixed inset-0 pointer-events-none z-10 select-none overflow-hidden ${className}`}
      style={{
        mixBlendMode: 'screen',
      }}
    />
  );
});

CyberDustLayer.displayName = 'CyberDustLayer';
