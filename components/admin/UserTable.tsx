import { Eye, Trash2, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";

export default function UserTable({ 
  activeTab, users, invites, loading, 
  page, setPage, totalPages, totalItems, 
  onRoleUpdate, onDeleteUser, onRevokeInvite, onSelectUser 
}: any) {
  
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
      {loading ? (
         <div className="flex items-center justify-center h-[400px] text-slate-400 font-bold">Loading Data...</div>
      ) : (
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
             {activeTab === 'users' ? users.map((user: any) => (
               <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                 <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectUser(user)}>
                   <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border">{user.full_name?.[0]?.toUpperCase() || "?"}</div>
                      <div><p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{user.full_name}</p><p className="text-xs text-slate-400">{user.email}</p></div>
                   </div>
                 </td>
                 <td className="px-6 py-4">
                    <select value={user.role} onChange={(e) => onRoleUpdate(user.id, e.target.value)} className="bg-white border border-slate-200 text-xs font-bold py-1 px-2 rounded uppercase cursor-pointer outline-none focus:border-indigo-500">
                      <option value="student">Student</option><option value="tutor">Tutor</option><option value="editor">Editor</option><option value="institute">Institute</option><option value="admin">Admin</option>
                    </select>
                 </td>
                 <td className="px-6 py-4">
                     {user.status === 'pending' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-600 uppercase tracking-wide"><Clock className="w-3 h-3"/> Review</span>
                     ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-wide"><CheckCircle className="w-3 h-3"/> Active</span>
                     )}
                 </td>
                 <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                 <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                    <button onClick={() => onSelectUser(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Eye className="w-4 h-4"/></button>
                    <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4"/></button>
                 </td>
               </tr>
             )) : invites.map((invite: any) => (
               <tr key={invite.id} className="hover:bg-slate-50 transition-colors">
                 <td className="px-6 py-4 font-bold text-slate-700">{invite.email}</td>
                 <td className="px-6 py-4"><span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-[10px] font-black uppercase text-slate-600">{invite.role}</span></td>
                 <td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-600 uppercase tracking-wide"><Clock className="w-3 h-3"/> Pending</span></td>
                 <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">{new Date(invite.created_at).toLocaleDateString()}</td>
                 <td className="px-6 py-4 text-right"><button onClick={() => onRevokeInvite(invite.id)} className="text-red-400 hover:text-red-600 font-bold text-xs bg-red-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-100">Revoke</button></td>
               </tr>
             ))}
             {users.length === 0 && invites.length === 0 && (
               <tr><td colSpan={5} className="text-center py-12 text-slate-400">No records found.</td></tr>
             )}
           </tbody>
         </table>
      )}
      
      {/* Pagination Footer */}
      <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
         <span className="text-xs font-bold text-slate-400 uppercase">Page {page} of {totalPages || 1} ({totalItems} items)</span>
         <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 bg-white border rounded-lg text-slate-500 disabled:opacity-50 hover:bg-slate-50"><ChevronLeft className="w-4 h-4"/></button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-2 bg-white border rounded-lg text-slate-500 disabled:opacity-50 hover:bg-slate-50"><ChevronRight className="w-4 h-4"/></button>
         </div>
      </div>
    </div>
  );
}