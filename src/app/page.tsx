"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Hash, Send, Smile, Paperclip, Users, MessageSquare, Volume2 } from "lucide-react";
import { useMessageStore } from "@/store/messageStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUserStore } from "@/store/userStore";
import { usePresenceStore } from "@/store/presenceStore";
import { UserProfileModal } from "@/components/UserProfileModal";
import { DeleteMessageModal } from "@/components/DeleteMessageModal";
import { MessageContextMenu } from "@/components/MessageContextMenu";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { supabase } from "@/lib/supabase";
import { useRef } from "react";

export default function Home() {
  const { activeWorkspaceId, activeChannelId, channels } = useWorkspaceStore();
  const { messages, fetchMessages, sendMessage, updateMessage, deleteMessage, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputValue, setInputValue] = useState("");
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
        {/* Top Header */}
        <div className="h-14 border-b border-subtle flex items-center px-6 shrink-0 bg-background/80 backdrop-blur-md z-10 sticky top-0 shadow-sm">
          <div className="flex items-center gap-6">
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
      {/* Top Header */}
      <div className="h-14 border-b border-subtle flex items-center justify-between px-6 shrink-0 bg-background/80 backdrop-blur-md z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Hash size={22} className="text-muted" />
          <div className="flex items-center gap-3">
            <span className="font-bold text-[16px]">{activeChannel ? activeChannel.name : 'Select a channel'}</span>
          </div>
        </div>
      </div>

      {activeChannel?.type === 'voice' ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-secondary/30">
          <div className="bg-tertiary p-8 rounded-2xl shadow-xl flex flex-col items-center max-w-md w-full border border-subtle">
            <div className="w-24 h-24 bg-accent/20 text-accent rounded-full flex items-center justify-center mb-6 shadow-[0_0_40px_rgba(var(--accent),0.3)]">
              <Volume2 size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-foreground">#{activeChannel.name}</h2>
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
          <div className="flex-1 overflow-y-auto px-6 py-6 custom-scrollbar flex flex-col gap-6">
            {messages.map((msg, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                key={msg.id} 
                onContextMenu={(e) => handleContextMenu(e, msg)}
                className={`flex gap-4 group relative hover:bg-tertiary/30 -mx-4 px-4 py-1 rounded-md transition-colors ${contextMenu.isOpen && contextMenu.msg?.id === msg.id ? 'bg-tertiary/30' : ''}`}
              >
                {/* Avatar */}
                <div 
                  onClick={() => handleUserClick(msg.user)}
                  className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center font-bold text-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity mt-1 ${
                    msg.user?.role === 'Creator' ? 'bg-accent' : 'bg-tertiary text-foreground'
                  }`}
                >
                  {msg.user?.username ? msg.user.username.substring(0, 1).toUpperCase() : '?'}
                </div>

                <div className="flex flex-col w-full max-w-[85%]">
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-1">
                    <span 
                      onClick={() => handleUserClick(msg.user)}
                      className="font-bold text-[15px] hover:underline cursor-pointer"
                    >
                      {msg.user?.username || 'Unknown User'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent/10 text-accent font-semibold tracking-wide">
                      {msg.user?.role || 'Member'}
                    </span>
                    <span className="text-xs text-muted ml-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                    </span>
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
                </div>

                {/* Hover Actions (Ellipsis Menu) */}
                <div className="absolute top-0 right-4 -translate-y-2 bg-secondary border border-subtle rounded-md shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center overflow-hidden z-10">
                  <button 
                    onClick={(e) => handleContextMenu(e, msg)}
                    className="p-1.5 text-muted hover:text-foreground hover:bg-tertiary transition-colors"
                    title="More"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                  </button>
                </div>
              </motion.div>
            ))}
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
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                className="hidden" 
                accept="image/*"
              />
              <div className="flex items-center bg-secondary/80 hover:bg-secondary transition-colors rounded-[16px] px-4 py-3 border border-subtle focus-within:border-accent shadow-sm">
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
                  <button 
                    type="submit" 
                    disabled={!inputValue.trim() || !activeChannelId}
                    className="text-white bg-accent hover:bg-accent-hover transition-colors p-1.5 rounded-lg disabled:opacity-50 disabled:hover:bg-accent"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
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
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        position={{ x: contextMenu.x, y: contextMenu.y }}
        onEdit={() => handleStartEdit(contextMenu.msg)}
        onDelete={(e) => handleDeleteClick(contextMenu.msg, e)}
        canEditDelete={Boolean(user && contextMenu.msg?.user_id === user?.id)}
      />
    </>
  );
}
