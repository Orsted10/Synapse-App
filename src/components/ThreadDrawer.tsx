"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CornerDownRight } from "lucide-react";
import { Message } from "@/store/messageStore";
import { TiltCard } from "./TiltCard";

interface ThreadDrawerProps {
  message: Message | null;
  onClose: () => void;
}

export function ThreadDrawer({ message, onClose }: ThreadDrawerProps) {
  return (
    <AnimatePresence>
      {message && (
        <>
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 400, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="h-full bg-secondary/90 border-l border-white/10 flex flex-col shrink-0 overflow-hidden"
          >
            {/* Header */}
            <div className="h-16 border-b border-white/5 flex items-center justify-between px-6 shrink-0 bg-secondary/30">
              <div className="flex items-center gap-3 font-bold text-lg text-foreground">
                <CornerDownRight size={20} className="text-accent" />
                <span>Thread</span>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-secondary/50 flex items-center justify-center hover:bg-accent hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Original Message Content */}
            <div className="p-6 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center text-[10px] font-bold">
                  {message.user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="font-bold text-sm text-foreground">{message.user?.username}</span>
                <span className="text-xs text-muted ml-auto">
                  {new Date(message.created_at).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {message.content}
              </p>
            </div>

            {/* Mock Thread Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center h-full text-muted gap-4 opacity-50">
                <CornerDownRight size={48} className="text-white/20" />
                <p className="font-medium tracking-wide">Thread replies coming soon</p>
              </div>
            </div>

            {/* Mock Input Area */}
            <div className="p-4 border-t border-white/5 bg-secondary/20">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Reply to thread..." 
                  disabled
                  className="w-full bg-secondary/50 text-foreground px-4 py-3 rounded-xl border border-white/10 focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
