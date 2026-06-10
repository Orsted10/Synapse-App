"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUserStore } from "@/store/userStore";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { fetchWorkspaces } = useWorkspaceStore();
  const { user } = useUserStore();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !user) return;
    setIsLoading(true);

    try {
      // 1. Create Workspace
      const { data: workspaceData, error: workspaceError } = await supabase
        .from('workspaces')
        .insert({
          name: name,
          short_name: name.substring(0, 2).toUpperCase(),
          owner_id: user.id,
        })
        .select()
        .single();

      if (workspaceError) throw workspaceError;

      // 2. Create default 'general' channel
      const { error: channelError } = await supabase
        .from('channels')
        .insert({
          workspace_id: workspaceData.id,
          name: 'general',
          type: 'text'
        });

      if (channelError) throw channelError;

      // The postgres trigger automatically created the workspace_member entry for the owner.
      
      // Refresh the workspace store
      await fetchWorkspaces();
      onClose();
      setName("");
    } catch (err: any) {
      alert("Error creating server: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="bg-secondary w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative z-10 border border-subtle"
          >
            <div className="p-6 text-center">
              <h2 className="text-2xl font-bold text-foreground mb-2">Customize your server</h2>
              <p className="text-muted text-sm mb-6">
                Give your new server a personality with a name and an icon. You can always change it later.
              </p>

              <form onSubmit={handleCreate}>
                <div className="flex justify-center mb-6">
                  <div className="w-20 h-20 rounded-full border-2 border-dashed border-muted flex items-center justify-center text-muted hover:text-foreground hover:border-accent cursor-pointer transition-colors relative group">
                    <ImageIcon size={24} />
                    <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider">Upload</span>
                    </div>
                  </div>
                </div>

                <div className="text-left mb-6">
                  <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                    Server Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-tertiary text-foreground border border-subtle focus:border-accent outline-none px-4 py-3 rounded-lg transition-colors"
                    placeholder="Ankan's Server"
                    autoFocus
                    required
                  />
                </div>

                <div className="flex items-center justify-between mt-8">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-muted hover:text-foreground transition-colors font-medium text-sm"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim() || isLoading}
                    className="px-6 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white rounded-lg font-medium transition-colors"
                  >
                    {isLoading ? "Creating..." : "Create"}
                  </button>
                </div>
              </form>
            </div>
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-muted hover:text-foreground transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
