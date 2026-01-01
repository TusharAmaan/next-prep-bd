"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Filter, Trash2, Eye, ChevronLeft, ChevronRight, Mail, UserCheck, Clock } from "lucide-react";

// --- TYPES ---
type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  bio?: string;
  phone?: string;
  institution?: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  status: string;
};

export default function UserManagement() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users');
  const [loading, setLoading] = useState(true);
  
  // Data
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const ITEMS_PER_PAGE = 10;

  // UI State
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [submitting, setSubmitting] = useState(false);

  // --- FETCHING DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    if (activeTab === 'users') {
      // 1. Fetch Profiles
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      if (roleFilter !== 'all') query = query.eq('role', roleFilter);

      const { data, count, error } = await query;
      if (!error && data) {
        setUsers(data);
        setTotalItems(count || 0);
      }
    } else {
      // 2. Fetch Invites
      let query = supabase
        .from('invitations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (search) query = query.ilike('email', `%${search}%`);
      if (roleFilter !== 'all') query = query.eq('role', roleFilter);

      const { data, count, error } = await query;
      if (!error && data) {
        setInvites(data);
        setTotalItems(count || 0);
      }
    }
    setLoading(false);
  }, [activeTab, page, search, roleFilter]);

  // Refetch when filters change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset page when switching tabs or filters
  useEffect(() => {
    setPage(1);
  }, [activeTab, search, roleFilter]);


  // --- ACTIONS ---

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    const previousUsers = [...users];
    // Optimistic UI Update
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) {
      alert("Failed to update role: " + error.message);
      setUsers(previousUsers); // Revert
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure? This removes their access immediately.")) return;
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) throw new Error("Failed to delete");
      setUsers(users.filter(u => u.id !== userId));
      alert("User removed successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!confirm("Revoke this invitation? The link will become invalid.")) return;
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    if (error) alert(error.message);
    else {
      setInvites(invites.filter(i => i.id !== id));
      alert("Invitation revoked.");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return alert("Email is required");
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, invitedByEmail: user?.email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert("Invitation sent successfully!");
      setIsInviteOpen(false);
      setInviteEmail("");
      if (activeTab === 'invites') fetchData(); // Refresh list if on invites tab
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* --- TOP HEADER --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">User Management</h2>
          <p className="text-sm text-slate-500 font-bold">Manage access, roles, and invitations.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
           {/* TABS */}
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setActiveTab('users')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <UserCheck className="w-4 h-4" /> Active Users
              </button>
              <button 
                onClick={() => setActiveTab('invites')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'invites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Mail className="w-4 h-4" /> Pending Invites
              </button>
           </div>

           <button onClick={() => setIsInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2">
             <span>✉️</span> Invite New
           </button>
        </div>
      </div>

      {/* --- FILTERS --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input 
             className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium outline-none focus:border-indigo-500"
             placeholder={activeTab === 'users' ? "Search users by name or email..." : "Search invites by email..."}
             value={search}
             onChange={(e) => setSearch(e.target.value)}
           />
        </div>
        <div className="relative min-w-[180px]">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <select 
             className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 appearance-none cursor-pointer"
             value={roleFilter}
             onChange={(e) => setRoleFilter(e.target.value)}
           >
             <option value="all">All Roles</option>
             <option value="admin">Admin</option>
             <option value="editor">Editor</option>
             <option value="tutor">Tutor</option>
             <option value="institute">Institute</option>
             <option value="student">Student</option>
           </select>
        </div>
      </div>

      {/* --- TABLE CONTENT --- */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
        {loading ? (
           <div className="flex items-center justify-center h-[400px] text-slate-400 font-bold">Loading Data...</div>
        ) : (
           <>
             {activeTab === 'users' ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4 text-right">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-lg border border-slate-200">
                              {user.full_name ? user.full_name[0].toUpperCase() : "?"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{user.full_name || "Unknown"}</p>
                              <p className="text-xs text-slate-400">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={user.role} 
                            onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                            className={`border border-slate-200 bg-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide cursor-pointer focus:ring-2 focus:ring-indigo-500
                              ${user.role === 'admin' ? 'text-yellow-600 bg-yellow-50 border-yellow-100' : 
                                user.role === 'editor' ? 'text-blue-600 bg-blue-50 border-blue-100' :
                                'text-slate-600'
                              }`}
                          >
                            <option value="student">Student</option>
                            <option value="tutor">Tutor</option>
                            <option value="editor">Editor</option>
                            <option value="institute">Institute</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <button onClick={() => setSelectedUser(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye className="w-4 h-4"/></button>
                          <button onClick={() => handleDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-12 text-slate-400">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
             ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4">Invited Email</th>
                      <th className="px-6 py-4">Assigned Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Invited On</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {invites.map((invite) => (
                      <tr key={invite.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-700">{invite.email}</td>
                        <td className="px-6 py-4">
                           <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-1 rounded text-[10px] font-black uppercase tracking-wide">
                             {invite.role}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <span className="flex items-center gap-2 text-xs font-bold text-orange-500 bg-orange-50 px-3 py-1 rounded-full w-fit">
                             <Clock className="w-3 h-3" /> Pending
                           </span>
                        </td>
                        <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">
                          {new Date(invite.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleRevokeInvite(invite.id)} className="text-xs font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100">
                            Revoke Invite
                          </button>
                        </td>
                      </tr>
                    ))}
                    {invites.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-400">No pending invitations.</td></tr>
                    )}
                  </tbody>
                </table>
             )}
           </>
        )}
        
        {/* --- PAGINATION FOOTER --- */}
        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
           <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
             Showing {users.length > 0 || invites.length > 0 ? 1 : 0}-{activeTab === 'users' ? users.length : invites.length} of {totalItems} results
           </span>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(Math.max(1, page - 1))} 
                disabled={page === 1}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-sm">
                Page {page} of {totalPages || 1}
              </span>
              <button 
                onClick={() => setPage(Math.min(totalPages, page + 1))} 
                disabled={page >= totalPages}
                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:text-indigo-600 hover:border-indigo-300 disabled:opacity-50 transition-all shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* --- MODALS (DETAILS & INVITE) --- */}
      
      {/* USER DETAILS MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-pop-in">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">User Profile</h3>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center">✕</button>
            </div>
            <div className="p-8 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-2xl font-bold">
                  {selectedUser.full_name?.[0] || "?"}
                </div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{selectedUser.full_name}</h4>
                  <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-bold uppercase">{selectedUser.role}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                 <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Email</span>
                    <span className="font-bold text-slate-700">{selectedUser.email}</span>
                 </div>
                 <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="block text-[10px] font-bold text-slate-400 uppercase">Joined</span>
                    <span className="font-bold text-slate-700">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                 </div>
              </div>
              <div>
                 <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Institution / Contact</span>
                 <p className="text-sm font-medium text-slate-600">{selectedUser.institution || "N/A"} • {selectedUser.phone || "N/A"}</p>
              </div>
              <div>
                 <span className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Bio</span>
                 <p className="text-sm text-slate-500 italic bg-slate-50 p-3 rounded-xl">{selectedUser.bio || "No bio available."}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MODAL */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-pop-in">
            <h3 className="text-xl font-black text-slate-900 mb-1">Invite Member</h3>
            <p className="text-xs text-slate-500 mb-6">Send an email invitation to join the team.</p>
            <div className="space-y-4">
              <input className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" placeholder="email@address.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              <select className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 bg-white" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option value="editor">Editor</option>
                <option value="tutor">Tutor</option>
                <option value="institute">Institute</option>
                <option value="admin">Admin</option>
              </select>
              <button onClick={handleInvite} disabled={submitting} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50">
                {submitting ? "Sending..." : "Send Invitation"}
              </button>
              <button onClick={() => setIsInviteOpen(false)} className="w-full text-xs font-bold text-slate-400 py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}