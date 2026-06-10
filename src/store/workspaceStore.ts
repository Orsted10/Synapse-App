import { create } from 'zustand';
import { supabase } from '@/lib/supabase';

export interface Workspace {
  id: string;
  name: string;
  short_name: string;
  icon_url: string | null;
  owner_id: string;
}

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  type: string;
}

export interface Role {
  id: string;
  name: string;
  color: string;
  members: number;
  permissions: {
    admin: boolean;
    manageChannels: boolean;
    sendMessages: boolean;
  };
}

export interface WorkspaceMember {
  id: string;
  username: string;
  status: string;
  avatarLetter: string;
  roles: string[]; // array of role ids
}

interface WorkspaceState {
  workspaces: Workspace[];
  channels: Channel[];
  activeWorkspaceId: string | null;
  activeChannelId: string | null;
  isLoading: boolean;
  
  // Mock Global State for Roles & Members scoped by Workspace
  serverRoles: Record<string, Role[]>;
  serverMembers: Record<string, any[]>;
  setServerRoles: (workspaceId: string, roles: Role[]) => void;
  updateRole: (workspaceId: string, role: Role) => void;
  toggleMemberRole: (workspaceId: string, memberId: string, roleId: string) => void;
  
  setActiveWorkspace: (id: string | null) => void;
  setActiveChannel: (id: string) => void;
  fetchWorkspaces: () => Promise<void>;
  fetchChannels: (workspaceId: string) => Promise<void>;
}

export const DEFAULT_MEMBERS = [
  { id: '1', name: "Ankan (Creator)", roleIds: ["core"], status: "dnd" as const, subtext: "Debugging UI..." },
  { id: '2', name: "Aryan", roleIds: ["core"], status: "online" as const },
  { id: '3', name: "Priya", roleIds: ["mod"], status: "idle" as const },
  { id: '4', name: "Orsted", roleIds: ["everyone"], status: "online" as const, subtext: "Exploring Synapse" },
  { id: '5', name: "Luffy", roleIds: ["everyone"], status: "offline" as const },
  { id: '6', name: "Zoro", roleIds: ["everyone"], status: "dnd" as const, subtext: "Lost again" },
];

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  channels: [],
  activeWorkspaceId: null,
  activeChannelId: null,
  isLoading: false,

  serverRoles: {},
  serverMembers: {},
  
  setServerRoles: (workspaceId, roles) => set((state) => ({ 
    serverRoles: { ...state.serverRoles, [workspaceId]: roles } 
  })),
  
  updateRole: (workspaceId, updatedRole) => set((state) => {
    const workspaceRoles = state.serverRoles[workspaceId] || [];
    return {
      serverRoles: {
        ...state.serverRoles,
        [workspaceId]: workspaceRoles.map(role => role.id === updatedRole.id ? updatedRole : role)
      }
    };
  }),

  toggleMemberRole: (workspaceId, memberId, roleId) => set((state) => {
    const members = state.serverMembers[workspaceId] || DEFAULT_MEMBERS;
    return {
      serverMembers: {
        ...state.serverMembers,
        [workspaceId]: members.map(m => {
          if (m.id === memberId) {
            const hasRole = m.roleIds.includes(roleId);
            const newRoles = hasRole 
              ? m.roleIds.filter((id: string) => id !== roleId)
              : [...m.roleIds, roleId];
            return { ...m, roleIds: newRoles };
          }
          return m;
        })
      }
    };
  }),

  setActiveWorkspace: async (id: string | null) => {
    set({ activeWorkspaceId: id });
    if (id) {
      await get().fetchChannels(id);
    } else {
      set({ channels: [], activeChannelId: null });
    }
  },

  setActiveChannel: (id: string) => set({ activeChannelId: id }),

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    
    // Get workspaces the current user is a member of
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspaces(*)')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching workspaces:', error);
      set({ isLoading: false });
      return;
    }

    // @ts-ignore - Supabase join typing is weird
    const workspaces: Workspace[] = data?.map(d => d.workspaces) || [];
    
    set({ workspaces, isLoading: false });

    if (workspaces.length > 0 && !get().activeWorkspaceId) {
      get().setActiveWorkspace(workspaces[0].id);
    }
  },

  fetchChannels: async (workspaceId: string) => {
    const { data, error } = await supabase
      .from('channels')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching channels:', JSON.stringify(error, null, 2), error.message, error.details, error.hint);
      return;
    }

    set({ channels: data as Channel[] });

    if (data.length > 0) {
      set({ activeChannelId: data[0].id });
    } else {
      set({ activeChannelId: null });
    }
  }
}));
