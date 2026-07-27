import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

interface PresenceState {
  onlineUsers: Record<string, any>;
  typingUsers: Record<string, string[]>; // channelId -> array of user names typing
  initializePresence: (userId: string, username: string) => void;
  setTyping: (channelId: string, username: string, isTyping: boolean) => void;
}

let presenceChannel: any = null;

export const usePresenceStore = create<PresenceState>((set, get) => ({
  onlineUsers: {},
  typingUsers: {},

  initializePresence: (userId: string, username: string) => {
    if (presenceChannel) return;

    presenceChannel = supabase.channel('global_presence');
    
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const activeUsers: Record<string, any> = {};
        
        for (const [key, presencesRaw] of Object.entries(state)) {
          const presences = presencesRaw as any[];
          if (presences.length > 0) {
            const presence = presences[0];
            activeUsers[presence.userId] = presence;
          }
        }
        set({ onlineUsers: activeUsers });
      })
      .on('broadcast', { event: 'typing' }, (payload: any) => {
        const { channelId, username, isTyping } = payload.payload;
        
        set((state) => {
          const currentTyping = state.typingUsers[channelId] || [];
          let newTyping = [...currentTyping];
          
          if (isTyping && !newTyping.includes(username)) {
            newTyping.push(username);
          } else if (!isTyping) {
            newTyping = newTyping.filter(name => name !== username);
          }
          
          return { typingUsers: { ...state.typingUsers, [channelId]: newTyping } };
        });
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track({
            userId,
            username,
            online_at: new Date().toISOString(),
          });
        }
      });
  },

  setTyping: (channelId: string, username: string, isTyping: boolean) => {
    if (presenceChannel) {
      presenceChannel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { channelId, username, isTyping },
      });
    }
  },
}));
