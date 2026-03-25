"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Heart, ShieldCheck, Zap, Award, CheckCircle2, Copy, ExternalLink, ArrowRight, Wallet, History } from "lucide-react";
import ProfessionalAppBanner from "@/components/ProfessionalAppBanner";
import { motion, AnimatePresence } from "framer-motion";

const PAYMENT_METHODS = [
  {
    id: "bkash",
    name: "bkash",
    number: "01828677148",
    color: "bg-[#D12053]",
    textColor: "text-white",
    logo: "https://www.logo.wine/a/logo/BKash/BKash-Logo.wine.svg",
    instructions: "Send Money to the Personal number above. Use 'Donation' as reference."
  },
  {
    id: "nagad",
    name: "Nagad",
    number: "01745775697",
    color: "bg-[#F15A22]",
    textColor: "text-white",
    logo: "https://www.logo.wine/a/logo/Nagad/Nagad-Logo.wine.svg",
    instructions: "Send Money to the Personal number above. Use 'NextPrep' as reference."
  },
  {
    id: "upay",
    name: "Upay",
    number: "01828677148",
    color: "bg-[#FFBA00]",
    textColor: "text-slate-900",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR6A7mY5p_R_X9_6_X9_6_X9_6_X9_6_X9_6_X9_6_X", // Placeholder for Upay
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
    const { data } = await supabase
      .from("donations")
      .select("donor_name, amount, created_at")
      .eq("status", "approved")
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setRecentDonations(data);
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
    // Add a toast notification here if available
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 pt-32">
      
      {/* 1. HERO HEADER */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-16">
         <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest mb-6"
         >
           <Heart className="w-3 h-3 fill-rose-600" /> Support NextPrepBD
         </motion.div>
         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-tight"
         >
           Empower Education through <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-600">Your Generosity</span>
         </motion.h1>
         <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.2 }}
           className="text-slate-500 text-lg md:text-xl max-w-2xl mx-auto font-medium leading-relaxed"
         >
           We are on a mission to provide quality educational resources to every student in Bangladesh. Your donation helps us keep our platform free and up-to-date.
         </motion.p>
      </div>

      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
         
         {/* LEFT: DONATION FORM CARD */}
         <div className="lg:col-span-2">
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 border border-slate-100 overflow-hidden relative">
               
               {/* Progress Bar */}
               <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-50">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-rose-500 to-indigo-600"
                    animate={{ width: `${(step / 3) * 100}%` }}
                  />
               </div>

               <div className="p-8 md:p-12">
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
                         <h3 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                           <Zap className="w-6 h-6 text-rose-500" /> Start Your Donation
                         </h3>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Full Name</label>
                               <input 
                                 type="text" 
                                 placeholder="e.g. Tushar Ahmed"
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all shadow-inner"
                                 value={formData.donor_name}
                                 onChange={(e) => setFormData({...formData, donor_name: e.target.value})}
                               />
                            </div>
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Donation Amount (BDT)</label>
                               <input 
                                 type="number" 
                                 placeholder="500"
                                 className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-bold outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all shadow-inner"
                                 value={formData.amount}
                                 onChange={(e) => setFormData({...formData, amount: e.target.value})}
                               />
                            </div>
                         </div>

                         <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Payment Method</label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                               {PAYMENT_METHODS.map((method) => (
                                 <button 
                                   key={method.id}
                                   onClick={() => handleMethodSelect(method.id)}
                                   disabled={!formData.amount || !formData.donor_name}
                                   className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group ${
                                      formData.payment_method === method.id 
                                      ? `${method.color} border-transparent shadow-xl scale-105` 
                                      : "border-slate-100 bg-white hover:border-rose-200 hover:shadow-lg disabled:opacity-50"
                                   }`}
                                 >
                                    <div className={`w-16 h-10 rounded-xl flex items-center justify-center font-black overflow-hidden bg-white/20 backdrop-blur-sm p-1`}>
                                       {method.logo ? (
                                         <img src={method.logo} alt={method.name} className="w-full h-full object-contain" />
                                       ) : (
                                         <span className="text-white text-xs">{method.name.charAt(0)}</span>
                                       )}
                                    </div>
                                    <span className={`text-xs font-black uppercase tracking-widest ${formData.payment_method === method.id ? (method.id === 'upay' ? 'text-slate-900' : 'text-white') : 'text-slate-600'}`}>
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
                        className="space-y-8"
                      >
                         <button onClick={() => setStep(1)} className="text-xs font-black text-rose-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                            <ArrowRight className="w-4 h-4 rotate-180" /> Change Method
                         </button>

                         <div className={`p-8 rounded-[2rem] ${PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.color} text-white shadow-2xl`}>
                            <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                               <ShieldCheck className="w-6 h-6" /> Payment Instructions
                            </h4>
                            <div className="space-y-6">
                               <div className="flex justify-between items-center py-4 border-b border-white/10">
                                  <div>
                                     <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">Send To (Personal)</p>
                                     <p className="text-2xl font-black">{PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.number}</p>
                                  </div>
                                  <button 
                                    onClick={() => copyToClipboard(PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.number || "")}
                                    className="p-3 bg-white/20 rounded-xl hover:bg-white/30 transition-all"
                                  >
                                     <Copy className="w-5 h-5" />
                                  </button>
                               </div>
                               <p className="text-sm font-medium leading-relaxed bg-white/10 p-4 rounded-xl">
                                  {PAYMENT_METHODS.find(m => m.id === formData.payment_method)?.instructions}
                               </p>
                            </div>
                         </div>

                         <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                            <div className="space-y-2">
                               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enter Transaction ID (TrxID)</label>
                               <div className="relative">
                                  <input 
                                    required
                                    type="text" 
                                    placeholder="e.g. 5K9L2M4N7P"
                                    className="w-full pl-6 pr-12 py-5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-black outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all uppercase tracking-widest shadow-inner"
                                    value={formData.transaction_id}
                                    onChange={(e) => setFormData({...formData, transaction_id: e.target.value.toUpperCase()})}
                                  />
                                  <CheckCircle2 className={`absolute right-6 top-1/2 -translate-y-1/2 w-6 h-6 transition-colors ${formData.transaction_id.length > 5 ? "text-green-500" : "text-slate-200"}`} />
                               </div>
                               <p className="text-[10px] font-bold text-slate-400 mt-2 italic px-2">Verify the TrxID from your SMS or App history.</p>
                            </div>
                            
                            <button 
                              disabled={isSubmitting || !formData.transaction_id}
                              className="w-full py-6 bg-slate-900 text-white rounded-2xl text-sm font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-rose-600 transition-all disabled:opacity-50 transform hover:-translate-y-1"
                            >
                              {isSubmitting ? "Processing..." : "Submit Transaction"}
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
                        className="text-center py-12 space-y-8"
                      >
                         <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                            <CheckCircle2 className="w-12 h-12" />
                         </div>
                         <div className="space-y-4">
                            <h3 className="text-4xl font-black text-slate-900">Jazakallah Khairan!</h3>
                            <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-sm mx-auto">
                               Thank you, <span className="text-rose-600 font-black">{formData.donor_name}</span>. Your donation of ৳{formData.amount} has been received and is pending verification.
                            </p>
                         </div>
                         <div className="bg-slate-50 p-6 rounded-3xl inline-block border border-slate-100">
                             <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Transaction Reference</p>
                             <p className="text-lg font-black text-slate-700 tracking-[0.2em]">{formData.transaction_id}</p>
                         </div>
                         <div className="pt-8">
                            <button 
                              onClick={() => {setStep(1); setFormData({amount: "", donor_name: "", payment_method: "", transaction_id: ""}); setIsSuccess(false);}}
                              className="px-8 py-4 bg-white border border-slate-200 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
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
            <div className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
               <h4 className="text-xl font-black mb-6 flex items-center gap-3">
                 <Wallet className="w-6 h-6 text-indigo-400" /> Why Donate?
               </h4>
               <ul className="space-y-6">
                  <li className="flex gap-4">
                     <div className="w-10 h-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center font-bold">01</div>
                     <p className="text-sm font-medium text-indigo-100 leading-relaxed">Expand Resource Library: Add more lecture sheets and video classes.</p>
                  </li>
                  <li className="flex gap-4">
                     <div className="w-10 h-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center font-bold">02</div>
                     <p className="text-sm font-medium text-indigo-100 leading-relaxed">Server Maintenance: Keeping NextPrepBD fast and available 24/7.</p>
                  </li>
                  <li className="flex gap-4">
                     <div className="w-10 h-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center font-bold">03</div>
                     <p className="text-sm font-medium text-indigo-100 leading-relaxed">Accessibility: Developing features for students in remote areas.</p>
                  </li>
               </ul>
            </div>

            {/* Recent Donors List */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100">
               <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-3">
                 <History className="w-5 h-5 text-rose-500" /> Recent Generosity
               </h4>
               <div className="space-y-6">
                  {recentDonations.length > 0 ? recentDonations.map((donor, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                       <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center relative overflow-hidden border border-slate-100">
                          <div className="absolute inset-0 bg-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Award className="w-5 h-5 text-rose-500" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-800 truncate">{donor.donor_name}</p>
                          <p className="text-[10px] font-bold text-slate-400">{new Date(donor.created_at).toLocaleDateString()}</p>
                       </div>
                       <div className="text-sm font-black text-slate-900 bg-slate-50 px-3 py-1 rounded-lg">
                          ৳{donor.amount}
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-8">
                       <p className="text-xs font-bold text-slate-400">Be the first to donate!</p>
                    </div>
                  )}
               </div>
            </div>

         </div>

      </div>

      <div className="max-w-6xl mx-auto px-6 mt-20">
         <ProfessionalAppBanner />
      </div>

    </div>
  );
}
