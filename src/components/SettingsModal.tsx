"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Shield, Bell, Image as ImageIcon, Edit2, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { ThemeSwitcher } from "./ThemeSwitcher";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { user, profile, initializeAuth } = useUserStore();
  const [activeTab, setActiveTab] = useState("profile");
  
  const [username, setUsername] = useState(profile?.username || "");
  const [isLoading, setIsLoading] = useState(false);
  
  // Audio state
  const [uiSoundsEnabled, setUiSoundsEnabled] = useState(true);
  const [msgChimeEnabled, setMsgChimeEnabled] = useState(true);

  const playBlip = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA=='); // tiny pop mock
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  const playChime = () => {
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRjIAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAAABmYWN0BAAAAAAAAABkYXRhAAAAAA==');
      audio.volume = 0.5;
      audio.play().catch(() => {});
    } catch (e) {}
  };

  // Sync state when opened
  React.useEffect(() => {
    if (isOpen && profile) {
      setUsername(profile.username);
    }
  }, [isOpen, profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('users')
        .update({ username })
        .eq('id', user.id);

      if (error) throw error;

      await initializeAuth(); // Refresh the store
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      toast.error("Error updating profile: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-8">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="glass-panel-heavy w-full h-full sm:w-[1000px] sm:h-[80vh] sm:rounded-[32px] overflow-hidden relative z-10 flex"
          >
            {/* Sidebar */}
            <div className="w-[240px] bg-tertiary/50 border-r border-subtle p-4 flex flex-col gap-1 shrink-0">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-3 mt-2">User Settings</h3>
              
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[15px] transition-colors ${activeTab === 'profile' ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'}`}
              >
                <User size={18} /> My Profile
              </button>
              
              <button 
                onClick={() => setActiveTab("themes")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[15px] transition-colors ${activeTab === 'themes' ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'}`}
              >
                <Palette size={18} /> Appearance & Themes
              </button>
              
              <button 
                onClick={() => setActiveTab("privacy")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[15px] transition-colors ${activeTab === 'privacy' ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'}`}
              >
                <Shield size={18} /> Privacy & Safety
              </button>

              <button 
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[15px] transition-colors ${activeTab === 'notifications' ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'}`}
              >
                <Bell size={18} /> Notifications
              </button>

              <div className="h-[1px] bg-subtle my-4 mx-3" />
              
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[15px] text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Log Out
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-10 pb-48 overflow-y-auto custom-scrollbar relative bg-background/50">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-9 h-9 rounded-full border border-subtle flex items-center justify-center text-muted hover:text-foreground hover:bg-tertiary transition-colors"
              >
                <X size={18} />
              </button>

              {activeTab === "profile" && (
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold text-foreground mb-6">My Profile</h2>
                  
                  {/* Premium Profile Card */}
                  <div className="bg-secondary rounded-2xl overflow-hidden border border-subtle mb-8 shadow-xl">
                    <div className="h-24 bg-[#5865f2] relative">
                      <div className="absolute top-3 right-3 bg-black/30 hover:bg-black/50 p-1.5 rounded-full cursor-pointer text-white transition-colors" title="Edit Banner (Mock)">
                        <Edit2 size={14} />
                      </div>
                    </div>
                    <div className="px-6 pb-6 pt-2 relative">
                      <div className="absolute -top-12 left-6 w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white font-bold text-3xl shadow-xl border-6 border-secondary relative group cursor-pointer">
                        {username ? username.substring(0, 1).toUpperCase() : '?'}
                        <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon size={24} />
                        </div>
                      </div>
                      
                      <div className="ml-32">
                        <h3 className="text-xl font-bold text-foreground">{username}</h3>
                        <p className="text-sm text-muted">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                        Username
                      </label>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-secondary text-foreground border border-subtle focus:border-accent outline-none px-4 py-3 rounded-xl transition-colors shadow-sm"
                        placeholder="Your Username"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                        Custom Status
                      </label>
                      <div className="relative flex items-center">
                        <button type="button" className="absolute left-3 w-6 h-6 rounded flex items-center justify-center hover:bg-tertiary transition-colors text-lg" onClick={() => toast.info('Emoji picker for status coming soon!')}>
                          💭
                        </button>
                        <input
                          type="text"
                          className="w-full bg-secondary text-foreground border border-subtle focus:border-accent outline-none pl-12 pr-4 py-3 rounded-xl transition-colors shadow-sm"
                          placeholder="What's on your mind?"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                        About Me
                      </label>
                      <textarea
                        disabled
                        className="w-full bg-secondary/50 text-foreground border border-subtle outline-none px-4 py-3 rounded-xl transition-colors shadow-sm resize-none opacity-50 cursor-not-allowed h-24"
                        placeholder="Coming soon..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || username === profile?.username}
                      className="px-8 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-white rounded-xl font-bold transition-all shadow-lg hover:shadow-accent/20 active:scale-95"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                  
                  <div className="h-[1px] bg-subtle my-10" />
                  
                  <div className="bg-secondary/50 rounded-2xl p-6 border border-subtle flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Quick Theme</h3>
                      <p className="text-sm text-muted">Change how Synapse looks.</p>
                    </div>
                    <ThemeSwitcher />
                  </div>
                </div>
              )}

              {activeTab === "themes" && (
                <div className="max-w-2xl">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Appearance & Themes</h2>
                  <p className="text-muted mb-8">Customize the look and feel of your Synapse experience.</p>
                  
                  <div className="bg-secondary/50 rounded-2xl p-6 border border-subtle mb-6 flex items-center justify-between shadow-sm">
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1">Global Theme</h3>
                      <p className="text-sm text-muted">Select from the full library of premium themes.</p>
                    </div>
                    <ThemeSwitcher />
                  </div>

                  <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-4 mt-8">Sound & Haptics</h3>
                  <div className="space-y-3">
                    <div className="bg-secondary/50 rounded-xl p-4 border border-subtle flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">UI Sound Effects</h4>
                        <p className="text-xs text-muted mt-1">Play satisfying sounds when interacting with buttons and menus.</p>
                      </div>
                      <div 
                        className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${uiSoundsEnabled ? 'bg-accent' : 'bg-black/30'}`}
                        onClick={() => {
                          setUiSoundsEnabled(!uiSoundsEnabled);
                          if (!uiSoundsEnabled) playBlip();
                        }}
                      >
                        <motion.div 
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ right: uiSoundsEnabled ? 4 : 28 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                    <div className="bg-secondary/50 rounded-xl p-4 border border-subtle flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-foreground">Message Chime</h4>
                        <p className="text-xs text-muted mt-1">Play a sound when receiving a new message.</p>
                      </div>
                      <div 
                        className={`w-12 h-6 rounded-full relative cursor-pointer shadow-inner transition-colors ${msgChimeEnabled ? 'bg-accent' : 'bg-black/30'}`}
                        onClick={() => {
                          setMsgChimeEnabled(!msgChimeEnabled);
                          if (!msgChimeEnabled) playChime();
                        }}
                      >
                        <motion.div 
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                          animate={{ right: msgChimeEnabled ? 4 : 28 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "privacy" && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Privacy & Safety</h2>
                  <p className="text-muted">Privacy settings will go here in the future.</p>
                </div>
              )}
              
              {activeTab === "notifications" && (
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Notifications</h2>
                  <p className="text-muted">Notification settings will go here in the future.</p>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
