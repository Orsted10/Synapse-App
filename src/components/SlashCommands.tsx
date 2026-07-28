"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Command, Image, MessageSquare, HelpCircle } from "lucide-react";
import { TiltCard } from "./TiltCard";

interface SlashCommandsProps {
  query: string;
  onSelect: (command: string) => void;
}

const ALL_COMMANDS = [
  { id: 'giphy', icon: <Image size={18} />, label: '/giphy', desc: 'Search for animated GIFs' },
  { id: 'shrug', icon: <MessageSquare size={18} />, label: '/shrug', desc: 'Appends ¯\\_(ツ)_/¯ to your message' },
  { id: 'poll', icon: <HelpCircle size={18} />, label: '/poll', desc: 'Create a multiple choice poll' },
  { id: 'me', icon: <Command size={18} />, label: '/me', desc: 'Displays an action text' }
];

export function SlashCommands({ query, onSelect }: SlashCommandsProps) {
  const filtered = ALL_COMMANDS.filter(c => c.label.startsWith(query));

  if (filtered.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="absolute bottom-full mb-4 left-0 w-80 bg-background/90 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden p-2 z-[100]"
    >
      <div className="px-3 py-2 text-xs font-bold text-accent uppercase tracking-wider mb-1">
        Command Center
      </div>
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto custom-scrollbar">
        {filtered.map((cmd, i) => (
          <TiltCard key={cmd.id}>
            <button
              type="button"
              onClick={() => onSelect(cmd.label + " ")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-left group"
            >
              <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-muted group-hover:text-accent group-hover:bg-accent/10 transition-colors shadow-sm">
                {cmd.icon}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[14px] text-foreground">{cmd.label}</span>
                <span className="text-xs text-muted leading-tight">{cmd.desc}</span>
              </div>
            </button>
          </TiltCard>
        ))}
      </div>
    </motion.div>
  );
}
