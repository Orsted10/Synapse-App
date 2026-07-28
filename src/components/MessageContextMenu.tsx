import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SmilePlus, Edit2, CornerUpLeft, Forward, 
  Hash, Copy, Pin, Grip, BellOff, Link, 
  Volume2, Trash2, Fingerprint
} from 'lucide-react';
import { toast } from 'sonner';

interface MessageContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number, y: number };
  onEdit: () => void;
  onDelete: (e?: React.MouseEvent) => void;
  canEditDelete: boolean;
  msg?: any;
  onPin?: () => void;
  onReaction?: (emoji: string) => void;
}

export function MessageContextMenu({ isOpen, onClose, position, onEdit, onDelete, canEditDelete, msg, onPin, onReaction }: MessageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen || !msg) return null;

  // Render mock reactions
  const quickReactions = ['👍', '❤️', '😂', '🔥', '💀'];

  const triggerMock = (feature: string) => {
    toast.info(`${feature} is coming in the next update!`);
    onClose();
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(msg.content);
    toast.success('Text copied to clipboard!');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/channels/${msg.channel_id}/${msg.id}`);
    toast.success('Message link copied to clipboard!');
    onClose();
  };

  // Viewport aware positioning
  const menuHeight = 350; // approximate max height
  const adjustedTop = position.y + menuHeight > window.innerHeight 
    ? Math.max(10, position.y - menuHeight)
    : position.y;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          style={{ top: adjustedTop, left: position.x }}
          className="fixed z-50 w-64 bg-secondary/80 backdrop-blur-xl border border-subtle rounded-xl shadow-2xl py-1.5 flex flex-col text-foreground font-medium text-sm"
        >
          {/* Quick Reactions */}
          <div className="flex items-center justify-between px-2 pb-1.5 border-b border-subtle mb-1.5">
            {quickReactions.map((emoji, i) => (
              <button 
                key={i} 
                onClick={() => {
                  if (onReaction) onReaction(emoji);
                  onClose();
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-tertiary transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>

          <MenuItem icon={<SmilePlus size={16} />} label="Add Reaction" hasSubmenu onClick={() => triggerMock('Full Emoji Picker')} />
          <div className="h-[1px] bg-subtle my-1.5 mx-2" />
          
          {canEditDelete && (
            <MenuItem icon={<Edit2 size={16} />} label="Edit Message" onClick={() => { onEdit(); onClose(); }} />
          )}
          <MenuItem icon={<CornerUpLeft size={16} />} label="Reply" onClick={() => triggerMock('Reply')} />
          <MenuItem icon={<Forward size={16} />} label="Forward" onClick={() => triggerMock('Forward')} />
          <MenuItem icon={<Hash size={16} />} label="Create Thread" onClick={() => triggerMock('Create Thread')} />
          
          <div className="h-[1px] bg-subtle my-1.5 mx-2" />
          
          <MenuItem icon={<Copy size={16} />} label="Copy Text" onClick={handleCopyText} />
          <MenuItem icon={<Pin size={16} />} label={msg.is_pinned ? "Unpin Message" : "Pin Message"} onClick={() => { if (onPin) onPin(); onClose(); }} />
          <MenuItem icon={<Grip size={16} />} label="Apps" hasSubmenu onClick={() => triggerMock('Apps')} />
          
          <div className="h-[1px] bg-subtle my-1.5 mx-2" />
          
          <MenuItem icon={<BellOff size={16} />} label="Mark Unread" onClick={() => triggerMock('Mark Unread')} />
          <MenuItem icon={<Link size={16} />} label="Copy Message Link" onClick={handleCopyLink} />
          <MenuItem icon={<Volume2 size={16} />} label="Speak Message" onClick={() => triggerMock('Speak Message')} />
          
          {canEditDelete && (
            <>
              <div className="h-[1px] bg-[#2b2d31] my-1.5 mx-2" />
              <MenuItem 
                icon={<Trash2 size={16} />} 
                label="Delete Message" 
                onClick={(e) => { onDelete(e); onClose(); }} 
                danger 
              />
            </>
          )}

          <div className="h-[1px] bg-[#2b2d31] my-1.5 mx-2" />
          <MenuItem icon={<Fingerprint size={16} />} label="Copy Message ID" onClick={() => triggerMock('Copy Message ID')} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuItem({ icon, label, onClick, danger, hasSubmenu }: { icon: React.ReactNode, label: string, onClick?: (e: React.MouseEvent) => void, danger?: boolean, hasSubmenu?: boolean }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 hover:bg-[#5865f2] hover:text-white transition-colors group ${danger ? 'text-[#f23f42] hover:bg-[#da373c]' : ''}`}
    >
      <span className="flex-1 text-left">{label}</span>
      <div className={`opacity-80 ${danger ? 'text-[#f23f42] group-hover:text-white' : ''}`}>
        {hasSubmenu ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        ) : (
          icon
        )}
      </div>
    </button>
  );
}
