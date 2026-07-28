"use client";

import React, { useEffect, useState } from "react";

const CHARS = "!<>-_\\\\/[]{}—=+*^?#________";

interface ScrambleTextProps {
  text: string;
  className?: string;
  duration?: number;
}

export const ScrambleText = ({ text, className = "", duration = 500 }: ScrambleTextProps) => {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let frame = 0;
    const totalFrames = (duration / 1000) * 60; // Assuming 60fps
    let animationFrameId: number;

    const animate = () => {
      let output = "";
      for (let i = 0; i < text.length; i++) {
        // As frame approaches totalFrames, more characters resolve to their true value
        const resolutionPoint = (i / text.length) * totalFrames;
        
        if (frame >= resolutionPoint) {
          output += text[i];
        } else {
          output += CHARS[Math.floor(Math.random() * CHARS.length)];
        }
      }
      
      setDisplayText(output);

      if (frame < totalFrames) {
        frame++;
        animationFrameId = requestAnimationFrame(animate);
      } else {
        setDisplayText(text); // Ensure final exact match
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, [text, duration]);

  return <span className={className}>{displayText}</span>;
};
