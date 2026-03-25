"use client";
import { useState } from "react";
import Link from "next/link";
import { Search, Tag, Clock, ArrowRight, Facebook, Twitter, Instagram, Youtube, Mail, ChevronRight } from "lucide-react";

interface NewsSidebarProps {
  categories: string[];
  recentPosts: any[];
  activeCategory?: string;
}

export default function NewsSidebar({ categories, recentPosts, activeCategory }: NewsSidebarProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setStatus("loading");
    try {
        const res = await fetch("/api/newsletter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        if (res.ok) {
            setStatus("success");
            setEmail("");
        } else {
            setStatus("error");
        }
    } catch (err) {
        setStatus("error");
    }
  };

  return (
    <aside className="space-y-10">
      
      {/* 1. SEARCH WIDGET */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-5 pb-2 border-b-2 border-indigo-600 inline-block">Search</h4>
        <form action="/news" method="GET" className="relative group">
          <input 
            type="text" 
            name="q"
            placeholder="Type and hit enter..." 
            className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all shadow-inner"
          />
          <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 2. CATEGORIES WIDGET */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-5 pb-2 border-b-2 border-indigo-600 inline-block">Categories</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <Link 
              key={cat} 
              href={`/news?category=${cat}&page=1`}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" 
                : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600"
              }`}
            >
              <span>{cat}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeCategory === cat ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. RECENT POSTS WIDGET */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-5 pb-2 border-b-2 border-indigo-600 inline-block">Recent Posts</h4>
        <div className="space-y-6">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/news/${post.id}`} className="flex gap-4 group">
              <div className="w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-100 relative">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300"><Tag className="w-6 h-6"/></div>
                )}
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h5 className="text-sm font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors mb-1.5">{post.title}</h5>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <Clock className="w-3 h-3" />
                  {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. SOCIAL WIDGET */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 mb-5 pb-2 border-b-2 border-indigo-600 inline-block">Stay Connected</h4>
        <div className="grid grid-cols-2 gap-3">
          <a href="#" className="flex items-center gap-3 p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all group">
            <Facebook className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Like</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 bg-sky-50 text-sky-500 rounded-xl hover:bg-sky-500 hover:text-white transition-all group">
            <Twitter className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Follow</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all group">
            <Youtube className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Watch</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-3 bg-pink-50 text-pink-600 rounded-xl hover:bg-pink-600 hover:text-white transition-all group">
            <Instagram className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-tighter">Follow</span>
          </a>
        </div>
      </div>

      {/* 5. NEWSLETTER WIDGET */}
      <div className="bg-indigo-600 rounded-3xl p-8 relative overflow-hidden shadow-xl shadow-indigo-100">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
        <div className="relative z-10 text-center">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <Mail className="w-7 h-7 text-white" />
            </div>
            <h4 className="text-xl font-black text-white mb-3">Subscribe Now!</h4>
            <p className="text-indigo-100 text-xs font-medium mb-6 leading-relaxed">Get the latest news and updates directly in your inbox.</p>
            <form onSubmit={handleSubscribe} className="space-y-3">
                <input 
                    type="email" 
                    placeholder="Your Email Address" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-indigo-200 text-xs outline-none focus:bg-white/20 transition-all font-bold"
                />
                <button 
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all ${
                    status === "success" ? "bg-green-500 text-white" : "bg-white text-indigo-600 hover:bg-slate-50"
                  }`}
                >
                    {status === "loading" ? "Joining..." : status === "success" ? "Joined!" : "Sign Up Now"}
                </button>
                {status === "error" && <p className="text-[10px] font-bold text-rose-300 mt-2">Something went wrong. Try again.</p>}
            </form>
        </div>
      </div>

    </aside>
  );
}


