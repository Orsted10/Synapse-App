"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Palette, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const themes = [
  { id: "synapse-dark", name: "Synapse Dark", color: "#0A0A0A" },
  { id: "midnight", name: "Midnight", color: "#050A14" },
  { id: "graphite", name: "Graphite", color: "#1C1C1E" },
  { id: "discord-classic", name: "Discord Classic", color: "#313338" },
  { id: "discord-light", name: "Discord Light", color: "#FFFFFF" },
  { id: "telegram-light", name: "Telegram Light", color: "#FFFFFF" },
  { id: "arctic", name: "Arctic Clean", color: "#F8FAFC" },
  { id: "oled", name: "OLED Black", color: "#000000" },
  { id: "matrix", name: "Matrix", color: "#050F05" },
  { id: "synthwave", name: "Synthwave", color: "#241136" },
  { id: "forest", name: "Deep Forest", color: "#0F190F" },
  { id: "ocean", name: "Ocean", color: "#0A1923" },
  { id: "sunset", name: "Sunset", color: "#230F0F" },
  { id: "monochrome", name: "Monochrome", color: "#FFFFFF" },
  { id: "dracula", name: "Dracula", color: "#282A36" },
  { id: "nord", name: "Nord", color: "#2E3440" },
  { id: "solarized-dark", name: "Solarized Dark", color: "#002B36" },
  { id: "solarized-light", name: "Solarized Light", color: "#FDF6E3" },
  { id: "cyberpunk", name: "Cyberpunk", color: "#FAE62D" },
  { id: "coffee", name: "Coffee", color: "#2C1E16" },
  { id: "rose-gold", name: "Rose Gold", color: "#FAF5F5" },
];

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center p-2 rounded-md hover:bg-secondary transition-colors text-muted hover:text-foreground"
        title="Change Theme"
      >
        <Palette size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 mt-2 w-64 glass-panel rounded-xl premium-shadow overflow-hidden z-50 flex flex-col max-h-[60vh]"
            >
              <div className="p-3 border-b border-subtle bg-secondary/50 font-medium text-sm text-foreground">
                Select Theme
              </div>
              <div className="overflow-y-auto custom-scrollbar flex-1 p-2 space-y-1">
                {themes.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                      theme === t.id
                        ? "bg-accent text-white"
                        : "hover:bg-secondary text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full border border-subtle"
                        style={{ backgroundColor: t.color }}
                      />
                      <span>{t.name}</span>
                    </div>
                    {theme === t.id && <Check size={16} />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
