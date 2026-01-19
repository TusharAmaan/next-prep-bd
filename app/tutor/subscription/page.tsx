"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  CheckCircle, Clock, History, Loader2, Copy, 
  Crown, Zap, Shield, Globe, Smartphone, X
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
  institute_name?: string;
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
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'upay' | 'cellfin' | 'dodo'>('bkash');
  
  // Manual Payment Form
  const [senderNumber, setSenderNumber] = useState("");
  const [trxId, setTrxId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- PRICING CONFIG ---
  const PRICING = {
    monthly: { original: 500, discount: 250 }, 
    yearly: { original: 5000, discount: 2500 } 
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
    setLoading(true);
    const { error } = await supabase.rpc('activate_trial');
    
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Trial Activated! You now have unlimited access for 7 days.");
      await fetchData(); 
    }
    setLoading(false);
  };

  // 2. Dodo Payment Redirect
  const handleDodoPayment = async () => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/payment/create-dodo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }) 
      });
      
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url; 
      } else {
        alert("Failed to initialize payment gateway.");
      }
    } catch (error) {
      console.error(error);
      alert("Connection error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. Submit Manual Payment
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderNumber || !trxId) return alert("Please fill in all fields");

    setSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
        const price = getDisplayPrice(selectedPlan);
        
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
            alert("Payment submitted! Our team will review and approve it shortly.");
            setShowPayModal(false);
            setTrxId("");
            setSenderNumber("");
            fetchData();
        }
    }
    setSubmitting(false);
  };

  // --- HELPERS ---
  const copyNumber = (num: string) => {
      navigator.clipboard.writeText(num);
      alert("Number copied: " + num);
  };

  const getDisplayPrice = (plan: 'monthly' | 'yearly') => {
      const hasHistory = transactions.some(t => t.status === 'approved');
      if (!hasHistory) {
          return plan === 'monthly' ? PRICING.monthly.discount : PRICING.yearly.discount;
      }
      return plan === 'monthly' ? PRICING.monthly.original : PRICING.yearly.original;
  };

  if (loading) return <div className="h-[80vh] flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600"/></div>;

  const hasDiscount = !transactions.some(t => t.status === 'approved');
  
  // FIX: Added nullish coalescing (?? 0) to prevent 'undefined' errors
  const usagePercentage = Math.min(100, ((profile?.monthly_question_count ?? 0) / (profile?.max_questions || 1)) * 100);

  return (
    <div className="max-w-7xl mx-auto p-4 lg:p-8 space-y-8 animate-in fade-in pb-24">
      
      {/* 1. HEADER & STATUS CARD */}
      <div className="bg-slate-900 rounded-3xl p-6 lg:p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] -mr-20 -mt-20 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-[80px] -ml-16 -mb-16 pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col lg:flex-row justify-between gap-8 items-start lg:items-center">
              <div className="space-y-4 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                          profile?.subscription_plan === 'pro' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 
                          profile?.subscription_plan === 'trial' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                          'bg-slate-700/50 text-slate-400 border-slate-600'
                      }`}>
                          {profile?.subscription_plan === 'pro' ? 'PRO PLAN' : profile?.subscription_plan === 'trial' ? 'TRIAL ACTIVE' : 'FREE PLAN'}
                      </span>
                      {profile?.subscription_expiry && (
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-medium bg-black/20 px-2 py-1 rounded-md border border-white/5">
                              <Clock className="w-3 h-3"/> Expires: {new Date(profile.subscription_expiry).toLocaleDateString()}
                          </span>
                      )}
                  </div>
                  <div>
                    <h1 className="text-3xl lg:text-4xl font-black tracking-tight mb-2">Subscription & Usage</h1>
                    <p className="text-slate-400 text-sm lg:text-base leading-relaxed">
                        Manage your billing, check your question limits, and unlock advanced features like custom branding and unlimited storage.
                    </p>
                  </div>
              </div>

              {/* Usage Meter (FIXED) */}
              <div className="bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 w-full lg:w-80 shadow-inner">
                  <div className="flex justify-between text-xs font-bold mb-3 uppercase tracking-wide text-slate-400">
                      <span>Monthly Quota</span>
                      {/* FIX: Ensure values are never undefined */}
                      <span className={(profile?.monthly_question_count ?? 0) >= (profile?.max_questions ?? 0) ? "text-red-400" : "text-emerald-400"}>
                          {profile?.monthly_question_count ?? 0} / {(profile?.max_questions ?? 0) > 1000 ? '∞' : (profile?.max_questions ?? 0)}
                      </span>
                  </div>
                  <div className="w-full bg-black/40 rounded-full h-3 overflow-hidden border border-white/5 relative">
                      <div 
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                              usagePercentage >= 100 ? 'bg-gradient-to-r from-red-500 to-orange-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                          }`}
                          style={{ width: `${usagePercentage}%` }}
                      ></div>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-3 text-center italic">
                      Resets automatically on the 1st of every month.
                  </p>
              </div>
          </div>
      </div>

      {/* 2. PLANS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* FREE PLAN */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 flex flex-col shadow-sm hover:border-slate-300 transition-all">
              <div className="mb-6">
                  <h3 className="text-lg font-bold text-slate-600 mb-2">Starter</h3>
                  <p className="text-4xl font-black text-slate-900">৳0<span className="text-sm font-bold text-slate-400">/mo</span></p>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-slate-300 shrink-0"/> 50 Questions / Month</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-slate-300 shrink-0"/> Basic PDF Export</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-slate-300 shrink-0"/> NextPrep Branding</li>
              </ul>
              <button disabled className="w-full py-4 rounded-xl bg-slate-100 text-slate-400 font-bold text-sm cursor-not-allowed">
                  {profile?.subscription_plan === 'free' ? 'Current Plan' : 'Downgrade'}
              </button>
          </div>

          {/* TRIAL PROMO */}
          {!profile?.is_trial_used && profile?.subscription_plan === 'free' && (
              <div className="relative bg-gradient-to-b from-blue-600 to-indigo-700 rounded-3xl p-1 shadow-xl shadow-blue-200 transform lg:-translate-y-4 order-first lg:order-none md:col-span-2 lg:col-span-1">
                  <div className="absolute top-0 right-0 left-0 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest py-1.5 text-center">
                      Recommended Start
                  </div>
                  <div className="bg-white rounded-[20px] p-6 lg:p-8 h-full flex flex-col mt-6">
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
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 lg:p-8 flex flex-col shadow-sm relative overflow-hidden group">
              {hasDiscount && (
                  <div className="absolute -right-12 top-6 bg-red-500 text-white text-[10px] font-black px-12 py-1 rotate-45 shadow-sm z-10">
                      50% OFF
                  </div>
              )}
              <div className="mb-6 relative z-10">
                  <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500 fill-amber-500"/> Professional</h3>
                  <div className="mt-2 flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                      <p className="text-4xl font-black text-slate-900">৳{getDisplayPrice('monthly')}</p>
                      {hasDiscount && <span className="text-lg text-slate-400 line-through font-bold">৳500</span>}
                      <span className="text-sm font-bold text-slate-400">/mo</span>
                  </div>
              </div>
              <ul className="space-y-4 mb-8 flex-1 relative z-10">
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Unlimited Questions</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> White-label PDF</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Priority Support</li>
                  <li className="flex gap-3 text-sm text-slate-600 font-medium"><CheckCircle className="w-5 h-5 text-emerald-500 shrink-0"/> Rich Text Editor</li>
              </ul>
              
              <div className="flex flex-col gap-3 relative z-10">
                  <button 
                      onClick={() => { setSelectedPlan('monthly'); setShowPayModal(true); }}
                      className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors shadow-lg shadow-slate-200"
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
              <table className="w-full text-sm text-left whitespace-nowrap">
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
                                  <td className="px-6 py-4 font-bold text-slate-800 capitalize">{t.plan_type.replace('pro_', '')}</td>
                                  <td className="px-6 py-4 text-slate-600 font-mono">৳{t.amount}</td>
                                  <td className="px-6 py-4 capitalize flex items-center gap-2 font-bold text-slate-700">
                                      {t.payment_method === 'bkash' && <span className="w-2 h-2 rounded-full bg-pink-500"></span>}
                                      {t.payment_method === 'upay' && <span className="w-2 h-2 rounded-full bg-blue-500"></span>}
                                      {t.payment_method === 'cellfin' && <span className="w-2 h-2 rounded-full bg-emerald-500"></span>}
                                      {t.payment_method === 'dodo' && <Globe className="w-3 h-3 text-yellow-500"/>}
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

      {/* --- PAYMENT MODAL (Responsive Overlay) --- */}
      {showPayModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in duration-300 overflow-y-auto">
              <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 my-auto">
                  {/* Header */}
                  <div className="bg-slate-900 p-5 md:p-6 text-white flex justify-between items-start sticky top-0 z-10">
                      <div>
                          <h3 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-emerald-400"/> Secure Payment</h3>
                          <p className="text-slate-400 text-sm mt-1">Upgrade to Pro {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'}</p>
                      </div>
                      <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                          <X className="w-5 h-5"/>
                      </button>
                  </div>

                  <div className="p-5 md:p-8 space-y-6">
                      
                      {/* Method Selector Grid */}
                      <div className="grid grid-cols-2 gap-3">
                          <button onClick={() => setPaymentMethod('bkash')} className={`p-3 rounded-xl border-2 font-bold text-xs md:text-sm transition-all flex flex-col items-center gap-1 ${paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50 text-pink-700 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                              <span>Bkash</span><Smartphone className="w-4 h-4 opacity-50"/>
                          </button>
                          <button onClick={() => setPaymentMethod('upay')} className={`p-3 rounded-xl border-2 font-bold text-xs md:text-sm transition-all flex flex-col items-center gap-1 ${paymentMethod === 'upay' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                              <span>Upay</span><Smartphone className="w-4 h-4 opacity-50"/>
                          </button>
                          <button onClick={() => setPaymentMethod('cellfin')} className={`p-3 rounded-xl border-2 font-bold text-xs md:text-sm transition-all flex flex-col items-center gap-1 ${paymentMethod === 'cellfin' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                              <span>Cellfin</span><Smartphone className="w-4 h-4 opacity-50"/>
                          </button>
                          <button onClick={() => setPaymentMethod('dodo')} className={`p-3 rounded-xl border-2 font-bold text-xs md:text-sm transition-all flex flex-col items-center gap-1 ${paymentMethod === 'dodo' ? 'border-yellow-400 bg-yellow-50 text-yellow-700 shadow-md' : 'border-slate-100 text-slate-500 hover:border-slate-200'}`}>
                              <span>Intl. Card</span><Globe className="w-4 h-4 opacity-50"/>
                          </button>
                      </div>

                      {/* DYNAMIC CONTENT AREA */}
                      {paymentMethod === 'dodo' ? (
                          <div className="text-center space-y-6 py-4 animate-in fade-in">
                              <div className="bg-yellow-50 p-5 rounded-2xl border border-yellow-200 text-yellow-800 text-sm">
                                  <p className="font-bold mb-1">Pay with Visa / Mastercard / Apple Pay</p>
                                  <p className="text-yellow-700/80 text-xs">You will be redirected to a secure checkout page hosted by Dodo Payments.</p>
                              </div>
                              <div className="flex justify-center gap-2 items-baseline text-slate-600">
                                  <span className="text-sm font-bold">Total:</span>
                                  <span className="text-3xl font-black text-slate-900">৳{getDisplayPrice(selectedPlan)}</span>
                              </div>
                              <button 
                                  onClick={handleDodoPayment} 
                                  disabled={submitting}
                                  className="w-full bg-yellow-400 text-black py-4 rounded-xl font-bold shadow-lg shadow-yellow-200 hover:bg-yellow-500 transition-all flex items-center justify-center gap-2"
                              >
                                  {submitting ? <Loader2 className="w-5 h-5 animate-spin"/> : "Proceed to Checkout"}
                              </button>
                          </div>
                      ) : (
                          <div className="space-y-6 animate-in fade-in">
                              {/* Payment Instructions */}
                              <div className={`p-5 rounded-2xl border-2 text-center space-y-3 ${
                                  paymentMethod === 'bkash' ? 'bg-pink-50/50 border-pink-100' : 
                                  paymentMethod === 'upay' ? 'bg-blue-50/50 border-blue-100' : 
                                  'bg-emerald-50/50 border-emerald-100'
                              }`}>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Send Money (Personal)</p>
                                  
                                  <div className="flex justify-center items-center gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm mx-auto max-w-fit">
                                      <span className="text-xl md:text-2xl font-black text-slate-800 tracking-tight font-mono">
                                          {paymentMethod === 'cellfin' ? '01828677148' : '+8801828677148'}
                                      </span>
                                      <button onClick={() => copyNumber(paymentMethod === 'cellfin' ? '01828677148' : '+8801828677148')} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"><Copy className="w-4 h-4"/></button>
                                  </div>
                                  
                                  <div className="flex justify-center gap-2 items-baseline text-slate-600">
                                      <span className="text-xs font-bold uppercase">Amount:</span>
                                      <span className="text-slate-900 text-xl font-black">৳{getDisplayPrice(selectedPlan)}</span>
                                  </div>
                              </div>

                              {/* Form */}
                              <form onSubmit={handleSubmitPayment} className="space-y-4">
                                  <div>
                                      <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Wallet Number</label>
                                      <input 
                                          required
                                          type="text" 
                                          placeholder="e.g. 017XXXXXXXX" 
                                          className="w-full border border-slate-300 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all placeholder:font-normal placeholder:text-slate-300"
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
                                          className="w-full border border-slate-300 rounded-xl p-3.5 font-bold text-slate-800 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all uppercase placeholder:font-normal placeholder:normal-case placeholder:text-slate-300"
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
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
}