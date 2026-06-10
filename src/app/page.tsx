"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Hash, Send, Smile, Paperclip, Users, MessageSquare } from "lucide-react";
import { useMessageStore } from "@/store/messageStore";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUserStore } from "@/store/userStore";
import { UserProfileModal } from "@/components/UserProfileModal";
import { DeleteMessageModal } from "@/components/DeleteMessageModal";
import { MessageContextMenu } from "@/components/MessageContextMenu";

export default function Home() {
  const { activeWorkspaceId, activeChannelId, channels } = useWorkspaceStore();
  const { messages, fetchMessages, sendMessage, updateMessage, deleteMessage, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
  const [inputValue, setInputValue] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const { user } = useUserStore();

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !activeChannelId) return;

    await sendMessage(activeChannelId, inputValue);
    setInputValue("");
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
                <div className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {msg.content}
                  {msg.is_edited && <span className="text-[10px] text-muted ml-1 select-none">(edited)</span>}
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
      <div className="shrink-0 px-6 pb-6 pt-2">
        <form onSubmit={handleSendMessage} className="relative">
          <div className="flex items-center bg-secondary/80 hover:bg-secondary transition-colors rounded-[16px] px-4 py-3 border border-subtle focus-within:border-accent shadow-sm">
            <button 
              type="button" 
              onClick={() => alert('File upload coming in Phase 6!')}
              className="text-muted hover:text-foreground transition-colors mr-3"
            >
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
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
        canEditDelete={user && contextMenu.msg?.user_id === user?.id}
      />
    </>
  );
}
