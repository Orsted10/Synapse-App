"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Hash, Volume2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface CreateChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function CreateChannelModal({ isOpen, onClose, workspaceId }: CreateChannelModalProps) {
  const [channelType, setChannelType] = useState<'text' | 'voice'>('text');
  const [channelName, setChannelName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { fetchChannels } = useWorkspaceStore();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelName.trim()) return;

    setIsLoading(true);

    try {
      // Format name: lowercase and replace spaces with hyphens
      const formattedName = channelName.trim().toLowerCase().replace(/\s+/g, '-');
      
      const { error } = await supabase.from('channels').insert({
        workspace_id: workspaceId,
        name: formattedName,
        type: channelType
      });

      if (error) throw error;

      await fetchChannels(workspaceId);
      onClose();
      setChannelName(""); // Reset for next time
    } catch (err: any) {
      alert("Error creating channel: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-secondary w-full max-w-[440px] rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-subtle"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Create Channel</h2>
                <button onClick={onClose} className="text-muted hover:text-foreground transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider">Channel Type</h3>
                  
                  <button 
                    type="button"
                    onClick={() => setChannelType('text')}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${channelType === 'text' ? 'bg-secondary' : 'bg-transparent hover:bg-secondary/50'}`}
                  >
                    <div className="text-muted"><Hash size={24} /></div>
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-foreground">Text</span>
                      <span className="text-xs text-muted">Send messages, images, GIFs, emoji, opinions, and puns</span>
                    </div>
                    <div className={`ml-auto flex shrink-0 items-center justify-center w-6 h-6 rounded-full border-2 ${channelType === 'text' ? 'border-accent' : 'border-muted'} bg-transparent`}>
                      {channelType === 'text' && <div className="w-3 h-3 rounded-full bg-accent" />}
                    </div>
                  </button>

                  <button 
                    type="button"
                    onClick={() => setChannelType('voice')}
                    className={`w-full text-left flex items-center gap-3 p-3 rounded-md cursor-pointer transition-colors ${channelType === 'voice' ? 'bg-secondary' : 'bg-transparent hover:bg-secondary/50'}`}
                  >
                    <div className="text-muted"><Volume2 size={24} /></div>
                    <div className="flex flex-col flex-1">
                      <span className="font-bold text-foreground">Voice</span>
                      <span className="text-xs text-muted">Hang out together with voice, video, and screen share</span>
                    </div>
                    <div className={`ml-auto flex shrink-0 items-center justify-center w-6 h-6 rounded-full border-2 ${channelType === 'voice' ? 'border-accent' : 'border-muted'} bg-transparent`}>
                      {channelType === 'voice' && <div className="w-3 h-3 rounded-full bg-accent" />}
                    </div>
                  </button>
                </div>

                <form onSubmit={handleCreate}>
                  <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2 mt-4">Channel Name</h3>
                  <div className="relative">
                    <Hash size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                    <input
                      type="text"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="new-channel"
                      className="w-full bg-tertiary text-foreground border border-subtle focus:border-accent outline-none pl-10 pr-4 py-3 rounded-lg transition-colors"
                      autoFocus
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 mt-8">
                    <button 
                      type="button" 
                      onClick={onClose}
                      className="text-muted hover:text-foreground font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isLoading || !channelName.trim()}
                      className="px-6 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-white rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? "Creating..." : "Create Channel"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
