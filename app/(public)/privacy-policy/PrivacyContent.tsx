"use client";

import React from 'react';
import { Shield, Lock, FileText, Mail, Phone, ExternalLink, ShieldCheck, Database, Globe, UserCheck, Sparkles } from 'lucide-react';

interface PrivacyContentProps {
  lastUpdated: string;
}

export default function PrivacyContent({ lastUpdated }: PrivacyContentProps) {
  const metaCards = [
    {
      title: "Data Control",
      desc: "You have complete control over your academic identity and learning progress.",
      icon: UserCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "Secure Encryption",
      desc: "All data transmission is secured via industry-standard SSL protocols.",
      icon: Database,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Google AdSense Ready",
      desc: "Fully compliant with Google's advertising policies and privacy standards.",
      icon: Globe,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-32">
        <div className="inline-flex items-center gap-3 py-2 px-6 rounded-full bg-slate-900 text-white dark:bg-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-12 shadow-2xl">
          <ShieldCheck className="w-4 h-4 text-indigo-400" /> Privacy Policy
        </div>
        <h1 className="text-5xl md:text-8xl font-bold text-slate-900 dark:text-white mb-10 tracking-tight leading-[0.9]">
          How We Protect <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500">Your Privacy.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          At NextPrepBD, we are committed to protecting your personal data and being transparent about how we use it. Last updated: <span className="text-slate-900 dark:text-white font-bold">{lastUpdated}</span>
        </p>
      </div>

      {/* Logic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {metaCards.map((card, i) => (
          <div key={i} className="p-10 rounded-[3rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl dark:shadow-none hover:-translate-y-2 transition-all duration-500 group">
            <div className={`w-16 h-16 rounded-2xl ${card.bg} dark:bg-slate-800 ${card.color} dark:text-indigo-400 flex items-center justify-center mb-8 shadow-inner transition-transform group-hover:scale-110 group-hover:rotate-6`}>
              <card.icon className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 group-hover:text-indigo-600 transition-colors">{card.title}</h3>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 leading-relaxed uppercase tracking-wide">{card.desc}</p>
          </div>
        ))}
      </div>

      {/* Content Blocks */}
      <div className="space-y-16">
        
        {/* 01: Information We Collect */}
        <section className="bg-white dark:bg-slate-900/50 p-12 md:p-20 rounded-[4rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Lock size={150} /></div>
          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="w-20 h-20 shrink-0 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-2xl font-bold shadow-3xl">01</div>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Information We Collect</h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                <p>We collect various types of information to provide and improve our services to you:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    "Identity Data (Name/Email)",
                    "Academic Progress & History",
                    "Resource Interaction Logs",
                    "Technical Data (IP/Device Info)"
                  ].map((item, id) => (
                    <li key={id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-200">
                      <Sparkles className="w-4 h-4 text-indigo-500" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 02: Advertising & Cookies (Critical for AdSense) */}
        <section className="bg-slate-900 text-white p-12 md:p-20 rounded-[4rem] border border-white/5 relative group overflow-hidden shadow-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-30"></div>
          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="w-20 h-20 shrink-0 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-2xl font-bold shadow-2xl">02</div>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-none">Advertising & <span className="text-indigo-400">Cookies</span></h2>
              <div className="space-y-8 text-slate-400 font-medium text-lg leading-relaxed">
                <p>NextPrepBD works with third-party networks, including <span className="text-white font-bold underline decoration-indigo-500">Google AdSense</span>, to serve relevant advertisements:</p>
                <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem] space-y-6 italic">
                  <p>Google, as a third-party vendor, uses cookies to serve ads on our site. Google's use of the <span className="text-indigo-400 font-bold">DART cookie</span> enables it to serve ads to our users based on their visit to our site and other sites on the Internet.</p>
                  <p>Users may opt out of the use of the DART cookie by visiting the Google ad and content network privacy policy at the following URL: <a href="https://policies.google.com/technologies/ads" className="text-indigo-400 underline hover:text-white transition-colors inline-flex items-center gap-2">Opt-out of Personalized Ads <ExternalLink className="w-4 h-4" /></a></p>
                </div>
                <p>Third-party ad servers use technologies to measure the effectiveness of their advertisements and to personalize the advertising content that you see.</p>
              </div>
            </div>
          </div>
        </section>

        {/* 03: Your Rights */}
        <section className="bg-white dark:bg-slate-900/50 p-12 md:p-20 rounded-[4rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="w-20 h-20 shrink-0 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center text-2xl font-bold shadow-3xl">03</div>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Your Data Rights</h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                <p>As a user of NextPrepBD, you have the following rights regarding your personal information:</p>
                <ul className="space-y-4">
                  {[
                    "Right to access the data we hold about you.",
                    "Right to rectify any incorrect personal information.",
                    "Right to request deletion of your account and data.",
                    "Right to object to specific types of data processing."
                  ].map((right, id) => (
                    <li key={id} className="flex gap-4 group/item">
                      <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center shrink-0 mt-1.5 group-hover/item:bg-emerald-600 transition-all"><Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400 group-hover/item:text-white"/></div>
                      <span className="font-bold text-slate-900 dark:text-white">{right}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Support */}
        <div className="pt-20">
           <div className="bg-indigo-600 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden shadow-3xl group">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent opacity-20 pointer-events-none"></div>
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                <div className="text-left space-y-4">
                  <h3 className="text-3xl md:text-5xl font-bold tracking-tight">Privacy Support <br/> Hub</h3>
                  <p className="text-indigo-100 font-medium text-lg max-w-md">Our team is here to answer any questions you have about your privacy and data protection.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6 w-full md:w-auto">
                   <a href="mailto:nextprepbd@gmail.com" className="flex items-center gap-6 p-6 pr-12 bg-white/10 hover:bg-white/20 rounded-[2.5rem] border border-white/10 transition-all group/btn backdrop-blur-xl">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-600 group-hover/btn:scale-110 transition-transform shadow-2xl"><Mail className="w-7 h-7"/></div>
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">Contact via Email</p>
                         <p className="text-xl font-bold tracking-tight">Support Email</p>
                      </div>
                   </a>
                   <a href="https://wa.me/8801619663933" className="flex items-center gap-6 p-6 pr-12 bg-white/10 hover:bg-white/20 rounded-[2.5rem] border border-white/10 transition-all group/btn backdrop-blur-xl">
                      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white group-hover/btn:scale-110 transition-transform shadow-2xl"><Phone className="w-7 h-7"/></div>
                      <div>
                         <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">Fast Response</p>
                         <p className="text-xl font-bold tracking-tight">WhatsApp</p>
                      </div>
                   </a>
                </div>
              </div>
           </div>
           <p className="text-center mt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">© 2026 NextPrepBD. All Rights Reserved. Committed to Global Privacy Standards.</p>
        </div>
      </div>
    </div>
  );
}
