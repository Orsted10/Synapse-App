import React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'start' | 'center' | 'end';
}

export function Tooltip({ content, children, side = 'top', align = 'center' }: TooltipProps) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger asChild>
        {children}
      </TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Content
          side={side}
          align={align}
          sideOffset={5}
          className="z-[100]"
          asChild
        >
          <motion.div
            initial={{ opacity: 0, scaleX: 0.3, scaleY: 0.1, y: side === 'top' ? 20 : side === 'bottom' ? -20 : 0, x: side === 'left' ? 20 : side === 'right' ? -20 : 0 }}
            animate={{ opacity: 1, scaleX: 1, scaleY: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scaleX: 0.8, scaleY: 0.5 }}
            transition={{ type: 'spring', damping: 15, stiffness: 400, mass: 0.5 }}
            className="px-4 py-2 bg-foreground text-background text-[13px] font-bold rounded-xl shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] max-w-[200px] text-center border border-white/20"
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-foreground" width={11} height={5} />
          </motion.div>
        </TooltipPrimitive.Content>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}
