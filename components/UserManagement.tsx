"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

// --- TYPES ---
type UserProfile = {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  bio?: string;     // Profile fields
  phone?: string;
  institution?: string;
};

export default function UserManagement() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null); // For Detail View
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  
  // Invite State
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);

  // 1. FETCH USERS
  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) setUsers(data);
    setLoading(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  // 2. UPDATE ROLE
  const handleRoleUpdate = async (userId: string, newRole: string) => {
    const originalUsers = [...users];
    
    // Optimistic Update (Update UI immediately)
    setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) {
      alert("Error updating role: " + error.message);
      setUsers(originalUsers); // Revert on error
    }
  };

  // 3. DELETE USER
  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure? This removes their access immediately.")) return;

    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      
      if (!res.ok) throw new Error("Failed to delete");
      
      setUsers(users.filter(u => u.id !== userId)); // Remove from UI
      alert("User removed.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  // 4. INVITE USER
  const handleInvite = async () => {
    setInviting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const res = await fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole, invitedByEmail: user?.email }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      alert("Invitation sent! (If using free Resend, only verified emails receive it)");
      setIsInviteOpen(false);
      setInviteEmail("");
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setInviting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading Users...</div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* HEADER & INVITE BUTTON */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">User Management</h2>
          <p className="text-sm text-slate-500">Manage {users.length} registered users</p>
        </div>
        <button onClick={() => setIsInviteOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all flex items-center gap-2">
          <span>✉️</span> Invite New User
        </button>
      </div>

      {/* USER LIST */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                <td className="px-6 py-4 cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                      {user.full_name ? user.full_name[0].toUpperCase() : "?"}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-base group-hover:text-indigo-600 transition-colors">
                        {user.full_name || "No Name Set"}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={user.role} 
                    onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                    className={`border-none bg-opacity-20 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wide cursor-pointer focus:ring-2 focus:ring-indigo-500
                      ${user.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 
                        user.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                        user.role === 'institute' ? 'bg-purple-100 text-purple-700' :
                        'bg-gray-100 text-gray-600'
                      }`}
                  >
                    <option value="student">Student</option>
                    <option value="tutor">Tutor</option>
                    <option value="editor">Editor</option>
                    <option value="institute">Institute</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-right flex items-center justify-end gap-3">
                  <button onClick={() => setSelectedUser(user)} className="text-slate-400 hover:text-indigo-600 font-bold text-xs">View</button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-300 hover:text-red-600 font-bold text-xs">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: USER DETAILS */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
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
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Email</label>
                    <p className="text-sm font-bold text-slate-700">{selectedUser.email}</p>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block">Joined</label>
                    <p className="text-sm font-bold text-slate-700">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Bio</label>
                  <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100 italic">
                    {selectedUser.bio || "No bio provided yet."}
                  </p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Contact / Institution</label>
                  <div className="flex gap-2">
                     <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg text-gray-600">📞 {selectedUser.phone || "N/A"}</span>
                     <span className="text-xs bg-gray-100 px-3 py-1 rounded-lg text-gray-600">🏫 {selectedUser.institution || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
               <button onClick={() => setSelectedUser(null)} className="text-sm font-bold text-slate-500 hover:text-slate-800">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INVITE */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-pop-in">
            <h3 className="text-xl font-black text-slate-900 mb-1">Invite Member</h3>
            <p className="text-xs text-slate-500 mb-6">Send an email invitation to join the team.</p>
            
            <div className="space-y-4">
              <input 
                className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500"
                placeholder="email@address.com"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
              />
              <select 
                className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 bg-white"
                value={inviteRole}
                onChange={e => setInviteRole(e.target.value)}
              >
                <option value="editor">Editor</option>
                <option value="tutor">Tutor</option>
                <option value="institute">Institute</option>
                <option value="admin">Admin</option>
              </select>
              <button 
                onClick={handleInvite} 
                disabled={inviting}
                className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50"
              >
                {inviting ? "Sending..." : "Send Invitation"}
              </button>
              <button onClick={() => setIsInviteOpen(false)} className="w-full text-xs font-bold text-slate-400 py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}