import { useState, useEffect } from "react";
import { 
  Trash2, KeyRound, Activity, Phone, 
  Building, Mail, GraduationCap, BookOpen, 
  Shield, User, CheckCircle2, MapPin, 
  Heart, ExternalLink, Loader2, 
  Ban, AlertTriangle, FileText, Star, Briefcase, Link as LinkIcon, Calendar
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; 

export default function UserDetailView({ user, onClose, onSendReset, onDeleteUser }: any) {
  
  // --- 1. STATE & HOOKS ---
  const [activeTab, setActiveTab] = useState<'profile' | 'likes'>('profile');
  const [likesData, setLikesData] = useState<any[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  
  // Local Management State (Initialized from props)
  const [status, setStatus] = useState(user?.status || 'pending');
  const [role, setRole] = useState(user?.role || 'student');
  const [notes, setNotes] = useState(user?.admin_notes || "");
  const [isFeatured, setIsFeatured] = useState(user?.is_featured || false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1.5 SYNC STATE ON PROP CHANGE (THE FIX) ---
  useEffect(() => {
    if (user) {
      // debug: check console to see if role arrives as 'undefined'
      console.log("Syncing User Data:", user.full_name, "Role:", user.role, "Status:", user.status); 

      setStatus(user.status || 'pending');
      setRole(user.role || 'student');
      setNotes(user.admin_notes || "");
      setIsFeatured(user.is_featured || false);
    }
  }, [user]);

  // --- 2. FETCH ACTIVITY ---
  useEffect(() => {
    if (activeTab === 'likes' && user?.id) {
      const fetchUserLikes = async () => {
        setLoadingLikes(true);
        const { data } = await supabase
          .from('likes')
          .select(`created_at, resources (id, title, type, subjects(title))`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (data) setLikesData(data);
        setLoadingLikes(false);
      };
      fetchUserLikes();
    }
  }, [activeTab, user?.id]);

  if (!user) return null;

  // --- 3. CORE ACTIONS ---
  
  // Update Profile Fields (Role, Status, Featured)
  const handleUpdateProfile = async (field: string, value: any) => {
    setIsSaving(true);
    
    // 1. Optimistic Update
    if(field === 'status') setStatus(value);
    if(field === 'role') setRole(value);
    if(field === 'is_featured') setIsFeatured(value);

    // 2. DB Update
    const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id);
    
    if (error) {
        alert(`❌ SAVE FAILED: ${error.message}\n\nDid you run the SQL RLS policy?`);
        // Revert State
        if(field === 'status') setStatus(user.status);
        if(field === 'role') setRole(user.role);
        if(field === 'is_featured') setIsFeatured(user.is_featured);
    }
    setIsSaving(false);
  };

  // Save Notes (Debounced/Blur)
  const saveNotes = async () => {
      if (notes === user.admin_notes) return;
      setIsSaving(true);
      const { error } = await supabase.from('profiles').update({ admin_notes: notes }).eq('id', user.id);
      if (error) alert("Failed to save notes. Check permissions.");
      setIsSaving(false);
  };

  // --- 4. FORMATTERS ---
  const formatGoal = (slug: string) => {
      if (!slug) return "Not Set";
      if (slug.includes('ssc')) return "SSC Preparation";
      if (slug.includes('hsc')) return "HSC Preparation";
      if (slug.includes('medical')) return "Medical Admission";
      if (slug.includes('university')) return "University Admission";
      if (slug.includes('mba')) return "IBA / MBA";
      if (slug.includes('job')) return "Job Preparation";
      return slug.replace('/resources/', '').replace(/-/g, ' '); 
  };


const getRoleIcon = (r: string) => {
    switch (r) {
      case 'student': return <GraduationCap className="w-4 h-4"/>;
      case 'tutor': return <BookOpen className="w-4 h-4"/>;
      case 'admin': return <Shield className="w-4 h-4"/>;
      case 'editor': return <Briefcase className="w-4 h-4"/>;
      default: return <User className="w-4 h-4"/>;
    }
  };

  const likesByType = likesData.reduce((acc: any, item: any) => {
    const type = item.resources?.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* HEADER */}
        <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <h3 className="text-lg font-bold text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4"/> User Details
             </h3>
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Overview</button>
                <button onClick={() => setActiveTab('likes')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'likes' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Heart className="w-3 h-3" /> Activity <span className="bg-slate-200 text-slate-600 px-1.5 rounded-full text-[10px]">{likesData.length || 0}</span>
                </button>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 flex items-center justify-center font-bold transition-colors">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
           
           {/* HERO SECTION */}
           <div className="p-8 pb-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-start gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm ${role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {user.full_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                  <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-2xl font-black text-slate-900">{user.full_name}</h4>
                        <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1">
                            <Mail className="w-3.5 h-3.5"/> {user.email}
                        </p>
                      </div>
                      {/* SAVING INDICATOR */}
                      {isSaving && <span className="text-xs font-bold text-indigo-600 flex items-center animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Saving...</span>}
                  </div>
                  
                  {/* === ADMIN ACTION BAR === */}
                  <div className="flex flex-wrap items-center gap-3 mt-5">
                      
                      {/* 1. ROLE DROPDOWN */}
                      <div className="relative group">
                          <select 
                            value={role} 
                            onChange={(e) => handleUpdateProfile('role', e.target.value)} 
                            className="appearance-none pl-9 pr-8 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer uppercase tracking-wider hover:bg-white transition-all shadow-sm"
                          >
                              <option value="student">Student</option>
                              <option value="tutor">Tutor</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{getRoleIcon(role)}</div>
                      </div>

                      {/* 2. STATUS DROPDOWN */}
                      <div className="relative">
                          <select 
                            value={status} 
                            onChange={(e) => handleUpdateProfile('status', e.target.value)} 
                            className={`appearance-none pl-9 pr-8 py-2 rounded-lg text-xs font-bold border outline-none cursor-pointer uppercase tracking-wider hover:brightness-95 transition-all shadow-sm
                                ${status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                                  status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' : 
                                  'bg-amber-50 text-amber-700 border-amber-200'}`}
                          >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="suspended">Suspended</option>
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600"/> : 
                               status === 'suspended' ? <Ban className="w-3.5 h-3.5 text-red-600"/> : 
                               <Activity className="w-3.5 h-3.5 text-amber-600"/>}
                          </div>
                      </div>

                      {/* 3. FEATURED TOGGLE (Tutor Only) */}
                      {role === 'tutor' && (
                          <button 
                            onClick={() => handleUpdateProfile('is_featured', !isFeatured)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all shadow-sm ${
                                isFeatured 
                                ? 'bg-amber-100 text-amber-700 border-amber-300 ring-2 ring-amber-200' 
                                : 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                            }`}
                          >
                              <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} /> 
                              {isFeatured ? "Featured Tutor" : "Promote to Featured"}
                          </button>
                      )}
                  </div>
              </div>
           </div>

           <div className="p-8">
              {/* === TAB 1: PROFILE === */}
              {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in">
                      
                      {/* LEFT COLUMN: DETAILS */}
                      <div className="md:col-span-7 space-y-6">
                          
                          {/* Admin Notes */}
                          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                              <h5 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4"/> Admin Private Notes
                              </h5>
                              <textarea 
                                  className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-amber-200 outline-none resize-none placeholder:text-slate-400"
                                  rows={3}
                                  placeholder="Write notes here (only visible to admins). Click outside to save."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  onBlur={saveNotes}
                              />
                              <p className="text-[10px] text-amber-700/60 mt-1.5 text-right italic">Changes save automatically on blur</p>
                          </div>

                          {/* Dynamic Info Card */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4"/> {role.charAt(0).toUpperCase() + role.slice(1)} Profile
                              </h5>
                              
                              {/* 1. Common Info */}
                              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                                  <div>
                                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone</p>
                                      <p className="font-bold text-slate-800">{user.phone || "—"}</p>
                                  </div>
                                  <div>
                                      <p className="text-xs text-slate-400 font-bold uppercase mb-1">Institution</p>
                                      <p className="font-bold text-slate-800">{user.institution || "—"}</p>
                                  </div>
                              </div>

                              {/* 2. STUDENT SPECIFIC */}
                              {role === 'student' && (
                                  <div className="space-y-4">
                                      <div>
                                          <p className="text-xs text-slate-400 font-bold uppercase mb-1">Target Goal</p>
                                          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">
                                              {formatGoal(user.current_goal || user.goal)}
                                          </span>
                                      </div>
                                      {user.date_of_birth && (
                                          <div>
                                              <p className="text-xs text-slate-400 font-bold uppercase mb-1">Date of Birth</p>
                                              <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
                                                  <Calendar className="w-4 h-4 text-slate-400" />
                                                  {new Date(user.date_of_birth).toLocaleDateString()}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              )}

                              {/* 3. TUTOR SPECIFIC */}
                              {role === 'tutor' && (
                                  <div className="space-y-5">
                                      <div>
                                          <p className="text-xs text-slate-400 font-bold uppercase mb-2">Interested Segments</p>
                                          <div className="flex flex-wrap gap-2">
                                              {user.interested_segments && user.interested_segments.length > 0 ? (
                                                  user.interested_segments.map((seg:string, i:number) => (
                                                      <span key={i} className="text-[11px] font-bold bg-purple-50 text-purple-700 px-2.5 py-1 rounded border border-purple-100">{seg}</span>
                                                  ))
                                              ) : <span className="text-sm text-slate-400 italic">No segments selected</span>}
                                          </div>
                                      </div>
                                      
                                      {user.academic_records && user.academic_records.length > 0 && (
                                          <div>
                                              <p className="text-xs text-slate-400 font-bold uppercase mb-2">Academic Records</p>
                                              <div className="space-y-2">
                                                  {user.academic_records.map((rec:any, i:number) => (
                                                      <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-100">
                                                          <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-400 font-bold text-xs">{i+1}</div>
                                                          <div>
                                                              <p className="text-xs font-bold text-slate-800">{rec.degree}</p>
                                                              <p className="text-[10px] text-slate-500">{rec.institute}</p>
                                                          </div>
                                                      </div>
                                                  ))}
                                              </div>
                                          </div>
                                      )}
                                  </div>
                              )}

                              {/* 4. EDITOR SPECIFIC */}
                              {role === 'editor' && user.skills && (
                                  <div>
                                      <p className="text-xs text-slate-400 font-bold uppercase mb-2">Skills</p>
                                      <div className="flex flex-wrap gap-2">
                                          {user.skills.map((sk:string, i:number) => (
                                              <span key={i} className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded border border-emerald-100">{sk}</span>
                                          ))}
                                      </div>
                                  </div>
                              )}
                          </div>

                          {/* Location Card */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center"><MapPin className="w-6 h-6" /></div>
                              <div>
                                  <p className="text-xs font-bold text-slate-400 uppercase">Last Known Location</p>
                                  <p className="text-lg font-bold text-slate-900">{user.city || "Unknown / Not Shared"}</p>
                                  {user.location_updated_at && <p className="text-[10px] text-slate-400 mt-0.5">Updated: {new Date(user.location_updated_at).toLocaleString()}</p>}
                              </div>
                          </div>
                      </div>

                      {/* RIGHT COLUMN: ACTIONS */}
                      <div className="md:col-span-5 space-y-6">
                          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Security & Access</h5>
                              <div className="space-y-3">
                                <button onClick={() => onSendReset(user.email)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all text-left group">
                                    <KeyRound className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors"/>
                                    <div><p className="text-sm font-bold">Reset Password</p><p className="text-[10px] text-slate-400">Send recovery email</p></div>
                                </button>
                                <button onClick={() => onDeleteUser(user.id)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-red-900/40 transition-all text-left group">
                                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-200 transition-colors"/>
                                    <div><p className="text-sm font-bold text-red-100">Delete Account</p><p className="text-[10px] text-red-300/60">Permanent action</p></div>
                                </button>
                              </div>
                          </div>
                          
                          {status === 'suspended' && (
                              <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex items-start gap-4 animate-in slide-in-from-right-2">
                                  <div className="bg-red-100 p-2 rounded-full"><AlertTriangle className="w-6 h-6 text-red-600" /></div>
                                  <div>
                                      <h5 className="text-sm font-bold text-red-800">Account Suspended</h5>
                                      <p className="text-xs text-red-600 mt-1 leading-relaxed">This user cannot log in or access any materials. Set status to 'Active' to restore access.</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {/* === TAB 2: ACTIVITY (ROBUST) === */}
              {activeTab === 'likes' && (
                  <div className="animate-in fade-in space-y-6">
                      {loadingLikes ? (
                          <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
                              <Loader2 className="w-8 h-8 animate-spin text-indigo-500" /> 
                              <p className="text-xs font-bold uppercase tracking-wider">Loading Activity...</p>
                          </div>
                      ) : likesData.length === 0 ? (
                          <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm"><Heart className="w-8 h-8 text-slate-300" /></div>
                              <h4 className="text-slate-900 font-bold text-lg">No Activity Yet</h4>
                              <p className="text-slate-500 text-sm mt-1">This user hasn't liked any resources.</p>
                          </div>
                      ) : (
                          <>
                              {/* Summary Cards */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-2xl shadow-lg text-white">
                                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Total Likes</p>
                                      <p className="text-3xl font-black mt-1">{likesData.length}</p>
                                  </div>
                                  {Object.entries(likesByType).map(([type, count]: any) => (
                                      <div key={type} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{type}s</p>
                                          <p className="text-3xl font-black text-slate-800 mt-1">{count}</p>
                                      </div>
                                  ))}
                              </div>

                              {/* Detailed List */}
                              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                  <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                                      <h5 className="font-bold text-slate-700 text-xs uppercase tracking-wide">Recent Interactions</h5>
                                  </div>
                                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                                      {likesData.map((like) => (
                                          <div key={like.created_at} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                              <div className="flex items-center gap-4 overflow-hidden">
                                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg ${
                                                      like.resources?.type === 'video' ? 'bg-red-50 text-red-500' : 
                                                      like.resources?.type === 'pdf' ? 'bg-orange-50 text-orange-500' : 
                                                      'bg-blue-50 text-blue-500'
                                                  }`}>
                                                      {like.resources?.type === 'video' ? '▶' : like.resources?.type === 'pdf' ? '📄' : '📝'}
                                                  </div>
                                                  <div className="min-w-0">
                                                      <p className="text-sm font-bold text-slate-800 truncate">{like.resources?.title || "Unknown Resource"}</p>
                                                      <div className="flex items-center gap-2 mt-0.5">
                                                          <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">{like.resources?.type}</span>
                                                          <span className="text-[10px] text-slate-400">• {new Date(like.created_at).toLocaleDateString()}</span>
                                                      </div>
                                                  </div>
                                              </div>
                                              <Link href={`/${like.resources?.type === 'question' ? 'question' : 'blog'}/${like.resources?.id}`} target="_blank" className="p-2 rounded-lg border border-slate-200 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-200 transition-all">
                                                  <ExternalLink className="w-4 h-4" />
                                              </Link>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                          </>
                      )}
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}