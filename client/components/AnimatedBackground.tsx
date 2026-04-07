'use client';

import { motion } from 'framer-motion';

interface Particle {
  id: number;
  size: string;
  background: string;
  left: string;
  top: string;
  opacity: number;
  xOffset: number;
  duration: number;
}

const particles: Particle[] = Array.from({ length: 20 }, (_, id) => ({
  id,
  size: `${(id % 4) + 1}px`,
  background: id % 2 === 0 ? 'var(--cyan-accent)' : 'var(--violet-accent)',
  left: `${(id * 17) % 100}%`,
  top: `${(id * 29) % 100}%`,
  opacity: 0.15 + (id % 5) * 0.08,
  xOffset: ((id % 6) - 3) * 14,
  duration: 10 + (id % 7) * 2,
}));

export default function AnimatedBackground() {

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-(--bg-dark) pointer-events-none">
      {/* Animated Grid Floor */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[50vh] opacity-20"
        style={{
          background: 'linear-gradient(transparent 95%, rgba(0, 212, 255, 0.4) 100%), linear-gradient(90deg, transparent 95%, rgba(0, 212, 255, 0.4) 100%)',
          backgroundSize: '40px 40px',
          transform: 'perspective(500px) rotateX(60deg) translateY(100px) scale(3)',
          animation: 'gridMove 10s linear infinite',
        }}
      />
      
      {/* Floating Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            background: particle.background,
            left: particle.left,
            top: particle.top,
            opacity: particle.opacity,
          }}
          animate={{
            y: ['0vh', '-100vh'],
            x: [0, particle.xOffset],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gridMove {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
      `}} />
    </div>
  );
}
