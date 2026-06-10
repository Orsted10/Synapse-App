"use client";

import React, { useEffect, useState } from "react";
import { Hash, Volume2, Plus, Settings } from "lucide-react";
import { ThemeSwitcher } from "./ThemeSwitcher";
import { RightSidebar } from "./RightSidebar";
import { CreateWorkspaceModal } from "./CreateWorkspaceModal";
import { SettingsModal } from "./SettingsModal";
import { ServerSettingsModal } from "./ServerSettingsModal";
import { CreateChannelModal } from "./CreateChannelModal";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { useUserStore } from "@/store/userStore";
import { useRouter } from "next/navigation";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, profile, isLoading: isAuthLoading, initializeAuth } = useUserStore();
  const { 
    workspaces, 
    channels, 
    activeWorkspaceId, 
    activeChannelId, 
    setActiveWorkspace, 
    setActiveChannel,
    fetchWorkspaces 
  } = useWorkspaceStore();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isServerSettingsModalOpen, setIsServerSettingsModalOpen] = useState(false);
  const [isCreateChannelModalOpen, setIsCreateChannelModalOpen] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    if (!isAuthLoading) {
      if (user === null) {
        router.push('/login');
      } else {
        fetchWorkspaces();
      }
    }
  }, [user, isAuthLoading, router, fetchWorkspaces]);

  if (isAuthLoading || !user || !profile) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground text-sm font-medium tracking-widest uppercase">Connecting to Synapse...</div>;
  }

  return (
    <div className="h-screen w-screen bg-background text-foreground overflow-hidden flex transition-colors duration-300">
      
      {/* Workspace Sidebar (Far Left) */}
      <div className="w-[72px] h-full bg-tertiary flex flex-col items-center py-4 gap-3 border-r border-subtle z-20 shrink-0">
        {/* Home Button */}
        <button
          onClick={() => setActiveWorkspace(null)}
          className={`w-12 h-12 rounded-[16px] flex items-center justify-center transition-all duration-200 group relative ${
            !activeWorkspaceId 
              ? "bg-accent text-white rounded-[12px]" 
              : "bg-secondary text-foreground hover:bg-accent hover:text-white hover:rounded-[12px]"
          }`}
        >
          <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 12l2.9 2.9L12 7.8l7.1 7.1L22 12 12 2z" />
            <path d="M4 14v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
          </svg>
          {/* Active Pill Indicator */}
          {!activeWorkspaceId && (
            <div className="absolute -left-1 w-2 h-10 bg-accent rounded-r-full" />
          )}
          <div className={`absolute -left-1 w-2 h-5 bg-foreground rounded-r-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${!activeWorkspaceId ? 'hidden' : ''}`} />
        </button>

        <div className="w-8 h-[2px] bg-subtle rounded-full mx-auto" />

        {workspaces.map((ws) => (
          <button
            key={ws.id}
            onClick={() => setActiveWorkspace(ws.id)}
            className={`w-12 h-12 rounded-[16px] flex items-center justify-center font-bold text-sm transition-all duration-200 premium-shadow group relative ${
              activeWorkspaceId === ws.id 
                ? "bg-accent text-white rounded-[12px]" 
                : "bg-secondary text-foreground hover:bg-accent hover:text-white hover:rounded-[12px]"
            }`}
          >
            {ws.icon_url ? (
              <img src={ws.icon_url} alt={ws.name} className="w-full h-full rounded-[inherit] object-cover" />
            ) : (
              ws.short_name
            )}
            {/* Active Pill Indicator */}
            {activeWorkspaceId === ws.id && (
              <div className="absolute -left-1 w-2 h-10 bg-accent rounded-r-full" />
            )}
            <div className={`absolute -left-1 w-2 h-5 bg-foreground rounded-r-full transition-all duration-200 opacity-0 group-hover:opacity-100 ${activeWorkspaceId === ws.id ? 'hidden' : ''}`} />
          </button>
        ))}
        
        {/* Add Workspace Button */}
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="w-12 h-12 rounded-[16px] bg-secondary text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all duration-200 group relative"
        >
          <Plus size={24} />
          <div className="absolute -left-1 w-2 h-5 bg-foreground rounded-r-full transition-all duration-200 opacity-0 group-hover:opacity-100" />
        </button>

        {/* Bottom actions (Theme) */}
        <div className="mt-auto">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Inner Sidebar (Channels) - Only show if in a workspace */}
        {activeWorkspaceId && (
          <div className="w-[240px] bg-secondary border-r border-subtle flex flex-col shrink-0 relative">
            {/* Workspace Header */}
            <div 
              onClick={() => setIsServerSettingsModalOpen(true)}
              className="h-14 border-b border-subtle flex items-center justify-between px-4 font-bold hover:bg-tertiary cursor-pointer transition-colors shadow-sm z-10 shrink-0 group"
            >
              <span className="truncate">{workspaces.find(w => w.id === activeWorkspaceId)?.name}</span>
              <Settings size={16} className="text-muted group-hover:text-foreground transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <div className="mb-2 px-2 flex items-center justify-between text-muted mt-2">
                <span className="text-xs font-bold uppercase tracking-wider">Text Channels</span>
                <button 
                  onClick={() => setIsCreateChannelModalOpen(true)}
                  className="hover:text-foreground transition-colors p-1"
                >
                  <Plus size={16} />
                </button>
              </div>
              {channels.map((channel) => {
                const isActive = activeChannelId === channel.id;
                const Icon = channel.type === 'voice' ? Volume2 : Hash;
                return (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium text-[15px] transition-all group ${
                      isActive 
                        ? "bg-accent/15 text-accent" 
                        : "text-muted hover:bg-tertiary hover:text-foreground"
                    }`}
                  >
                    <Icon size={18} className={isActive ? "text-accent" : "text-muted group-hover:text-foreground"} />
                    <span className="truncate">{channel.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Profile Block - ALWAYS visible at the bottom of the inner sidebar */}
            <div className="absolute bottom-0 w-full h-[70px] bg-tertiary border-t border-subtle flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer hover:bg-secondary p-2 rounded-md transition-colors">
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold shrink-0">
                  {profile.username ? profile.username.substring(0, 1).toUpperCase() : '?'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-[14px] leading-tight truncate">{profile.username}</span>
                  <span className="text-xs text-muted leading-tight truncate">{profile.status}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {!activeWorkspaceId && (
          // Home Sidebar
          <div className="w-[240px] bg-secondary border-r border-subtle flex flex-col shrink-0 relative">
            <div className="h-14 border-b border-subtle flex items-center px-4 z-10 shrink-0">
              <button className="w-full bg-tertiary text-muted hover:bg-tertiary hover:text-foreground text-sm font-medium px-3 py-1.5 rounded-md text-left transition-colors border border-subtle shadow-inner">
                Find or start a conversation
              </button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-[2px]">
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-[15px] bg-accent/15 text-accent transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87" />
                  <path d="M16 3.13a4 4 0 010 7.75" />
                </svg>
                Friends
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-bold text-[15px] text-muted hover:bg-tertiary hover:text-foreground transition-all">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 12l-4-4-4 4" />
                  <path d="M12 16V8" />
                </svg>
                Nitro
              </button>
            </div>

            {/* Profile Block - ALWAYS visible at the bottom of the inner sidebar */}
            <div className="absolute bottom-0 w-full h-[70px] bg-tertiary border-t border-subtle flex items-center justify-between px-3 shrink-0">
              <div className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer hover:bg-secondary p-2 rounded-md transition-colors">
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold shrink-0">
                  {profile.username ? profile.username.substring(0, 1).toUpperCase() : '?'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-[14px] leading-tight truncate">{profile.username}</span>
                  <span className="text-xs text-muted leading-tight truncate">{profile.status}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <button 
                  onClick={() => setIsSettingsModalOpen(true)}
                  className="p-2 text-muted hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                >
                  <Settings size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 h-full flex flex-col bg-background relative z-10 min-w-0">
          {children}
        </div>

        {/* Dynamic Right Sidebar (Active Now / Member List) */}
        <RightSidebar />
      </div>

      <CreateWorkspaceModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
      />

      <SettingsModal 
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />
      {activeWorkspaceId && (
        <ServerSettingsModal 
          isOpen={isServerSettingsModalOpen}
          onClose={() => setIsServerSettingsModalOpen(false)}
          workspaceId={activeWorkspaceId}
        />
      )}

      {activeWorkspaceId && (
        <CreateChannelModal 
          isOpen={isCreateChannelModalOpen}
          onClose={() => setIsCreateChannelModalOpen(false)}
          workspaceId={activeWorkspaceId}
        />
      )}

    </div>
  );
}
