import { Trash2, KeyRound, Activity, Calendar, Phone, Building } from "lucide-react";

export default function UserDetailView({ user, onClose, onSendReset, onDeleteUser, onApproveUser }: any) {
  if (!user) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-pop-in flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-900">User Profile</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center font-bold">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* HEADER INFO */}
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold">{user.full_name?.[0] || "?"}</div>
            <div>
              <h4 className="text-2xl font-black text-slate-900">{user.full_name}</h4>
              <div className="flex gap-2 mt-2">
                 <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-indigo-100">{user.role}</span>
                 <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">{user.email}</span>
              </div>
            </div>
          </div>

          {/* PENDING APPROVAL ALERT */}
          {user.status === 'pending' && (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center justify-between">
                  <div>
                      <h5 className="font-bold text-orange-800 text-sm">Verification Needed</h5>
                      <p className="text-xs text-orange-600">This user requested to be a {user.role}.</p>
                  </div>
                  <button onClick={() => onApproveUser(user.id)} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs shadow-lg transition-all">Approve Account</button>
              </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-4">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Details</h5>
                <div className="space-y-3">
                   <div className="flex items-center gap-2 text-sm text-slate-700"><Building className="w-4 h-4 text-slate-400"/> <strong>Institution:</strong> {user.institution || "N/A"}</div>
                   <div className="flex items-center gap-2 text-sm text-slate-700"><Phone className="w-4 h-4 text-slate-400"/> <strong>Phone:</strong> {user.phone || "N/A"}</div>
                   <div className="flex items-center gap-2 text-sm text-slate-700"><Calendar className="w-4 h-4 text-slate-400"/> <strong>Joined:</strong> {new Date(user.created_at).toDateString()}</div>
                </div>
             </div>
             
             <div className="space-y-4">
                <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Actions</h5>
                <button onClick={() => onSendReset(user.email)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-all group text-left">
                   <div className="bg-white p-2 rounded-lg shadow-sm group-hover:text-indigo-600"><KeyRound className="w-5 h-5"/></div>
                   <div><p className="text-xs font-bold text-slate-800">Send Password Reset</p><p className="text-[10px] text-slate-400">Email a reset link</p></div>
                </button>
                <button onClick={() => onDeleteUser(user.id)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-100 hover:border-red-300 hover:bg-red-50 transition-all group text-left">
                   <div className="bg-white p-2 rounded-lg shadow-sm text-red-500"><Trash2 className="w-5 h-5"/></div>
                   <div><p className="text-xs font-bold text-red-600">Delete Account</p><p className="text-[10px] text-red-400">Revoke access permanently</p></div>
                </button>
             </div>
          </div>

          {/* LOGS SECTION */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
             <h5 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4"><Activity className="w-4 h-4"/> Recent Logs</h5>
             <div className="space-y-2">
                <div className="flex justify-between items-center text-xs p-2.5 bg-white rounded-lg border border-slate-100 shadow-sm">
                   <span className="font-bold text-slate-700">Account Created</span>
                   <span className="text-slate-400">{new Date(user.created_at).toLocaleString()}</span>
                </div>
                {/* Placeholder for future specific logs */}
                <div className="text-center text-[10px] text-slate-400 italic py-2">End of activity history.</div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}