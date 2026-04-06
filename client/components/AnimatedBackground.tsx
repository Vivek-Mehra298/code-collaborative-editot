'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedBackground() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[var(--bg-dark)] pointer-events-none">
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
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 1 + 'px',
            height: Math.random() * 4 + 1 + 'px',
            background: i % 2 === 0 ? 'var(--cyan-accent)' : 'var(--violet-accent)',
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1,
          }}
          animate={{
            y: ['0vh', '-100vh'],
            x: [0, Math.sin(Math.random() * 2) * 50],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
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
