import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  role: string;
  status: string;
}

interface UserState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  
  initializeAuth: () => void;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  initializeAuth: () => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      set({ user: session?.user ?? null });
      if (session?.user) {
        fetchProfile(session.user.id, set);
      } else {
        set({ isLoading: false });
      }
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null });
      if (session?.user) {
        fetchProfile(session.user.id, set);
      } else {
        set({ profile: null, isLoading: false });
      }
    });
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  }
}));

async function fetchProfile(userId: string, set: any) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (!error && data) {
    set({ profile: data as Profile, isLoading: false });
  } else {
    set({ isLoading: false });
  }
}
