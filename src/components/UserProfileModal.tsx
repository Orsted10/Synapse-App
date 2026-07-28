"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Edit2, Hexagon, Circle } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any; // Using any for the mock up
}

export function UserProfileModal({ isOpen, onClose, user }: UserProfileModalProps) {
  if (!user) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="w-full max-w-[340px] bg-secondary/80 backdrop-blur-3xl rounded-[24px] shadow-premium overflow-hidden relative z-10 border border-white/10 flex flex-col"
          >
            {/* Banner */}
            <div className="h-[120px] bg-gradient-to-tr from-accent to-purple-600 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay opacity-30"></div>
            </div>

            {/* Avatar & Badges */}
            <div className="px-5 relative flex justify-between items-start">
              {/* Avatar */}
              <div className="relative -mt-12">
                <div className="w-[100px] h-[100px] rounded-full bg-secondary/80 p-1.5 backdrop-blur-xl">
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-4xl shadow-inner relative overflow-hidden group cursor-pointer"
                    style={{ backgroundColor: user.roleColor || '#FF5252' }}
                    onClick={() => alert("Image upload coming in Phase 6!")}
                  >
                    {/* Fallback to initials if no image */}
                    {user.name?.charAt(0) || user.username?.charAt(0)}
                    
                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 size={18} className="text-white mb-1" />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Upload</span>
                    </div>
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-[4px] border-secondary/90 rounded-full shadow-sm" />
                </div>
              </div>

              {/* Badges Container */}
              <div className="bg-black/20 border border-white/5 rounded-xl px-2 py-1.5 mt-3 flex items-center gap-1.5 shadow-inner">
                <Hexagon size={16} className="text-green-400 fill-green-400/20" />
                <Hexagon size={16} className="text-orange-400 fill-orange-400/20" />
                <Hexagon size={16} className="text-blue-400 fill-blue-400/20" />
              </div>
            </div>

            {/* User Info Block */}
            <div className="px-5 mt-3 mb-5">
              <div className="bg-black/20 rounded-2xl p-4 border border-white/5 shadow-inner mb-4">
                <h1 className="text-xl font-bold text-foreground leading-tight">{user.name || user.username}</h1>
                <div className="text-sm font-medium flex items-center gap-2 mt-0.5">
                  <span className="text-foreground">{user.username || user.name.toLowerCase().replace(/\s/g, '')}</span>
                  <span className="text-muted">•</span>
                  <span className="text-muted">He/Him</span>
                </div>
                
                <div className="h-[1px] bg-white/5 my-3" />

                {/* Custom Status Component */}
                <div className="flex items-center gap-2 mb-3 bg-white/5 px-3 py-2 rounded-xl border border-white/5">
                  <span className="text-lg leading-none">💭</span>
                  <span className="text-sm font-medium text-foreground">Building the future of communication.</span>
                </div>
                
                <div className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap font-medium">
                  {user.subtext || "🚀 AI Enthusiast & Full-Stack Developer | 🏆 Hackathon Winner | 💡 Future Tech Entrepreneur"}
                </div>
                
                <div className="mt-5">
                  <h3 className="text-[10px] font-bold text-muted uppercase tracking-wider mb-2.5">Roles</h3>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {user.memberRoles && user.memberRoles.length > 0 ? (
                      user.memberRoles.map((role: any) => (
                        <div key={role.id} className="flex items-center gap-1.5 bg-black/30 border border-white/5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-foreground/90">
                          <Circle size={10} fill={role.color} stroke="none" />
                          {role.name}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-1.5 bg-black/30 border border-white/5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-foreground/90">
                        <Circle size={10} fill={user.roleColor || '#9E9E9E'} stroke="none" />
                        {user.roleGroup || "Member"}
                      </div>
                    )}
                    
                    {/* Add Role Button */}
                    <button className="flex items-center justify-center w-7 h-7 rounded-full bg-white/5 border border-white/10 text-muted hover:text-foreground hover:bg-white/10 transition-colors" title="Add Role">
                      <span className="text-lg leading-none mb-0.5">+</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
