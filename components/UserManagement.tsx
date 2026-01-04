"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { UserCheck, Mail, Ban, Clock, ShieldAlert } from "lucide-react";

// --- IMPORTS ---
import FilterBar from "./admin/FilterBar";
import UserTable from "./admin/UserTable";
import UserDetailView from "./admin/UserDetailView";
import InviteModal from "./admin/InviteModal";

// --- TYPES ---
export type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  status: 'active' | 'pending' | 'suspended'; // Enforced Status Types
  created_at: string;
  bio?: string;
  phone?: string;
  institution?: string;
  is_featured?: boolean;
  admin_notes?: string;
};

type Invitation = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  status: string;
};

// Tab Types
type TabType = 'active' | 'pending' | 'suspended' | 'invitations';

export default function UserManagement({ onShowError, onShowSuccess }: any) {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [loading, setLoading] = useState(true);
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [invites, setInvites] = useState<Invitation[]>([]);
  
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const ITEMS_PER_PAGE = 10;

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  
  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [submitting, setSubmitting] = useState(false);

  // --- FETCHING DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE - 1;

    try {
      if (activeTab === 'invitations') {
        // Fetch Invitations
        let query = supabase.from('invitations').select('*', { count: 'exact' }).order('created_at', { ascending: false }).range(start, end);
        if (search) query = query.ilike('email', `%${search}%`);
        
        const { data, count, error } = await query;
        if (error) throw error;
        setInvites(data || []);
        setTotalItems(count || 0);
      } else {
        // Fetch Users (Filtered by activeTab status)
        let query = supabase.from('profiles')
          .select('*', { count: 'exact' })
          .eq('status', activeTab) // STRICT FILTER: 'active', 'pending', or 'suspended'
          .order('created_at', { ascending: false })
          .range(start, end);

        if (search) query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
        if (roleFilter !== 'all') query = query.eq('role', roleFilter);
        
        const { data, count, error } = await query;
        if (error) throw error;
        setUsers(data as UserProfile[] || []);
        setTotalItems(count || 0);
      }
    } catch (err: any) {
      onShowError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeTab, page, search, roleFilter, onShowError]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { setPage(1); }, [activeTab, search, roleFilter]);

  // --- SYNC HELPERS ---

  // Helper: Update a user in the local list OR remove them if they no longer match the filter
  const syncUserUpdate = (updatedUser: UserProfile) => {
    // 1. Update Selected User (Detail View) - Always update this so the modal reflects changes
    if (selectedUser?.id === updatedUser.id) {
      setSelectedUser(updatedUser);
    }

    // 2. Update Table List
    // If the new status doesn't match the current tab, REMOVE it from the list.
    if (activeTab !== 'invitations' && updatedUser.status !== activeTab) {
      setUsers(prev => prev.filter(u => u.id !== updatedUser.id));
      setTotalItems(prev => Math.max(0, prev - 1)); // Decrement count
    } else {
      // Otherwise, just update the data in place
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  };

  // --- ACTIONS ---

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    // Optimistic Object
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) return;
    const updatedUser = { ...userToUpdate, role: newRole };

    // Optimistic UI Update
    syncUserUpdate(updatedUser);

    // DB Update
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    
    if (error) { 
        onShowError(error.message); 
        fetchData(); // Revert on error
    } else {
        onShowSuccess(`Role updated to ${newRole}`);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'suspended' | 'pending') => {
    // Optimistic Object
    const userToUpdate = users.find(u => u.id === userId) || selectedUser; // Fallback to selectedUser if list filtered
    if (!userToUpdate) return;
    
    // @ts-ignore
    const updatedUser: UserProfile = { ...userToUpdate, status: newStatus };

    // Optimistic UI Update
    syncUserUpdate(updatedUser);

    // DB Update
    const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', userId);
    
    if (error) {
        onShowError(error.message);
        fetchData(); // Revert on error
    } else {
        onShowSuccess(`User marked as ${newStatus}`);
    }
  };

  // Wrappers for specific actions
  const handleApproveUser = (userId: string) => handleStatusChange(userId, 'active');
  const handleSuspendUser = (userId: string) => handleStatusChange(userId, 'suspended');

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
      if (selectedUser?.id === userId) setSelectedUser(null);
      onShowSuccess("User removed.");
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
      // Only refresh if we are looking at invites, otherwise it doesn't matter yet
      if (activeTab === 'invitations') fetchData(); 
    } catch (err: any) { 
        onShowError(err.message); 
    } finally { 
        setSubmitting(false); 
    }
  };

  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // TAB BUTTON COMPONENT
  const TabButton = ({ id, label, icon: Icon, colorClass }: any) => (
    <button 
      onClick={() => setActiveTab(id)} 
      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border ${
        activeTab === id 
        ? `bg-white ${colorClass} shadow-sm border-slate-200` 
        : 'text-slate-500 border-transparent hover:bg-slate-50'
      }`}
    >
      <Icon className="w-4 h-4" /> {label}
    </button>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight">User Management</h2>
            <p className="text-sm text-slate-500 font-bold">Manage team access & students.</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center bg-slate-100 p-1.5 rounded-xl">
            <TabButton id="active" label="Active" icon={UserCheck} colorClass="text-emerald-600" />
            <TabButton id="pending" label="Pending" icon={Clock} colorClass="text-orange-600" />
            <TabButton id="suspended" label="Suspended" icon={Ban} colorClass="text-red-600" />
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <TabButton id="invitations" label="Invites" icon={Mail} colorClass="text-indigo-600" />
        </div>
        <button onClick={() => setIsInviteOpen(true)} className="ml-auto xl:ml-0 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2"><span>✉️</span> Invite</button>
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
        onDeleteUser={handleDeleteUser} 
        onRevokeInvite={handleRevokeInvite} 
        onSelectUser={setSelectedUser}
      />

      <UserDetailView 
        user={selectedUser} 
        onClose={() => setSelectedUser(null)} 
        onSendReset={handleSendReset} 
        onDeleteUser={handleDeleteUser} 
        // Syncing Handlers
        onApproveUser={handleApproveUser} 
        onSuspendUser={handleSuspendUser} // Pass this to DetailView
        onRoleUpdate={handleRoleUpdate}
      />
      
      <InviteModal isOpen={isInviteOpen} onClose={() => setIsInviteOpen(false)} onInvite={handleInvite} email={inviteEmail} setEmail={setInviteEmail} role={inviteRole} setRole={setInviteRole} submitting={submitting} />
    </div>
  );
}