"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, KeyRound, Activity, Phone, 
  Building, Mail, GraduationCap, BookOpen, 
  Shield, User, CheckCircle2, MapPin, 
  Heart, ExternalLink, Loader2, 
  Ban, AlertTriangle, FileText, Star, Briefcase, Calendar,
  CreditCard, Check, X, Clock, Smartphone
} from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient"; 

// Update props to include the sync functions from UserManagement
export default function UserDetailView({ 
  user, onClose, onSendReset, onDeleteUser, 
  onRoleUpdate, onApproveUser, onSuspendUser 
}: any) {
  
  // --- 1. STATE & HOOKS ---
  const [activeTab, setActiveTab] = useState<'profile' | 'likes' | 'billing'>('profile');
  const [likesData, setLikesData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]); // New: Transactions
  const [loadingData, setLoadingData] = useState(false);
  
  // Local Management State
  const [status, setStatus] = useState(user?.status || 'pending');
  const [role, setRole] = useState(user?.role || 'student');
  const [notes, setNotes] = useState(user?.admin_notes || "");
  const [isFeatured, setIsFeatured] = useState(user?.is_featured || false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 1.5 SYNC STATE ON PROP CHANGE ---
  useEffect(() => {
    if (user) {
      setStatus(user.status || 'pending');
      setRole(user.role || 'student');
      setNotes(user.admin_notes || "");
      setIsFeatured(user.is_featured || false);
    }
  }, [user]);

  // --- 2. FETCH DATA (Activity & Billing) ---
  useEffect(() => {
    if (user?.id) {
        const loadData = async () => {
            setLoadingData(true);
            
            // 1. Likes
            if (activeTab === 'likes') {
                const { data } = await supabase
                    .from('likes')
                    .select(`created_at, resources (id, title, type, subjects(title))`)
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (data) setLikesData(data);
            }

            // 2. Billing (For Tutors/Institutes)
            if (activeTab === 'billing' || (role === 'tutor' || role === 'institute')) {
                const { data } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                if (data) setTransactions(data);
            }
            setLoadingData(false);
        };
        loadData();
    }
  }, [activeTab, user?.id, role]);

  if (!user) return null;

  // --- 3. CORE ACTIONS ---
  
  const handleUpdateProfile = async (field: string, value: any) => {
    setIsSaving(true);
    // Optimistic Update
    if(field === 'status') setStatus(value);
    if(field === 'role') setRole(value);
    if(field === 'is_featured') setIsFeatured(value);

    try {
        if (field === 'role') await onRoleUpdate(user.id, value);
        else if (field === 'status') {
            if (value === 'active') await onApproveUser(user.id);
            else if (value === 'suspended') await onSuspendUser(user.id);
            else await supabase.from('profiles').update({ status: 'pending' }).eq('id', user.id);
        } 
        else if (field === 'is_featured') {
            const { error } = await supabase.from('profiles').update({ is_featured: value }).eq('id', user.id);
            if (error) throw error;
        }
    } catch (error: any) {
        alert(`❌ Update Failed: ${error.message}`);
        // Revert
        if(field === 'status') setStatus(user.status);
        if(field === 'role') setRole(user.role);
        if(field === 'is_featured') setIsFeatured(user.is_featured);
    } finally {
        setIsSaving(false);
    }
  };

  const saveNotes = async () => {
      if (notes === user.admin_notes) return;
      setIsSaving(true);
      const { error } = await supabase.from('profiles').update({ admin_notes: notes }).eq('id', user.id);
      if (error) alert("Failed to save notes.");
      setIsSaving(false);
  };

  // --- NEW: Approve/Reject Transaction ---
  const handleTransaction = async (id: number, action: 'approved' | 'rejected') => {
      if(!confirm(`Are you sure you want to ${action} this payment?`)) return;
      
      const { error } = await supabase.from('transactions').update({ status: action }).eq('id', id);
      
      if (!error) {
          alert(`Transaction ${action}`);
          // Refresh list
          const { data } = await supabase.from('transactions').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
          if(data) setTransactions(data);
      } else {
          alert("Error: " + error.message);
      }
  };

  // --- FORMATTERS ---
  const formatGoal = (slug: string) => {
      if (!slug) return "Not Set";
      return slug.replace('/resources/', '').replace(/-/g, ' '); 
  };

  const getRoleIcon = (r: string) => {
    switch (r) {
      case 'student': return <GraduationCap className="w-4 h-4"/>;
      case 'tutor': return <BookOpen className="w-4 h-4"/>;
      case 'institute': return <Building className="w-4 h-4"/>;
      case 'admin': return <Shield className="w-4 h-4"/>;
      case 'editor': return <Briefcase className="w-4 h-4"/>;
      default: return <User className="w-4 h-4"/>;
    }
  };

  const pendingTrx = transactions.find(t => t.status === 'pending');

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* HEADER */}
        <div className="bg-white p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-4">
             <h3 className="text-lg font-bold text-slate-500 flex items-center gap-2">
                <User className="w-4 h-4"/> User Details
             </h3>
             <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setActiveTab('profile')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${activeTab === 'profile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Overview</button>
                <button onClick={() => setActiveTab('likes')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'likes' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <Heart className="w-3 h-3" /> Activity
                </button>
                {(role === 'tutor' || role === 'institute') && (
                    <button onClick={() => setActiveTab('billing')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'billing' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                        <CreditCard className="w-3 h-3" /> Billing {pendingTrx && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                    </button>
                )}
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
                      {isSaving && <span className="text-xs font-bold text-indigo-600 flex items-center animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Syncing...</span>}
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
                              <option value="institute">Institute</option>
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

                      {/* 3. FEATURED TOGGLE */}
                      {(role === 'tutor' || role === 'institute') && (
                          <button 
                            onClick={() => handleUpdateProfile('is_featured', !isFeatured)} 
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all shadow-sm ${
                                isFeatured 
                                ? 'bg-amber-100 text-amber-700 border-amber-300 ring-2 ring-amber-200' 
                                : 'bg-white text-slate-400 border-slate-200 hover:border-amber-300 hover:text-amber-600'
                            }`}
                          >
                              <Star className={`w-3.5 h-3.5 ${isFeatured ? 'fill-current' : ''}`} /> 
                              {isFeatured ? "Featured" : "Promote"}
                          </button>
                      )}
                  </div>
              </div>
           </div>

           <div className="p-8">
              {/* === TAB 1: PROFILE === */}
              {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in">
                      
                      {/* LEFT: INFO & NOTES */}
                      <div className="md:col-span-7 space-y-6">
                          
                          {/* PENDING PAYMENT ALERT (If any) */}
                          {pendingTrx && (
                              <div className="bg-white border-2 border-indigo-100 rounded-2xl p-5 shadow-lg shadow-indigo-100 animate-pulse">
                                  <div className="flex items-start justify-between">
                                      <div className="flex gap-3">
                                          <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600"><CreditCard className="w-5 h-5"/></div>
                                          <div>
                                              <h4 className="font-bold text-slate-800 text-sm">Payment Verification Needed</h4>
                                              <p className="text-xs text-slate-500 mt-1">
                                                  Sent <b>৳{pendingTrx.amount}</b> via <span className="capitalize font-bold">{pendingTrx.payment_method}</span>
                                              </p>
                                              <div className="mt-2 flex items-center gap-2 text-xs font-mono bg-slate-50 w-fit px-2 py-1 rounded border">
                                                  <Smartphone className="w-3 h-3"/> {pendingTrx.sender_number}
                                                  <span className="text-slate-300">|</span>
                                                  TRX: {pendingTrx.transaction_id}
                                              </div>
                                          </div>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => handleTransaction(pendingTrx.id, 'approved')} className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 shadow-md transition-transform active:scale-95" title="Approve"><Check className="w-4 h-4"/></button>
                                          <button onClick={() => handleTransaction(pendingTrx.id, 'rejected')} className="p-2 bg-red-100 text-red-500 rounded-lg hover:bg-red-200 transition-colors" title="Reject"><X className="w-4 h-4"/></button>
                                      </div>
                                  </div>
                              </div>
                          )}

                          {/* Admin Notes */}
                          <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 shadow-sm">
                              <h5 className="text-xs font-black text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <FileText className="w-4 h-4"/> Admin Private Notes
                              </h5>
                              <textarea 
                                  className="w-full bg-white border border-amber-200 rounded-xl p-3 text-sm text-slate-700 focus:ring-2 focus:ring-amber-200 outline-none resize-none placeholder:text-slate-400"
                                  rows={3}
                                  placeholder="Write notes here. Click outside to save."
                                  value={notes}
                                  onChange={(e) => setNotes(e.target.value)}
                                  onBlur={saveNotes}
                              />
                          </div>

                          {/* Info Card */}
                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <User className="w-4 h-4"/> Profile Details
                              </h5>
                              
                              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                                  <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone</p><p className="font-bold text-slate-800">{user.phone || "—"}</p></div>
                                  <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Institution</p><p className="font-bold text-slate-800">{user.institution || "—"}</p></div>
                              </div>

                              {/* TUTOR/INSTITUTE SUBSCRIPTION DETAILS */}
                              {(role === 'tutor' || role === 'institute') && (
                                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                      <div className="flex justify-between items-center mb-3">
                                          <p className="text-xs font-bold text-slate-500 uppercase">Subscription Status</p>
                                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                                              user.subscription_plan === 'pro' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                              user.subscription_plan === 'trial' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                              'bg-slate-200 text-slate-600'
                                          }`}>
                                              {user.subscription_plan}
                                          </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                          <div>
                                              <p className="text-slate-400 text-xs">Expires</p>
                                              <p className="font-bold text-slate-800">{user.subscription_expiry ? new Date(user.subscription_expiry).toLocaleDateString() : 'N/A'}</p>
                                          </div>
                                          <div>
                                              <p className="text-slate-400 text-xs">Usage (Month)</p>
                                              <p className="font-bold text-slate-800">{user.monthly_question_count || 0} / {user.max_questions || 50}</p>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </div>
                      </div>

                      {/* RIGHT: SECURITY & ACTIONS */}
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
                      </div>
                  </div>
              )}

              {/* === TAB 3: BILLING HISTORY (Admin View) === */}
              {activeTab === 'billing' && (
                  <div className="animate-in fade-in">
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-xs">
                                  <tr>
                                      <th className="px-6 py-4">Date</th>
                                      <th className="px-6 py-4">Plan</th>
                                      <th className="px-6 py-4">Amount</th>
                                      <th className="px-6 py-4">Method</th>
                                      <th className="px-6 py-4 text-right">Status</th>
                                      <th className="px-6 py-4 text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {transactions.length === 0 ? (
                                      <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">No transactions found.</td></tr>
                                  ) : (
                                      transactions.map(t => (
                                          <tr key={t.id} className="hover:bg-slate-50">
                                              <td className="px-6 py-4 text-slate-600">{new Date(t.created_at).toLocaleDateString()}</td>
                                              <td className="px-6 py-4 font-bold text-slate-800 capitalize">{t.plan_type.replace('pro_', '')}</td>
                                              <td className="px-6 py-4 text-slate-600 font-mono">৳{t.amount}</td>
                                              <td className="px-6 py-4 capitalize font-bold text-slate-700">{t.payment_method}</td>
                                              <td className="px-6 py-4 text-right">
                                                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                                                      t.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                      t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                                      'bg-yellow-100 text-yellow-700'
                                                  }`}>
                                                      {t.status}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-4 text-right">
                                                  {t.status === 'pending' && (
                                                      <div className="flex justify-end gap-2">
                                                          <button onClick={() => handleTransaction(t.id, 'approved')} className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200" title="Approve"><Check className="w-4 h-4"/></button>
                                                          <button onClick={() => handleTransaction(t.id, 'rejected')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject"><X className="w-4 h-4"/></button>
                                                      </div>
                                                  )}
                                              </td>
                                          </tr>
                                      ))
                                  )}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}