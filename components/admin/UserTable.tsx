import { Eye, Trash2, Clock, CheckCircle, ChevronLeft, ChevronRight, Ban, Star, FileText, Shield, GraduationCap, BookOpen } from "lucide-react";

export default function UserTable({ 
  activeTab, users, invites, loading, 
  page, setPage, totalPages, totalItems, 
  onDeleteUser, onRevokeInvite, onSelectUser 
}: any) {
  
  // Helper for Role Styles
  const getRoleBadge = (role: string, isFeatured: boolean) => {
    switch (role) {
      case 'admin': 
        return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 px-2 py-1 rounded text-[10px] font-black uppercase border border-red-100"><Shield className="w-3 h-3"/> Admin</span>;
      case 'tutor': 
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-black uppercase border ${isFeatured ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>
            <BookOpen className="w-3 h-3"/> {isFeatured ? 'Featured Tutor' : 'Tutor'}
            {isFeatured && <Star className="w-3 h-3 fill-amber-500 text-amber-500 ml-1" />}
          </span>
        );
      case 'student': 
        return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase border border-blue-100"><GraduationCap className="w-3 h-3"/> Student</span>;
      default: 
        return <span className="bg-slate-100 border border-slate-200 px-2 py-1 rounded text-[10px] font-black uppercase text-slate-600">{role}</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
      {loading ? (
         <div className="flex items-center justify-center h-[400px] text-slate-400 font-bold animate-pulse">Loading Data...</div>
      ) : (
         <table className="w-full text-left text-sm">
           <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-400 border-b border-slate-100">
             <tr>
               <th className="px-6 py-4">{activeTab === 'users' ? 'User Identity' : 'Email'}</th>
               <th className="px-6 py-4">Role</th>
               <th className="px-6 py-4">Status</th>
               <th className="px-6 py-4 text-right">Joined</th>
               <th className="px-6 py-4 text-right">Actions</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
             {activeTab === 'users' ? users.map((user: any) => (
               <tr key={user.id} className={`transition-colors group ${user.status === 'suspended' ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-slate-50'}`}>
                 
                 {/* USER INFO */}
                 <td className="px-6 py-4 cursor-pointer" onClick={() => onSelectUser(user)}>
                   <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm ${user.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-600'}`}>
                          {user.full_name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                          <div className="flex items-center gap-2">
                              <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{user.full_name}</p>
                              {/* Show Note Icon if Admin Notes exist */}
                              {user.admin_notes && (
                                <span title="Has Admin Notes" className="text-amber-500"><FileText className="w-3 h-3 fill-amber-100"/></span>
                              )}
                          </div>
                          <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                   </div>
                 </td>

                 {/* ROLE DISPLAY (Read-Only) */}
                 <td className="px-6 py-4">
                     {getRoleBadge(user.role, user.is_featured)}
                 </td>

                 {/* STATUS */}
                 <td className="px-6 py-4">
                     {user.status === 'suspended' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-red-100 text-red-700 uppercase tracking-wide border border-red-200">
                             <Ban className="w-3 h-3"/> Suspended
                         </span>
                     ) : user.status === 'pending' ? (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-50 text-orange-600 uppercase tracking-wide border border-orange-100">
                             <Clock className="w-3 h-3"/> Review
                         </span>
                     ) : (
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 uppercase tracking-wide border border-emerald-100">
                             <CheckCircle className="w-3 h-3"/> Active
                         </span>
                     )}
                 </td>

                 {/* DATE */}
                 <td className="px-6 py-4 text-right text-xs font-bold text-slate-400">
                    {new Date(user.created_at).toLocaleDateString()}
                 </td>

                 {/* ACTIONS */}
                 <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onSelectUser(user)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="View Details">
                            <Eye className="w-4 h-4"/>
                        </button>
                        <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete User">
                            <Trash2 className="w-4 h-4"/>
                        </button>
                    </div>
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
               <tr><td colSpan={5} className="text-center py-12 text-slate-400 font-medium">No records found matching your filters.</td></tr>
             )}
           </tbody>
         </table>
      )}
      
      {/* Pagination Footer */}
      <div className="flex justify-between items-center p-4 border-t border-slate-100 bg-slate-50">
         <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Page {page} of {totalPages || 1} <span className="opacity-50 mx-1">|</span> {totalItems} items</span>
         <div className="flex gap-2">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="p-2 bg-white border rounded-lg text-slate-500 disabled:opacity-50 hover:bg-slate-100 transition-colors shadow-sm"><ChevronLeft className="w-4 h-4"/></button>
            <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="p-2 bg-white border rounded-lg text-slate-500 disabled:opacity-50 hover:bg-slate-100 transition-colors shadow-sm"><ChevronRight className="w-4 h-4"/></button>
         </div>
      </div>
    </div>
  );
}