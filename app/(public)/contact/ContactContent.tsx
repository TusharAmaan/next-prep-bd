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
    <div className="max-w-7xl w-full mx-auto px-4 md:px-6">
      
      <div className="text-center mb-16 md:mb-24 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 font-bold text-xs tracking-wide mb-8 shadow-sm">
            <Sparkles className="w-4 h-4" /> Academic Support & Guidance
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-8xl font-bold text-slate-900 dark:text-white mb-6 md:mb-8 tracking-tight leading-[1] md:leading-[0.9]">
            Contact Our <br className="hidden md:block"/><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">Support Team.</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base md:text-xl font-medium leading-relaxed opacity-80">
            Have a question, feedback, or need help with a resource? Our dedicated support team is here to assist you.
          </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-3xl dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-colors duration-500">
          
          {/* LEFT SIDE: Contact Info */}
          <div className="lg:col-span-5 bg-slate-900 dark:bg-slate-950 text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden group">
              
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none -mr-40 -mt-20 transition-transform group-hover:scale-110 duration-1000"></div>
              <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px] pointer-events-none -ml-40 -mb-20 transition-transform group-hover:scale-110 duration-1000"></div>

              <div className="relative z-10 space-y-12 md:space-y-16">
                  <div>
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4 tracking-tight">Support <span className="text-indigo-500">Channels</span></h3>
                      <p className="text-slate-400 text-xs md:text-sm font-semibold tracking-wide leading-relaxed md:leading-loose opacity-60">We typically respond within <br className="hidden md:block"/>2 hours during business hours.</p>
                  </div>

                  <div className="space-y-8 md:space-y-10">
                      
                      {/* EMAIL */}
                      <div className="flex items-start gap-4 md:gap-6 group/item">
                          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 border border-white/10 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover/item:bg-indigo-600 group-hover/item:border-indigo-500 transition-all duration-500 shadow-2xl">
                              <Mail className="w-6 h-6 text-slate-400 group-hover/item:text-white" />
                          </div>
                          <div>
                              <h4 className="font-bold text-xs text-slate-500 tracking-wide mb-1.5 md:mb-2">Email Us</h4>
                              <a href="mailto:nextprepbd@gmail.com" className="text-lg md:text-xl font-bold text-white hover:text-indigo-400 transition-colors tracking-tight">nextprepbd@gmail.com</a>
                          </div>
                      </div>

                      {/* WHATSAPP */}
                      <div className="flex items-start gap-4 md:gap-6 group/item">
                          <div className="w-14 h-14 md:w-16 md:h-16 bg-white/5 border border-white/10 rounded-xl md:rounded-[1.5rem] flex items-center justify-center shrink-0 group-hover/item:bg-emerald-600 group-hover/item:border-emerald-500 transition-all duration-500 shadow-2xl">
                              <Phone className="w-6 h-6 text-slate-400 group-hover/item:text-white" />
                          </div>
                          <div>
                              <a href="https://wa.me/8801619663933">
                                  <h4 className="font-bold text-xs text-slate-500 tracking-wide mb-1.5 md:mb-2">WhatsApp / Phone</h4>
                                  <p className="text-lg md:text-xl font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer tracking-tight">+880 16196 63933</p>
                              </a>
                          </div>
                      </div>

                  </div>

                  <div className="pt-12 md:pt-16 border-t border-white/5 space-y-6 md:space-y-8">
                      <h4 className="font-bold text-xs text-slate-500 tracking-wide">Follow Our Updates</h4>
                      <div className="flex flex-wrap gap-3 md:gap-4">
                          <a href="https://www.facebook.com/profile.php?id=61584943876571" className="flex items-center gap-3 md:gap-4 px-6 md:px-8 py-4 bg-white/5 hover:bg-[#1877F2] text-white rounded-2xl text-xs font-bold tracking-wide transition-all duration-500 border border-white/5 hover:border-transparent group/btn">
                              <Facebook className="w-5 h-5 group-hover/btn:scale-125 transition-transform" />
                              Facebook
                          </a>
                          <a href="https://www.youtube.com/@nextprepbd" className="flex items-center gap-3 md:gap-4 px-6 md:px-8 py-4 bg-white/5 hover:bg-[#FF0000] text-white rounded-2xl text-xs font-bold tracking-wide transition-all duration-500 border border-white/5 hover:border-transparent group/btn">
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
                          <p className="text-xs font-bold tracking-wide text-indigo-400 mb-1">Service Status</p>
                          <p className="text-xs font-bold tracking-tight text-white">All systems operational</p>
                      </div>
                  </div>
              </div>
          </div>

          {/* RIGHT SIDE: Interactive Form */}
          <div className="lg:col-span-12 h-px bg-slate-100 dark:bg-slate-800 lg:hidden" />
          <div className="lg:col-span-7 p-8 md:p-16 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-8 md:mb-10 tracking-tight leading-none">Send Us <br className="hidden md:block"/><span className="text-indigo-600 dark:text-indigo-400">A Message</span></h3>
              
              <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide ml-1">Your Full Name</label>
                          <input 
                              type="text" 
                              name="name" 
                              required
                              value={formData.name}
                              onChange={handleChange}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-[1.2rem] p-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 font-bold"
                              placeholder="e.g. Tushar Ahmed"
                          />
                      </div>
                      <div className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide ml-1">Your Email Address</label>
                          <input 
                              type="email" 
                              name="email" 
                              required
                              value={formData.email}
                              onChange={handleChange}
                              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-[1.2rem] p-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 font-bold"
                              placeholder="e.g. contact@example.com"
                          />
                      </div>
                  </div>

                  <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide ml-1">Subject / Topic</label>
                      <input 
                          type="text" 
                          name="subject" 
                          required
                          value={formData.subject}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-[1.2rem] p-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 font-bold"
                          placeholder="e.g. Question about SSC Resources"
                      />
                  </div>

                  <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-400 dark:text-slate-500 tracking-wide ml-1">Your Message</label>
                      <textarea 
                          name="message" 
                          rows={6}
                          required
                          value={formData.message}
                          onChange={handleChange}
                          className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-[1.2rem] p-5 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all placeholder-slate-400 dark:placeholder-slate-500 resize-none font-bold leading-relaxed"
                          placeholder="How can we help you today?"
                      ></textarea>
                  </div>

                  <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-slate-900 dark:bg-indigo-600 text-white font-bold py-6 rounded-[1.5rem] shadow-3xl shadow-indigo-600/20 transition-all transform hover:-translate-y-2 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-4 text-xs tracking-wide group"
                  >
                      {loading ? "Sending Message..." : <><span className="group-hover:translate-x-2 transition-transform">Send Message</span> <Send className="w-5 h-5 group-hover:rotate-45 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"/></>}
                  </button>

                  {/* Status Messages */}
                  {status === "success" && (
                      <div className="flex items-center gap-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 p-6 rounded-[1.5rem] animate-in fade-in slide-in-from-bottom-2">
                          <CheckCircle2 className="w-6 h-6 shrink-0" />
                          <p className="text-xs font-bold tracking-wide">Message Sent! Our team will get back to you shortly.</p>
                      </div>
                  )}
                  {status === "error" && (
                      <div className="flex items-center gap-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 text-rose-700 dark:text-rose-400 p-6 rounded-[1.5rem] animate-in fade-in slide-in-from-bottom-2">
                          <ShieldAlert className="w-6 h-6 shrink-0" />
                          <p className="text-xs font-bold tracking-wide">Failed to send message. Please try again or contact us via WhatsApp.</p>
                      </div>
                  )}
              </form>
          </div>

      </div>
    </div>
  );
}
