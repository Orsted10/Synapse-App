import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { Profile } from './userStore';

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  content: string;
  created_at: string;
  is_edited: boolean;
  is_pinned?: boolean;
  reactions?: Record<string, string[]>; // { '👍': ['user_id_1', 'user_id_2'] }
  user?: Profile; // Populated by join
}

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  
  fetchMessages: (channelId: string) => Promise<void>;
  sendMessage: (channelId: string, content: string) => Promise<void>;
  updateMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  toggleReaction: (messageId: string, emoji: string, userId: string) => Promise<void>;
  togglePin: (messageId: string, currentPinState: boolean) => Promise<void>;
  subscribeToMessages: (channelId: string) => void;
  unsubscribeFromMessages: () => void;
}

let messageSubscription: any = null;

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  isLoading: false,

  fetchMessages: async (channelId: string) => {
    set({ isLoading: true });
    
    // Fetch messages with user profiles
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        user:users(*)
      `)
      .eq('channel_id', channelId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      set({ messages: data as unknown as Message[], isLoading: false });
    } else {
      console.error(error);
      set({ isLoading: false });
    }
  },

  sendMessage: async (channelId: string, content: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('users').select('*').eq('id', user.id).single();
    
    // Optimistic UI Insert
    const tempId = `temp-${Date.now()}`;
    const newMsg: Message = {
      id: tempId,
      channel_id: channelId,
      user_id: user.id,
      content,
      created_at: new Date().toISOString(),
      is_edited: false,
      user: profile,
    };

    set((state) => ({ messages: [...state.messages, newMsg] }));

    await supabase.from('messages').insert({
      channel_id: channelId,
      user_id: user.id,
      content,
    });
  },

  updateMessage: async (messageId: string, newContent: string) => {
    set((state) => ({
      messages: state.messages.map(msg => 
        msg.id === messageId ? { ...msg, content: newContent, is_edited: true } : msg
      )
    }));

    await supabase.from('messages').update({
      content: newContent,
      is_edited: true
    }).eq('id', messageId);
  },

  deleteMessage: async (messageId: string) => {
    set((state) => ({
      messages: state.messages.filter(msg => msg.id !== messageId)
    }));
    await supabase.from('messages').delete().eq('id', messageId);
  },

  toggleReaction: async (messageId: string, emoji: string, userId: string) => {
    let currentReactions = {};
    set((state) => {
      const messages = state.messages.map(msg => {
        if (msg.id === messageId) {
          const reactions = { ...(msg.reactions || {}) };
          const userList = reactions[emoji] || [];
          if (userList.includes(userId)) {
            reactions[emoji] = userList.filter(id => id !== userId);
            if (reactions[emoji].length === 0) delete reactions[emoji];
          } else {
            reactions[emoji] = [...userList, userId];
          }
          currentReactions = reactions;
          return { ...msg, reactions };
        }
        return msg;
      });
      return { messages };
    });

    await supabase.from('messages').update({ reactions: currentReactions }).eq('id', messageId);
  },

  togglePin: async (messageId: string, currentPinState: boolean) => {
    set((state) => ({
      messages: state.messages.map(msg => 
        msg.id === messageId ? { ...msg, is_pinned: !currentPinState } : msg
      )
    }));
    await supabase.from('messages').update({ is_pinned: !currentPinState }).eq('id', messageId);
  },

  subscribeToMessages: (channelId: string) => {
    get().unsubscribeFromMessages();

    messageSubscription = supabase
      .channel('public:messages')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'messages',
        filter: `channel_id=eq.${channelId}`
      }, async (payload) => {
        
        if (payload.eventType === 'INSERT') {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', payload.new.user_id)
            .single();

          const newMsg = { ...payload.new, user: userData } as Message;
          
          set((state) => {
            // Remove optimistic temp message with same content
            const filtered = state.messages.filter(m => !(m.id.toString().startsWith('temp-') && m.content === newMsg.content));
            if (filtered.some(m => m.id === newMsg.id)) return { messages: filtered };
            return { messages: [...filtered, newMsg] };
          });
        } 
        
        else if (payload.eventType === 'UPDATE') {
          set((state) => ({
            messages: state.messages.map(msg => 
              msg.id === payload.new.id 
                ? { ...msg, content: payload.new.content, is_edited: payload.new.is_edited } 
                : msg
            )
          }));
        } 
        
        else if (payload.eventType === 'DELETE') {
          set((state) => ({
            messages: state.messages.filter(msg => msg.id !== payload.old.id)
          }));
        }

      })
      .subscribe();
  },

  unsubscribeFromMessages: () => {
    if (messageSubscription) {
      supabase.removeChannel(messageSubscription);
      messageSubscription = null;
    }
  }
}));
