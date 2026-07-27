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
  permissions: {
    admin: boolean;
    manageChannels: boolean;
    sendMessages: boolean;
  };
  priority: number;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  username: string; // from auth.users via join or fetch
  avatar_url?: string;
  roleIds: string[]; // parsed from role_ids JSONB
}

interface WorkspaceState {
  workspaces: Workspace[];
  channels: Channel[];
  activeWorkspaceId: string | null;
  activeChannelId: string | null;
  isLoading: boolean;
  
  // Real Global State for Roles & Members scoped by Workspace
  serverRoles: Record<string, Role[]>;
  serverMembers: Record<string, WorkspaceMember[]>;
  
  fetchRoles: (workspaceId: string) => Promise<void>;
  createRole: (workspaceId: string, roleData: Partial<Role>) => Promise<Role | null>;
  updateRole: (workspaceId: string, role: Role) => Promise<void>;
  deleteRole: (workspaceId: string, roleId: string) => Promise<void>;
  
  fetchMembers: (workspaceId: string) => Promise<void>;
  toggleMemberRole: (workspaceId: string, memberId: string, roleId: string) => Promise<void>;
  
  setActiveWorkspace: (id: string | null) => void;
  setActiveChannel: (id: string) => void;
  fetchWorkspaces: () => Promise<void>;
  fetchChannels: (workspaceId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  channels: [],
  activeWorkspaceId: null,
  activeChannelId: null,
  isLoading: false,

  serverRoles: {},
  serverMembers: {},
  
  fetchRoles: async (workspaceId: string) => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('workspace_id', workspaceId)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching roles:', error);
      return;
    }

    set((state) => ({
      serverRoles: {
        ...state.serverRoles,
        [workspaceId]: data as Role[]
      }
    }));
  },

  createRole: async (workspaceId, roleData) => {
    const { data, error } = await supabase
      .from('roles')
      .insert({
        workspace_id: workspaceId,
        name: roleData.name || 'New Role',
        color: roleData.color || '#99aab5',
        priority: roleData.priority || 0,
        permissions: roleData.permissions || { admin: false, manageChannels: false, sendMessages: true }
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating role:', error);
      return null;
    }
    
    // Update local state immediately
    set((state) => {
      const currentRoles = state.serverRoles[workspaceId] || [];
      return {
        serverRoles: {
          ...state.serverRoles,
          [workspaceId]: [...currentRoles, data as Role]
        }
      };
    });
    
    return data as Role;
  },
  
  updateRole: async (workspaceId, updatedRole) => {
    // Optimistic UI update
    set((state) => {
      const workspaceRoles = state.serverRoles[workspaceId] || [];
      return {
        serverRoles: {
          ...state.serverRoles,
          [workspaceId]: workspaceRoles.map(role => role.id === updatedRole.id ? updatedRole : role)
        }
      };
    });

    const { error } = await supabase
      .from('roles')
      .update({
        name: updatedRole.name,
        color: updatedRole.color,
        permissions: updatedRole.permissions,
        priority: updatedRole.priority
      })
      .eq('id', updatedRole.id);

    if (error) {
      console.error('Error updating role:', error);
      // rollback could be handled here
    }
  },

  deleteRole: async (workspaceId, roleId) => {
    // Optimistic delete
    set((state) => {
      const workspaceRoles = state.serverRoles[workspaceId] || [];
      return {
        serverRoles: {
          ...state.serverRoles,
          [workspaceId]: workspaceRoles.filter(role => role.id !== roleId)
        }
      };
    });

    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', roleId);

    if (error) {
      console.error('Error deleting role:', error);
    }
  },

  fetchMembers: async (workspaceId: string) => {
    // Fetch members and join with auth.users (handled via a profile view or function if needed, but for now we'll do a basic fetch and rely on user metadata)
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*')
      .eq('workspace_id', workspaceId);

    if (error) {
      console.error('Error fetching members:', error);
      return;
    }
    
    // As we can't join auth.users directly via RLS without a secure view, 
    // we'll mock the username for now using the local state or metadata,
    // Or we should assume the backend creates a user_profiles table.
    // For now, map the raw members:
    const mappedMembers: WorkspaceMember[] = data.map(m => ({
      id: m.id,
      user_id: m.user_id,
      username: "Member", // Will be filled dynamically by UI if possible, or we need a profiles table
      roleIds: m.role_ids || []
    }));

    set((state) => ({
      serverMembers: {
        ...state.serverMembers,
        [workspaceId]: mappedMembers
      }
    }));
  },

  toggleMemberRole: async (workspaceId, memberId, roleId) => {
    const state = get();
    const members = state.serverMembers[workspaceId] || [];
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const hasRole = member.roleIds.includes(roleId);
    const newRoles = hasRole 
      ? member.roleIds.filter((id: string) => id !== roleId)
      : [...member.roleIds, roleId];
      
    // Optimistic UI
    set((state) => ({
      serverMembers: {
        ...state.serverMembers,
        [workspaceId]: members.map(m => m.id === memberId ? { ...m, roleIds: newRoles } : m)
      }
    }));

    // Update DB
    const { error } = await supabase
      .from('workspace_members')
      .update({ role_ids: newRoles })
      .eq('id', memberId);

    if (error) {
      console.error('Error updating member role:', error);
    }
  },

  setActiveWorkspace: async (id: string | null) => {
    set({ activeWorkspaceId: id });
    if (id) {
      await get().fetchChannels(id);
      await get().fetchRoles(id);
      await get().fetchMembers(id);
    } else {
      set({ channels: [], activeChannelId: null });
    }
  },

  setActiveChannel: (id: string) => set({ activeChannelId: id }),

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    
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

    // @ts-ignore
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
      console.error('Error fetching channels:', error);
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
