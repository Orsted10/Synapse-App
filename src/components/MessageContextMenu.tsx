import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  SmilePlus, Edit2, CornerUpLeft, Forward, 
  Hash, Copy, Pin, Grip, BellOff, Link, 
  Volume2, Trash2, Fingerprint
} from 'lucide-react';

interface MessageContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number, y: number };
  onEdit: () => void;
  onDelete: (e?: React.MouseEvent) => void;
  canEditDelete: boolean;
}

export function MessageContextMenu({ isOpen, onClose, position, onEdit, onDelete, canEditDelete }: MessageContextMenuProps) {
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

  if (!isOpen) return null;

  // Render mock reactions
  const quickReactions = ['💀', '🗿', '🔥', '👍'];

  const triggerMock = (feature: string) => {
    alert(`${feature} is coming in Phase 6!`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.1 }}
          style={{ top: position.y, left: position.x }}
          className="fixed z-50 w-64 bg-[#111214] border border-[#1e1f22] rounded-md shadow-[0_8px_16px_rgba(0,0,0,0.24)] py-1.5 flex flex-col text-[#dbdee1] font-medium text-sm"
        >
          {/* Quick Reactions */}
          <div className="flex items-center justify-between px-2 pb-1.5 border-b border-[#2b2d31] mb-1.5">
            {quickReactions.map((emoji, i) => (
              <button 
                key={i} 
                onClick={() => triggerMock(`Reaction ${emoji}`)}
                className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#5865f2] transition-colors text-lg"
              >
                {emoji}
              </button>
            ))}
          </div>

          <MenuItem icon={<SmilePlus size={16} />} label="Add Reaction" hasSubmenu onClick={() => triggerMock('Add Reaction')} />
          <div className="h-[1px] bg-[#2b2d31] my-1.5 mx-2" />
          
          {canEditDelete && (
            <MenuItem icon={<Edit2 size={16} />} label="Edit Message" onClick={() => { onEdit(); onClose(); }} />
          )}
          <MenuItem icon={<CornerUpLeft size={16} />} label="Reply" onClick={() => triggerMock('Reply')} />
          <MenuItem icon={<Forward size={16} />} label="Forward" onClick={() => triggerMock('Forward')} />
          <MenuItem icon={<Hash size={16} />} label="Create Thread" onClick={() => triggerMock('Create Thread')} />
          
          <div className="h-[1px] bg-[#2b2d31] my-1.5 mx-2" />
          
          <MenuItem icon={<Copy size={16} />} label="Copy Text" onClick={() => triggerMock('Copy Text')} />
          <MenuItem icon={<Pin size={16} />} label="Pin Message" onClick={() => triggerMock('Pin Message')} />
          <MenuItem icon={<Grip size={16} />} label="Apps" hasSubmenu onClick={() => triggerMock('Apps')} />
          
          <div className="h-[1px] bg-[#2b2d31] my-1.5 mx-2" />
          
          <MenuItem icon={<BellOff size={16} />} label="Mark Unread" onClick={() => triggerMock('Mark Unread')} />
          <MenuItem icon={<Link size={16} />} label="Copy Message Link" onClick={() => triggerMock('Copy Message Link')} />
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
