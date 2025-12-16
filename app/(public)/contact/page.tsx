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

    const { error } = await supabase.from("messages").insert([formData]);

    if (error) {
      setStatus("error");
    } else {
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" }); // Reset form
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20 flex items-center justify-center">
      <div className="max-w-6xl w-full mx-auto px-6">
        
        {/* Header Section */}
        <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Contact Support</h1>
            <p className="text-gray-500 text-lg">We are here to help with your academic journey.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
            
            {/* LEFT SIDE: Contact Info (Dark Theme) */}
            <div className="lg:col-span-5 bg-[#0f172a] text-white p-10 flex flex-col justify-between relative overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute top-0 left-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-2">Get in Touch</h3>
                    <p className="text-blue-200 mb-10 text-sm leading-relaxed">
                        Fill out the form and our team will get back to you within 24 hours.
                    </p>

                    <div className="space-y-8">
                        
                        {/* Email Item */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-200 uppercase tracking-wider mb-1">Email</h4>
                                <p className="text-blue-100 hover:text-white transition">support@nextprepbd.com</p>
                            </div>
                        </div>

                        {/* Location Item */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-200 uppercase tracking-wider mb-1">Location</h4>
                                <p className="text-blue-100">Dhaka, Bangladesh</p>
                            </div>
                        </div>

                        {/* Socials Item */}
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-400">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            </div>
                            <div>
                                <h4 className="font-bold text-sm text-gray-200 uppercase tracking-wider mb-1">Socials</h4>
                                <div className="flex gap-4 text-blue-100 text-sm">
                                    <a href="#" className="hover:text-white transition underline decoration-blue-500/50">Facebook</a>
                                    <a href="#" className="hover:text-white transition underline decoration-blue-500/50">YouTube</a>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="relative z-10 mt-12 pt-8 border-t border-white/10">
                    <p className="text-xs text-blue-300 italic">
                        "Connecting students with the resources they need to succeed."
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE: Interactive Form */}
            <div className="lg:col-span-7 p-10 lg:p-14 bg-white">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Send us a Message</h3>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Your Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder="e.g. Abdullah Masum"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                                placeholder="e.g. student@example.com"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Subject</label>
                        <input 
                            type="text" 
                            name="subject" 
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400"
                            placeholder="e.g. Suggestion for Physics"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Message</label>
                        <textarea 
                            name="message" 
                            rows={5}
                            required
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg p-3.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-gray-400 resize-none"
                            placeholder="Write your message here..."
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Sending...
                            </>
                        ) : (
                            "Send Message"
                        )}
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