"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Search, Filter, Trash2, Eye, ChevronLeft, ChevronRight, Mail, UserCheck, Clock, Shield, KeyRound, Activity } from "lucide-react";

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
  last_sign_in_at?: string; // We can fetch this from auth if needed, using created_at for now
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  status: string;
};

export default function UserManagement({ onShowError, onShowSuccess }: any) {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'users' | 'invites'>('users');
  const [loading, setLoading] = useState(true);
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
      let query = supabase
        .from('invitations')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(start, end);

      if (search) query = query.ilike('email', `%${search}%`);
      
      const { data, count, error } = await query;
      if (!error && data) {
        setInvites(data);
        setTotalItems(count || 0);
      }
    }
    setLoading(false);
  }, [activeTab, page, search, roleFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [activeTab, search, roleFilter]);

  // --- ACTIONS ---
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    const prev = [...users];
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    if (error) { onShowError(error.message); setUsers(prev); }
    else onShowSuccess("Role Updated");
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
      onShowSuccess("User removed.");
    } catch (err: any) { onShowError(err.message); }
  };

  const handleSendReset = async (email: string) => {
    if(!confirm(`Send password reset email to ${email}?`)) return;
    try {
        const res = await fetch('/api/admin/send-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if(!res.ok) throw new Error("Failed to send reset link");
        onShowSuccess("Reset link sent to user's email.");
    } catch(err:any) {
        onShowError(err.message);
    }
  };

  const handleRevokeInvite = async (id: string) => {
    if (!confirm("Revoke this invitation?")) return;
    const { error } = await supabase.from('invitations').delete().eq('id', id);
    if (error) onShowError(error.message);
    else {
      setInvites(invites.filter(i => i.id !== id));
      onShowSuccess("Invitation revoked.");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
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
      
      onShowSuccess("Invitation sent!");
      setIsInviteOpen(false);
      setInviteEmail("");
      if (activeTab === 'invites') fetchData();
    } catch (err: any) { onShowError(err.message); } 
    finally { setSubmitting(false); }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">User Management</h2>
          <p className="text-sm text-slate-500 font-bold">Manage team access & students.</p>
        </div>
        <div className="flex gap-3">
           <div className="flex bg-slate-100 p-1 rounded-xl">
              <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><UserCheck className="w-4 h-4" /> Active</button>
              <button onClick={() => setActiveTab('invites')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'invites' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}><Mail className="w-4 h-4" /> Pending</button>
           </div>
           <button onClick={() => setIsInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2"><span>✉️</span> Invite</button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
           <input className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {activeTab === 'users' && (
            <div className="relative min-w-[180px]">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 appearance-none cursor-pointer" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                    <option value="all">All Roles</option><option value="admin">Admin</option><option value="editor">Editor</option><option value="tutor">Tutor</option><option value="student">Student</option>
                </select>
            </div>
        )}
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
        {loading ? <div className="flex items-center justify-center h-[400px] text-slate-400 font-bold">Loading...</div> : (
           <table className="w-full text-left text-sm">
             <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-100">
               <tr>
                 <th className="px-6 py-4">{activeTab === 'users' ? 'User' : 'Email'}</th>
                 <th className="px-6 py-4">Role</th>
                 <th className="px-6 py-4">Status</th>
                 <th className="px-6 py-4 text-right">Date</th>
                 <th className="px-6 py-4 text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-slate-100">
               {activeTab === 'users' ? users.map(user => (
                 <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                   <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                     <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border">{user.full_name?.[0]?.toUpperCase() || "?"}</div>
                        <div><p className="font-bold text-slate-800">{user.full_name}</p><p className="text-xs text-slate-400">{user.email}</p></div>
                     </div>
                   </td>
                   <td className="px-6 py-4">
                      <select value={user.role} onChange={(e) => handleRoleUpdate(user.id, e.target.value)} className="bg-white border border-slate-200 text-xs font-bold py-1 px-2 rounded uppercase cursor-pointer outline-none focus:border-indigo-500">
                        <option value="student">Student</option><option value="tutor">Tutor</option><option value="editor">Editor</option><option value="institute">Institute</option><option value="admin">Admin</option>
                      </select>
                   </td>
                   <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-wide"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> Active</span></td>
                   <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                   <td className="px-6 py-4 text-right"><button onClick={() => setSelectedUser(user)} className="text-slate-400 hover:text-indigo-600 p-2"><Eye className="w-4 h-4"/></button></td>
                 </tr>
               )) : invites.map(invite => (
                 <tr key={invite.id} className="hover:bg-slate-50 transition-colors">
                   <td className="px-6 py-4 font-bold text-slate-700">{invite.email}</td>
                   <td className="px-6 py-4"><span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-[10px] font-black uppercase text-slate-600">{invite.role}</span></td>
                   <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-600 uppercase tracking-wide"><Clock className="w-3 h-3"/> Pending</span></td>
                   <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">{new Date(invite.created_at).toLocaleDateString()}</td>
                   <td className="px-6 py-4 text-right"><button onClick={() => handleRevokeInvite(invite.id)} className="text-red-400 hover:text-red-600 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg">Revoke</button></td>
                 </tr>
               ))}
             </tbody>
           </table>
        )}
        {/* Pagination Controls */}
        <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
           <span className="text-xs font-bold text-slate-400 uppercase">Page {page} of {totalPages || 1}</span>
           <div className="flex gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 bg-white border rounded-lg text-slate-500 disabled:opacity-50"><ChevronLeft className="w-4 h-4"/></button>
              <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-2 bg-white border rounded-lg text-slate-500 disabled:opacity-50"><ChevronRight className="w-4 h-4"/></button>
           </div>
        </div>
      </div>

      {/* USER DETAILS MODAL (ENHANCED) */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-pop-in flex flex-col max-h-[90vh]">
            <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">User Profile & Logs</h3>
              <button onClick={() => setSelectedUser(null)} className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {/* HEADER INFO */}
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold">{selectedUser.full_name?.[0] || "?"}</div>
                <div>
                  <h4 className="text-2xl font-black text-slate-900">{selectedUser.full_name}</h4>
                  <div className="flex gap-2 mt-2">
                     <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-indigo-100">{selectedUser.role}</span>
                     <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">{selectedUser.email}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-4">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Details</h5>
                    <div className="space-y-3">
                       <div><label className="text-[10px] font-bold text-slate-400 uppercase block">Institution</label><p className="font-bold text-slate-700">{selectedUser.institution || "N/A"}</p></div>
                       <div><label className="text-[10px] font-bold text-slate-400 uppercase block">Phone</label><p className="font-bold text-slate-700">{selectedUser.phone || "N/A"}</p></div>
                       <div><label className="text-[10px] font-bold text-slate-400 uppercase block">Joined On</label><p className="font-bold text-slate-700">{new Date(selectedUser.created_at).toDateString()}</p></div>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Security & Actions</h5>
                    <button onClick={() => handleSendReset(selectedUser.email)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group text-left">
                       <div className="bg-white p-2 rounded-lg shadow-sm group-hover:text-indigo-600"><KeyRound className="w-5 h-5"/></div>
                       <div><p className="text-xs font-bold text-slate-800">Send Password Reset</p><p className="text-[10px] text-slate-400">Email a reset link to user</p></div>
                    </button>
                    <button onClick={() => handleDeleteUser(selectedUser.id)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-100 hover:border-red-300 hover:bg-red-50 transition-all group text-left">
                       <div className="bg-white p-2 rounded-lg shadow-sm text-red-500"><Trash2 className="w-5 h-5"/></div>
                       <div><p className="text-xs font-bold text-red-600">Delete User Account</p><p className="text-[10px] text-red-400">Revoke access permanently</p></div>
                    </button>
                 </div>
              </div>

              {/* MOCK LOGS SECTION */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                 <h5 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4"><Activity className="w-4 h-4"/> Activity Logs</h5>
                 <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                       <span className="font-bold text-slate-700">Account Created</span>
                       <span className="text-slate-400">{new Date(selectedUser.created_at).toLocaleString()}</span>
                    </div>
                    {/* Future logs can be mapped here */}
                    <div className="text-center text-[10px] text-slate-400 italic py-2">No further activity recorded.</div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INVITE MODAL (SAME AS BEFORE) */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-pop-in">
            <h3 className="text-xl font-black text-slate-900 mb-1">Invite Member</h3>
            <p className="text-xs text-slate-500 mb-6">Send an email invitation.</p>
            <div className="space-y-4">
              <input className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" placeholder="email@address.com" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} />
              <select className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 bg-white" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option value="editor">Editor</option><option value="tutor">Tutor</option><option value="institute">Institute</option><option value="admin">Admin</option>
              </select>
              <button onClick={handleInvite} disabled={submitting} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50">{submitting ? "Sending..." : "Send Invitation"}</button>
              <button onClick={() => setIsInviteOpen(false)} className="w-full text-xs font-bold text-slate-400 py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}