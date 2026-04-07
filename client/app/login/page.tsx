'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import { motion } from 'framer-motion';
import { AxiosError } from 'axios';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      setError(
        err.response?.data?.message ||
          (err.request ? 'Cannot reach the server. Check the deployed API URL configuration.' : 'Login failed')
      );
    }
  };

  return (
    <main className="min-h-screen relative flex flex-col">
      <AnimatedBackground />
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center px-4">
        <motion.div 
          className="glass-panel p-10 max-w-md w-full"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-space-grotesk text-center text-white mb-2">Welcome Back</h2>
          <p className="text-center text-gray-400 mb-8 font-inter">Sign in to DevSync</p>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="relative">
              <input 
                type="email" 
                id="email"
                required
                className="peer w-full bg-transparent border-b border-gray-600 px-2 py-3 text-white focus:outline-none focus:border-[var(--cyan-accent)] focus:ring-0 placeholder-transparent"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email" className="absolute left-2 -top-3 text-sm text-[var(--cyan-accent)] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[var(--cyan-accent)] pointer-events-none">
                Email Address
              </label>
            </div>

            <div className="relative">
              <input 
                type="password" 
                id="password"
                required
                className="peer w-full bg-transparent border-b border-gray-600 px-2 py-3 text-white focus:outline-none focus:border-[var(--cyan-accent)] focus:ring-0 placeholder-transparent"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password" className="absolute left-2 -top-3 text-sm text-[var(--cyan-accent)] transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-3 peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[var(--cyan-accent)] pointer-events-none">
                Password
              </label>
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 px-4 py-3 bg-[var(--violet-accent)] text-white font-bold rounded shadow-lg hover:shadow-[0_0_15px_var(--violet-accent)] transition-all"
            >
              Log In
            </motion.button>
          </form>
        </motion.div>
      </div>
    </main>
  );
}
