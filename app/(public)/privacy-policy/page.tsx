"use client";
import { Shield, Lock, Eye, Server, MessageSquare, Mail, Phone, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  const lastUpdated = "March 25, 2026";

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pt-32 pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-20">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6"
         >
           <Shield className="w-3 h-3 fill-indigo-600/10" /> Your Privacy Matters
         </motion.div>
         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight"
         >
           Privacy <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Policy</span>
         </motion.h1>
         <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-slate-500 text-lg font-medium"
         >
           Last updated on <span className="text-slate-900 font-bold">{lastUpdated}</span>
         </motion.p>
      </div>

      <div className="max-w-4xl mx-auto px-6">
         <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-16">
            
            {/* 1. Introduction */}
            <section className="space-y-6">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">01</div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Introduction</h2>
               </div>
               <div className="pl-0 md:pl-16 space-y-4">
                  <p className="text-lg text-slate-600 leading-relaxed font-medium">
                    At <span className="text-slate-900 font-black">NextPrepBD</span>, we are committed to protecting your personal information and your right to privacy. This Privacy Policy outlines how we collect, use, and safeguard your data.
                  </p>
                  <p className="text-slate-500 leading-relaxed italic border-l-4 border-indigo-100 pl-6 py-2">
                    "We believe education should be accessible, and privacy is a fundamental human right. We never sell your personal data to advertisers."
                  </p>
               </div>
            </section>

            {/* 2. Information We Collect */}
            <section className="space-y-10">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">02</div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">Information We Collect</h2>
               </div>
               <div className="pl-0 md:pl-16 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { icon: Lock, title: "Identity Data", desc: "Name, username, and profile details provided during registration." },
                    { icon: Mail, title: "Contact Data", desc: "Email address and optional phone number for account recovery." },
                    { icon: Eye, title: "Usage Data", desc: "Exam scores, quiz attempts, and time spent on resources." },
                    { icon: Server, title: "Technical Data", desc: "IP address and browser version to ensure platform security." }
                  ].map((item, i) => (
                    <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:border-indigo-200 transition-all group">
                       <item.icon className="w-6 h-6 text-indigo-400 mb-4 group-hover:text-indigo-600 transition-colors" />
                       <h3 className="text-lg font-black text-slate-900 mb-2">{item.title}</h3>
                       <p className="text-sm text-slate-500 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  ))}
               </div>
            </section>

            {/* 3. Data Usage */}
            <section className="space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black">03</div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">How We Use Your Data</h2>
               </div>
               <div className="pl-0 md:pl-16 space-y-4">
                  <ul className="grid grid-cols-1 gap-4">
                    {[
                      "To personalize your learning dashboard and track progress.",
                      "To provide AI-driven study suggestions and resource analysis.",
                      "To maintain the security and integrity of our question banks.",
                      "To communicate important system updates or changes."
                    ].map((text, i) => (
                      <li key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                         <div className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                         <span className="text-slate-700 font-medium">{text}</span>
                      </li>
                    ))}
                  </ul>
               </div>
            </section>

            {/* 4. Contact Block */}
            <div className="pt-10 border-t border-slate-100">
               <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                  <h3 className="text-3xl font-black mb-4">Dedicated Support</h3>
                  <p className="text-slate-400 font-medium mb-10 max-w-md">Our legal team and support staff are here to answer any questions regarding your data rights.</p>
                  
                  <div className="flex flex-col sm:flex-row gap-6">
                     <a href="mailto:support@nextprepbd.com" className="flex items-center gap-4 p-4 pr-8 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all group">
                        <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Mail className="w-5 h-5"/></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Email Support</p>
                           <p className="text-sm font-bold">support@nextprepbd.com</p>
                        </div>
                     </a>
                     <a href="tel:+8801745775697" className="flex items-center gap-4 p-4 pr-8 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/10 transition-all group">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform"><Phone className="w-5 h-5"/></div>
                        <div>
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Call Us</p>
                           <p className="text-sm font-bold">+880 1745-775697</p>
                        </div>
                     </a>
                  </div>
               </div>
            </div>

         </div>
      </div>

    </div>
  );
}