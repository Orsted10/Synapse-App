"use client";

import React, { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const TiltCard = ({ children, className = "", onClick, onMouseEnter, onMouseLeave }: TiltCardProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 300, damping: 40 });
  const mouseYSpring = useSpring(y, { stiffness: 300, damping: 40 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);
  
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => {
        setIsHovering(true);
        if (onMouseEnter) onMouseEnter();
      }}
      onMouseLeave={() => {
        handleMouseLeave();
        if (onMouseLeave) onMouseLeave();
      }}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      animate={{
        scale: isHovering ? 1.05 : 1,
        z: isHovering ? 20 : 0
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative ${className} cursor-pointer perspective-1000`}
    >
      <div 
        style={{ transform: "translateZ(30px)" }}
        className="w-full h-full"
      >
        {children}
      </div>
      
      {/* Glossy reflection on hover */}
      {isHovering && (
        <motion.div 
          className="absolute inset-0 z-50 rounded-inherit pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.15) 25%, transparent 30%)",
            backgroundSize: "200% 200%",
          }}
          animate={{ backgroundPosition: ["200% 0", "-100% 0"] }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      )}
    </motion.div>
  );
};
