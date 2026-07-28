"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Hash, Send, Smile, Paperclip, Users, MessageSquare, Volume2, Pin, CornerDownRight } from "lucide-react";
import { useMessageStore } from "@/store/messageStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUserStore } from "@/store/userStore";
import { usePresenceStore } from "@/store/presenceStore";
import { UserProfileModal } from "@/components/UserProfileModal";
import { DeleteMessageModal } from "@/components/DeleteMessageModal";
import { MessageContextMenu } from "@/components/MessageContextMenu";
import { TiltCard } from "@/components/TiltCard";
import { SpotlightCard } from "@/components/SpotlightCard";
import { Magnetic } from "@/components/Magnetic";
import { CustomCursor } from "@/components/CustomCursor";
import { ScrambleText } from "@/components/ScrambleText";
import { StaggerText } from "@/components/StaggerText";
import { PinnedDrawer } from "@/components/PinnedDrawer";
import { SlashCommands } from "@/components/SlashCommands";
import { ThreadDrawer } from "@/components/ThreadDrawer";
import { EmojiPickerPopover } from "@/components/EmojiPickerPopover";
import { MediaGalleryViewer } from "@/components/MediaGalleryViewer";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { CodeBlock } from "@/components/CodeBlock";
import { VoiceChannel } from "@/components/VoiceChannel";

export default function Home() {
  const { activeWorkspaceId, activeChannelId, channels, workspaces } = useWorkspaceStore();
  const { messages, fetchMessages, sendMessage, updateMessage, deleteMessage, toggleReaction, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { user, profile } = useUserStore();
  const { typingUsers, setTyping } = usePresenceStore();

  // Modal and Context Menu State
  const [activeThreadMsg, setActiveThreadMsg] = useState<any>(null);
  const [deleteModalMessage, setDeleteModalMessage] = useState<any>(null);
  const [isPinnedDrawerOpen, setIsPinnedDrawerOpen] = useState(false);
  const [galleryImage, setGalleryImage] = useState<string | null>(null);
  const [mockTypingUsers, setMockTypingUsers] = useState<string[]>([]);
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number; msg: any }>({ 
    isOpen: false, x: 0, y: 0, msg: null 
  });

  useEffect(() => {
    // Mock typing indicators for functional aesthetics demo
    if (!activeChannelId) return;
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setMockTypingUsers(["Alice"]);
        setTimeout(() => setMockTypingUsers([]), 3000);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [activeChannelId]);

  useEffect(() => {
    if (activeChannelId) {
      fetchMessages(activeChannelId);
      subscribeToMessages(activeChannelId);
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [activeChannelId, fetchMessages, subscribeToMessages, unsubscribeFromMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeTypingUsers = activeChannelId ? (typingUsers[activeChannelId] || []).filter(name => name !== profile?.username) : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    if (activeChannelId && profile?.username) {
      setTyping(activeChannelId, profile.username, e.target.value.length > 0);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChannelId) return;

    const content = inputValue;
    setInputValue("");
    if (profile?.username) {
      setTyping(activeChannelId, profile.username, false);
    }
    await sendMessage(activeChannelId, content);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Optional: show a loading state on the input
    const originalValue = inputValue;
    setInputValue(originalValue + (originalValue ? ' ' : '') + '*(uploading image...)*');

    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `chat-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from('synapse-storage')
      .upload(filePath, file);

    if (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image. Please check your Supabase Storage policies.');
      setInputValue(originalValue);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('synapse-storage')
      .getPublicUrl(filePath);

    // Replace the loading text with the markdown image syntax
    setInputValue(originalValue + (originalValue ? ' ' : '') + `![${file.name}](${publicUrl})\n`);
  };

  // ---------------------------------------------
  // HOME SCREEN (No Workspace Selected)
  // ---------------------------------------------
  if (!activeWorkspaceId) {
    return (
      <AppLayout>
        {/* Top Header - Dynamic Island */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 h-14 border border-white/10 rounded-full flex items-center px-6 shrink-0 bg-background/80 backdrop-blur-md z-50 shadow-2xl transition-all duration-500 hover:w-[45%] w-[40%] min-w-[300px]">
          <div className="flex items-center gap-6 w-full justify-between">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Users size={20} className="text-muted" />
              <span>Friends</span>
            </div>
            <div className="h-5 w-[1px] bg-subtle" />
            <div className="flex gap-4 text-sm font-medium">
              <button className="text-foreground bg-secondary px-2 py-1 rounded-md">Online</button>
              <button className="text-muted hover:text-foreground px-2 py-1 transition-colors">All</button>
              <button className="text-muted hover:text-foreground px-2 py-1 transition-colors">Pending</button>
              <button className="text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded-md transition-colors shadow-sm ml-2">Add Friend</button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
          <div className="w-64 h-64 bg-secondary/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-subtle">
            <Users size={80} className="text-muted opacity-50" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Your neural network is empty.</h2>
          <p className="text-muted max-w-md">Click the + button on the left sidebar to create a Synapse Server and start connecting with others!</p>
        </div>

        <PinnedDrawer 
          isOpen={isPinnedDrawerOpen} 
          onClose={() => setIsPinnedDrawerOpen(false)} 
          pinnedMessages={messages.filter(m => m.is_pinned)} 
        />
      </AppLayout>
    );
  }

  // ---------------------------------------------
  // CHAT SCREEN (Workspace & Channel Selected)
  // ---------------------------------------------
  
  const getColorForUser = (username: string) => {
    if (!username) return 'rgba(var(--accent), 1)';
    const colors = [
      '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF', 
      '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41', 
      '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40'
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // ... (inside the component)
  const handleUserClick = (userProfile: any) => {
    setSelectedUser({
      name: userProfile.username || "Unknown",
      roleGroup: userProfile.role === "Creator" ? "Core Team" : "Members",
      roleColor: userProfile.role === "Creator" ? "#FF5252" : "#9E9E9E",
      status: "online",
      subtext: userProfile.role === "Creator" ? "Debugging UI..." : ""
    });
  };

  const handleStartEdit = (msg: any) => {
    setEditingMessageId(msg.id);
    setEditContent(msg.content);
  };

  const handleSaveEdit = async (msgId: string) => {
    if (editContent.trim()) {
      await updateMessage(msgId, editContent);
    }
    setEditingMessageId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, msgId: string) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(msgId);
    } else if (e.key === "Escape") {
      setEditingMessageId(null);
    }
  };

  const handleDeleteClick = (msg: any, e?: React.MouseEvent) => {
    if (e?.shiftKey) {
      deleteMessage(msg.id);
      return;
    }
    
    setDeleteModalMessage({
      id: msg.id,
      content: msg.content,
      username: msg.user?.username || 'Unknown',
      avatarLetter: msg.user?.username ? msg.user.username.substring(0, 1).toUpperCase() : '?',
      time: new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    });
  };

  const handleConfirmDelete = async () => {
    if (deleteModalMessage) {
      await deleteMessage(deleteModalMessage.id);
      setDeleteModalMessage(null);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, msg: any) => {
    e.preventDefault();
    
    const menuWidth = 260; // Approximate menu width
    const menuHeight = 580; // Approximate menu height (increased to handle all options without clipping)
    
    let x = e.clientX;
    let y = e.clientY;

    // Clamp to window bounds
    x = Math.max(8, Math.min(x, window.innerWidth - menuWidth - 8));
    y = Math.max(8, Math.min(y, window.innerHeight - menuHeight - 8));

    setContextMenu({
      isOpen: true,
      x,
      y,
      msg
    });
  };

  return (
    <>
      <AppLayout>
      {/* Top Header - Dynamic Island */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 h-10 min-w-[320px] max-w-[500px] border border-white/10 rounded-full flex items-center justify-between px-4 shrink-0 glass-panel-heavy z-50 shadow-2xl transition-all duration-500 hover:w-[50%] w-[45%]">
        <div className="flex items-center gap-2">
          <Hash size={18} className="text-muted" />
          <div className="flex items-center gap-2">
            <span className="font-bold text-[15px] tracking-wide text-gradient-animated">
              {activeChannel ? <ScrambleText text={activeChannel.name} /> : 'Select a channel'}
            </span>
          </div>
        </div>
        {activeChannel && (
          <div className="flex items-center gap-3 text-muted">
            <button className="hover:text-foreground transition-colors" title="Pinned Messages" onClick={() => setIsPinnedDrawerOpen(true)}>
              <Pin size={16} />
            </button>
            <button className="hover:text-foreground transition-colors" title="Member List">
              <Users size={16} />
            </button>
          </div>
        )}
      </div>

      {activeChannel?.type === 'voice' ? (
        <VoiceChannel channelName={activeChannel.name} />
      ) : (
        <div className="flex-1 flex flex-row overflow-hidden w-full relative">
          <div className="flex-1 flex flex-col min-w-0 h-full">
          {/* Message Log Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar flex flex-col gap-6 relative overscroll-contain chat-fade-mask pt-[80px]">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={activeChannel?.id}
                initial={{ opacity: 0, rotateX: 20, z: -100 }}
                animate={{ opacity: 1, rotateX: 0, z: 0 }}
                exit={{ opacity: 0, rotateX: -20, z: -100 }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className="flex flex-col gap-6"
                style={{ transformStyle: "preserve-3d", perspective: 1000 }}
              >
            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : null;
              const isGrouped = prevMsg && prevMsg.user_id === msg.user_id && (new Date(msg.created_at).getTime() - new Date(prevMsg.created_at).getTime() < 5 * 60 * 1000);
              const userColor = getColorForUser(msg.user?.username || '');
              return (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: Math.min(index * 0.05, 1),
                  type: "spring",
                  damping: 20,
                  stiffness: 200
                }}
                className={`group flex items-start gap-4 px-6 py-1 hover:bg-white/5 transition-colors relative ${editingMessageId === msg.id ? 'bg-accent/5' : ''} ${isGrouped ? 'mt-0' : 'mt-4'}`}
                key={msg.id}
                onContextMenu={(e) => handleContextMenu(e, msg)}
              >
                <div className={`flex gap-3 max-w-[85%] w-full ${msg.user_id === profile?.id ? 'flex-row-reverse ml-auto' : 'flex-row'}`}>
                  {/* Avatar Area */}
                  <div className="flex flex-col justify-end pb-1 shrink-0">
                    {!isGrouped && (
                      <div 
                        onClick={() => handleUserClick(msg.user)}
                        className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-premium cursor-pointer hover:scale-110 transition-transform relative z-10"
                        style={{
                          backgroundColor: userColor,
                          backgroundImage: `linear-gradient(135deg, ${userColor} 0%, rgba(255,255,255,0.2) 100%)`
                        }}
                      >
                        {msg.user?.username ? msg.user.username.substring(0, 1).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>

                  {/* Message Bubble Container */}
                  <div className={`flex flex-col w-full z-10 ${msg.user_id === profile?.id ? 'items-end' : 'items-start'}`}>
                    
                    {/* Message Header */}
                    {!isGrouped && (
                      <div className={`flex items-center gap-2 mb-1 ${msg.user_id === profile?.id ? 'flex-row-reverse' : ''}`}>
                        <span 
                          onClick={() => handleUserClick(msg.user)}
                          className={`font-bold text-[13px] hover:underline cursor-pointer tracking-wide ${msg.user?.role?.toLowerCase() === 'admin' ? 'role-admin' : msg.user?.role?.toLowerCase() === 'mod' ? 'role-mod' : msg.user?.role?.toLowerCase() === 'vip' ? 'role-vip' : ''}`}
                          style={{ color: !['admin', 'mod', 'vip'].includes(msg.user?.role?.toLowerCase() || '') ? userColor : undefined }}
                        >
                          <StaggerText text={msg.user?.username || 'Unknown User'} />
                        </span>
                        <span className="text-[10px] text-muted">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                        </span>
                        {msg.is_pinned && (
                          <span className="text-[9px] text-accent font-bold uppercase tracking-wider flex items-center gap-1 bg-accent/10 px-1.5 py-0.5 rounded">
                            📌
                          </span>
                        )}
                      </div>
                    )}  

                    {/* Message Content Bubble */}
                    <div className={`relative group/bubble max-w-full ${msg.user_id === profile?.id ? 'text-right' : 'text-left'}`}>
                      {editingMessageId === msg.id ? (
                        <div className="mt-1 relative min-w-[300px]">
                          <input
                            type="text"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, msg.id)}
                            className="w-full bg-secondary text-foreground border border-subtle focus:border-accent outline-none px-4 py-2.5 rounded-2xl shadow-bubble"
                            autoFocus
                          />
                          <span className="text-[10px] text-muted absolute -bottom-5 right-0">
                            escape to cancel • enter to save
                          </span>
                        </div>
                      ) : (
                        <div 
                          className={`text-[15px] leading-relaxed markdown-content px-4 py-2.5 shadow-bubble transition-all ${msg.user_id === profile?.id ? 'bg-accent text-white rounded-2xl rounded-tr-sm' : 'glass-bubble text-foreground rounded-2xl rounded-tl-sm'}`}
                        >
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({node, ...props}) => <p className="mb-1 last:mb-0 inline-block" {...props} />,
                              a: ({node, ...props}) => <a className="underline opacity-90 hover:opacity-100" target="_blank" rel="noreferrer" {...props} />,
                              code: ({node, inline, className, children, ...props}: any) => 
                                inline 
                                  ? <code className="bg-black/20 px-1.5 py-0.5 rounded-md text-[13px] font-mono" {...props}>{children}</code>
                                  : <CodeBlock className={className}>{children}</CodeBlock>,
                              ul: ({node, ...props}) => <ul className="list-disc ml-4 my-1" {...props} />,
                              ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-1" {...props} />,
                              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-white/30 pl-3 my-1 italic opacity-90" {...props} />,
                              img: ({node, ...props}) => (
                                <img 
                                  className="max-w-full max-h-[300px] rounded-xl my-2 object-contain bg-black/10 cursor-pointer hover:opacity-90 transition-opacity" 
                                  loading="lazy" 
                                  onClick={() => setGalleryImage(typeof props.src === 'string' ? props.src : null)}
                                  {...props} 
                                />
                              ),
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                          {msg.is_edited && (
                            <span className="text-[9px] opacity-60 ml-2 italic">(edited)</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Reactions Area */}
                    {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                      <div className={`flex flex-wrap gap-1.5 mt-1.5 ${msg.user_id === profile?.id ? 'justify-end' : 'justify-start'}`}>
                        {Object.entries(msg.reactions).map(([emoji, users]: [string, any]) => {
                          const hasReacted = user && users.includes(user.id);
                          const count = users.length;
                          return (
                            <motion.button
                              key={emoji}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              animate={{ scale: count > 3 ? Math.min(1 + (count - 3) * 0.1, 1.4) : 1 }}
                              onClick={() => user && toggleReaction(msg.id, emoji, user.id)}
                              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] border ${
                                hasReacted 
                                  ? 'bg-accent/20 border-accent/50 text-accent' 
                                  : 'bg-secondary/50 border-subtle text-muted hover:bg-tertiary hover:border-subtle/80 hover:text-foreground'
                              } transition-colors text-[13px] font-medium ${count > 3 ? 'shadow-[0_0_15px_rgba(var(--accent),0.3)]' : ''}`}
                            >
                              <span>{emoji}</span>
                              <span>{count}</span>
                            </motion.button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Hover Actions Menu */}
                <div className="absolute top-0 right-4 -translate-y-4 glass-panel rounded-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-5 transition-all duration-300 flex items-center overflow-hidden z-10 shadow-premium border border-subtle">
                  <div className="flex items-center border-r border-white/10 pr-1 mr-1">
                    {['👍', '❤️', '😂', '🔥'].map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => user && toggleReaction(msg.id, emoji, user.id)}
                        className="p-1.5 text-muted hover:text-foreground hover:bg-tertiary hover:scale-110 transition-all"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                    <button 
                      onClick={() => setActiveThreadMsg(msg)}
                      className="p-1.5 text-muted hover:text-accent hover:bg-tertiary hover:scale-110 transition-all ml-1"
                      title="Reply in Thread"
                    >
                      <CornerDownRight size={16} />
                    </button>
                  </div>
                  <button 
                    onClick={(e) => handleContextMenu(e, msg)}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-tertiary transition-colors"
                    title="More"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </div>
              </motion.div>
            )})}
              </motion.div>
            </AnimatePresence>
            {messages.length === 0 && activeChannelId && (
              <div className="m-auto text-muted flex flex-col items-center justify-center h-full">
                <Hash size={48} className="mb-4 opacity-50" />
                <h2 className="text-xl font-bold mb-2">Welcome to #{activeChannel?.name}</h2>
                <p className="text-sm">This is the start of the #{activeChannel?.name} channel.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-0 pb-0 pt-2 z-20 w-full mt-auto">
            <div className="mb-2 h-6 px-6">
              <AnimatePresence>
                {(activeTypingUsers.length > 0 || mockTypingUsers.length > 0) && <TypingIndicator usernames={activeTypingUsers.length > 0 ? activeTypingUsers : mockTypingUsers} />}
              </AnimatePresence>
            </div>
            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="relative group flex justify-center w-full">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
              <div className="relative w-full max-w-[1200px] flex items-center justify-center mx-auto px-6">
                <AnimatePresence>
                  {inputValue.startsWith('/') && (
                    <SlashCommands 
                      query={inputValue} 
                      onSelect={(cmd) => {
                        setInputValue(cmd);
                        inputRef.current?.focus();
                      }} 
                    />
                  )}
                </AnimatePresence>
                <motion.div 
                  layout
                animate={{
                  boxShadow: isInputFocused ? "0 -10px 40px -10px rgba(var(--accent), 0.3)" : "0 -5px 20px -5px rgba(0,0,0,0.2)",
                  width: "100%"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex items-center glass-panel-heavy rounded-t-[24px] rounded-b-none px-6 py-4 transition-all duration-500 overflow-hidden relative border-b-0 ${isInputFocused ? 'border-accent/80' : 'border-white/10'}`}
              >
                {/* Background ambient glow inside input when focused */}
                <div className={`absolute inset-0 bg-accent/5 transition-opacity duration-500 ${isInputFocused ? 'opacity-100' : 'opacity-0'} pointer-events-none`} />
                
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-muted hover:text-foreground transition-colors mr-3"
                >
                  <Paperclip size={20} />
                </button>
                <textarea
                  value={inputValue}
                  onChange={handleInputChange}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = 'auto';
                    target.style.height = Math.min(target.scrollHeight, 200) + 'px';
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  placeholder={`Message #${activeChannel ? activeChannel.name : 'channel'}`}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted resize-none overflow-y-auto min-h-[24px] max-h-[200px] leading-relaxed custom-scrollbar py-1"
                  rows={1}
                  autoFocus
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  disabled={!activeChannelId}
                />
                <div className="flex items-center gap-2 ml-3">
                  <div className="relative">
                    <button 
                      type="button" 
                      ref={emojiButtonRef}
                      onClick={() => setIsEmojiPickerOpen(prev => !prev)}
                      className={`text-muted hover:text-foreground transition-colors p-1.5 rounded-md ${isEmojiPickerOpen ? 'bg-tertiary text-foreground' : 'hover:bg-tertiary'}`}
                    >
                      <Smile size={20} />
                    </button>
                    <EmojiPickerPopover 
                      isOpen={isEmojiPickerOpen} 
                      onClose={() => setIsEmojiPickerOpen(false)} 
                      buttonRef={emojiButtonRef}
                      onEmojiSelect={(emoji) => setInputValue(prev => prev + emoji)}
                    />
                  </div>
                  <Magnetic>
                  <motion.button 
                    type="submit" 
                    whileTap={{ scale: 0.9 }}
                    disabled={!inputValue.trim() || !activeChannelId}
                    className="text-white bg-accent hover:bg-accent-hover transition-colors p-1.5 rounded-lg disabled:opacity-50 disabled:hover:bg-accent flex items-center justify-center"
                  >
                    <Send size={18} />
                  </motion.button>
                  </Magnetic>
                </div>
                </motion.div>
              </div>
            </form>
          </div>
          </div>
          <ThreadDrawer
            message={activeThreadMsg}
            onClose={() => setActiveThreadMsg(null)}
          />
        </div>
      )}
      </AppLayout>

      <UserProfileModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />
      <DeleteMessageModal 
        isOpen={!!deleteModalMessage} 
        onClose={() => setDeleteModalMessage(null)} 
        onConfirm={handleConfirmDelete} 
        message={deleteModalMessage} 
      />
      <MessageContextMenu 
        isOpen={contextMenu.isOpen}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onEdit={() => {
          if (contextMenu.msg) {
            setEditingMessageId(contextMenu.msg.id);
            setEditContent(contextMenu.msg.content);
          }
        }}
        onDelete={() => setDeleteModalMessage(contextMenu.msg)}
        canEditDelete={contextMenu.msg?.user_id === user?.id || workspaces.find(w => w.id === activeChannel?.workspace_id)?.owner_id === user?.id}
        msg={contextMenu.msg}
        onPin={() => {
          if (contextMenu.msg) {
            useMessageStore.getState().togglePin(contextMenu.msg.id, contextMenu.msg.is_pinned || false);
          }
        }}
        onReaction={(emoji) => {
          if (contextMenu.msg && user) {
            useMessageStore.getState().toggleReaction(contextMenu.msg.id, emoji, user.id);
          }
        }}
        onReplyInThread={() => {
          if (contextMenu.msg) {
            setActiveThreadMsg(contextMenu.msg);
          }
        }}
      />
      <PinnedDrawer 
        isOpen={isPinnedDrawerOpen} 
        onClose={() => setIsPinnedDrawerOpen(false)} 
        pinnedMessages={messages.filter(m => m.is_pinned)} 
      />
      <MediaGalleryViewer 
        isOpen={!!galleryImage} 
        onClose={() => setGalleryImage(null)} 
        imageUrl={galleryImage} 
      />
    </>
  );
}
