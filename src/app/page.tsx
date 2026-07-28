"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Hash, Send, Smile, Paperclip, Users, MessageSquare, Volume2, Pin } from "lucide-react";
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
import { ScrambleText } from "@/components/ScrambleText";
import { StaggerText } from "@/components/StaggerText";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function Home() {
  const { activeWorkspaceId, activeChannelId, channels, workspaces } = useWorkspaceStore();
  const { messages, fetchMessages, sendMessage, updateMessage, deleteMessage, toggleReaction, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { user, profile } = useUserStore();
  const { typingUsers, setTyping } = usePresenceStore();

  // Modal and Context Menu State
  const [deleteModalMessage, setDeleteModalMessage] = useState<any>(null);
  const [contextMenu, setContextMenu] = useState<{ isOpen: boolean; x: number; y: number; msg: any }>({ 
    isOpen: false, x: 0, y: 0, msg: null 
  });

  useEffect(() => {
    if (activeChannelId) {
      fetchMessages(activeChannelId);
      subscribeToMessages(activeChannelId);
    }
    return () => {
      unsubscribeFromMessages();
    };
  }, [activeChannelId, fetchMessages, subscribeToMessages, unsubscribeFromMessages]);

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeTypingUsers = activeChannelId ? (typingUsers[activeChannelId] || []).filter(name => name !== profile?.username) : [];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <div className="absolute top-4 left-1/2 -translate-x-1/2 h-14 border border-white/10 rounded-full flex items-center justify-between px-6 shrink-0 glass-panel-heavy z-50 shadow-2xl transition-all duration-500 hover:w-[55%] w-[50%] min-w-[400px]">
        <div className="flex items-center gap-3">
          <Hash size={22} className="text-muted" />
          <div className="flex items-center gap-3">
            <span className="font-bold text-[18px] tracking-wide text-gradient-animated">
              {activeChannel ? <ScrambleText text={activeChannel.name} /> : 'Select a channel'}
            </span>
          </div>
        </div>
        {activeChannel && (
          <div className="flex items-center gap-4 text-muted">
            <button className="hover:text-foreground transition-colors" title="Pinned Messages" onClick={() => toast.info('Pinned Messages Drawer coming in Phase 10 part 2!')}>
              <Pin size={20} />
            </button>
            <button className="hover:text-foreground transition-colors" title="Member List">
              <Users size={20} />
            </button>
          </div>
        )}
      </div>

      {activeChannel?.type === 'voice' ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30">
          <div className="bg-tertiary p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-md w-full border border-subtle relative overflow-hidden">
            <div className="absolute inset-0 bg-noise mix-blend-overlay opacity-30 pointer-events-none" />
            <div className="w-24 h-24 bg-accent/10 rounded-full flex items-end justify-center mb-6 shadow-[0_0_50px_rgba(var(--accent),0.2)] overflow-hidden gap-1 pb-4 relative z-10">
              {[...Array(5)].map((_, i) => (
                <motion.div 
                  key={i} 
                  animate={{ height: [20, 60, 30, 70, 20] }} 
                  transition={{ repeat: Infinity, duration: 1 + i * 0.2, ease: "easeInOut" }}
                  className="w-2 bg-accent rounded-full" 
                />
              ))}
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground relative z-10">
              <ScrambleText text={`# ${activeChannel.name}`} />
            </h2>
            <p className="text-muted text-center mb-8">
              Voice channels are currently in development. You will be able to connect and talk with your friends here soon!
            </p>
            <button className="bg-accent text-white px-8 py-3 rounded-full font-bold hover:bg-accent-hover transition-colors shadow-lg shadow-accent/20">
              Join Voice
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Message Log Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar flex flex-col gap-6 relative">
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
                key={msg.id} 
                onContextMenu={(e) => handleContextMenu(e, msg)}
                className={`group relative hover:bg-white/5 hover:backdrop-blur-md -mx-4 rounded-2xl transition-all duration-300 ${contextMenu.isOpen && contextMenu.msg?.id === msg.id ? 'bg-white/5 backdrop-blur-md shadow-lg' : ''}`}
              >
                <TiltCard className="w-full h-full rounded-[inherit]">
                  <SpotlightCard className="w-full h-full flex gap-4 px-4 py-2 rounded-[inherit]">
                  {/* Avatar */}
                  <div 
                    onClick={() => handleUserClick(msg.user)}
                    className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-white shadow-sm cursor-pointer hover:scale-110 transition-transform mt-1 z-10 relative"
                    style={{
                      backgroundColor: userColor,
                      boxShadow: `0 0 20px ${userColor}60, inset 0 0 10px rgba(255,255,255,0.2)`
                    }}
                  >
                    {msg.user?.username ? msg.user.username.substring(0, 1).toUpperCase() : '?'}
                  </div>

                  <div className="flex flex-col w-full max-w-[85%] z-10">
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      onClick={() => handleUserClick(msg.user)}
                      className="font-bold text-[15px] hover:underline cursor-pointer tracking-wide"
                      style={{ color: userColor }}
                    >
                      <StaggerText text={msg.user?.username || 'Unknown User'} />
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold tracking-wide border border-accent/20">
                      {msg.user?.role || 'Member'}
                    </span>
                    <span className="text-xs text-muted ml-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
                    {msg.is_pinned && (
                      <span className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1 ml-1 bg-accent/10 px-1.5 py-0.5 rounded">
                        📌 Pinned
                      </span>
                    )}
                  </div>
                  
                  {/* Message Content */}
                  {editingMessageId === msg.id ? (
                    <div className="mt-1 relative">
                      <input
                        type="text"
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, msg.id)}
                        className="w-full bg-secondary text-foreground border border-subtle focus:border-accent outline-none px-3 py-2 rounded-lg"
                        autoFocus
                      />
                      <span className="text-[10px] text-muted absolute -bottom-5 left-0">
                        escape to <span className="text-accent cursor-pointer hover:underline" onClick={() => setEditingMessageId(null)}>cancel</span> • enter to <span className="text-accent cursor-pointer hover:underline" onClick={() => handleSaveEdit(msg.id)}>save</span>
                      </span>
                    </div>
                  ) : (
                    <div className="text-[15px] leading-relaxed text-foreground/90 markdown-content">
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({node, ...props}) => <p className="mb-1 last:mb-0 inline-block" {...props} />,
                          a: ({node, ...props}) => <a className="text-accent hover:underline" target="_blank" rel="noreferrer" {...props} />,
                          code: ({node, inline, ...props}: any) => 
                            inline 
                              ? <code className="bg-secondary px-1.5 py-0.5 rounded-md text-[13px] font-mono text-accent" {...props} />
                              : <pre className="bg-secondary p-3 rounded-md my-2 overflow-x-auto"><code className="text-[13px] font-mono" {...props} /></pre>,
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 my-1" {...props} />,
                          ol: ({node, ...props}) => <ol className="list-decimal ml-4 my-1" {...props} />,
                          blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-subtle pl-3 my-1 italic text-muted" {...props} />,
                          img: ({node, ...props}) => <img className="max-w-full max-h-[300px] rounded-lg my-2 object-contain bg-secondary/50" loading="lazy" {...props} />,
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {msg.is_edited && <span className="text-[10px] text-muted ml-1 select-none inline-block">(edited)</span>}
                    </div>
                  )}
                  {/* Reactions Area */}
                  {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {Object.entries(msg.reactions).map(([emoji, users]) => {
                        const hasReacted = user && users.includes(user.id);
                        return (
                          <button
                            key={emoji}
                            onClick={() => user && toggleReaction(msg.id, emoji, user.id)}
                            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[6px] border ${
                              hasReacted 
                                ? 'bg-accent/20 border-accent/50 text-accent' 
                                : 'bg-secondary/50 border-subtle text-muted hover:bg-tertiary hover:border-subtle/80 hover:text-foreground'
                            } transition-colors text-[13px] font-medium`}
                          >
                            <span>{emoji}</span>
                            <span>{users.length}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Hover Actions Menu */}
                <div className="absolute top-0 right-4 -translate-y-4 glass-panel rounded-xl opacity-0 group-hover:opacity-100 group-hover:-translate-y-5 transition-all duration-300 flex items-center overflow-hidden z-10">
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
                  </div>
                  <button 
                    onClick={(e) => handleContextMenu(e, msg)}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-tertiary transition-colors"
                    title="More"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </div>
                  </SpotlightCard>
                </TiltCard>
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
          </div>

          {/* Input Area */}
          <div className="shrink-0 px-6 pb-6 pt-2 relative">
            {activeTypingUsers.length > 0 && (
              <div className="absolute -top-4 left-6 text-xs text-accent font-medium flex items-center gap-2">
                <span className="flex gap-1">
                  <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                  <motion.span animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-1.5 h-1.5 bg-accent rounded-full" />
                </span>
                {activeTypingUsers.join(', ')} {activeTypingUsers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}
            <form onSubmit={handleSendMessage} className="relative group">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
              <motion.div 
                layout
                animate={{
                  y: isInputFocused ? -20 : 0,
                  scale: isInputFocused ? 1.05 : 1,
                  boxShadow: isInputFocused ? "0 40px 80px -20px rgba(var(--accent), 0.6)" : "0 10px 40px -10px rgba(0,0,0,0.3)",
                  width: isInputFocused ? "100%" : "85%",
                  margin: "0 auto"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                className={`flex items-center glass-panel-heavy rounded-[32px] px-6 py-4 transition-all duration-500 overflow-hidden relative ${isInputFocused ? 'border-accent/80' : 'border-white/10'}`}
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
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={`Message #${activeChannel ? activeChannel.name : 'channel'}`}
                  className="flex-1 bg-transparent border-none outline-none text-foreground placeholder:text-muted"
                  autoFocus
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  disabled={!activeChannelId}
                />
                <div className="flex items-center gap-2 ml-3">
                  <button 
                    type="button" 
                    onClick={() => alert('Emoji picker coming in Phase 6!')}
                    className="text-muted hover:text-foreground transition-colors p-1.5 hover:bg-tertiary rounded-md"
                  >
                    <Smile size={20} />
                  </button>
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
            </form>
          </div>
        </>
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
      />
    </>
  );
}
