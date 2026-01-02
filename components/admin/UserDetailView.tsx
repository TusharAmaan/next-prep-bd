import { useState, useEffect } from "react";
import { 
  Trash2, KeyRound, Activity, Phone, 
  Building, Mail, GraduationCap, BookOpen, 
  Shield, User, CheckCircle2, MapPin, 
  Heart, ExternalLink, Loader2
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; 

export default function UserDetailView({ user, onClose, onSendReset, onDeleteUser, onApproveUser }: any) {
  // --- HOOKS MUST BE AT THE TOP (Before any return) ---
  const [activeTab, setActiveTab] = useState<'profile' | 'likes'>('profile');
  const [likesData, setLikesData] = useState<any[]>([]);
  const [loadingLikes, setLoadingLikes] = useState(false);

  // 1. FETCH LIKES (Safe inside useEffect)
  useEffect(() => {
    // Only fetch if we have a valid user and tab is active
    if (activeTab === 'likes' && user?.id) {
      const fetchUserLikes = async () => {
        setLoadingLikes(true);
        const { data, error } = await supabase
          .from('likes')
          .select(`
            created_at,
            resources (
              id, title, type, subjects(title)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (!error && data) {
          setLikesData(data);
        }
        setLoadingLikes(false);
      };
      fetchUserLikes();
    }
  }, [activeTab, user?.id]);

  // --- SAFE GUARD: NOW we can return null if no user ---
  if (!user) return null;

  // --- HELPER: Fix Goal Display ---
  const displayGoal = user.goal || user.target_exam || user.educational_goal || "Not Set";

  // --- HELPER: Role Styling ---
  const getRoleTheme = (role: string) => {
    switch (role) {
      case 'student': return { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: <GraduationCap className="w-4 h-4"/>, label: 'Student' };
      case 'tutor':   return { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: <BookOpen className="w-4 h-4"/>, label: 'Tutor' };
      case 'admin':   return { color: 'bg-red-100 text-red-700 border-red-200', icon: <Shield className="w-4 h-4"/>, label: 'Admin' };
      default:        return { color: 'bg-slate-100 text-slate-700 border-slate-200', icon: <User className="w-4 h-4"/>, label: role || 'User' };
    }
  };
  const theme = getRoleTheme(user.role);

  // --- ANALYTICS: Group Likes by Type ---
  const likesByType = likesData.reduce((acc: any, item: any) => {
    const type = item.resources?.type || 'Other';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* HEADER & TABS */}
        <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <h3 className="text-lg font-bold text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4"/> User Profile
             </h3>
             {/* TABS SWITCHER */}
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Overview
                </button>
                <button 
                    onClick={() => setActiveTab('likes')}
                    className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'likes' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    <Heart className="w-3 h-3" /> Activity
                </button>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 flex items-center justify-center font-bold">✕</button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[#F8FAFC]">
          
           {/* HERO SECTION */}
           <div className="p-8 pb-6 bg-white border-b border-slate-100 flex flex-col sm:flex-row items-start gap-6">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold border-4 border-white shadow-sm ${theme.color.replace('bg-', 'bg-opacity-20 ')}`}>
                  {user.full_name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                  <h4 className="text-2xl font-black text-slate-900">{user.full_name}</h4>
                  <p className="text-slate-500 font-medium text-sm flex items-center gap-2 mt-1">
                     <Mail className="w-3.5 h-3.5"/> {user.email}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${theme.color}`}>
                          {theme.icon} {theme.label}
                      </span>
                      {user.status === 'active' && (
                         <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                            <CheckCircle2 className="w-3.5 h-3.5"/> Active
                         </span>
                      )}
                  </div>
              </div>
           </div>

           {/* === TAB CONTENT === */}
           <div className="p-8">
              
              {/* TAB 1: PROFILE OVERVIEW */}
              {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                      
                      {/* Left Column: Details */}
                      <div className="space-y-6">
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
                                      <span className="font-bold text-blue-600 bg-blue-50 px-2 rounded">
                                          {displayGoal}
                                      </span>
                                  </div>
                                  <div className="flex justify-between text-sm border-b border-slate-100 pb-2">
                                      <span className="text-slate-500 font-medium">Phone</span>
                                      <span className="font-bold text-slate-900">{user.phone || "—"}</span>
                                  </div>
                              </div>
                          </div>

                          {/* LOCATION BOX (ADMIN VIEW) */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                  <MapPin className="w-4 h-4"/> Location Data
                              </h5>
                              <div className="flex items-start gap-3">
                                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                                      <MapPin className="w-5 h-5" />
                                  </div>
                                  <div>
                                      <p className="text-xs font-bold text-slate-400 uppercase">Current City</p>
                                      <p className="text-lg font-bold text-slate-900">
                                          {user.city || "Not Reachable"}
                                      </p>
                                      {user.location_updated_at && (
                                          <p className="text-[10px] text-slate-400 mt-1">
                                              Updated: {new Date(user.location_updated_at).toLocaleDateString()}
                                          </p>
                                      )}
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Right Column: Actions */}
                      <div className="space-y-6">
                          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl">
                              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Account Control</h5>
                              <div className="space-y-3">
                                <button onClick={() => onSendReset(user.email)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all text-left">
                                    <KeyRound className="w-4 h-4 text-indigo-400"/>
                                    <span className="text-sm font-bold">Reset Password</span>
                                </button>
                                <button onClick={() => onDeleteUser(user.id)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-800 hover:bg-red-900/40 transition-all text-left">
                                    <Trash2 className="w-4 h-4 text-red-400"/>
                                    <span className="text-sm font-bold text-red-100">Delete Account</span>
                                </button>
                                {user.status === 'pending' && (
                                   <button onClick={() => onApproveUser(user.id)} className="w-full flex items-center gap-3 p-3 rounded-xl bg-orange-600 hover:bg-orange-500 transition-all text-left mt-2">
                                      <Shield className="w-4 h-4 text-white"/>
                                      <span className="text-sm font-bold text-white">Approve Access</span>
                                   </button>
                                )}
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {/* TAB 2: LIKES & ACTIVITY */}
              {activeTab === 'likes' && (
                  <div className="animate-in fade-in space-y-6">
                      {loadingLikes ? (
                          <div className="flex items-center justify-center py-12 text-slate-400">
                              <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading history...
                          </div>
                      ) : likesData.length === 0 ? (
                          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-300">
                              <Heart className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                              <p className="text-slate-500 font-medium">No activity recorded yet.</p>
                          </div>
                      ) : (
                          <>
                              {/* Analytics Grid */}
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

                              {/* Liked List */}
                              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                      <h5 className="font-bold text-slate-700 text-sm flex items-center gap-2">
                                          <Activity className="w-4 h-4 text-slate-400"/> Liked Resources
                                      </h5>
                                  </div>
                                  <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto custom-scrollbar">
                                      {likesData.map((like) => (
                                          <div key={like.created_at} className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group">
                                              <div className="flex-1 pr-4">
                                                  <div className="flex items-center gap-2 mb-1">
                                                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                                                          like.resources?.type === 'blog' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                      }`}>
                                                          {like.resources?.type || 'Resource'}
                                                      </span>
                                                      <span className="text-[10px] text-slate-400">
                                                          {new Date(like.created_at).toLocaleDateString()}
                                                      </span>
                                                  </div>
                                                  <p className="text-sm font-bold text-slate-800 line-clamp-1">
                                                      {like.resources?.title || "Unknown Resource"}
                                                  </p>
                                              </div>
                                              <Link 
                                                  href={`/${like.resources?.type === 'question' ? 'question' : 'blog'}/${like.resources?.id}`} 
                                                  target="_blank"
                                                  className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all opacity-0 group-hover:opacity-100"
                                              >
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