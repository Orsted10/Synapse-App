"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Hexagon } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";

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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="w-full max-w-[340px] bg-secondary rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-subtle flex flex-col"
          >
            {/* Banner */}
            <div className="h-[120px] bg-gradient-to-r from-accent to-purple-600 relative">
              {/* Optional: <img src="..." className="w-full h-full object-cover" /> */}
            </div>

            {/* Avatar & Badges */}
            <div className="px-4 relative flex justify-between items-start">
              {/* Avatar */}
              <div className="relative -mt-12">
                <div className="w-[92px] h-[92px] rounded-full bg-secondary p-1.5">
                  <div 
                    className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-inner relative overflow-hidden group cursor-pointer"
                    style={{ backgroundColor: user.roleColor || '#FF5252' }}
                    onClick={() => alert("Image upload coming in Phase 6!")}
                  >
                    {/* Fallback to initials if no image */}
                    {user.name?.charAt(0)}
                    
                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Edit2 size={16} className="text-white mb-1" />
                      <span className="text-[9px] uppercase tracking-wider font-bold">Upload</span>
                    </div>
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-4 border-secondary rounded-full" />
                </div>
              </div>

              {/* Badges Container */}
              <div className="bg-tertiary border border-subtle rounded-lg px-2 py-1 mt-3 flex items-center gap-1.5 shadow-sm">
                <Hexagon size={16} className="text-green-400 fill-green-400/20" />
                <Hexagon size={16} className="text-orange-400 fill-orange-400/20" />
                <Hexagon size={16} className="text-blue-400 fill-blue-400/20" />
              </div>
            </div>

            {/* User Info Block */}
            <div className="px-4 mt-2 mb-4">
              <div className="bg-tertiary rounded-xl p-3 border border-subtle shadow-sm mb-3">
                <h1 className="text-xl font-bold text-foreground leading-tight">{user.name}</h1>
                <div className="text-sm text-foreground font-medium flex items-center gap-2 mt-0.5">
                  <span>{user.username || user.name.toLowerCase().replace(/\s/g, '')}</span>
                  <span className="text-muted">•</span>
                  <span className="text-muted">He/Him</span>
                </div>
                
                <div className="h-[1px] bg-subtle my-3" />
                
                <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {user.subtext || "Fullstack Developer | 🚀 AI Enthusiast & Full-Stack Developer | 🏆 Hackathon Winner | 💡 Future Tech Entrepreneur"}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-2">Roles</h3>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {user.memberRoles && user.memberRoles.length > 0 ? (
                      user.memberRoles.map((role: any) => (
                        <div key={role.id} className="flex items-center gap-1.5 bg-secondary border border-subtle px-2 py-1 rounded-md text-xs font-medium text-foreground">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: role.color }} />
                          {role.name}
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center gap-1.5 bg-secondary border border-subtle px-2 py-1 rounded-md text-xs font-medium text-foreground">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: user.roleColor || '#9E9E9E' }} />
                        {user.roleGroup || "Member"}
                      </div>
                    )}
                    
                    {/* Add Role Button (UI Only for now in Profile) */}
                    <button className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary border border-subtle text-muted hover:text-foreground hover:bg-tertiary transition-colors" title="Add Role">
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
