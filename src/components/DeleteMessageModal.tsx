import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface DeleteMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: {
    content: string;
    username: string;
    avatarLetter: string;
    time: string;
  } | null;
}

export function DeleteMessageModal({ isOpen, onClose, onConfirm, message }: DeleteMessageModalProps) {
  if (!isOpen || !message) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-[440px] bg-secondary rounded-xl shadow-2xl overflow-hidden border border-subtle flex flex-col"
        >
          {/* Header */}
          <div className="p-4 pb-2 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Delete Message</h2>
            <button 
              onClick={onClose}
              className="text-muted hover:text-foreground transition-colors p-1"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="px-4 pb-4">
            <p className="text-muted text-[15px] mb-4">
              Are you sure you want to delete this message?
            </p>

            {/* Message Preview */}
            <div className="flex gap-3 p-3 rounded-lg border border-subtle bg-background/50 mb-4 shadow-inner">
              <div className="w-10 h-10 rounded-full bg-accent text-white flex items-center justify-center font-bold shrink-0 shadow-sm mt-0.5">
                {message.avatarLetter}
              </div>
              <div className="flex flex-col flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="font-bold text-[15px] hover:underline cursor-pointer truncate text-foreground">
                    {message.username}
                  </span>
                  <span className="text-xs text-muted font-medium shrink-0">
                    {message.time}
                  </span>
                </div>
                <div className="text-[15px] text-foreground/90 whitespace-pre-wrap break-words leading-relaxed">
                  {message.content}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted">
              <strong className="text-green-500 font-bold uppercase text-xs tracking-wider">Protip:</strong>
              <br />
              You can hold down shift when clicking <strong>delete message</strong> to bypass this confirmation entirely.
            </p>
          </div>

          {/* Footer */}
          <div className="p-4 bg-tertiary flex justify-end gap-3 border-t border-subtle">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md font-medium text-foreground hover:underline transition-all"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2 rounded-md font-bold text-white bg-red-500 hover:bg-red-600 transition-all shadow-sm active:translate-y-[1px]"
            >
              Delete
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
