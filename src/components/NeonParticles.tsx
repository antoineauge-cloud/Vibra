import React, { useEffect, useRef, memo } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  alpha: number;
  pulseSpeed: number;
  pulsePhase: number;
}

const PARTICLE_COLORS = [
  { color: '#00f0ff', glow: 'rgba(0, 240, 255, 0.8)' }, // Neon Cyan
  { color: '#ff007f', glow: 'rgba(255, 0, 127, 0.8)' }, // Neon Magenta / Pink
  { color: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)' }, // Electric Violet
  { color: '#00ffa3', glow: 'rgba(0, 255, 163, 0.8)' }, // Neon Mint
  { color: '#ffbe0b', glow: 'rgba(255, 190, 11, 0.8)' }, // Cyber Amber
];

export const NeonParticles: React.FC = memo(() => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    // Generate responsive floating neon particles
    const particleCount = Math.min(48, Math.floor((width * height) / 28000));
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const palette = PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)];
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -0.2 - Math.random() * 0.3, // Slowly floats upwards
        radius: 1.2 + Math.random() * 2.2,
        color: palette.color,
        glowColor: palette.glow,
        alpha: 0.25 + Math.random() * 0.65,
        pulseSpeed: 0.02 + Math.random() * 0.03,
        pulsePhase: Math.random() * Math.PI * 2,
      });
    }

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min(2.0, (time - lastTime) / 16.666);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      // Draw each floating particle with glowing radial gradient
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.pulsePhase += p.pulseSpeed * dt;

        // Wrap boundaries smoothly
        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        const dynamicAlpha = Math.max(0.1, p.alpha * (0.7 + 0.3 * Math.sin(p.pulsePhase)));
        const dynamicRadius = p.radius * (0.85 + 0.25 * Math.sin(p.pulsePhase));

        // Outer glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicRadius * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = p.glowColor.replace('0.8)', `${dynamicAlpha * 0.25})`);
        ctx.fill();

        // Inner glowing core
        ctx.beginPath();
        ctx.arc(p.x, p.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = dynamicAlpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // Draw subtle connecting cyber constellation laser links when particles are near
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 95) {
            const lineAlpha = (1 - dist / 95) * 0.18;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 240, 255, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none z-0 w-full h-full opacity-70 dark:opacity-90"
    />
  );
});

NeonParticles.displayName = 'NeonParticles';
