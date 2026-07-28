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
import { usePresenceStore } from "@/store/presenceStore";
import { Tooltip } from "./Tooltip";
import { useRouter } from "next/navigation";
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { CustomCursor } from "./CustomCursor";
import { TiltCard } from "./TiltCard";
import { Magnetic } from "./Magnetic";
import { useHaptics } from "@/hooks/useHaptics";

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
  const { playHover, playClick } = useHaptics();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const { initializePresence } = usePresenceStore();

  useEffect(() => {
    if (!isAuthLoading) {
      if (user === null) {
        router.push('/login');
      } else {
        fetchWorkspaces();
        if (profile?.username) {
          initializePresence(user.id, profile.username);
        }
      }
    }
  }, [user, isAuthLoading, router, fetchWorkspaces, profile, initializePresence]);

  if (isAuthLoading || !user || !profile) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground text-sm font-medium tracking-widest uppercase">Connecting to Synapse...</div>;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen w-screen bg-aurora text-foreground overflow-hidden flex transition-colors duration-500 relative">
        <div className="bg-noise absolute inset-0 pointer-events-none mix-blend-overlay opacity-40 z-50"></div>
        <CustomCursor />
        <Toaster theme="system" position="bottom-right" richColors />
        
        {/* Workspace Sidebar (Floating Dock) */}
      <div className="w-[72px] h-[calc(100vh-32px)] my-auto ml-4 mr-2 rounded-[24px] glass-panel-heavy border border-subtle/50 flex flex-col items-center py-4 gap-3 z-20 shrink-0 shadow-2xl">
        {/* Home Button */}
        <Tooltip content="Direct Messages" side="right">
          <Magnetic>
          <TiltCard
            onMouseEnter={playHover}
            onClick={() => { playClick(); setActiveWorkspace(null); }}
            className={`w-12 h-12 flex items-center justify-center transition-all duration-300 group relative ${
              !activeWorkspaceId 
                ? "bg-accent text-white rounded-[12px] shadow-[0_0_20px_rgba(var(--accent),0.5)]" 
                : "bg-secondary/50 text-foreground hover:bg-accent hover:text-white hover:rounded-[12px] rounded-[16px] glowing-border"
            }`}
          >
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 12l2.9 2.9L12 7.8l7.1 7.1L22 12 12 2z" />
                <path d="M4 14v7a1 1 0 001 1h14a1 1 0 001-1v-7" />
              </svg>
            </div>
            {/* Active Pill Indicator */}
            {!activeWorkspaceId && (
              <div className="absolute -left-3 top-1 w-2 h-10 bg-accent rounded-r-full shadow-[0_0_10px_rgba(var(--accent),0.8)]" />
            )}
            <div className={`absolute -left-3 top-3.5 w-2 h-5 bg-foreground/50 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${!activeWorkspaceId ? 'hidden' : ''}`} />
          </TiltCard>
          </Magnetic>
        </Tooltip>

        <div className="w-8 h-[2px] bg-subtle/50 rounded-full mx-auto" />

        {workspaces.map((ws) => (
          <Tooltip key={ws.id} content={ws.name} side="right">
            <Magnetic>
            <TiltCard
              onMouseEnter={playHover}
              onClick={() => { playClick(); setActiveWorkspace(ws.id); }}
              className={`w-12 h-12 flex items-center justify-center font-bold text-sm transition-all duration-300 premium-shadow group relative ${
                activeWorkspaceId === ws.id 
                  ? "bg-accent text-white rounded-[12px] shadow-[0_0_20px_rgba(var(--accent),0.5)]" 
                  : "bg-secondary/50 text-foreground hover:bg-accent hover:text-white hover:rounded-[12px] rounded-[16px] glowing-border"
              }`}
            >
              <div className="w-full h-full flex items-center justify-center overflow-hidden rounded-[inherit]">
                {ws.icon_url ? (
                  <img src={ws.icon_url} alt={ws.name} className="w-full h-full object-cover" />
                ) : (
                  ws.name.substring(0, 2).toUpperCase()
                )}
              </div>
              
              {/* Active Pill Indicator */}
              {activeWorkspaceId === ws.id && (
                <div className="absolute -left-3 top-1 w-2 h-10 bg-accent rounded-r-full shadow-[0_0_10px_rgba(var(--accent),0.8)]" />
              )}
              <div className={`absolute -left-3 top-3.5 w-2 h-5 bg-foreground/50 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100 ${activeWorkspaceId === ws.id ? 'hidden' : ''}`} />
            </TiltCard>
            </Magnetic>
          </Tooltip>
        ))}
        
        {/* Add Workspace Button */}
        <Tooltip content="Add a Server" side="right">
          <Magnetic pullFactor={0.5}>
          <button 
            onMouseEnter={playHover}
            onClick={() => { playClick(); setIsCreateModalOpen(true); }}
            className="w-12 h-12 rounded-[16px] bg-secondary/50 text-green-500 hover:bg-green-500 hover:text-white flex items-center justify-center transition-all duration-300 group relative glowing-border"
          >
            <Plus size={24} />
            <div className="absolute -left-3 w-2 h-5 bg-foreground/50 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100" />
          </button>
          </Magnetic>
        </Tooltip>

        {/* Bottom actions (Theme) */}
        <div className="mt-auto">
          <ThemeSwitcher />
        </div>
      </div>

      {/* Main Content Split */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Inner Sidebar (Channels) - Only show if in a workspace */}
        {activeWorkspaceId && (
          <div className="w-[240px] h-[calc(100vh-32px)] my-auto mr-4 rounded-[24px] glass-panel border border-subtle/50 flex flex-col shrink-0 relative z-10 overflow-hidden shadow-2xl">
            {/* Workspace Header */}
            <div 
              onClick={() => setIsServerSettingsModalOpen(true)}
              className="h-14 border-b border-subtle/50 flex items-center justify-between px-4 font-bold hover:bg-white/5 cursor-pointer transition-colors shadow-sm z-10 shrink-0 group"
            >
              <span className="truncate">{workspaces.find(w => w.id === activeWorkspaceId)?.name}</span>
              <Settings size={16} className="text-muted group-hover:text-foreground transition-colors" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
              <div className="mb-2 px-2 flex items-center justify-between text-muted mt-2">
                <span className="text-xs font-bold uppercase tracking-wider">Text Channels</span>
                <button 
                  onClick={() => setIsCreateChannelModalOpen(true)}
                  className="hover:text-foreground transition-colors p-1 bg-white/0 hover:bg-white/10 rounded-full"
                >
                  <Plus size={16} />
                </button>
              </div>
              {channels.map((channel) => {
                const isActive = activeChannelId === channel.id;
                const Icon = channel.type === 'voice' ? Volume2 : Hash;
                return (
                  <TiltCard key={channel.id} className="w-full mb-0.5">
                    <button
                      onClick={() => setActiveChannel(channel.id)}
                      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg font-medium text-[15px] transition-all duration-200 group relative overflow-hidden ${
                        isActive
                          ? "bg-white/10 text-foreground shadow-sm"
                          : "text-muted hover:bg-white/5 hover:text-foreground"
                      }`}
                    >
                      {isActive && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent/80 rounded-r shadow-[0_0_8px_rgba(var(--accent),0.8)]" />
                      )}
                      <Icon size={20} className="shrink-0 opacity-80" />
                      <span className="truncate">{channel.name}</span>
                    </button>
                  </TiltCard>
                );
              })}
            </div>

            {/* Profile Block - ALWAYS visible at the bottom of the inner sidebar */}
            <TiltCard className="absolute bottom-0 w-full">
            <div className="w-full h-[70px] bg-black/10 backdrop-blur-xl border-t border-white/5 flex items-center justify-between px-3 shrink-0 z-20">
              <div 
                className="flex items-center gap-3 flex-1 overflow-hidden cursor-pointer hover:bg-white/10 p-2 rounded-xl transition-colors group"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300">
                  {profile.username ? profile.username.substring(0, 1).toUpperCase() : '?'}
                </div>
                <div className="flex flex-col truncate">
                  <span className="font-bold text-[14px] leading-tight truncate">{profile.username}</span>
                  <span className="text-xs text-muted leading-tight truncate">{profile.status}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 shrink-0 ml-1">
                <Tooltip content="User Settings">
                  <button 
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="p-2 text-muted hover:text-foreground hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Settings size={18} />
                  </button>
                </Tooltip>
              </div>
            </div>
            </TiltCard>
          </div>
        )}

        {!activeWorkspaceId && (
          // Home Sidebar
          <div className="w-[240px] h-[calc(100vh-32px)] my-auto mr-4 rounded-[24px] glass-panel border border-subtle/50 flex flex-col shrink-0 relative z-10 overflow-hidden shadow-2xl">
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
              <TiltCard className="flex-1">
                <div className="flex items-center gap-3 w-full overflow-hidden cursor-pointer hover:bg-secondary p-2 rounded-md transition-colors">
                  <div className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center font-bold shrink-0">
                    {profile.username ? profile.username.substring(0, 1).toUpperCase() : '?'}
                  </div>
                  <div className="flex flex-col truncate">
                    <span className="font-bold text-[14px] leading-tight truncate">{profile.username}</span>
                    <span className="text-xs text-muted leading-tight truncate">{profile.status}</span>
                  </div>
                </div>
              </TiltCard>
              
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
    </TooltipProvider>
  );
}
