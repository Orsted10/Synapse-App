"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CornerDownRight, Send } from "lucide-react";
import { Message } from "@/store/messageStore";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ThreadDrawerProps {
  message: Message | null;
  onClose: () => void;
}

export function ThreadDrawer({ message, onClose }: ThreadDrawerProps) {
  const [replyText, setReplyText] = useState("");

  const handleReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    toast.success("Thread replies are coming in the next backend update!");
    setReplyText("");
  };

  return (
    <AnimatePresence>
      {message && (
        <>
          <motion.div
            initial={{ width: 0, opacity: 0, x: 50 }}
            animate={{ width: 400, opacity: 1, x: 0 }}
            exit={{ width: 0, opacity: 0, x: 50 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="h-[calc(100vh-32px)] my-auto ml-2 bg-secondary/80 backdrop-blur-2xl border border-white/10 flex flex-col shrink-0 overflow-hidden rounded-[24px] shadow-2xl z-40"
          >
            {/* Header */}
            <div className="h-14 border-b border-white/10 flex items-center justify-between px-5 shrink-0 bg-white/5">
              <div className="flex items-center gap-3 font-bold text-[15px] tracking-wide text-foreground">
                <CornerDownRight size={18} className="text-accent" />
                <span>Thread</span>
              </div>
              <button 
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all text-muted hover:text-foreground"
              >
                <X size={14} />
              </button>
            </div>

            {/* Original Message Content */}
            <div className="p-5 border-b border-white/10 bg-black/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  {message.user?.username?.[0]?.toUpperCase()}
                </div>
                <span className="font-bold text-sm text-foreground">{message.user?.username}</span>
                <span className="text-[10px] text-muted ml-auto">
                  {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="text-[14px] text-foreground/90 leading-relaxed pl-11 markdown-content">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
              </div>
            </div>

            {/* Mock Thread Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 flex flex-col gap-4">
              <div className="flex flex-col items-center justify-center h-full text-muted gap-3 opacity-60">
                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                  <CornerDownRight size={32} className="text-accent/50" />
                </div>
                <p className="font-bold text-foreground">No replies yet</p>
                <p className="text-xs text-center px-8">Start the conversation by replying below.</p>
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-secondary">
              <form onSubmit={handleReply} className="relative flex items-center">
                <input 
                  type="text" 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Reply to thread..." 
                  className="w-full bg-white/5 text-foreground px-4 py-3 rounded-2xl border border-white/10 focus:outline-none focus:border-accent transition-all pr-12 text-sm"
                />
                <button 
                  type="submit"
                  disabled={!replyText.trim()}
                  className="absolute right-2 w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:hover:bg-accent"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
