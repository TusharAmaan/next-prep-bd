'use client';

import { useState } from "react";
import { ArrowRight, Mail, Phone, Facebook, Youtube, Send, Sparkles, CheckCircle2, ShieldAlert } from "lucide-react";

export default function ContactContent() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });

        if (response.ok) {
            setStatus("success");
            setFormData({ name: "", email: "", subject: "", message: "" });
        } else {
            setStatus("error");
        }
    } catch (error) {
        setStatus("error");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-6">
      
      <div className="text-center mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-black text-[10px] uppercase tracking-[0.2em] mb-8">
            <Sparkles className="w-4 h-4" /> Global Intelligence Support
          </div>
          <h1 className="text-5xl md:text-8xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter uppercase leading-[0.9]">
            Signal the <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Mastery Hub.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg md:text-xl font-medium leading-relaxed">
            Encountered an anomaly or have high-level feedback? Our academic response team is synchronized to assist.
          </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-3xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors duration-500">
          
          {/* LEFT SIDE: Contact Info */}
          <div className="lg:col-span-5 bg-slate-900 dark:bg-slate-950 text-white p-12 md:p-16 flex flex-col justify-between relative overflow-hidden group">
              
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20 transition-transform group-hover:scale-110 duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none -ml-40 -mb-20 transition-transform group-hover:scale-110 duration-1000"></div>

              <div className="relative z-10 space-y-16">
                  <div>
                      <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Command <span className="text-indigo-500">Center</span></h3>
                      <p className="text-slate-400 text-sm font-black uppercase tracking-widest leading-loose opacity-60">Synchronized response within <br/>120 minutes of intelligence relay.</p>
                  </div>

                  <div className="space-y-10">
                      
                      {/* EMAIL */}
                      <div className="flex items-start gap-6 group/item">
                          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover/item:bg-indigo-600 group-hover/item:border-indigo-500 transition-all duration-500 shadow-2xl">
                              <Mail className="w-6 h-6 text-slate-400 group-hover/item:text-white" />
                          </div>
                          <div>
                              <h4 className="font-black text-[9px] text-slate-500 uppercase tracking-[0.3em] mb-2">Protocol: Email</h4>
                              <a href="mailto:nextprepbd@gmail.com" className="text-xl font-black text-white hover:text-indigo-400 transition-colors uppercase tracking-tight tracking-tight">nextprepbd@gmail.com</a>
                          </div>
                      </div>

                      {/* WHATSAPP */}
                      <div className="flex items-start gap-6 group/item">
                          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover/item:bg-emerald-600 group-hover/item:border-emerald-500 transition-all duration-500 shadow-2xl">
                              <Phone className="w-6 h-6 text-slate-400 group-hover/item:text-white" />
                          </div>
                          <div>
                              <a href="https://wa.me/8801619663933">
                                  <h4 className="font-black text-[9px] text-slate-500 uppercase tracking-[0.3em] mb-2">Protocol: Mobile</h4>
                                  <p className="text-xl font-black text-white hover:text-emerald-400 transition-colors cursor-pointer uppercase tracking-tight tracking-tight">+880 16196 63933</p>
                              </a>
                          </div>
                      </div>

                  </div>

                  <div className="pt-16 border-t border-white/5 space-y-8">
                      <h4 className="font-black text-[9px] text-slate-500 uppercase tracking-[0.3em]">Network Broadcasts</h4>
                      <div className="flex flex-wrap gap-4">
                          <a href="https://www.facebook.com/profile.php?id=61584943876571" className="flex items-center gap-4 px-8 py-4 bg-white/5 hover:bg-[#1877F2] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border border-white/5 hover:border-transparent group/btn">
                              <Facebook className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
                              Facebook
                          </a>
                          <a href="https://www.youtube.com/@nextprepbd" className="flex items-center gap-4 px-8 py-4 bg-white/5 hover:bg-[#FF0000] text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 border border-white/5 hover:border-transparent group/btn">
                              <Youtube className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
                              YouTube
                          </a>
                      </div>
                  </div>
              </div>

              <div className="relative z-10 mt-20 pt-10 border-t border-white/5 hidden md:block">
                  <div className="flex items-center gap-4 p-6 bg-white/5 rounded-[2rem] border border-white/5 backdrop-blur-3xl group/card hover:bg-white/10 transition-all duration-500">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shrink-0 group-hover/card:scale-110 transition-transform"><Sparkles className="w-6 h-6" /></div>
                      <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-1">Ecosystem Status</p>
                          <p className="text-xs font-black uppercase tracking-tight text-white">All intelligence nodes online</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT SIDE: Interactive Form */}
          <div className="lg:col-span-7 p-12 md:p-16 flex flex-col justify-center">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-10 tracking-tighter uppercase leading-none">Relay <br/><span className="text-indigo-600 dark:text-indigo-400">Intelligence Payload</span></h3>
              
              <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Entity Identity</label>
                          <input 
                              type="text" 
                              name="name" 
                              required
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-[1.2rem] p-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 font-black uppercase tracking-widest"
                              placeholder="e.g. Master Candidate"
                          />
                      </div>
                      <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Relay Channel (Email)</label>
                          <input 
                              type="email" 
                              name="email" 
                              required
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-[1.2rem] p-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 font-black uppercase tracking-widest"
                              placeholder="e.g. signal@node.com"
                          />
                      </div>
                  </div>

                  <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Intelligence Sector</label>
                      <input 
                          type="text" 
                          name="subject" 
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-[1.2rem] p-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 font-black uppercase tracking-widest"
                          placeholder="e.g. Curriculum Anomaly Detection"
                      />
                  </div>

                  <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1">Payload Description</label>
                      <textarea 
                          name="message" 
                          rows={6}
                          required
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-[1.2rem] p-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 resize-none font-black uppercase tracking-widest leading-relaxed"
                          placeholder="Describe the mission parameters..."
                      ></textarea>
                  </div>

                  <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-black py-6 rounded-[1.5rem] shadow-3xl shadow-indigo-600/20 transition-all transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 text-[10px] uppercase tracking-[0.3em] group"
                  >
                      {loading ? "Relaying Payload..." : <><span className="group-hover:translate-x-2 transition-transform">Transmit Intelligence</span> <Send className="w-5 h-5 group-hover:rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"/></>}
                  </button>

                  {/* Status Messages */}
                  {status === "success" && (
                      <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-6 rounded-[1.5rem] animate-in fade-in slide-in-from-bottom-2">
                          <CheckCircle2 className="w-6 h-6 shrink-0" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Relay Successful. Our curators are analyzing your payload.</p>
                      </div>
                  )}
                  {status === "error" && (
                      <div className="flex items-center gap-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400 p-6 rounded-[1.5rem] animate-in fade-in slide-in-from-bottom-2">
                          <ShieldAlert className="w-6 h-6 shrink-0" />
                          <p className="text-[10px] font-black uppercase tracking-widest">Relay failure. Connection to Command Center interrupted.</p>
                      </div>
                  )}
              </form>
          </div>

      </div>
    </div>
  );
}
