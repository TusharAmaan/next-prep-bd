"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Heart, ShieldCheck, Zap, Award, CheckCircle2, Copy, ExternalLink, ArrowRight, Wallet, History, Mail, Phone } from "lucide-react";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";

const PAYMENT_METHODS = [
  {
    id: "bkash",
    name: "bkash",
    number: "01828677148",
    color: "bg-[#D12053] dark:bg-[#D12053]/90",
    textColor: "text-white",
    logo: "https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg",
    instructions: "Send Money to the Personal number above. Use 'Donation' as reference."
  },
  {
    id: "nagad",
    name: "Nagad",
    number: "01745775697",
    color: "bg-[#F15A22] dark:bg-[#F15A22]/90",
    textColor: "text-white",
    logo: "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg",
    instructions: "Send Money to the Personal number above. Use 'NextPrep' as reference."
  },
  {
    id: "upay",
    name: "Upay",
    number: "01828677148",
    color: "bg-[#FFBA00] dark:bg-[#FFBA00]/90",
    textColor: "text-slate-900",
    logo: "https://raw.githubusercontent.com/shurjopay/shurjopay-plugin-images/master/upay.png",
    instructions: "Send Money to the Personal number above via Upay App or USSD *268#."
  }
];

export default function DonatePage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    amount: "",
    donor_name: "",
    payment_method: "",
    transaction_id: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [recentDonations, setRecentDonations] = useState<any[]>([]);

  useEffect(() => {
    fetchRecentDonations();
  }, []);

  async function fetchRecentDonations() {
    try {
      const { data } = await supabase
        .from("donations")
        .select("donor_name, amount, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(5);
      if (data) setRecentDonations(data);
    } catch (e) {
      // Quietly handle fetch error
    }
  }

  const handleMethodSelect = (methodId: string) => {
    setFormData({ ...formData, payment_method: methodId });
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase
      .from("donations")
      .insert([
        { 
          ...formData, 
          amount: parseFloat(formData.amount),
          status: "pending" 
        }
      ]);

    if (!error) {
      setIsSuccess(true);
      setStep(3);
    } else {
      alert("Something went wrong. Please try again or contact support.");
    }
    setIsSubmitting(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 font-sans transition-colors duration-300 selection:bg-rose-100 dark:selection:bg-rose-900/30 selection:text-rose-900 dark:selection:text-rose-200">

      
      <main className="pt-32 pb-20 px-6">
        {/* HERO HEADER */}
        <div className="max-w-4xl mx-auto text-center mb-16">
           <motion.div 
             initial={{ opacity: 0, scale: 0.9 }}
             animate={{ opacity: 1, scale: 1 }}
             className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold tracking-widest mb-6"
           >
             <Heart className="w-4 h-4 fill-rose-600 dark:fill-rose-400" /> Support NextPrepBD
           </motion.div>
           <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             className="text-4xl md:text-7xl font-bold text-slate-900 dark:text-white mb-6 tracking-tight leading-none"
           >
             Empower <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600 dark:from-rose-400 dark:to-indigo-400">Education</span>
           </motion.h1>
           <motion.p 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-slate-500 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
           >
             We are on a mission to provide quality educational resources to every student in Bangladesh. Your donation helps us keep our platform free and up-to-date.
           </motion.p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
           
           {/* LEFT: DONATION FORM CARD */}
           <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl dark:shadow-indigo-900/10 border border-slate-100 dark:border-slate-800 overflow-hidden relative">
                 
                 {/* Progress Bar */}
                 <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50 dark:bg-slate-800">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-rose-500 to-indigo-600"
                      animate={{ width: `${(step / 3) * 100}%` }}
                    />
                 </div>

                 <div className="p-8 md:p-14">
                    <AnimatePresence mode="wait">
                      
                      {/* STEP 1: AMOUNT & NAME */}
                      {step === 1 && (
                        <motion.div 
                          key="step1"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-8"
                        >
                           <h3 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
                             <Zap className="w-8 h-8 text-rose-500" /> Start Your Donation
                           </h3>
                           
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                 <label className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500">Your Full Name</label>
                                 <input 
                                   type="text" 
                                   placeholder="e.g. Tushar Ahmed"
                                   className="w-full px-7 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-white font-bold outline-none focus:ring-4 focus:ring-rose-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                                   value={formData.donor_name}
                                   onChange={(e) => setFormData({...formData, donor_name: e.target.value})}
                                 />
                              </div>
                              <div className="space-y-3">
                                 <label className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500">Donation Amount (BDT)</label>
                                 <input 
                                   type="number" 
                                   placeholder="500"
                                   className="w-full px-7 py-5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-white font-bold outline-none focus:ring-4 focus:ring-rose-500/20 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-sm"
                                   value={formData.amount}
                                   onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                 />
                              </div>
                           </div>

                           <div className="space-y-5">
                              <label className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500">Select Payment Method</label>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                 {PAYMENT_METHODS.map((method) => (
                                   <button 
                                     key={method.id}
                                     onClick={() => handleMethodSelect(method.id)}
                                     disabled={!formData.amount || !formData.donor_name}
                                     className={`p-7 rounded-[2.5rem] border-2 transition-all flex flex-col items-center gap-5 group ${
                                        formData.payment_method === method.id 
                                        ? `${method.color} border-transparent shadow-xl scale-105` 
                                        : "border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-rose-200 dark:hover:border-rose-900/50 hover:shadow-lg disabled:opacity-40"
                                     }`}
                                   >
                                      <div className={`w-16 h-12 rounded-xl flex items-center justify-center font-bold overflow-hidden bg-white/20 backdrop-blur-sm p-1`}>
                                         <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                                      </div>
                                      <span className={`text-xs font-bold tracking-[0.2em] ${formData.payment_method === method.id ? (method.id === 'upay' ? 'text-slate-900' : 'text-white') : 'text-slate-600 dark:text-slate-400'}`}>
                                        {method.name}
                                      </span>
                                   </button>
                                 ))}
                              </div>
                           </div>
                        </motion.div>
                      )}

                      {/* STEP 2: PAYMENT DETAILS */}
                      {step === 2 && (
                        <motion.div 
                          key="step2"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="space-y-10"
                        >
                           <button onClick={() => setStep(1)} className="text-xs font-bold text-rose-500 tracking-widest flex items-center gap-2 mb-4 group">
                              <ArrowRight className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" /> Change Method
                           </button>

                           <div className={`p-10 rounded-[3rem] ${PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.color} text-white shadow-2xl relative overflow-hidden`}>
                              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                              <h4 className="text-2xl font-bold mb-8 flex items-center gap-4 tracking-tight">
                                 <ShieldCheck className="w-8 h-8" /> Payment Setup
                              </h4>
                              <div className="space-y-8">
                                 <div className="flex justify-between items-center py-6 border-b border-white/20">
                                    <div>
                                       <p className="text-xs font-bold tracking-widest text-white/60 mb-2">Send To (Personal)</p>
                                       <p className="text-3xl font-bold tracking-wider">{PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.number}</p>
                                    </div>
                                    <button 
                                      onClick={() => copyToClipboard(PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.number || "")}
                                      className="p-4 bg-white/20 rounded-2xl hover:bg-white/30 transition-all active:scale-90"
                                    >
                                       <Copy className="w-6 h-6" />
                                    </button>
                                 </div>
                                 <div className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                                    <p className="text-sm font-bold leading-relaxed">
                                       {PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.instructions}
                                    </p>
                                 </div>
                              </div>
                           </div>

                           <form onSubmit={handleSubmit} className="space-y-8">
                              <div className="space-y-3">
                                 <label className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500">Transaction ID (TrxID)</label>
                                 <div className="relative">
                                    <input 
                                      required
                                      type="text" 
                                      placeholder="e.g. 5K9L2M4N7P"
                                      className="w-full pl-7 pr-16 py-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-700 dark:text-white font-bold outline-none focus:ring-4 focus:ring-rose-500/20 focus:bg-white transition-all tracking-[0.3em] shadow-sm"
                                      value={formData.transaction_id}
                                      onChange={(e) => setFormData({...formData, transaction_id: e.target.value.toUpperCase()})}
                                    />
                                    <CheckCircle2 className={`absolute right-7 top-1/2 -translate-y-1/2 w-7 h-7 transition-all ${formData.transaction_id.length > 5 ? "text-green-500 scale-110" : "text-slate-200 dark:text-slate-700"}`} />
                                 </div>
                              </div>
                              
                              <button 
                                disabled={isSubmitting || !formData.transaction_id}
                                className="w-full py-6 bg-slate-900 border border-slate-800 text-white rounded-[2rem] text-xs font-bold tracking-[0.4em] shadow-2xl hover:bg-rose-600 transition-all disabled:opacity-40 transform hover:-translate-y-1"
                              >
                                {isSubmitting ? "Processing..." : "Submit Donation"}
                              </button>
                           </form>
                        </motion.div>
                      )}

                      {/* STEP 3: SUCCESS */}
                      {step === 3 && (
                        <motion.div 
                          key="step3"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="text-center py-12 space-y-10"
                        >
                           <div className="w-28 h-28 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto shadow-inner">
                              <CheckCircle2 className="w-14 h-14" />
                           </div>
                           <div className="space-y-5">
                              <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">Thank You!</h3>
                              <p className="text-slate-500 dark:text-slate-400 font-medium text-lg md:text-xl leading-relaxed max-w-sm mx-auto">
                                 Your contribution of <span className="text-rose-600 dark:text-rose-400 font-bold">৳{formData.amount}</span> helps us keep education free for everyone.
                              </p>
                           </div>
                           <div className="bg-slate-50 dark:bg-slate-800 p-8 rounded-[2.5rem] inline-block border border-slate-100 dark:border-slate-700">
                               <p className="text-xs font-bold tracking-widest text-slate-400 dark:text-slate-500 mb-3">Ref ID</p>
                               <p className="text-xl font-bold text-slate-700 dark:text-white tracking-[0.4em]">{formData.transaction_id}</p>
                           </div>
                           <div className="pt-10">
                              <button 
                                onClick={() => {setStep(1); setFormData({amount: "", donor_name: "", payment_method: "", transaction_id: ""}); setIsSuccess(false);}}
                                className="px-10 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm"
                              >
                                 Make Another Donation
                              </button>
                           </div>
                        </motion.div>
                      )}

                    </AnimatePresence>
                 </div>
              </div>
           </div>

           {/* RIGHT: SIDEBAR (Social Proof & Impact) */}
           <div className="space-y-10">
              
              {/* Impact Widget */}
              <div className="bg-slate-900 dark:bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                 <h4 className="text-xl font-bold mb-8 flex items-center gap-4 tracking-tight">
                   <Wallet className="w-6 h-6 text-indigo-400" /> Our Mission
                 </h4>
                 <ul className="space-y-8">
                    {[
                      { idx: "01", t: "Expand Library", d: "Add more lecture sheets and video classes." },
                      { idx: "02", t: "Availability", d: "Keep NextPrepBD fast and available 24/7." },
                      { idx: "03", t: "Reach", d: "Developing features for remote students." }
                    ].map((item, i) => (
                      <li key={i} className="flex gap-5">
                         <div className="w-12 h-12 shrink-0 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center font-bold text-xs">{item.idx}</div>
                         <div>
                            <p className="text-sm font-bold tracking-wider mb-1">{item.t}</p>
                            <p className="text-xs font-medium text-slate-400 leading-relaxed">{item.d}</p>
                         </div>
                      </li>
                    ))}
                 </ul>
              </div>

              {/* Recent Donors List */}
              <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                 <h4 className="text-xs font-bold tracking-[0.3em] text-slate-900 dark:text-white mb-10 flex items-center gap-4">
                   <History className="w-5 h-5 text-rose-500" /> Recent Activity
                 </h4>
                 <div className="space-y-8">
                    {recentDonations.length > 0 ? recentDonations.map((donor, i) => (
                      <div key={i} className="flex items-center gap-5 group">
                         <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center relative overflow-hidden border border-slate-100 dark:border-slate-700">
                            <Award className="w-6 h-6 text-rose-500 dark:text-rose-400" />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 dark:text-white truncate tracking-tight">{donor.donor_name}</p>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500">{new Date(donor.created_at).toLocaleDateString()}</p>
                         </div>
                         <div className="text-sm font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 px-4 py-2 rounded-xl">
                            ৳{donor.amount}
                         </div>
                      </div>
                    )) : (
                      <div className="text-center py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2rem]">
                         <p className="text-xs font-bold text-slate-400 tracking-widest">Be the first to donate</p>
                      </div>
                    )}
                 </div>
              </div>

           </div>

        </div>

        <div className="max-w-6xl mx-auto mt-20">
           <ProfessionalAppBanner />
        </div>
      </main>


    </div>
  );
}
