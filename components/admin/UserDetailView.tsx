import { 
  Trash2, KeyRound, Activity, Calendar, Phone, 
  Building, Mail, GraduationCap, BookOpen, 
  School, CheckCircle2, XCircle, Shield, User
} from "lucide-react";

export default function UserDetailView({ user, onClose, onSendReset, onDeleteUser, onApproveUser }: any) {
  if (!user) return null;

  // --- 1. HELPER: Get Role Specific Styles & Icons ---
  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'student': return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <GraduationCap className="w-4 h-4"/>, label: 'Student' };
      case 'tutor':   return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <BookOpen className="w-4 h-4"/>, label: 'Tutor' };
      case 'admin':   return { color: 'bg-red-100 text-red-700 border-red-200', icon: <Shield className="w-4 h-4"/>, label: 'Administrator' };
      case 'editor':  return { color: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: <User className="w-4 h-4"/>, label: 'Editor' };
      default:        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <User className="w-4 h-4"/>, label: role || 'User' };
    }
  };

  const theme = getRoleTheme(user.role);

  // --- 2. HELPER: Parse JSON Fields safely (if subjects is stored as JSON/Array) ---
  const renderList = (data: any) => {
    if (Array.isArray(data)) return data.join(", ");
    if (typeof data === 'string' && data.startsWith('[')) {
        try { return JSON.parse(data).join(", "); } catch { return data; }
    }
    return data || "None";
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* CARD CONTAINER */}
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* HEADER */}
        <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <h3 className="text-lg font-bold text-slate-500 flex items-center gap-2">
            <User className="w-4 h-4"/> User Profile
          </h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          
          {/* --- HERO SECTION --- */}
          <div className="p-8 pb-6 bg-slate-50/50 border-b border-slate-100 flex flex-col sm:flex-row items-start gap-6">
            {/* Avatar */}
            <div className={`w-24 h-24 rounded-2xl shadow-sm flex items-center justify-center text-4xl font-bold border-4 border-white ${theme.color.replace('bg-', 'bg-opacity-20 ')}`}>
               {user.full_name?.[0]?.toUpperCase() || "?"}
            </div>

            {/* Name & Basic Info */}
            <div className="flex-1 space-y-2">
               <div>
                  <h4 className="text-3xl font-black text-slate-900 tracking-tight">{user.full_name}</h4>
                  <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1">
                    <Mail className="w-3.5 h-3.5"/> {user.email}
                  </p>
               </div>

               <div className="flex flex-wrap gap-2 mt-3">
                  {/* Role Badge */}
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${theme.color}`}>
                     {theme.icon} <span>{theme.label}</span>
                  </div>

                  {/* Status Badge */}
                  {user.status === 'active' ? (
                     <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5"/> <span>Active</span>
                     </div>
                  ) : (
                     <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        <Activity className="w-3.5 h-3.5"/> <span>{user.status || "Pending"}</span>
                     </div>
                  )}
               </div>
            </div>
          </div>

          {/* --- APPROVAL ACTION (Only if Pending) --- */}
          {user.status === 'pending' && (
              <div className="mx-8 mt-6 p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex gap-3">
                      <div className="p-2 bg-orange-100 text-orange-600 rounded-lg h-fit"><Shield className="w-5 h-5"/></div>
                      <div>
                          <h5 className="font-bold text-orange-900 text-sm">Approval Required</h5>
                          <p className="text-xs text-orange-700 mt-0.5">User requested access as <strong>{user.role}</strong>.</p>
                      </div>
                  </div>
                  <button onClick={() => onApproveUser(user.id)} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold text-xs shadow-md shadow-orange-200 transition-all active:scale-95">
                      Approve Access
                  </button>
              </div>
          )}

          {/* --- MAIN GRID LAYOUT --- */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
             
             {/* LEFT COL: Personal Details */}
             <div className="md:col-span-7 space-y-8">
                
                {/* 1. ACADEMIC / PROFESSIONAL INFO */}
                <section>
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        {user.role === 'student' ? <GraduationCap className="w-4 h-4"/> : <Building className="w-4 h-4"/>}
                        {user.role === 'student' ? 'Academic Profile' : 'Professional Info'}
                    </h5>
                    
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                        {/* Institution */}
                        <div className="flex justify-between items-center border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                            <span className="text-sm font-semibold text-slate-500">Institution</span>
                            <span className="text-sm font-bold text-slate-900 text-right">{user.institution || "—"}</span>
                        </div>

                        {/* Student Specific: GOAL */}
                        {user.role === 'student' && (
                            <div className="flex justify-between items-center border-b border-slate-200 pb-3 last:border-0 last:pb-0">
                                <span className="text-sm font-semibold text-slate-500">Target Exam (Goal)</span>
                                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-right">
                                    {user.goal || "—"}
                                </span>
                            </div>
                        )}

                        {/* Subjects */}
                        {(user.subjects || user.expertise) && (
                            <div className="flex flex-col gap-2 pt-1">
                                <span className="text-sm font-semibold text-slate-500">
                                    {user.role === 'tutor' ? 'Expertise Areas' : 'Enrolled Subjects'}
                                </span>
                                <div className="text-sm font-medium text-slate-800 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                                    {renderList(user.subjects || user.expertise)}
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* 2. CONTACT INFO */}
                <section>
                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Phone className="w-4 h-4"/> Contact Details
                    </h5>
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Phone Number</p>
                            <p className="text-sm font-semibold text-slate-800">{user.phone || "Not Provided"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Location/City</p>
                            <p className="text-sm font-semibold text-slate-800">{user.city || "—"}</p>
                        </div>
                        <div>
                            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Date Joined</p>
                            <p className="text-sm font-semibold text-slate-800">{new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                    </div>
                </section>
             </div>

             {/* RIGHT COL: Actions & Logs */}
             <div className="md:col-span-5 space-y-6">
                
                {/* ACTIONS PANEL */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl shadow-slate-200">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Admin Actions</h5>
                    
                    <div className="space-y-3">
                        <button 
                            onClick={() => onSendReset(user.email)} 
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 hover:border-slate-600 group text-left"
                        >
                            <KeyRound className="w-5 h-5 text-indigo-400"/>
                            <div>
                                <p className="text-sm font-bold text-slate-200">Reset Password</p>
                                <p className="text-[10px] text-slate-400">Send recovery email</p>
                            </div>
                        </button>

                        <button 
                            onClick={() => onDeleteUser(user.id)} 
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-red-900/30 transition-all border border-slate-700 hover:border-red-900 group text-left"
                        >
                            <Trash2 className="w-5 h-5 text-red-400"/>
                            <div>
                                <p className="text-sm font-bold text-red-100">Delete Account</p>
                                <p className="text-[10px] text-slate-400">Permanently remove</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* LOGS / METADATA */}
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                    <h5 className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-4">
                        <Activity className="w-4 h-4"/> Audit Log
                    </h5>
                    <div className="space-y-3 pl-2 border-l-2 border-slate-200">
                        <div className="relative">
                            <span className="absolute -left-[13px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-slate-50"></span>
                            <p className="text-xs font-bold text-slate-700">Account Created</p>
                            <p className="text-[10px] text-slate-400">{new Date(user.created_at).toLocaleString()}</p>
                        </div>
                        {user.updated_at && (
                            <div className="relative pt-2">
                                <span className="absolute -left-[13px] top-3 w-2.5 h-2.5 rounded-full bg-blue-300 ring-4 ring-slate-50"></span>
                                <p className="text-xs font-bold text-slate-700">Last Profile Update</p>
                                <p className="text-[10px] text-slate-400">{new Date(user.updated_at).toLocaleString()}</p>
                            </div>
                        )}
                    </div>
                </div>

             </div>
          </div>
        </div>
      </div>
    </div>
  );
}