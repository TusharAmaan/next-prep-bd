import { useState, useEffect } from "react";
import { 
  Trash2, KeyRound, Activity, Phone, 
  Building, Mail, GraduationCap, BookOpen, 
  Shield, User, CheckCircle2, MapPin, 
  Heart, ExternalLink, Loader2, Save, 
  Ban, AlertTriangle, FileText, Star
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; 

export default function UserDetailView({ user, onClose, onSendReset, onDeleteUser }: any) {
  // --- 1. HOOKS (Must be at the top) ---
  const [activeTab, setActiveTab] = useState<'profile' | 'likes'>('profile');
  const [likesData, setLikesData] = useState<any[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);
  
  // --- MANAGEMENT STATE ---
  const [status, setStatus] = useState(user?.status || 'pending');
  const [role, setRole] = useState(user?.role || 'student');
  const [notes, setNotes] = useState(user?.admin_notes || "");
  const [isFeatured, setIsFeatured] = useState(user?.is_featured || false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 2. FETCH LIKES EFFECT ---
  useEffect(() => {
    if (activeTab === 'likes' && user?.id) {
      const fetchUserLikes = async () => {
        setLoadingLikes(true);
        const { data, error } = await supabase
          .from('likes')
          .select(`created_at, resources (id, title, type, subjects(title))`)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) setLikesData(data);
        setLoadingLikes(false);
      };
      fetchUserLikes();
    }
  }, [activeTab, user?.id]);

  // Safe Guard
  if (!user) return null;

  // --- 3. MANAGEMENT HANDLERS ---
  
  // Generic Profile Update (Role/Status)
  const handleUpdateProfile = async (field: string, value: string) => {
    setIsSaving(true);
    // Optimistic Update
    if (field === 'status') setStatus(value);
    if (field === 'role') setRole(value);

    const { error } = await supabase
        .from('profiles')
        .update({ [field]: value })
        .eq('id', user.id);
    
    if (error) {
        alert(`Failed to update ${field}`);
        // Revert (Simplified)
        if (field === 'status') setStatus(user.status);
        if (field === 'role') setRole(user.role);
    }
    setIsSaving(false);
  };

  // Toggle Featured (For Tutors)
  const toggleFeatured = async () => {
      const newValue = !isFeatured;
      setIsFeatured(newValue);
      const { error } = await supabase.from('profiles').update({ is_featured: newValue }).eq('id', user.id);
      if (error) {
          setIsFeatured(!newValue); // Revert
          alert("Failed to update featured status");
      }
  };

  // Save Admin Notes (On Blur)
  const saveNotes = async () => {
      if (notes === user.admin_notes) return; // Don't save if no change
      setIsSaving(true);
      await supabase.from('profiles').update({ admin_notes: notes }).eq('id', user.id);
      setIsSaving(false);
  };

  // --- 4. HELPERS ---
  const getReadableGoal = (slug: string) => {
    if (!slug) return "Not Set";
    if (slug.includes('ssc')) return "SSC Preparation";
    if (slug.includes('hsc')) return "HSC Preparation";
    if (slug.includes('medical')) return "Medical Admission";
    if (slug.includes('university')) return "University Admission";
    if (slug.includes('mba')) return "IBA / MBA";
    if (slug.includes('job')) return "Job Preparation";
    return slug;
  };
  const displayGoal = getReadableGoal(user.current_goal || user.goal);

  const getRoleIcon = (r: string) => {
    switch (r) {
      case 'student': return <GraduationCap className="w-4 h-4"/>;
      case 'tutor': return <BookOpen className="w-4 h-4"/>;
      case 'admin': return <Shield className="w-4 h-4"/>;
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
                <User className="w-4 h-4"/> User Profile
             </h3>
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Overview</button>
                <button onClick={() => setActiveTab('likes')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'likes' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><Heart className="w-3 h-3" /> Activity</button>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 flex items-center justify-center font-bold">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
           
           {/* HERO SECTION (EDITABLE) */}
           <div className="p-8 pb-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-start gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm ${role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                  {user.full_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1">
                  <h4 className="text-2xl font-black text-slate-900">{user.full_name}</h4>
                  <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1">
                     <Mail className="w-3.5 h-3.5"/> {user.email}
                  </p>
                  
                  {/* ADMIN CONTROLS */}
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                      {/* Role Select */}
                      <div className="relative group">
                          <select 
                            value={role}
                            onChange={(e) => handleUpdateProfile('role', e.target.value)}
                            className="appearance-none pl-9 pr-8 py-1.5 rounded-full text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer uppercase tracking-wider hover:bg-white transition-all"
                          >
                              <option value="student">Student</option>
                              <option value="tutor">Tutor</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{getRoleIcon(role)}</div>
                      </div>

                      {/* Status Select */}
                      <div className="relative">
                          <select 
                            value={status}
                            onChange={(e) => handleUpdateProfile('status', e.target.value)}
                            className={`appearance-none pl-9 pr-8 py-1.5 rounded-full text-xs font-bold border outline-none cursor-pointer uppercase tracking-wider hover:brightness-95 transition-all
                                ${status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 
                                  status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' : 
                                  'bg-orange-50 text-orange-700 border-orange-200'}`}
                          >
                              <option value="active">Active</option>
                              <option value="pending">Pending</option>
                              <option value="suspended">Suspended</option>
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                              {status === 'active' ? <CheckCircle2 className="w-3.5 h-3.5 text-green-600"/> : 
                               status === 'suspended' ? <Ban className="w-3.5 h-3.5 text-red-600"/> : 
                               <Activity className="w-3.5 h-3.5 text-orange-600"/>}
                          </div>
                      </div>

                      {/* Featured Toggle (Only Tutors) */}
                      {role === 'tutor' && (
                          <button 
                            onClick={toggleFeatured}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                                isFeatured 
                                ? 'bg-amber-100 text-amber-700 border-amber-300' 
                                : 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                            }`}
                          >
                              <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} />
                              {isFeatured ? "Featured" : "Promote"}
                          </button>
                      )}
                      
                      {isSaving && <span className="text-xs text-slate-400 flex items-center animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Saving...</span>}
                  </div>
              </div>
           </div>

           <div className="p-8">
              {/* TAB 1: PROFILE */}
              {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in">
                      
                      {/* Left: Info */}
                      <div className="md:col-span-7 space-y-6">
                          
                          {/* ADMIN NOTES */}
                          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                              <h5 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4"/> Admin Notes
                              </h5>
                              <textarea 
                                  className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-amber-200 outline-none resize-none placeholder:text-slate-400"
                                  rows={3}
                                  placeholder="Internal notes (visible only to admins)..."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  onBlur={saveNotes}
                              />
                              <p className="text-[10px] text-amber-700/60 mt-1.5 text-right italic">Auto-saves on exit</p>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4"/> Education
                              </h5>
                              <div className="space-y-3">
                                  <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                      <span className="text-slate-500 font-medium">Institution</span>
                                      <span className="font-bold text-slate-900">{user.institution || "—"}</span>
                                  </div>
                                  <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                      <span className="text-slate-500 font-medium">Target Goal</span>
                                      <span className="font-bold text-blue-600 bg-blue-50 px-2 rounded text-right">{displayGoal}</span>
                                  </div>
                                  <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                      <span className="text-slate-500 font-medium">Phone</span>
                                      <span className="font-bold text-slate-900">{user.phone || "—"}</span>
                                  </div>
                              </div>
                          </div>

                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <MapPin className="w-4 h-4"/> Location Data
                              </h5>
                              <div className="flex items-start gap-3">
                                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><MapPin className="w-5 h-5" /></div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase">Current City</p>
                                      <p className="text-lg font-bold text-slate-900">{user.city || "Not Reachable"}</p>
                                      {user.location_updated_at && (
                                          <p className="text-[10px] text-slate-400 mt-1">Updated: {new Date(user.location_updated_at).toLocaleDateString()}</p>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="md:col-span-5 space-y-6">
                          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Control</h5>
                              <div className="space-y-3">
                                <button onClick={() => onSendReset(user.email)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all text-left group">
                                    <KeyRound className="w-4 h-4 text-indigo-400 group-hover:text-white transition-colors"/>
                                    <span className="text-sm font-bold">Reset Password</span>
                                </button>
                                <button onClick={() => onDeleteUser(user.id)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-red-900/40 transition-all text-left group">
                                    <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-200 transition-colors"/>
                                    <span className="text-sm font-bold text-red-100">Delete Account</span>
                                </button>
                              </div>
                          </div>
                          
                          {/* SUSPENSION WARNING */}
                          {status === 'suspended' && (
                              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
                                  <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
                                  <div>
                                      <h5 className="text-sm font-bold text-red-800">User Suspended</h5>
                                      <p className="text-xs text-red-600 mt-1">This user cannot log in or access materials.</p>
                                  </div>
                              </div>
                          )}
                      </div>
                  </div>
              )}

              {/* TAB 2: LIKES */}
              {activeTab === 'likes' && (
                  <div className="animate-in fade-in space-y-6">
                      {loadingLikes ? (
                          <div className="flex items-center justify-center py-12 text-slate-400"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading history...</div>
                      ) : likesData.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                              <Heart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                              <p className="text-slate-500 font-medium">No activity recorded yet.</p>
                          </div>
                      ) : (
                          <>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Likes</p>
                                      <p className="text-3xl font-black text-rose-500 mt-1">{likesData.length}</p>
                                  </div>
                                  {Object.entries(likesByType).map(([type, count]: any) => (
                                      <div key={type} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{type}s</p>
                                          <p className="text-3xl font-black text-slate-800 mt-1">{count}</p>
                                      </div>
                                  ))}
                              </div>

                              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto custom-scrollbar">
                                      {likesData.map((like) => (
                                          <div key={like.created_at} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                              <div className="flex-1 pr-4">
                                                  <div className="flex items-center gap-2 mb-1">
                                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${like.resources?.type === 'blog' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>{like.resources?.type || 'Resource'}</span>
                                                      <span className="text-[10px] text-slate-400">{new Date(like.created_at).toLocaleDateString()}</span>
                                                  </div>
                                                  <p className="text-sm font-bold text-slate-800 line-clamp-1">{like.resources?.title || "Unknown Resource"}</p>
                                              </div>
                                              <Link href={`/${like.resources?.type === 'question' ? 'question' : 'blog'}/${like.resources?.id}`} target="_blank" className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all opacity-0 group-hover:opacity-100">
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