'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import type { RoomSummary } from '@/lib/types';

interface RoomCardProps {
  room: RoomSummary;
}

const getParticipantKey = (participant: RoomSummary['participants'][number]) =>
  participant._id || participant.id || participant.name.trim().toLowerCase();

export default function RoomCard({ room }: RoomCardProps) {
  const router = useRouter();
  const uniqueParticipantCount = new Set(room.participants.map(getParticipantKey)).size;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(room.roomId);
    // Could add a toast notification here
  };

  return (
    <motion.div 
      className="glass-panel p-6 cursor-pointer relative overflow-hidden group"
      whileHover={{ y: -5, boxShadow: '0 10px 30px -10px var(--cyan-accent)' }}
      onClick={() => router.push(`/room/${room.roomId}`)}
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[var(--cyan-accent)] to-[var(--violet-accent)]" />
      
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-space-grotesk text-white font-bold">{room.roomId}</h3>
        <button 
          onClick={handleCopy}
          className="text-xs text-[var(--cyan-accent)] border border-[var(--cyan-accent)] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[var(--cyan-accent)] hover:text-black"
        >
          Copy ID
        </button>
      </div>

      <div className="flex items-center gap-2 mb-2 text-sm text-gray-400 font-jetbrains-mono">
        <span className="w-2 h-2 rounded-full bg-[var(--cyan-accent)] animate-pulse" />
        {uniqueParticipantCount} Participant{uniqueParticipantCount !== 1 ? 's' : ''}
      </div>

      <div className="flex justify-between items-center text-sm">
        <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded font-jetbrains-mono">{room.language}</span>
        <span className="text-gray-500 font-inter">{new Date(room.lastActive).toLocaleDateString()}</span>
      </div>
    </motion.div>
  );
}
