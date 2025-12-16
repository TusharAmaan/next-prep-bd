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
    <div className="min-h-screen bg-gray-50 font-sans pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Get in Touch</h1>
            <p className="text-gray-500 max-w-2xl mx-auto">
                Have questions about our courses, notes, or suggestions? We'd love to hear from you.
            </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* Left: Contact Info */}
            <div className="bg-blue-600 p-10 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-64 h-64 bg-blue-500 rounded-full opacity-50 blur-3xl"></div>
                
                <div className="relative z-10">
                    <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📧</span>
                            <div>
                                <p className="text-blue-100 text-sm uppercase font-bold tracking-wider">Email Us</p>
                                <p className="font-medium text-lg">support@nextprepbd.com</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📍</span>
                            <div>
                                <p className="text-blue-100 text-sm uppercase font-bold tracking-wider">Location</p>
                                <p className="font-medium text-lg">Dhaka, Bangladesh</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📱</span>
                            <div>
                                <p className="text-blue-100 text-sm uppercase font-bold tracking-wider">Socials</p>
                                <div className="flex gap-4 mt-2">
                                    <a href="#" className="hover:text-blue-200 transition">Facebook</a>
                                    <a href="#" className="hover:text-blue-200 transition">YouTube</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-10">
                    <p className="text-blue-200 text-sm">
                        "Education is the most powerful weapon which you can use to change the world."
                    </p>
                </div>
            </div>

            {/* Right: Form */}
            <div className="p-10 lg:p-12">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Your Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="John Doe"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                            <input 
                                type="email" 
                                name="email" 
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                placeholder="john@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Subject</label>
                        <input 
                            type="text" 
                            name="subject" 
                            required
                            value={formData.subject}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="How can we help?"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                        <textarea 
                            name="message" 
                            rows={4}
                            required
                            value={formData.message}
                            onChange={handleChange}
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 outline-none transition"
                            placeholder="Type your message here..."
                        ></textarea>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70"
                    >
                        {loading ? "Sending..." : "Send Message"}
                    </button>

                    {status === "success" && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center text-sm font-bold">
                            Message sent successfully! We will get back to you soon.
                        </div>
                    )}
                    {status === "error" && (
                        <div className="bg-red-50 text-red-700 p-4 rounded-lg text-center text-sm font-bold">
                            Something went wrong. Please try again later.
                        </div>
                    )}
                </form>
            </div>

        </div>
      </div>
    </div>
  );
}