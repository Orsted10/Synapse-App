import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Hash, Settings, User, Command, Sun, Moon } from 'lucide-react';
import { useWorkspaceStore } from '@/store/workspaceStore';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { channels, setActiveChannel } = useWorkspaceStore();
  const { theme, setTheme } = useTheme();
  const router = useRouter();

  // Handle keyboard shortcut (Ctrl/Cmd + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Trigger open via parent
          document.dispatchEvent(new CustomEvent('open-command-palette'));
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items = [
    // Channels
    ...channels.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).map(c => ({
      id: `channel-${c.id}`,
      title: `Go to #${c.name}`,
      icon: <Hash size={18} className="text-muted" />,
      action: () => {
        setActiveChannel(c.id);
        onClose();
      }
    })),
    // Theme toggle
    {
      id: 'theme-toggle',
      title: 'Toggle Theme (Light/Dark)',
      icon: theme === 'dark' ? <Sun size={18} className="text-muted" /> : <Moon size={18} className="text-muted" />,
      action: () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
        onClose();
      },
      showAlways: 'theme'.includes(query.toLowerCase())
    },
    // Settings
    {
      id: 'open-settings',
      title: 'Open Settings',
      icon: <Settings size={18} className="text-muted" />,
      action: () => {
        document.dispatchEvent(new CustomEvent('open-settings'));
        onClose();
      },
      showAlways: 'settings'.includes(query.toLowerCase())
    }
  ].filter(item => query === '' || ('showAlways' in item && item.showAlways) || item.title.toLowerCase().includes(query.toLowerCase()));
  // Keyboard navigation
  useEffect(() => {
    const handleNavigation = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % items.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          items[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleNavigation);
    return () => window.removeEventListener('keydown', handleNavigation);
  }, [isOpen, items, selectedIndex, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
        >
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ scale: 0.95, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: -20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-secondary/80 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Search Input */}
            <div className="flex items-center px-4 py-4 border-b border-white/10">
              <Search size={22} className="text-muted mr-3" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent border-none outline-none text-foreground text-lg font-medium placeholder:text-muted/50"
              />
              <div className="flex items-center gap-1 text-[10px] text-muted font-bold bg-white/5 px-2 py-1 rounded">
                <Command size={12} /> K
              </div>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar p-2">
              {items.length === 0 ? (
                <div className="py-10 text-center text-muted">
                  No results found for "{query}"
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {items.map((item, i) => (
                    <motion.button
                      key={item.id}
                      onClick={item.action}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl transition-all duration-200 text-left ${
                        selectedIndex === i 
                          ? 'bg-accent/20 text-accent shadow-[0_0_20px_rgba(var(--accent),0.2)]' 
                          : 'text-foreground/80 hover:bg-white/5'
                      }`}
                    >
                      <div className={`p-1.5 rounded-lg ${selectedIndex === i ? 'bg-accent/20 text-accent' : 'bg-white/5 text-muted'}`}>
                        {item.icon}
                      </div>
                      <span className="font-semibold">{item.title}</span>
                      
                      {selectedIndex === i && (
                        <motion.span 
                          layoutId="cmd-enter"
                          className="ml-auto text-[10px] font-bold uppercase tracking-wider opacity-70"
                        >
                          Press Enter
                        </motion.span>
                      )}
                    </motion.button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
