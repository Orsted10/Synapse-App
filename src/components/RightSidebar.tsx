"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { useWorkspaceStore } from "@/store/workspaceStore";
import { UserProfileModal } from "./UserProfileModal";
import { usePresenceStore } from "@/store/presenceStore";
import { useUserStore } from "@/store/userStore";

export function RightSidebar() {
  const { activeWorkspaceId, serverRoles, serverMembers } = useWorkspaceStore();
  const { onlineUsers } = usePresenceStore();
  const { user } = useUserStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // If no workspace is selected, we show the "Active Now" home sidebar
  if (!activeWorkspaceId) {
    const activeUsersList = Object.values(onlineUsers);

    return (
      <div className="w-[300px] h-full bg-secondary border-l border-subtle flex flex-col shrink-0">
        <div className="h-14 border-b border-subtle flex items-center px-4 shrink-0">
          <h2 className="font-bold text-foreground text-[16px]">Active Now</h2>
        </div>
        <div className="p-4 space-y-4 overflow-y-auto custom-scrollbar">
          {activeUsersList.length === 0 && (
            <div className="text-sm text-muted text-center pt-10">No one is active right now.</div>
          )}
          {activeUsersList.map((u, i) => {
            const activities = [
              { type: 'Playing', name: 'Visual Studio Code', icon: '💻', details: 'Editing page.tsx', time: '45:12 elapsed' },
              { type: 'Listening to', name: 'Spotify', icon: '🎵', details: 'Synthwave Mix', time: '2:14 / 4:30' },
              { type: 'Playing', name: 'Cyberpunk 2077', icon: '🎮', details: 'Night City', time: 'In Menus' },
              null,
            ];
            const activity = activities[i % activities.length];

            return (
              <div key={i} className="bg-tertiary p-3 rounded-xl border border-subtle relative overflow-hidden group cursor-pointer hover:bg-tertiary-hover transition-colors"
                   onClick={() => setSelectedUser({ name: u.username, roleColor: "#8b5cf6", status: "online", roleGroup: "Member", subtext: "Online" })}>
                <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold">
                      {u.username ? u.username.substring(0, 1).toUpperCase() : '?'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-tertiary rounded-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm">{u.username}{u.userId === user?.id && " (You)"}</span>
                    <span className="text-xs text-muted">Online</span>
                  </div>
                </div>

                {/* Rich Presence Card */}
                {activity && (
                  <div className="mt-3 bg-secondary/50 rounded-lg p-2.5 border border-white/5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
                      <span>{activity.type}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 bg-black/40 rounded-md flex items-center justify-center text-lg shrink-0">
                        {activity.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-foreground truncate">{activity.name}</span>
                        <span className="text-[11px] text-muted truncate">{activity.details}</span>
                        <span className="text-[10px] text-muted truncate mt-0.5">{activity.time}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <UserProfileModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />
      </div>
    );
  }

  // Fetch members mapped by stable roleId
  const allMembers = activeWorkspaceId ? (serverMembers[activeWorkspaceId] || []) : [];

  const roles = activeWorkspaceId ? (serverRoles[activeWorkspaceId] || []) : [];

  // Filter members based on search query
  const filteredMembers = allMembers.filter(m => 
    m.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="w-[280px] h-full bg-secondary border-l border-subtle flex flex-col shrink-0 z-10">
        <div className="h-14 border-b border-subtle flex items-center px-4 shrink-0">
          <div className="bg-tertiary w-full flex items-center px-3 py-1.5 rounded-md border border-subtle focus-within:border-accent transition-colors">
            <Search size={14} className="text-muted mr-2" />
            <input 
              type="text" 
              placeholder="Search Members" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm text-foreground w-full placeholder:text-muted"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
          
          {roles.map(role => {
            // A member is grouped under this role if it's their highest priority role
            const roleMembers = filteredMembers.filter(m => {
              if (!m.roleIds || m.roleIds.length === 0) return false;
              // Find the highest role this member has (based on the ordered roles array)
              const highestRole = roles.find(r => m.roleIds.includes(r.id));
              return highestRole?.id === role.id;
            });
            if (roleMembers.length === 0) return null;
            
            return (
              <div key={role.id}>
                <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-2">{role.name} — {roleMembers.length}</h3>
                <div className="space-y-1">
                  {roleMembers.map((m, i) => {
                    const activities = [
                      { type: 'Playing', name: 'Visual Studio Code', icon: '💻', details: 'Editing page.tsx', time: '45:12 elapsed' },
                      { type: 'Listening to', name: 'Spotify', icon: '🎵', details: 'Synthwave Mix', time: '2:14 / 4:30' },
                      { type: 'Playing', name: 'Cyberpunk 2077', icon: '🎮', details: 'Night City', time: 'In Menus' },
                      null,
                    ];
                    const activity = activities[i % activities.length];
                    
                    return (
                      <MemberRow 
                        key={m.id} 
                        name={m.username} 
                        roleColor={role.color} 
                        status={"online"} 
                        activity={activity}
                        onClick={() => setSelectedUser({ 
                          ...m, 
                          name: m.username,
                          roleColor: role.color, 
                          // Attach all matching roles for the Profile Modal to render
                          memberRoles: roles.filter(r => m.roleIds.includes(r.id))
                        })} 
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}

          {filteredMembers.length === 0 && (
            <div className="text-center text-muted text-sm mt-10">
              No members found matching "{searchQuery}"
            </div>
          )}

        </div>
      </div>
      <UserProfileModal isOpen={!!selectedUser} onClose={() => setSelectedUser(null)} user={selectedUser} />
    </>
  );
}

interface Activity {
  type: string;
  name: string;
  icon: string;
  details: string;
  time: string;
}

function MemberRow({ name, roleColor, status, subtext, activity, onClick }: { name: string, roleColor: string, status: 'online' | 'idle' | 'dnd' | 'offline', subtext?: string, activity?: Activity | null, onClick?: () => void }) {
  const getStatusColor = () => {
    switch(status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      case 'offline': return 'bg-gray-500';
    }
  };

  return (
    <div onClick={onClick} className="flex flex-col p-2 rounded-lg hover:bg-tertiary cursor-pointer transition-colors group">
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">
          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white shadow-sm" style={{ backgroundColor: roleColor }}>
            {name.charAt(0)}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 ${getStatusColor()} border-2 border-secondary group-hover:border-tertiary transition-colors rounded-full`} />
        </div>
        <div className="flex flex-col overflow-hidden">
          <span className="font-bold text-sm truncate" style={{ color: roleColor }}>{name}</span>
          {subtext && <span className="text-[11px] text-muted truncate">{subtext}</span>}
        </div>
      </div>
      
      {activity && (
        <div className="mt-3 bg-secondary/50 rounded-lg p-2.5 border border-white/5 ml-11">
          <div className="text-[10px] font-bold uppercase tracking-wider text-muted mb-1 flex items-center gap-1">
            <span>{activity.type}</span>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-black/40 rounded-md flex items-center justify-center text-lg shrink-0">
              {activity.icon}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-foreground truncate">{activity.name}</span>
              <span className="text-[11px] text-muted truncate">{activity.details}</span>
              <span className="text-[10px] text-muted truncate mt-0.5">{activity.time}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
