"use client";

import { useState, useEffect } from "react";
import { 
  Trash2, KeyRound, Activity, Phone, 
  Building, Mail, GraduationCap, BookOpen, 
  Shield, User, CheckCircle2, MapPin, 
  Heart, Loader2, Ban, FileText, Star, Briefcase, 
  CreditCard, Check, X, Calendar, Edit, Save
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient"; 

// --- TYPES ---
interface PaymentRequest {
  id: string;
  amount: number;
  payment_method: string;
  transaction_id: string;
  sender_number: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  plan_name: string;
}

export default function UserDetailView({ 
  user, onClose, onSendReset, onDeleteUser, 
  onRoleUpdate, onApproveUser, onSuspendUser 
}: any) {
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'profile' | 'likes' | 'billing'>('profile');
  const [likesData, setLikesData] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<PaymentRequest[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  // Local Profile State (for optimistic updates)
  const [status, setStatus] = useState(user?.status || 'pending');
  const [role, setRole] = useState(user?.role || 'student');
  const [notes, setNotes] = useState(user?.admin_notes || "");
  const [isFeatured, setIsFeatured] = useState(user?.is_featured || false);
  const [isSaving, setIsSaving] = useState(false);

  // Manual Subscription State
  const [subPlan, setSubPlan] = useState(user?.subscription_plan || 'free');
  const [subStatus, setSubStatus] = useState(user?.subscription_status || 'expired');
  const [subExpiry, setSubExpiry] = useState(
    user?.subscription_expiry ? new Date(user.subscription_expiry).toISOString().split('T')[0] : ''
  );

  // --- SYNC STATE ---
  useEffect(() => {
    if (user) {
      setStatus(user.status || 'pending');
      setRole(user.role || 'student');
      setNotes(user.admin_notes || "");
      setIsFeatured(user.is_featured || false);
      setSubPlan(user.subscription_plan || 'free');
      setSubStatus(user.subscription_status || 'expired');
      setSubExpiry(user.subscription_expiry ? new Date(user.subscription_expiry).toISOString().split('T')[0] : '');
    }
  }, [user]);

  // --- FETCH DATA ---
  const loadBillingData = async () => {
      setLoadingData(true);
      // Fetch from the correct 'payment_requests' table
      const { data } = await supabase
          .from('payment_requests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
      if (data) setTransactions(data);
      setLoadingData(false);
  };

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

            // 2. Billing
            if (activeTab === 'billing') {
                await loadBillingData();
            }
            setLoadingData(false);
        };
        loadData();
    }
  }, [activeTab, user?.id]);

  if (!user) return null;

  // --- ACTIONS ---

  // 1. Core Profile Updates
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
            await supabase.from('profiles').update({ is_featured: value }).eq('id', user.id);
        }
    } catch (error: any) {
        alert(`Error: ${error.message}`);
    } finally {
        setIsSaving(false);
    }
  };

  const saveNotes = async () => {
      if (notes === user.admin_notes) return;
      setIsSaving(true);
      await supabase.from('profiles').update({ admin_notes: notes }).eq('id', user.id);
      setIsSaving(false);
  };

  // 2. Payment Approval Logic (The Fix)
  const handlePaymentAction = async (trx: PaymentRequest, action: 'approved' | 'rejected') => {
      if(!confirm(`Are you sure you want to ${action} this payment?`)) return;
      
      setIsSaving(true);

      // A. Update Payment Request Status
      const { error } = await supabase
          .from('payment_requests')
          .update({ status: action })
          .eq('id', trx.id);
      
      if (error) {
          alert("Error updating payment: " + error.message);
          setIsSaving(false);
          return;
      }

      // B. If Approved, Automatically Upgrade User Profile
      if (action === 'approved') {
          const isYearly = trx.plan_name.toLowerCase().includes('year');
          const monthsToAdd = isYearly ? 12 : 1;
          
          // Calculate Expiry
          const expiryDate = new Date();
          expiryDate.setMonth(expiryDate.getMonth() + monthsToAdd);

          const { error: profileError } = await supabase.from('profiles').update({
              subscription_plan: 'pro',
              subscription_status: 'active',
              subscription_expiry: expiryDate.toISOString(),
              max_questions: 10000 // Grant unlimited access
          }).eq('id', user.id);

          if (profileError) alert("Payment approved, but profile update failed: " + profileError.message);
          else {
              alert("Payment Approved! User upgraded to PRO.");
              // Update local state to reflect changes immediately
              setSubPlan('pro');
              setSubStatus('active');
              setSubExpiry(expiryDate.toISOString().split('T')[0]);
          }
      }

      await loadBillingData(); // Refresh table
      setIsSaving(false);
  };

  // 3. Manual Subscription Override (Give Friend Access)
  const handleManualSubscriptionUpdate = async () => {
      if(!confirm("Are you sure you want to manually update this subscription?")) return;
      
      setIsSaving(true);
      const { error } = await supabase.from('profiles').update({
          subscription_plan: subPlan,
          subscription_status: subStatus,
          subscription_expiry: subExpiry ? new Date(subExpiry).toISOString() : null,
          max_questions: subPlan === 'pro' || subPlan === 'trial' ? 10000 : 50
      }).eq('id', user.id);

      if(error) alert("Failed to update: " + error.message);
      else alert("Subscription updated successfully!");
      
      setIsSaving(false);
  };

  // --- HELPERS ---
  const getRoleIcon = (r: string) => {
    switch (r) {
      case 'student': return <GraduationCap className="w-4 h-4"/>;
      case 'tutor': return <BookOpen className="w-4 h-4"/>;
      case 'institute': return <Building className="w-4 h-4"/>;
      case 'admin': return <Shield className="w-4 h-4"/>;
      default: return <User className="w-4 h-4"/>;
    }
  };

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
                <button onClick={() => setActiveTab('billing')} className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${activeTab === 'billing' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                    <CreditCard className="w-3 h-3" /> Billing
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
                      {isSaving && <span className="text-xs font-bold text-indigo-600 flex items-center animate-pulse"><Loader2 className="w-3 h-3 mr-1 animate-spin"/> Syncing...</span>}
                  </div>
                  
                  {/* === ADMIN ACTION BAR === */}
                  <div className="flex flex-wrap items-center gap-3 mt-5">
                      {/* ROLE */}
                      <div className="relative group">
                          <select 
                            value={role} 
                            onChange={(e) => handleUpdateProfile('role', e.target.value)} 
                            className="appearance-none pl-9 pr-8 py-2 rounded-lg text-xs font-bold border border-slate-200 bg-slate-50 text-slate-700 outline-none cursor-pointer uppercase tracking-wider hover:bg-white transition-all shadow-sm"
                          >
                              <option value="student">Student</option>
                              <option value="tutor">Tutor</option>
                              <option value="institute">Institute</option>
                              <option value="editor">Editor</option>
                              <option value="admin">Admin</option>
                          </select>
                          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">{getRoleIcon(role)}</div>
                      </div>

                      {/* STATUS */}
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

                      {/* FEATURED */}
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
                  </div>
              </div>
           </div>

           <div className="p-8">
              {/* === TAB 1: PROFILE === */}
              {activeTab === 'profile' && (
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 animate-in fade-in">
                      {/* LEFT */}
                      <div className="md:col-span-7 space-y-6">
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

                          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5">
                              <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                  <User className="w-4 h-4"/> Profile Details
                              </h5>
                              <div className="grid grid-cols-2 gap-4 pb-4">
                                  <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Phone</p><p className="font-bold text-slate-800">{user.phone || "—"}</p></div>
                                  <div><p className="text-xs text-slate-400 font-bold uppercase mb-1">Institution</p><p className="font-bold text-slate-800">{user.institution || "—"}</p></div>
                              </div>
                          </div>
                      </div>

                      {/* RIGHT */}
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

              {/* === TAB 3: BILLING & SUBSCRIPTION === */}
              {activeTab === 'billing' && (
                  <div className="animate-in fade-in space-y-8">
                      
                      {/* 1. MANUAL SUBSCRIPTION CONTROL */}
                      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                              <h5 className="text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
                                  <Activity className="w-4 h-4 text-slate-400"/> Manual Subscription Control
                              </h5>
                              <span className="text-[10px] bg-white border px-2 py-1 rounded text-slate-400 font-medium">Use for manual upgrades</span>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                              <div>
                                  <label className="text-xs font-bold text-slate-500 mb-1 block">Plan</label>
                                  <select 
                                      value={subPlan} 
                                      onChange={(e) => setSubPlan(e.target.value)} 
                                      className="w-full text-sm border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                      <option value="free">Free</option>
                                      <option value="trial">Trial</option>
                                      <option value="pro">Pro</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 mb-1 block">Status</label>
                                  <select 
                                      value={subStatus} 
                                      onChange={(e) => setSubStatus(e.target.value)} 
                                      className="w-full text-sm border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                  >
                                      <option value="active">Active</option>
                                      <option value="expired">Expired</option>
                                      <option value="canceled">Canceled</option>
                                  </select>
                              </div>
                              <div>
                                  <label className="text-xs font-bold text-slate-500 mb-1 block">Expiry Date</label>
                                  <input 
                                      type="date" 
                                      value={subExpiry} 
                                      onChange={(e) => setSubExpiry(e.target.value)} 
                                      className="w-full text-sm border-slate-300 rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                                  />
                              </div>
                              <button 
                                  onClick={handleManualSubscriptionUpdate}
                                  className="bg-indigo-600 text-white font-bold text-sm py-2.5 px-4 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-md shadow-indigo-200"
                              >
                                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                                  Update
                              </button>
                          </div>
                      </div>

                      {/* 2. TRANSACTION TABLE */}
                      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                          <table className="w-full text-sm text-left">
                              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-xs">
                                  <tr>
                                      <th className="px-6 py-4">Date</th>
                                      <th className="px-6 py-4">Transaction Details</th>
                                      <th className="px-6 py-4">Amount</th>
                                      <th className="px-6 py-4 text-right">Status</th>
                                      <th className="px-6 py-4 text-right">Action</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {transactions.length === 0 ? (
                                      <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No transactions found.</td></tr>
                                  ) : (
                                      transactions.map(t => (
                                          <tr key={t.id} className="hover:bg-slate-50">
                                              <td className="px-6 py-4 text-slate-600">{new Date(t.created_at).toLocaleDateString()}</td>
                                              <td className="px-6 py-4">
                                                  <p className="font-bold text-slate-800 capitalize">{t.plan_name}</p>
                                                  <div className="flex gap-2 text-xs text-slate-500 mt-1">
                                                      <span className="font-mono bg-slate-100 px-1 rounded">{t.transaction_id}</span>
                                                      <span className="font-mono">{t.sender_number}</span>
                                                  </div>
                                              </td>
                                              <td className="px-6 py-4 text-slate-600 font-mono">৳{t.amount}</td>
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
                                                          <button onClick={() => handlePaymentAction(t, 'approved')} className="p-1.5 bg-emerald-100 text-emerald-600 rounded hover:bg-emerald-200" title="Approve"><Check className="w-4 h-4"/></button>
                                                          <button onClick={() => handlePaymentAction(t, 'rejected')} className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Reject"><X className="w-4 h-4"/></button>
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