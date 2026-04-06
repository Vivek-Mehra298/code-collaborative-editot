'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import AnimatedBackground from '@/components/AnimatedBackground';
import RoomCard from '@/components/RoomCard';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [joinId, setJoinId] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const fetchRooms = async () => {
        try {
          const res = await api.get('/rooms/recent');
          setRooms(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchRooms();
    }
  }, [user]);

  const handleCreateRoom = async () => {
    try {
      const roomId = nanoid(8);
      await api.post('/rooms', { roomId, language: 'javascript' });
      router.push(`/room/${roomId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    if (joinId.trim()) {
      router.push(`/room/${joinId.trim()}`);
    }
  };

  if (loading || !user) return <div className="min-h-screen bg-[var(--bg-dark)]" />;

  return (
    <main className="min-h-screen relative flex flex-col">
      <AnimatedBackground />
      <Navbar />
      
      <div className="max-w-6xl w-full mx-auto p-4 md:p-6 mt-6 md:mt-10">
        <motion.div 
          className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 md:mb-12 gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-space-grotesk font-bold text-white mb-2">Welcome, {user.name}</h1>
            <p className="text-gray-400 font-inter">Manage your collaborative sessions</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center glass-panel p-4 w-full lg:w-auto">
            <form onSubmit={handleJoinRoom} className="flex gap-2 w-full sm:w-auto">
              <input 
                type="text" 
                placeholder="Paste Room ID..." 
                className="bg-transparent border-b border-gray-600 px-2 py-1 text-white focus:outline-none focus:border-[var(--violet-accent)] font-jetbrains-mono text-sm w-full sm:w-48"
                value={joinId}
                onChange={(e) => setJoinId(e.target.value)}
              />
              <button className="text-sm px-4 py-2 border border-[var(--violet-accent)] text-[var(--violet-accent)] hover:bg-[var(--violet-accent)] hover:text-white rounded transition whitespace-nowrap">
                Join
              </button>
            </form>
            <div className="w-full h-px sm:w-px sm:h-8 bg-gray-700 my-2 sm:my-0 sm:mx-2 hidden sm:block" />
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateRoom}
              className="relative overflow-hidden group bg-[var(--cyan-accent)] text-black font-bold px-6 py-2 rounded w-full sm:w-auto flex justify-center mt-2 sm:mt-0"
            >
              <span className="relative z-10 whitespace-nowrap">New Room</span>
              <div className="absolute inset-0 h-full w-full bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded" />
            </motion.button>
          </div>
        </motion.div>

        <div>
          <h2 className="text-2xl font-space-grotesk text-white mb-6">Recent Rooms</h2>
          {rooms.length === 0 ? (
            <div className="text-center py-10 md:py-20 glass-panel">
              <p className="text-gray-500 font-jetbrains-mono">No recent rooms found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {rooms.map((room, i) => (
                <motion.div
                  key={room.roomId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <RoomCard room={room} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
