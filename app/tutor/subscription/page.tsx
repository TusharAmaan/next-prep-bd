"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  CheckCircle, Clock, History, Loader2, Copy, 
  Crown, Zap, Shield, AlertCircle
} from "lucide-react";

// --- TYPES ---
interface Profile {
  id: string;
  subscription_plan: 'free' | 'trial' | 'pro';
  subscription_status: 'active' | 'expired';
  subscription_expiry: string | null;
  monthly_question_count: number;
  max_questions: number;
  is_trial_used: boolean;
}

interface Transaction {
  id: number;
  amount: number;
  payment_method: string;
  transaction_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  plan_type: string;
}

export default function SubscriptionPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  // Payment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'upay' | 'cellfin'>('bkash');
  
  // Manual Payment Form
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- PRICING CONFIG ---
  const PRICING = {
    monthly: { original: 500, discount: 250 }, // 50% off first month
    yearly: { original: 5000, discount: 2500 } // 50% off first year
  };

  // --- INITIAL FETCH ---
  const fetchData = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // 1. Get Profile
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (prof) setProfile(prof);

      // 2. Get Transactions
      const { data: trx } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (trx) setTransactions(trx);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- ACTIONS ---

  // 1. Activate Trial
  const handleActivateTrial = async () => {
    if (!confirm("Activate your 7-Day Free Trial?")) return;
    
    setLoading(true);
    const { error } = await supabase.rpc('activate_trial');
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Trial Activated! Enjoy unlimited access.");
      fetchData(); // Refresh UI
    }
    setLoading(false);
  };

  // 2. Submit Manual Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber || !trxId) return alert("Please fill in all fields");

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        // Smart Pricing Logic: If no previous APPROVED transactions, give discount
        const hasHistory = transactions.some(t => t.status === 'approved');
        const price = hasHistory 
            ? (selectedPlan === 'monthly' ? PRICING.monthly.original : PRICING.yearly.original)
            : (selectedPlan === 'monthly' ? PRICING.monthly.discount : PRICING.yearly.discount);
        
        const { error } = await supabase.from('transactions').insert({
            user_id: user.id,
            amount: price,
            currency: 'BDT',
            payment_method: paymentMethod,
            transaction_id: trxId,
            sender_number: senderNumber,
            plan_type: selectedPlan === 'monthly' ? 'pro_monthly' : 'pro_yearly',
            status: 'pending'
        });

        if (error) {
            alert("Submission failed: " + error.message);
        } else {
            alert("Payment submitted! An admin will review it shortly.");
            setShowPayModal(false);
            setTrxId("");
            setSenderNumber("");
            fetchData();
        }
    }
    setSubmitting(false);
  };

  // --- HELPER: Copy Number ---
  const copyNumber = (num: string) => {
      navigator.clipboard.writeText(num);
      // Optional: Add a toast notification here instead of alert
      alert("Number copied: " + num);
  };

  // Helper to determine current price for display
  const getDisplayPrice = (plan: 'monthly' | 'yearly') => {
      const hasHistory = transactions.some(t => t.status === 'approved');
      if (!hasHistory) {
          return plan === 'monthly' ? PRICING.monthly.discount : PRICING.yearly.discount;
      }
      return plan === 'monthly' ? PRICING.monthly.original : PRICING.yearly.original;
  };

  if (loading) return <div className="h-96 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-600"/></div>;

  const isPro = profile?.subscription_plan === 'pro';
  const hasDiscount = !transactions.some(t => t.status === 'approved');

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in pb-20">
      
      {/* 1. HEADER & STATUS CARD */}
      <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          {/* Abstract Background */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
              <div>
                  <div className="flex items-center gap-3 mb-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          profile?.subscription_plan === 'pro' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          profile?.subscription_plan === 'trial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-slate-700/50 text-slate-400 border-slate-600'
                      }`}>
                          {profile?.subscription_plan} Plan
                      </span>
                      {profile?.subscription_expiry && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-black/20 px-2 py-1 rounded-md">
                              <Clock className="w-3 h-3"/> Expires: {new Date(profile.subscription_expiry).toLocaleDateString()}
                          </span>
                      )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Manage Subscription</h1>
                  <p className="text-slate-400 max-w-lg text-sm leading-relaxed">
                      Unlock advanced exam builder features, custom branding, and unlimited question storage.
                  </p>
              </div>

{/* Usage Meter */}
<div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 w-full md:w-80 shadow-inner">
    <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wide text-slate-400">
        <span>Monthly Quota</span>
        <span className={(profile?.monthly_question_count ?? 0) >= (profile?.max_questions ?? 0) ? "text-red-400" : "text-emerald-400"}>
            {profile?.monthly_question_count ?? 0} / {(profile?.max_questions ?? 0) > 1000 ? '∞' : (profile?.max_questions ?? 0)}
        </span>
    </div>
    <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5">
        <div 
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
                (profile?.monthly_question_count ?? 0) >= (profile?.max_questions ?? 0) ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
            style={{ width: `${Math.min(100, ((profile?.monthly_question_count ?? 0) / (profile?.max_questions || 1)) * 100)}%` }}
        ></div>
    </div>
    <p className="text-[10px] text-slate-500 mt-3 text-center italic">
        Resets automatically on the 1st of every month.
    </p>
</div>
          </div>
      </div>

      {/* 2. PLANS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* FREE PLAN */}
          <div className="bg-white border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
              <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-600 mb-2">Starter</h3>
                  <p className="text-4xl font-black text-slate-900">৳0<span className="text-sm font-bold text-slate-400">/mo</span></p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-slate-300 shrink-0"/> 50 Questions / Month</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-slate-300 shrink-0"/> Basic PDF Export</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-slate-300 shrink-0"/> NextPrep Branding</li>
              </ul>
              <button disabled className="w-full py-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed">Current Plan</button>
          </div>

          {/* TRIAL PROMO (Only if not used) */}
          {!profile?.is_trial_used && profile?.subscription_plan === 'free' && (
              <div className="relative bg-gradient-to-b from-blue-600 to-indigo-700 rounded-3xl p-1 shadow-xl shadow-blue-200 transform lg:-translate-y-4">
                  <div className="absolute top-0 right-0 left-0 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center">
                      Recommended for New Tutors
                  </div>
                  <div className="bg-white rounded-[20px] p-7 h-full flex flex-col mt-6">
                      <div className="mb-6">
                          <h3 className="text-lg font-bold text-indigo-600 flex items-center gap-2"><Zap className="w-5 h-5 fill-indigo-600"/> 7-Day Trial</h3>
                          <p className="text-4xl font-black text-slate-900 mt-2">Free<span className="text-sm font-bold text-slate-400">/7 days</span></p>
                      </div>
                      <ul className="space-y-4 mb-8 flex-1">
                          <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle className="w-5 h-5 text-indigo-500 shrink-0"/> Unlimited Questions</li>
                          <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle className="w-5 h-5 text-indigo-500 shrink-0"/> Remove Watermark</li>
                          <li className="flex gap-3 text-sm text-slate-700 font-bold"><CheckCircle className="w-5 h-5 text-indigo-500 shrink-0"/> Custom Institute Name</li>
                      </ul>
                      <button onClick={handleActivateTrial} className="w-full py-4 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all">
                          Start Free Trial
                      </button>
                  </div>
              </div>
          )}

          {/* PRO PLAN */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col shadow-sm relative overflow-hidden group">
              {hasDiscount && (
                  <div className="absolute -right-12 top-6 bg-red-500 text-white text-[10px] font-black px-12 py-1 rotate-45 shadow-sm">
                      50% OFF
                  </div>
              )}
              <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500 fill-amber-500"/> Professional</h3>
                  <div className="mt-2 flex items-baseline gap-2">
                      <p className="text-4xl font-black text-slate-900">৳{getDisplayPrice('monthly')}</p>
                      {hasDiscount && <span className="text-lg text-slate-400 line-through font-bold">৳500</span>}
                      <span className="text-sm font-bold text-slate-400">/mo</span>
                  </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Unlimited Questions</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> White-label PDF</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Priority Support</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Rich Text Editor</li>
              </ul>
              
              <div className="flex flex-col gap-3">
                  <button 
                      onClick={() => { setSelectedPlan('monthly'); setShowPayModal(true); }}
                      className="w-full py-4 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-slate-200"
                  >
                      Get Monthly
                  </button>
                  <button 
                      onClick={() => { setSelectedPlan('yearly'); setShowPayModal(true); }}
                      className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold text-sm hover:border-slate-300 transition-colors"
                  >
                      Get Yearly (৳{getDisplayPrice('yearly')})
                  </button>
              </div>
          </div>
      </div>

      {/* 3. TRANSACTION HISTORY */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50">
              <History className="w-5 h-5 text-slate-400"/>
              <h3 className="font-bold text-slate-800">Billing History</h3>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-100 uppercase text-xs tracking-wider">
                      <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Plan</th>
                          <th className="px-6 py-4">Amount</th>
                          <th className="px-6 py-4">Method</th>
                          <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                      {transactions.length === 0 ? (
                          <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic font-medium">No transactions found.</td></tr>
                      ) : (
                          transactions.map(t => (
                              <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                                  <td className="px-6 py-4 text-slate-600 font-medium">{new Date(t.created_at).toLocaleDateString()}</td>
                                  <td className="px-6 py-4 font-bold text-slate-800 capitalize">{t.plan_type.replace('_', ' ')}</td>
                                  <td className="px-6 py-4 text-slate-600 font-mono">৳{t.amount}</td>
                                  <td className="px-6 py-4 capitalize flex items-center gap-2 font-bold text-slate-700">
                                      {t.payment_method === 'bkash' && <span className="w-2 h-2 rounded-full bg-pink-500"></span>}
                                      {t.payment_method === 'upay' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                                      {t.payment_method === 'cellfin' && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                                      {t.payment_method}
                                  </td>
                                  <td className="px-6 py-4 text-right">
                                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wide ${
                                          t.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                          t.status === 'rejected' ? 'bg-red-100 text-red-700' :
                                          'bg-amber-100 text-amber-700'
                                      }`}>
                                          {t.status}
                                      </span>
                                  </td>
                              </tr>
                          ))
                      )}
                  </tbody>
              </table>
          </div>
      </div>

      {/* --- PAYMENT MODAL --- */}
      {showPayModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
                  {/* Header */}
                  <div className="bg-slate-900 p-6 text-white flex justify-between items-start">
                      <div>
                          <h3 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-400"/> Secure Payment</h3>
                          <p className="text-slate-400 text-sm mt-1">Upgrade to Pro {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}</p>
                      </div>
                      <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                          <div className="w-4 h-4 relative"><div className="absolute inset-0 rotate-45 w-full h-0.5 bg-current top-2"></div><div className="absolute inset-0 -rotate-45 w-full h-0.5 bg-current top-2"></div></div>
                      </button>
                  </div>

                  <div className="p-6 md:p-8 space-y-6">
                      
                      {/* Method Selector */}
                      <div className="flex gap-3">
                          <button onClick={() => setPaymentMethod('bkash')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs md:text-sm transition-all ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>Bkash</button>
                          <button onClick={() => setPaymentMethod('upay')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs md:text-sm transition-all ${paymentMethod === 'upay' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>Upay</button>
                          <button onClick={() => setPaymentMethod('cellfin')} className={`flex-1 py-3 rounded-xl border-2 font-bold text-xs md:text-sm transition-all ${paymentMethod === 'cellfin' ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>Cellfin</button>
                      </div>

                      {/* Payment Instructions */}
                      <div className={`p-5 rounded-2xl border-2 text-center space-y-3 ${
                          paymentMethod === 'bkash' ? 'bg-pink-50/50 border-pink-100' : 
                          paymentMethod === 'upay' ? 'bg-blue-50/50 border-blue-100' : 
                          'bg-green-50/50 border-green-100'
                      }`}>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Send Money (Personal)</p>
                          
                          <div className="flex justify-center items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mx-auto max-w-fit">
                              <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
                                  {paymentMethod === 'cellfin' ? '01828677148' : '+8801828677148'}
                              </span>
                              <button onClick={() => copyNumber(paymentMethod === 'cellfin' ? '01828677148' : '+8801828677148')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><Copy className="w-4 h-4"/></button>
                          </div>
                          
                          <div className="flex justify-center gap-4 text-sm font-bold text-slate-600">
                              <span>Amount:</span>
                              <span className="text-slate-900 text-lg">৳{getDisplayPrice(selectedPlan)}</span>
                          </div>
                      </div>

                      {/* Input Form */}
                      <form onSubmit={handleSubmitPayment} className="space-y-5">
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sender Number</label>
                              <input 
                                  required
                                  type="text" 
                                  placeholder="e.g. 017..." 
                                  className="w-full border border-slate-300 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-normal"
                                  value={senderNumber}
                                  onChange={e => setSenderNumber(e.target.value)}
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Transaction ID (TrxID)</label>
                              <input 
                                  required
                                  type="text" 
                                  placeholder="e.g. 8H3K9L..." 
                                  className="w-full border border-slate-300 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all uppercase placeholder:font-normal placeholder:normal-case"
                                  value={trxId}
                                  onChange={e => setTrxId(e.target.value)}
                              />
                          </div>

                          <button 
                              type="submit" 
                              disabled={submitting}
                              className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-xl shadow-slate-200 hover:bg-black disabled:opacity-70 transition-all mt-2 transform active:scale-95 flex items-center justify-center gap-2"
                          >
                              {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : "Confirm Payment"}
                          </button>
                      </form>
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}