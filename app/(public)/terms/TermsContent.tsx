"use client";

import React from 'react';
import { Gavel, ShieldCheck, Scale, FileWarning, Mail, Phone, Rocket, Sparkles, CheckCircle2 } from 'lucide-react';

interface TermsContentProps {
  lastUpdated: string;
}

export default function TermsContent({ lastUpdated }: TermsContentProps) {
  const metaCards = [
    {
      title: "Content Usage",
      desc: "All resources are for personal educational use. Commercial use is strictly prohibited.",
      icon: Scale,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      title: "User Conduct",
      desc: "Users must follow our community guidelines and respect our digital platform.",
      icon: ShieldCheck,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Property Protection",
      desc: "Copyright and technical marks on all academic materials must remain intact.",
      icon: FileWarning,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    }
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-32">
        <div className="inline-flex items-center gap-3 py-2 px-6 rounded-full bg-slate-900 text-white dark:bg-indigo-600 text-[10px] font-bold uppercase tracking-widest mb-12 shadow-2xl">
          <Gavel className="w-4 h-4 text-indigo-400" /> Terms of Service
        </div>
        <h1 className="text-5xl md:text-8xl font-bold text-slate-900 dark:text-white mb-10 tracking-tight leading-[0.9]">
          Our Service <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-cyan-500">Terms.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto leading-relaxed">
          By using our platform, you agree to the following terms and guidelines. Last updated: <span className="text-slate-900 dark:text-white font-bold">{lastUpdated}</span>
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
        
        {/* 01: Acceptance */}
        <section className="bg-white dark:bg-slate-900/50 p-12 md:p-20 rounded-[4rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity"><Scale size={150} /></div>
          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="w-20 h-20 shrink-0 bg-slate-900 text-white rounded-[2rem] flex items-center justify-center text-2xl font-bold shadow-3xl">01</div>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Accepting the Terms</h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                <p>By accessing or using <span className="font-bold">NextPrepBD</span>, you acknowledge that you have read and agree to these terms. If you do not agree, please stop using the site immediately.</p>
                <div className="p-8 rounded-[2rem] bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800 flex items-start gap-6">
                  <FileWarning className="w-8 h-8 text-amber-600 shrink-0 mt-1" />
                  <p className="text-sm font-bold text-amber-800 dark:text-amber-500 tracking-tight leading-relaxed">Jurisdiction: These terms are governed by the laws of Bangladesh. Any disputes will be subject to the exclusive jurisdiction of the courts in Dhaka.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 02: Intellectual Property */}
        <section className="bg-slate-900 text-white p-12 md:p-20 rounded-[4rem] border border-white/5 relative group overflow-hidden shadow-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 to-transparent opacity-30"></div>
          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="w-20 h-20 shrink-0 bg-indigo-600 text-white rounded-[2rem] flex items-center justify-center text-2xl font-bold shadow-2xl">02</div>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight leading-none">Intellectual <br/> <span className="text-indigo-400">Property</span></h2>
              <div className="space-y-8 text-slate-400 font-medium text-lg leading-relaxed">
                <p>All academic materials, including text, graphics, logos, and code, are the property of NextPrepBD and are protected by intellectual property laws.</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {[
                    "No Commercial Use",
                    "No Automated Data Scraping",
                    "No Mirroring of Content",
                    "No Security Tampering"
                  ].map((rule, id) => (
                    <li key={id} className="flex items-center gap-4 p-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white shadow-inner">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {rule}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 03: Service Disclaimer */}
        <section className="bg-white dark:bg-slate-900/50 p-12 md:p-20 rounded-[4rem] border border-slate-100 dark:border-slate-800 relative group overflow-hidden">
          <div className="flex flex-col md:flex-row gap-12 relative z-10">
            <div className="w-20 h-20 shrink-0 bg-cyan-600 text-white rounded-[2rem] flex items-center justify-center text-2xl font-bold shadow-3xl">03</div>
            <div className="space-y-8">
              <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Service <br/> Disclaimer</h2>
              <div className="space-y-6 text-slate-600 dark:text-slate-400 font-medium text-lg leading-relaxed">
                <p>Our services are provided "as is" without any warranties. While we strive for absolute accuracy in our academic resources, we cannot guarantee perfection. We are not liable for any specific academic or examination outcomes.</p>
                <div className="flex gap-4 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                  <Sparkles className="w-6 h-6 text-indigo-500 shrink-0 mt-1" />
                  <p className="text-[11px] font-bold uppercase tracking-widest leading-relaxed">Continuous Updates: We reserve the right to modify or update any part of our service without prior notice.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Legal Support */}
        <div className="pt-20">
           <div className="bg-slate-900 dark:bg-indigo-600 rounded-[4rem] p-12 md:p-24 text-white relative overflow-hidden shadow-3xl group text-center">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent opacity-20 pointer-events-none"></div>
              <div className="absolute bottom-0 right-0 p-20 opacity-5 group-hover:opacity-10 transition-opacity"><Rocket size={500} /></div>
              
              <div className="relative z-10 max-w-4xl mx-auto space-y-12">
                <h2 className="text-4xl md:text-7xl font-bold leading-[0.9] tracking-tight">Legal & <br /> Compliance.</h2>
                <p className="text-xl md:text-2xl text-indigo-100/70 font-medium leading-relaxed">
                   Our legal team is here to ensure the ethical and proper use of our educational platform.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-8 justify-center">
                   <a href="mailto:nextprepbd@gmail.com" className="flex items-center gap-6 p-6 pr-12 bg-white text-slate-900 rounded-[2.5rem] transition-all group/btn shadow-2xl hover:bg-slate-50 active:scale-95">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover/btn:scale-110 transition-transform shadow-2xl"><Mail className="w-7 h-7"/></div>
                      <div className="text-left">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Send Inquiry</p>
                         <p className="text-xl font-bold">Legal Support</p>
                      </div>
                   </a>
                   <a href="https://wa.me/8801619663933" className="flex items-center gap-6 p-6 pr-12 bg-white/10 hover:bg-white/20 rounded-[2.5rem] border border-white/20 transition-all group/btn backdrop-blur-xl active:scale-95">
                      <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white group-hover/btn:scale-110 transition-transform shadow-2xl"><Phone className="w-7 h-7"/></div>
                      <div className="text-left">
                         <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-1">Direct Message</p>
                         <p className="text-xl font-bold">WhatsApp</p>
                      </div>
                   </a>
                </div>
              </div>
           </div>
           <p className="text-center mt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">© 2026 NextPrepBD. All Rights Reserved. Committed to Excellence and Integrity.</p>
        </div>
      </div>
    </div>
  );
}
