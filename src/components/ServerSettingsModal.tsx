"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Settings, Users, Shield, Hash, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useWorkspaceStore } from "@/store/workspaceStore";

interface ServerSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

export function ServerSettingsModal({ isOpen, onClose, workspaceId }: ServerSettingsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { 
    workspaces, fetchWorkspaces, 
    serverRoles, createRole, updateRole, deleteRole, 
    serverMembers, toggleMemberRole 
  } = useWorkspaceStore();
  
  const workspace = workspaces.find(w => w.id === workspaceId);
  
  const [serverName, setServerName] = useState(workspace?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const roles = serverRoles[workspaceId] || [];

  const [editingRole, setEditingRole] = useState<any>(null);

  React.useEffect(() => {
    if (isOpen && workspace) {
      setServerName(workspace.name);
    }
  }, [isOpen, workspace]);

  if (!workspace) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ name: serverName })
        .eq('id', workspaceId);

      if (error) throw error;

      await fetchWorkspaces();
      alert("Server updated successfully!");
    } catch (err: any) {
      alert("Error updating server: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const handleDeleteServer = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteServer = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('workspaces')
        .delete()
        .eq('id', workspaceId);
      if (error) throw error;
      
      await fetchWorkspaces();
      window.location.href = "/";
    } catch (err: any) {
      alert("Error deleting server: " + err.message);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-3xl"
            onClick={onClose}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass-panel-heavy w-full max-w-4xl h-[80vh] rounded-[32px] overflow-hidden relative z-10 border border-white/10 flex"
          >
            {/* Sidebar */}
            <div className="w-[240px] bg-tertiary border-r border-subtle p-4 flex flex-col gap-1 shrink-0">
              <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 mt-4 px-2">Server Profile</h3>
              
              <button 
                onClick={() => setActiveTab("overview")}
                className={`w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] transition-colors ${activeTab === 'overview' ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'}`}
              >
                Overview
              </button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Server Tag</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Engagement</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Boost Perks</button>

              <div className="h-[1px] bg-subtle my-2 mx-2" />
              <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 mt-2 px-2">Expression</h3>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Emoji</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Stickers</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Soundboard</button>

              <div className="h-[1px] bg-subtle my-2 mx-2" />
              <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 mt-2 px-2">People</h3>
              
              <button 
                onClick={() => setActiveTab("members")}
                className={`w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] transition-colors ${activeTab === 'members' ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'}`}
              >
                Members
              </button>
              
              <button 
                onClick={() => setActiveTab("roles")}
                className={`w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] transition-colors ${activeTab === 'roles' ? 'bg-secondary text-foreground' : 'text-muted hover:bg-secondary/50 hover:text-foreground'}`}
              >
                Roles
              </button>
              
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Invites</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Access</button>

              <div className="h-[1px] bg-subtle my-2 mx-2" />
              <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 mt-2 px-2">Apps</h3>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Integrations</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors flex items-center justify-between">App Directory <span className="text-xs">↗</span></button>

              <div className="h-[1px] bg-subtle my-2 mx-2" />
              <h3 className="text-[11px] font-bold text-muted uppercase tracking-wider mb-1 mt-2 px-2">Moderation</h3>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Safety Setup</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Audit Log</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">Bans</button>
              <button className="w-full text-left px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-muted hover:bg-secondary/50 hover:text-foreground transition-colors">AutoMod</button>

              <div className="h-[1px] bg-subtle my-4 mx-2" />
              
              <button 
                onClick={handleDeleteServer}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded-[4px] font-medium text-[15px] text-red-500 hover:bg-red-500/10 transition-colors"
              >
                Delete Server <Trash2 size={14} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-10 overflow-y-auto custom-scrollbar relative">
              <button 
                onClick={onClose}
                className="absolute top-8 right-8 w-8 h-8 rounded-full border border-subtle flex items-center justify-center text-muted hover:text-foreground hover:bg-tertiary transition-colors"
              >
                <X size={16} />
              </button>

              {activeTab === "overview" && (
                <div className="max-w-xl">
                  <h2 className="text-2xl font-bold text-foreground mb-6">Server Overview</h2>
                  
                  <form onSubmit={handleSave} className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">
                        Server Name
                      </label>
                      <input
                        type="text"
                        value={serverName}
                        onChange={(e) => setServerName(e.target.value)}
                        className="w-full bg-tertiary text-foreground border border-subtle focus:border-accent outline-none px-4 py-3 rounded-lg transition-colors"
                        required
                      />
                    </div>

                    <div className="bg-tertiary rounded-xl p-6 border border-subtle mb-6 flex items-center gap-6">
                      <div className="w-24 h-24 rounded-[20px] bg-accent flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-secondary overflow-hidden">
                         {workspace.icon_url ? (
                           <img src={workspace.icon_url} alt="Server Icon" className="w-full h-full object-cover" />
                         ) : (
                           serverName.substring(0, 1).toUpperCase()
                         )}
                      </div>
                      <div className="flex flex-col gap-2 text-sm text-muted">
                        <p>Minimum Size: <strong className="text-foreground">128x128</strong></p>
                        <p>Recommend: <strong className="text-foreground">512x512</strong></p>
                        <button 
                          type="button" 
                          onClick={() => alert("Server icon upload coming in Phase 6!")}
                          className="mt-1 text-foreground bg-secondary border border-subtle hover:bg-tertiary px-4 py-1.5 rounded-[4px] transition-colors w-fit font-bold shadow-sm"
                        >
                          Upload Image
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || serverName === workspace.name}
                      className="px-6 py-2 bg-accent hover:bg-accent-hover disabled:opacity-50 disabled:hover:bg-accent text-white rounded-lg font-medium transition-colors"
                    >
                      {isLoading ? "Saving..." : "Save Changes"}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === "roles" && (
                <div className="max-w-2xl">
                  {!editingRole ? (
                    <>
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-2xl font-bold text-foreground mb-1">Roles</h2>
                          <p className="text-muted text-sm">Use roles to group your server members and assign permissions.</p>
                        </div>
                        <button 
                          onClick={() => setEditingRole({ id: Date.now().toString(), name: 'New Role', color: '#99aab5', members: 0, permissions: { admin: false, manageChannels: false, sendMessages: true } })}
                          className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg font-medium transition-colors flex items-center gap-2"
                        >
                          <Shield size={16} /> Create Role
                        </button>
                      </div>
                      
                      <div className="bg-tertiary rounded-lg border border-subtle overflow-hidden flex flex-col">
                        {roles.map(role => {
                          const memberCount = (serverMembers[workspaceId] || []).filter(m => (m.roleIds || []).includes(role.id)).length;
                          return (
                            <div 
                              key={role.id} 
                              onClick={() => setEditingRole(role)}
                              className="flex items-center justify-between p-3 border-b border-subtle hover:bg-secondary cursor-pointer transition-colors group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                                <span className="font-medium text-foreground group-hover:underline">{role.name}</span>
                              </div>
                              <span className="text-xs text-muted font-medium bg-secondary group-hover:bg-tertiary px-2 py-1 rounded transition-colors">
                                {memberCount} Members
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-200">
                      <div className="flex items-center gap-4 mb-6">
                        <button onClick={() => setEditingRole(null)} className="text-muted hover:text-foreground">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                        </button>
                        <h2 className="text-2xl font-bold text-foreground">Edit Role — {editingRole.name}</h2>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Role Name</label>
                          <input
                            type="text"
                            value={editingRole.name}
                            onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                            className="w-full bg-tertiary text-foreground border border-subtle focus:border-accent outline-none px-4 py-3 rounded-lg transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-2">Role Color</label>
                          <div className="flex gap-2">
                            {['#99aab5', '#1abc9c', '#2ecc71', '#3498db', '#9b59b6', '#e91e63', '#f1c40f', '#e67e22', '#e74c3c', '#95a5a6', '#607d8b'].map(color => (
                              <button 
                                key={color}
                                onClick={() => setEditingRole({ ...editingRole, color })}
                                className="w-8 h-8 rounded-md transition-transform hover:scale-110 flex items-center justify-center"
                                style={{ backgroundColor: color }}
                              >
                                {editingRole.color === color && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="h-[1px] bg-subtle my-6" />

                        <div>
                          <label className="block text-xs font-bold text-muted uppercase tracking-wider mb-4">Permissions</label>
                          
                          <div className="space-y-4">
                            <label className="flex items-center justify-between p-4 bg-tertiary rounded-lg border border-subtle cursor-pointer hover:border-accent/50 transition-colors">
                              <div>
                                <div className="font-bold text-foreground mb-1">Administrator</div>
                                <div className="text-xs text-muted">Members with this permission have every permission and bypass channel specific permissions.</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={editingRole.permissions?.admin}
                                onChange={(e) => setEditingRole({ ...editingRole, permissions: { ...editingRole.permissions, admin: e.target.checked } })}
                                className="w-5 h-5 rounded border-subtle text-accent focus:ring-accent bg-secondary"
                              />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-tertiary rounded-lg border border-subtle cursor-pointer hover:border-accent/50 transition-colors">
                              <div>
                                <div className="font-bold text-foreground mb-1">Manage Channels</div>
                                <div className="text-xs text-muted">Allows members to create, edit, or delete channels.</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={editingRole.permissions?.manageChannels}
                                onChange={(e) => setEditingRole({ ...editingRole, permissions: { ...editingRole.permissions, manageChannels: e.target.checked } })}
                                className="w-5 h-5 rounded border-subtle text-accent focus:ring-accent bg-secondary"
                              />
                            </label>

                            <label className="flex items-center justify-between p-4 bg-tertiary rounded-lg border border-subtle cursor-pointer hover:border-accent/50 transition-colors">
                              <div>
                                <div className="font-bold text-foreground mb-1">Send Messages</div>
                                <div className="text-xs text-muted">Allows members to send messages in text channels.</div>
                              </div>
                              <input 
                                type="checkbox" 
                                checked={editingRole.permissions?.sendMessages}
                                onChange={(e) => setEditingRole({ ...editingRole, permissions: { ...editingRole.permissions, sendMessages: e.target.checked } })}
                                className="w-5 h-5 rounded border-subtle text-accent focus:ring-accent bg-secondary"
                              />
                            </label>
                          </div>
                        </div>

                        <div className="h-[1px] bg-subtle my-6" />

                        <div className="flex items-center justify-between">
                          <button 
                            onClick={async () => {
                              const exists = roles.find(r => r.id === editingRole.id);
                              if (exists) {
                                await updateRole(workspaceId, editingRole);
                              } else {
                                await createRole(workspaceId, editingRole);
                              }
                              setEditingRole(null);
                            }}
                            className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold transition-colors"
                          >
                            Save Changes
                          </button>

                          <button 
                            onClick={async () => {
                              if (roles.find(r => r.id === editingRole.id)) {
                                await deleteRole(workspaceId, editingRole.id);
                              }
                              setEditingRole(null);
                            }}
                            className="px-4 py-2 text-red-500 hover:bg-red-500/10 rounded-lg font-medium transition-colors"
                          >
                            Delete Role
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "members" && (
                <div className="flex flex-col h-full">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-foreground mb-1">Server Members</h2>
                    <p className="text-muted text-sm">Manage who has access to this server and their roles.</p>
                  </div>
                  
                  <div className="bg-tertiary rounded-lg border border-subtle overflow-visible flex flex-col flex-1">
                    {(serverMembers[workspaceId] || []).map(member => {
                      const memberRolesList = roles.filter(r => (member.roleIds || []).includes(r.id));
                      return (
                        <div key={member.id} className="flex items-center justify-between p-3 border-b border-subtle hover:bg-secondary transition-colors group relative">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-accent text-white font-bold flex items-center justify-center">
                              {member.username?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="font-bold text-foreground">{member.username}</span>
                          </div>
                          
                          <div className="flex items-center gap-4 relative">
                            {/* Role Badges */}
                            <div className="flex flex-wrap gap-1.5 items-center">
                              {memberRolesList.map(r => (
                                <div key={r.id} className="flex items-center gap-1.5 bg-secondary px-2 py-1 rounded-[4px] border border-subtle">
                                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                                  <span className="text-xs font-bold text-foreground">{r.name}</span>
                                </div>
                              ))}
                              
                              {/* Add Role Dropdown */}
                              <div className="relative dropdown-container">
                                <button 
                                  onClick={() => setEditingRole(editingRole === member.id ? null : member.id)}
                                  className="flex items-center justify-center w-6 h-6 rounded-full bg-secondary border border-subtle text-muted hover:text-foreground hover:bg-tertiary transition-colors"
                                  title="Add Role"
                                >
                                  <span className="text-lg leading-none mb-0.5">+</span>
                                </button>
                                
                                {editingRole === member.id && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setEditingRole(null)} />
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-[#111214] border border-[#1e1f22] rounded-md shadow-2xl z-50 py-2">
                                      <div className="px-3 pb-2 mb-2 border-b border-[#2b2d31]">
                                        <span className="text-xs font-bold text-muted uppercase tracking-wider">Assign Roles</span>
                                      </div>
                                      {roles.map(r => {
                                        const hasRole = (member.roleIds || []).includes(r.id);
                                        return (
                                          <button
                                            key={r.id}
                                            onClick={() => {
                                              toggleMemberRole(workspaceId, member.id, r.id);
                                            }}
                                            className="w-full text-left px-3 py-1.5 hover:bg-secondary text-sm font-medium flex items-center gap-2 transition-colors"
                                          >
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                                            {r.name}
                                            {hasRole && <span className="ml-auto text-accent">✓</span>}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                            
                            <button className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors opacity-0 group-hover:opacity-100" title="Kick Member">
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </motion.div>
        </div>
      )}
      
      {/* Custom Delete Server Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsDeleteModalOpen(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-secondary w-full max-w-[440px] rounded-md shadow-2xl relative z-[61] border border-subtle overflow-hidden"
          >
            <div className="p-4">
              <h2 className="text-[19px] font-bold text-foreground mb-4 leading-tight">Delete '{workspace.name}'</h2>
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md mb-6">
                Are you absolutely sure you want to delete <strong className="font-bold text-foreground">{workspace.name}</strong>? This action cannot be undone.
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="px-4 py-2 hover:underline text-foreground font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDeleteServer}
                  disabled={isLoading}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-[3px] font-medium text-sm transition-colors"
                >
                  {isLoading ? "Deleting..." : "Delete Server"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
