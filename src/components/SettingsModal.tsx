"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, User, Shield, Bell, Image as ImageIcon } from "lucide-react";
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
      alert("Profile updated successfully!");
    } catch (err: any) {
      alert("Error updating profile: " + err.message);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-secondary w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-subtle flex"
          >
            {/* Sidebar */}
            <div className="w-[240px] bg-tertiary border-r border-subtle p-4 flex flex-col gap-1 shrink-0">
              <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 px-3 mt-2">User Settings</h3>
              
              <button 
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[15px] transition-colors ${activeTab === 'profile' ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'}`}
              >
                <User size={18} /> My Profile
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
            <div className="flex-1 p-10 pb-48 overflow-y-auto custom-scrollbar relative">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-8 h-8 rounded-full border border-subtle flex items-center justify-center text-muted hover:text-foreground hover:bg-tertiary transition-colors"
              >
                <X size={16} />
              </button>

              {activeTab === "profile" && (
                <div className="max-w-xl">
                  <h2 className="text-2xl font-bold text-foreground mb-6">My Profile</h2>
                  
                  <div className="bg-tertiary rounded-xl p-6 border border-subtle mb-6">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="w-24 h-24 rounded-full bg-accent flex items-center justify-center text-white font-bold text-3xl shadow-lg relative group cursor-pointer border-4 border-secondary">
                        {username ? username.substring(0, 1).toUpperCase() : '?'}
                        <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <ImageIcon size={24} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-2xl font-bold text-foreground">{username}</span>
                        <span className="text-sm text-muted">{user?.email}</span>
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
                        className="w-full bg-tertiary text-foreground border border-subtle focus:border-accent outline-none px-4 py-3 rounded-lg transition-colors"
                        placeholder="Your Username"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || username === profile?.username}
                      className="px-6 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-white rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                  
                  <div className="h-[1px] bg-subtle my-8" />
                  
                  <div className="bg-tertiary rounded-xl p-6 border border-subtle mb-6">
                    <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-4">App Theme</h3>
                    <ThemeSwitcher />
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
