"use client";

import React from "react";
import { motion } from "framer-motion";
import { ScrambleText } from "./ScrambleText";

interface TypingIndicatorProps {
  usernames: string[];
}

export function TypingIndicator({ usernames }: TypingIndicatorProps) {
  if (usernames.length === 0) return null;

  const text = usernames.length === 1 
    ? `${usernames[0]} is typing...` 
    : usernames.length === 2 
      ? `${usernames[0]} and ${usernames[1]} are typing...` 
      : "Several people are typing...";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-3 px-2 py-1 text-xs text-muted"
    >
      <div className="flex items-center gap-1">
        <div className="w-1.5 h-1.5 rounded-full bg-accent typing-dot shadow-[0_0_8px_rgba(var(--accent),0.8)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent typing-dot shadow-[0_0_8px_rgba(var(--accent),0.8)]" />
        <div className="w-1.5 h-1.5 rounded-full bg-accent typing-dot shadow-[0_0_8px_rgba(var(--accent),0.8)]" />
      </div>
      <span className="font-medium tracking-wide">
        <ScrambleText text={text} />
      </span>
    </motion.div>
  );
}
