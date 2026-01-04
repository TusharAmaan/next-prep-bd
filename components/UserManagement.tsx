"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserCheck, Mail } from "lucide-react";

// --- IMPORTS ---
import FilterBar from "./admin/FilterBar";
import UserTable from "./admin/UserTable";
import UserDetailView from "./admin/UserDetailView";
import InviteModal from "./admin/InviteModal";

// --- TYPES ---
type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: string;
  created_at: string;
  bio?: string;
  phone?: string;
  institution?: string;
  is_featured?: boolean; // Added based on your previous Table code
  admin_notes?: string;
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
  
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const ITEMS_PER_PAGE = 10;

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
      let query = supabase.from('profiles').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(start, end);
      if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
      if (roleFilter !== 'all') query = query.eq('role', roleFilter);
      
      const { data, count } = await query;
      if (data) { 
          setUsers(data); 
          setTotalItems(count || 0); 
      }
    } else {
      let query = supabase.from('invitations').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(start, end);
      if (search) query = query.ilike('email', `%${search}%`);
      
      const { data, count } = await query;
      if (data) { 
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
    // 1. Optimistic Update (Immediate Feedback)
    const prevUsers = [...users];
    
    // Update List
    const updatedUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(updatedUsers);
    
    // Update Modal (Syncing Detail View)
    if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, role: newRole });
    }

    // 2. DB Update
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    
    if (error) { 
        onShowError(error.message); 
        setUsers(prevUsers); // Revert on failure
        if (selectedUser?.id === userId) setSelectedUser(prevUsers.find(u => u.id === userId) || null);
    } else {
        onShowSuccess(`Role updated to ${newRole}`);
    }
  };

  const handleApproveUser = async (userId: string) => {
    // 1. Optimistic Update
    const updatedUsers = users.map(u => u.id === userId ? { ...u, status: 'active' } : u);
    setUsers(updatedUsers);

    if (selectedUser?.id === userId) {
        setSelectedUser({ ...selectedUser, status: 'active' });
    }

    // 2. DB Update
    const { error } = await supabase.from('profiles').update({ status: 'active' }).eq('id', userId);
    
    if (error) {
        onShowError(error.message);
        fetchData(); // Revert/Refresh on error
    } else {
        onShowSuccess("User Approved Successfully");
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
      onShowSuccess("User removed.");
      
      // Close modal if the deleted user was open
      if (selectedUser?.id === userId) setSelectedUser(null);
      
    } catch (err: any) { 
        onShowError(err.message); 
    }
  };

  const handleSendReset = async (email: string) => {
    if(!confirm(`Send password reset email to ${email}?`)) return;
    try {
        const res = await fetch('/api/admin/send-reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        if(!res.ok) throw new Error("Failed to send link");
        onShowSuccess("Reset link sent.");
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
    } catch (err: any) { 
        onShowError(err.message); 
    } finally { 
        setSubmitting(false); 
    }
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

      <FilterBar search={search} setSearch={setSearch} roleFilter={roleFilter} setRoleFilter={setRoleFilter} activeTab={activeTab} />
      
      <UserTable 
        activeTab={activeTab} 
        users={users} 
        invites={invites} 
        loading={loading} 
        page={page} 
        setPage={setPage} 
        totalPages={totalPages} 
        totalItems={totalItems}
        // Removed onRoleUpdate from here as requested
        onDeleteUser={handleDeleteUser} 
        onRevokeInvite={handleRevokeInvite} 
        onSelectUser={setSelectedUser}
      />

      {/* Syncing happens here: We pass the update functions to the Detail View */}
      <UserDetailView 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
        onSendReset={handleSendReset} 
        onDeleteUser={handleDeleteUser} 
        onApproveUser={handleApproveUser} 
        onRoleUpdate={handleRoleUpdate}
      />
      
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onInvite={handleInvite} email={inviteEmail} setEmail={setInviteEmail} role={inviteRole} setRole={setInviteRole} submitting={submitting} />
    </div>
  );
}