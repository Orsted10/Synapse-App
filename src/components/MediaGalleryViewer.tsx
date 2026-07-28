import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ZoomOut, Download } from 'lucide-react';

interface MediaGalleryViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string | null;
}

export function MediaGalleryViewer({ isOpen, onClose, imageUrl }: MediaGalleryViewerProps) {
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    if (isOpen) {
      setScale(1); // Reset zoom on open
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !imageUrl) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Toolbar */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-0 inset-x-0 p-4 flex items-center justify-end gap-3 z-10 bg-gradient-to-b from-black/80 to-transparent"
        >
          <button onClick={() => setScale(s => Math.min(s + 0.5, 4))} className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-colors">
            <ZoomIn size={20} />
          </button>
          <button onClick={() => setScale(s => Math.max(s - 0.5, 0.5))} className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-colors">
            <ZoomOut size={20} />
          </button>
          <a href={imageUrl} download target="_blank" rel="noreferrer" className="p-2 text-white/70 hover:text-white bg-white/5 hover:bg-white/20 rounded-full transition-colors">
            <Download size={20} />
          </a>
          <div className="w-px h-6 bg-white/20 mx-1" />
          <button onClick={onClose} className="p-2 text-red-400 hover:text-red-300 bg-white/5 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </motion.div>

        {/* Image Container */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-0 max-w-[90vw] max-h-[90vh] flex items-center justify-center pointer-events-none"
        >
          <motion.img 
            src={imageUrl} 
            alt="Gallery Media"
            animate={{ scale }}
            className="max-w-full max-h-full object-contain pointer-events-auto cursor-grab active:cursor-grabbing rounded-lg shadow-2xl"
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.8}
            onDoubleClick={() => setScale(s => s === 1 ? 2 : 1)}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
