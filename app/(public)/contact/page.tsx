"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ContactPage() {
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
    <div className="min-h-screen bg-gray-50 font-sans pt-28 pb-20 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto px-6">
        
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Contact Support</h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Got a technical issue or feedback? We are here to help.
            </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
            
            {/* LEFT SIDE: Contact Info */}
            <div className="lg:col-span-5 bg-[#0f172a] text-white p-10 flex flex-col justify-between relative overflow-hidden">
                
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-overlay filter blur-3xl opacity-10 -ml-16 -mb-16"></div>

                <div className="relative z-10 space-y-10">
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Get in Touch</h3>
                        <p className="text-gray-400 text-sm">We typically respond within 2 hours.</p>
                    </div>

                    <div className="space-y-6">
                        
                        {/* EMAIL */}
                        <div className="flex items-start gap-4 group">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1">Email Support</h4>
                                <a href="mailto:support@nextprepbd.com" className="text-lg font-medium text-white hover:text-blue-400 transition">support@nextprepbd.com</a>
                            </div>
                        </div>

                        {/* WHATSAPP */}
                        <div className="flex items-start gap-4 group">
                            <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-600 group-hover:border-green-500 transition-all">
                                <svg className="w-5 h-5 text-gray-300 group-hover:text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-1">WhatsApp</h4>
                                <p className="text-lg font-medium text-white hover:text-green-400 transition cursor-pointer">+880 1234-567890</p>
                            </div>
                        </div>

                    </div>

                    <div className="border-t border-white/10 pt-8">
                        <h4 className="font-bold text-xs text-gray-400 uppercase tracking-wider mb-4">Follow Us</h4>
                        <div className="flex gap-3">
                            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-[#1877F2] hover:bg-blue-600 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-blue-500/20">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                                Facebook
                            </a>
                            <a href="#" className="flex items-center gap-2 px-4 py-2 bg-[#FF0000] hover:bg-red-600 text-white rounded-lg text-sm font-bold transition shadow-lg shadow-red-500/20">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
                                YouTube
                            </a>
                        </div>
                    </div>
                </div>

                {/* APP DOWNLOAD CTA - UPDATED ICONS */}
                <div className="relative z-10 mt-auto pt-8 border-t border-white/10">
                    <h4 className="font-bold text-white text-sm mb-3">Learn on the go</h4>
                    <div className="flex gap-3">
                        {/* Google Play Button */}
                        <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 rounded-xl transition hover:scale-105">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M3.038 2.5C2.378 2.9 2 3.7 2 4.6v14.8c0 .9.378 1.7 1.038 2.1l9.6-8.4-9.6-8.4zm1.6-1.4l10.6 9.2 4.3-3.8-13.2-7.6c-.6-.3-1.2-.2-1.7.2zm15.8 6.3l-3.6 3.1 3.6 3.1c.8-.5 1.3-1.4 1.3-2.4s-.5-1.9-1.3-2.4zM4.638 22.9c.5.4 1.1.5 1.7.2l13.2-7.6-4.3-3.8-10.6 9.2z"/>
                            </svg>
                            <div className="text-left">
                                <div className="text-[9px] uppercase font-bold text-gray-400 leading-none">Get it on</div>
                                <div className="text-xs font-bold text-white leading-tight">Google Play</div>
                            </div>
                        </button>
                        
                        {/* App Store Button */}
                        <button className="flex items-center gap-3 bg-white/10 hover:bg-white/20 border border-white/10 px-3 py-2 rounded-xl transition hover:scale-105">
                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                <path d="M17.354 12.527c-.024-2.506 2.037-3.71 2.13-3.76-1.162-1.7-2.972-1.933-3.615-1.956-1.538-.158-3.004.907-3.785.907-.782 0-1.987-.887-3.283-.867-1.69.02-3.248.986-4.117 2.506-1.757 3.064-.45 7.567 1.255 10.053.835 1.223 1.82 2.6 3.122 2.55 1.252-.048 1.723-.81 3.235-.81 1.513 0 1.944.81 3.258.78 1.35-.02 2.206-1.223 3.037-2.447.953-1.403 1.346-2.766 1.37-2.836-.03-.01-2.64-1.016-2.608-4.02zm-2.722-5.694c.697-.85 1.17-2.03 1.04-3.207-1.01.04-2.235.676-2.963 1.528-.65.752-1.217 1.963-1.065 3.15 1.127.088 2.28-.62 2.948-1.47z"/>
                            </svg>
                            <div className="text-left">
                                <div className="text-[9px] uppercase font-bold text-gray-400 leading-none">Download on</div>
                                <div className="text-xs font-bold text-white leading-tight">App Store</div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Interactive Form */}
            <div className="lg:col-span-7 p-10 lg:p-12 bg-white flex flex-col justify-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Your Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder="e.g. Abdullah Masum"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder="e.g. student@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Subject</label>
                        <input 
                            type="text" 
                            name="subject" 
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            placeholder="e.g. Question about Physics Note"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Message</label>
                        <textarea 
                            name="message" 
                            rows={5}
                            required
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 resize-none"
                            placeholder="How can we help you today?"
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-black hover:bg-gray-800 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>

                    {/* Status Messages */}
                    {status === "success" && (
                        <div className="flex items-center gap-3 bg-green-50 border border-green-100 text-green-700 p-4 rounded-xl animate-fade-in-up">
                            <span className="bg-green-100 p-1 rounded-full">✅</span>
                            <p className="text-sm font-bold">Message sent! We'll reply soon.</p>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl animate-fade-in-up">
                            <span className="bg-red-100 p-1 rounded-full">⚠️</span>
                            <p className="text-sm font-bold">Failed to send. Please check connection.</p>
                        </div>
                    )}
                </form>
            </div>

        </div>
      </div>
    </div>
  );
}