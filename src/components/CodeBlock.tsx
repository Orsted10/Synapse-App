import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const language = className ? className.replace(/language-/, '') : 'code';

  const handleCopy = () => {
    let text = '';
    if (typeof children === 'string') {
      text = children;
    } else if (Array.isArray(children)) {
      text = children.map(child => (typeof child === 'string' ? child : '')).join('');
    } else if (React.isValidElement(children)) {
      text = children.props.children || '';
    }
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl bg-[#0d1117] border border-white/10 my-3 overflow-hidden shadow-2xl">
      {/* Mac-style Window Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <span className="ml-3 text-[11px] font-mono font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
            <Terminal size={12} /> {language}
          </span>
        </div>
        
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Copy code"
        >
          {copied ? <Check size={14} className="text-[#27c93f]" /> : <Copy size={14} />}
        </button>
      </div>

      {/* Code Content */}
      <div className="p-4 overflow-x-auto custom-scrollbar">
        <code className={`text-[13px] font-mono leading-relaxed text-[#e6edf3] ${className || ''}`}>
          {children}
        </code>
      </div>
    </div>
  );
}
