import React, { useRef, useEffect } from 'react';
import EmojiPicker, { Theme, EmojiStyle } from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

interface EmojiPickerPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function EmojiPickerPopover({ isOpen, onClose, onEmojiSelect, buttonRef }: EmojiPickerPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        if (buttonRef?.current && buttonRef.current.contains(event.target as Node)) {
          return;
        }
        onClose();
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="absolute bottom-[110%] right-0 z-50 shadow-premium rounded-[24px] overflow-hidden border border-subtle/50"
        >
          <EmojiPicker 
            theme={Theme.DARK} 
            emojiStyle={EmojiStyle.NATIVE}
            onEmojiClick={(emojiData) => onEmojiSelect(emojiData.emoji)}
            lazyLoadEmojis={true}
            searchDisabled={false}
            skinTonesDisabled={true}
            width={320}
            height={400}
            style={{
              backgroundColor: 'rgba(20, 20, 25, 0.95)',
              border: 'none',
              backdropFilter: 'blur(20px)',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
