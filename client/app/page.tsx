'use client';

import AnimatedBackground from '@/components/AnimatedBackground';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { SiJavascript, SiTypescript, SiPython, SiCplusplus, SiGo, SiRust, SiPhp } from 'react-icons/si';
import { FaJava } from 'react-icons/fa';

const languages = [
  { icon: SiJavascript, name: 'JavaScript', color: '#f7df1e' },
  { icon: SiTypescript, name: 'TypeScript', color: '#3178c6' },
  { icon: SiPython, name: 'Python', color: '#3776ab' },
  { icon: FaJava, name: 'Java', color: '#007396' },
  { icon: SiCplusplus, name: 'C++', color: '#00599c' },
  { icon: SiGo, name: 'Go', color: '#00add8' },
  { icon: SiRust, name: 'Rust', color: '#000000', invert: true },
  { icon: SiPhp, name: 'PHP', color: '#777bb4' },
];

export default function Home() {
  const title = "Code Together. Ship Faster.";

  return (
    <main className="min-h-screen relative flex flex-col">
      <AnimatedBackground />
      <Navbar />
      
      <div className="flex-1 flex flex-col items-center justify-center px-4 text-center pb-20">
        
        {/* Animated Typewriter Hero Heading */}
        <motion.h1 
          className="text-5xl md:text-7xl font-bold font-space-grotesk mb-6 text-white"
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.05 } },
            hidden: {},
          }}
        >
          {title.split("").map((char, index) => (
            <motion.span
              key={index}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className={char === '.' ? "text-[var(--cyan-accent)]" : ""}
            >
              {char}
            </motion.span>
          ))}
          {/* Blinking Cursor */}
          <motion.span
            animate={{ opacity: [0, 1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="text-[var(--cyan-accent)] font-jetbrains-mono ml-2 font-normal"
          >
            |
          </motion.span>
        </motion.h1>

        <motion.p 
          className="text-xl md:text-2xl text-gray-400 mb-10 max-w-2xl font-inter"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          A futuristic, real-time collaborative code editor built for speed and seamless pair programming.
        </motion.p>

        <motion.div 
          className="flex gap-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2 }}
        >
          <Link href="/dashboard">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--cyan-accent)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-[var(--cyan-accent)] text-black font-bold text-lg rounded-md"
            >
              Get Started
            </motion.button>
          </Link>
          <Link href="/login">
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: '0 0 20px var(--violet-accent)' }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-transparent border-2 border-[var(--violet-accent)] text-white font-bold text-lg rounded-md"
            >
              Join Room
            </motion.button>
          </Link>
        </motion.div>

        {/* Features 3D Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24 max-w-5xl w-full">
          {[
            { title: "Real-Time Sync", desc: "Collaborate with peers seamlessly with sub-millisecond operational transformation." },
            { title: "Multi-Language Support", desc: "Write in JavaScript, Python, C++, Go, Rust, and more with exact syntax highlighting." },
            { title: "Instant Room Sharing", desc: "Generate a link, share it, and start coding together instantly without heavy setups." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              className="glass-panel p-8 flex flex-col items-start text-left"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 + (i * 0.2) }}
              whileHover={{ scale: 1.05, rotateY: 5, rotateX: -5 }} // Basic 3D Tilt illusion
              style={{ transformPerspective: 1000 }}
            >
              <h3 className="text-2xl font-space-grotesk text-white font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 font-inter">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Languages Grid */}
        <div className="mt-24 w-full max-w-4xl">
          <h2 className="text-3xl font-space-grotesk text-center text-white mb-8">Supported Languages</h2>
          <div className="flex flex-wrap justify-center gap-8">
            {languages.map((lang, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2 + (i * 0.1) }}
                whileHover={{ scale: 1.2 }}
              >
                <lang.icon size={48} color={lang.invert ? "#ffffff" : lang.color} />
                <span className="text-gray-400 text-sm font-jetbrains-mono">{lang.name}</span>
              </motion.div>
            ))}
          </div>
        </div>

      </div>

      <footer className="py-6 border-t border-gray-800 text-center glass-panel rounded-none">
        <p className="text-gray-500 font-jetbrains-mono text-sm">
          Built with Next.js & Socket.io
        </p>
      </footer>
    </main>
  );
}
