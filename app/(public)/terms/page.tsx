"use client";
import { Scale, FileText, ShieldCheck, UserCheck, AlertOctagon, Mail, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

export default function TermsPage() {
  const lastUpdated = "March 25, 2026";

  const sections = [
    {
      icon: FileText,
      title: "Acceptance of Terms",
      desc: "By accessing NextPrepBD, you agree to comply with our core guidelines and ethics of our education system."
    },
    {
      icon: UserCheck,
      title: "User Obligations",
      desc: "Users must provide accurate information and maintain the security of their learning credentials."
    },
    {
      icon: ShieldCheck,
      title: "IP Protection",
      desc: "All resources, notes and suggestions are protected under intellectual property laws."
    },
    {
      icon: AlertOctagon,
      title: "Service Disclaimers",
      desc: "We provide educational assistance 'as-is' and do not guarantee specific academic outcomes."
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans pt-32 pb-24 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-6 text-center mb-20">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white shadow-sm border border-slate-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest mb-6"
         >
           <Scale className="w-3 h-3" /> Community Standards
         </motion.div>
         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight"
         >
           Terms of <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">Service</span>
         </motion.h1>
         <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-slate-500 text-lg font-medium"
         >
           Updated on <span className="text-slate-900 font-bold">{lastUpdated}</span>
         </motion.p>
      </div>

      <div className="max-w-5xl mx-auto px-6">
         <div className="bg-white rounded-[3.5rem] p-8 md:p-20 shadow-2xl shadow-slate-200/40 border border-slate-100 mb-16">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
               {sections.map((section, idx) => (
                 <div key={idx} className="group">
                    <div className="w-14 h-14 bg-slate-50 rounded-[1.25rem] flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 mb-6">
                       <section.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight">{section.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">{section.desc}</p>
                 </div>
               ))}
            </div>

            <div className="space-y-12">
               <section className="p-8 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100/50">
                  <h4 className="text-lg font-black text-indigo-900 mb-4">Educational Disclaimer</h4>
                  <p className="text-indigo-800/80 font-medium leading-relaxed">
                    NextPrepBD provides suggestions and materials based on NCTB curriculum analysis. We do not guarantee 100% common questions in real exams. Students are advised to use our materials as supplementary resources alongside their official textbooks.
                  </p>
               </section>

               <div className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:font-medium prose-p:text-slate-600 prose-p:leading-relaxed">
                  <h3 className="text-2xl">Use of Materials</h3>
                  <p>
                    All materials on NextPrepBD are protected by copyright. You may download materials for your personal, non-commercial use only. You may not distribute, reproduce, or modify our content without explicit written permission.
                  </p>
                  
                  <h3 className="text-2xl">User Content</h3>
                  <p>
                    When you participate in discussions, groups, or upload content, you grant NextPrepBD a non-exclusive right to use and display that content on the platform to benefit other learners.
                  </p>
               </div>
            </div>
         </div>

         {/* Call to Action */}
         <div className="bg-gradient-to-br from-indigo-700 to-violet-800 rounded-[3rem] p-12 text-center text-white shadow-3xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <h3 className="text-3xl font-black mb-6">Need Legal Clarification?</h3>
            <p className="text-indigo-100 font-medium mb-10 max-w-sm mx-auto leading-relaxed">If you have technical or legal questions about our service usage, please contact us.</p>
            <div className="flex flex-wrap justify-center gap-4">
               <a href="mailto:support@nextprepbd.com" className="px-8 py-4 bg-white text-indigo-700 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl hover:scale-105 transition-all">Email Legal Team</a>
               <a href="/faq" className="px-8 py-4 bg-transparent border-2 border-white/20 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">Read FAQ</a>
            </div>
         </div>
      </div>

    </div>
  );
}