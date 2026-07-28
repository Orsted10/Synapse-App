"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Pin } from "lucide-react";
import { Message } from "@/store/messageStore";
import { TiltCard } from "./TiltCard";
import { StaggerText } from "./StaggerText";

interface PinnedDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pinnedMessages: Message[];
}

export function PinnedDrawer({ isOpen, onClose, pinnedMessages }: PinnedDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[100] backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ x: "100%", opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-[400px] bg-background/90 backdrop-blur-2xl border-l border-white/10 z-[101] shadow-2xl flex flex-col pointer-events-auto"
          >
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-secondary/30">
              <div className="flex items-center gap-3 font-bold text-lg text-foreground">
                <Pin size={20} className="text-accent" />
                <StaggerText text="Pinned Messages" />
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
              {pinnedMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted gap-4 opacity-50">
                  <Pin size={48} className="text-white/20" />
                  <p className="font-medium tracking-wide">No pinned messages in this channel</p>
                </div>
              ) : (
                pinnedMessages.map(msg => (
                  <TiltCard key={msg.id} className="p-4 rounded-xl bg-secondary/40 border border-white/5 hover:border-white/20 transition-all cursor-pointer group shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold">
                        {msg.user?.username?.[0]?.toUpperCase()}
                      </div>
                      <span className="font-bold text-sm text-foreground/80">{msg.user?.username}</span>
                      <span className="text-xs text-muted ml-auto">
                        {new Date(msg.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/90 leading-relaxed group-hover:text-white transition-colors">
                      {msg.content}
                    </p>
                  </TiltCard>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
