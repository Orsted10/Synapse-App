import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Headphones, Video, MonitorUp, PhoneOff, Settings } from 'lucide-react';
import { useUserStore } from '@/store/userStore';

interface VoiceChannelProps {
  channelName: string;
}

export function VoiceChannel({ channelName }: VoiceChannelProps) {
  const { user, profile } = useUserStore();
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  // Mock participants
  const participants = isJoined 
    ? [
        { id: user?.id, name: profile?.username || 'You', isSpeaking: !isMuted, avatar: profile?.username?.charAt(0) || 'Y' },
        { id: '2', name: 'Alice', isSpeaking: true, avatar: 'A' },
        { id: '3', name: 'Bob', isSpeaking: false, avatar: 'B' },
        { id: '4', name: 'Charlie', isSpeaking: false, avatar: 'C' },
      ]
    : [
        { id: '2', name: 'Alice', isSpeaking: true, avatar: 'A' },
        { id: '3', name: 'Bob', isSpeaking: false, avatar: 'B' },
      ];

  if (!isJoined) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30 h-full relative overflow-hidden">
        <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-[0.03] pointer-events-none" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-tertiary/50 backdrop-blur-xl p-10 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center max-w-lg w-full relative z-10"
        >
          <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center mb-6 text-accent">
            <Mic size={32} />
          </div>
          <h2 className="text-3xl font-bold mb-2 text-foreground"># {channelName}</h2>
          <p className="text-muted text-center mb-8">
            {participants.length} people are chatting right now. Jump in!
          </p>
          <button 
            onClick={() => setIsJoined(true)}
            className="w-full bg-accent text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-accent-hover transition-all shadow-[0_0_40px_rgba(var(--accent),0.3)] hover:shadow-[0_0_60px_rgba(var(--accent),0.5)] active:scale-95"
          >
            Join Voice Channel
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#0f1115] relative overflow-hidden h-full">
      <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-[0.02] pointer-events-none" />
      
      {/* Top Bar */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-white/5 z-10">
        <h2 className="font-bold text-lg"># {channelName}</h2>
        <div className="flex items-center gap-4 text-muted text-sm font-medium">
          <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> Voice Connected</span>
          <span>{participants.length} / 99</span>
        </div>
      </div>

      {/* Grid Area */}
      <div className="flex-1 p-6 overflow-y-auto custom-scrollbar flex items-center justify-center z-10">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl auto-rows-[250px]">
          <AnimatePresence>
            {participants.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                className={`relative rounded-2xl overflow-hidden bg-secondary border-2 transition-colors ${
                  p.isSpeaking ? 'border-green-500 shadow-[0_0_30px_rgba(34,197,94,0.2)]' : 'border-white/5'
                }`}
              >
                {/* Fallback Avatar inside Voice Box */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-tertiary to-background">
                  <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-white transition-all duration-300 ${p.isSpeaking ? 'scale-110 shadow-[0_0_40px_rgba(34,197,94,0.4)]' : ''}`} style={{ backgroundColor: `hsl(${i * 60}, 60%, 50%)` }}>
                    {p.avatar}
                  </div>
                </div>

                {/* Name Tag */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-2 rounded-lg border border-white/10">
                  <span className="font-semibold text-sm">{p.name}</span>
                  {!p.isSpeaking && p.id !== user?.id && <MicOff size={14} className="text-red-400" />}
                  {p.id === user?.id && isMuted && <MicOff size={14} className="text-red-400" />}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="h-24 bg-secondary/50 border-t border-white/5 backdrop-blur-xl flex items-center justify-center gap-4 z-10">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button 
          onClick={() => setIsDeafened(!isDeafened)}
          className={`p-4 rounded-full transition-all ${isDeafened ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-white/10 text-white hover:bg-white/20'}`}
        >
          <Headphones size={24} />
        </button>
        <button className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
          <Video size={24} />
        </button>
        <button className="p-4 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
          <MonitorUp size={24} />
        </button>
        <div className="w-px h-8 bg-white/10 mx-2" />
        <button 
          onClick={() => setIsJoined(false)}
          className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)]"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
}
