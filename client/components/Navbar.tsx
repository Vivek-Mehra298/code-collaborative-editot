'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex justify-between items-center rounded-none border-t-0 border-x-0">
      <Link href="/">
        <motion.div 
          className="text-2xl font-bold tracking-tight text-gradient font-space-grotesk"
          whileHover={{ scale: 1.05 }}
        >
          Dev<span className="text-white">Sync</span>
        </motion.div>
      </Link>
      
      <div className="flex gap-4 items-center">
        {user ? (
          <>
            <Link href="/dashboard">
              <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Dashboard</span>
            </Link>
            <button 
              onClick={logout}
              className="text-sm px-4 py-2 border border-gray-600 rounded-md hover:bg-gray-800 transition"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link href="/login">
              <span className="text-gray-300 hover:text-white transition-colors cursor-pointer">Log In</span>
            </Link>
            <Link href="/register">
              <motion.button 
                whileHover={{ scale: 1.05, boxShadow: '0 0 15px var(--cyan-accent)' }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2 bg-[var(--cyan-accent)] text-black font-semibold rounded-md shadow-lg"
              >
                Sign Up
              </motion.button>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
