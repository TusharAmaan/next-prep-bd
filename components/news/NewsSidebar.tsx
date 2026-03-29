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
    <aside className="space-y-10 transition-colors duration-300">
      
      {/* 1. SEARCH WIDGET */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white mb-6 pb-2 border-b-2 border-indigo-600 inline-block">Search</h4>
        <form action="/news" method="GET" className="relative group">
          <input 
            type="text" 
            name="q"
            placeholder="Type and hit enter..." 
            className="w-full pl-6 pr-12 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-700 dark:text-white outline-none focus:ring-4 focus:ring-indigo-600/10 focus:bg-white dark:focus:bg-slate-800 transition-all shadow-inner"
          />
          <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* 2. CATEGORIES WIDGET */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white mb-6 pb-2 border-b-2 border-indigo-600 inline-block">Categories</h4>
        <div className="space-y-2">
          {categories.map((cat) => (
            <Link 
              key={cat} 
              href={`/news?category=${cat}&page=1`}
              className={`flex items-center justify-between px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group ${
                activeCategory === cat 
                ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400"
              }`}
            >
              <span>{cat}</span>
              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${activeCategory === cat ? "translate-x-1" : "opacity-0 group-hover:opacity-100"}`} />
            </Link>
          ))}
        </div>
      </div>

      {/* 3. RECENT POSTS WIDGET */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white mb-6 pb-2 border-b-2 border-indigo-600 inline-block">Recent Posts</h4>
        <div className="space-y-8">
          {recentPosts.map((post) => (
            <Link key={post.id} href={`/news/${post.id}`} className="flex gap-5 group">
              <div className="w-16 h-16 shrink-0 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 relative shadow-sm">
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-600"><Tag className="w-5 h-5"/></div>
                )}
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h5 className="text-xs font-black text-slate-800 dark:text-white line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 uppercase tracking-tight">{post.title}</h5>
                <div className="flex items-center gap-2 text-[8px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <Clock className="w-3 h-3" />
                  {new Date(post.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* 4. SOCIAL WIDGET */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white mb-6 pb-2 border-b-2 border-indigo-600 inline-block">Stay Connected</h4>
        <div className="grid grid-cols-2 gap-4">
          <a href="#" className="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl hover:bg-blue-600 hover:text-white transition-all group border border-blue-100 dark:border-blue-900/50">
            <Facebook className="w-4 h-4 shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-widest">Like</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 bg-sky-50 dark:bg-sky-900/20 text-sky-500 dark:text-sky-400 rounded-2xl hover:bg-sky-500 hover:text-white transition-all group border border-sky-100 dark:border-sky-900/50">
            <Twitter className="w-4 h-4 shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-widest">Follow</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl hover:bg-red-600 hover:text-white transition-all group border border-red-100 dark:border-red-900/50">
            <Youtube className="w-4 h-4 shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-widest">Watch</span>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-2xl hover:bg-pink-600 hover:text-white transition-all group border border-pink-100 dark:border-pink-900/50">
            <Instagram className="w-4 h-4 shrink-0" />
            <span className="text-[8px] font-black uppercase tracking-widest">Follow</span>
          </a>
        </div>
      </div>

      {/* 5. NEWSLETTER WIDGET */}
      <div className="bg-slate-900 dark:bg-indigo-600 rounded-[2.5rem] p-10 relative overflow-hidden shadow-2xl transition-colors duration-500">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 text-center">
            <div className="w-16 h-16 bg-white/10 border border-white/10 rounded-[1.5rem] flex items-center justify-center mx-auto mb-8 backdrop-blur-md">
                <Mail className="w-8 h-8 text-white" />
            </div>
            <h4 className="text-2xl font-black text-white mb-4 uppercase tracking-tight">Join Us</h4>
            <p className="text-slate-400 dark:text-indigo-100 text-xs font-semibold mb-8 leading-relaxed">Essential updates delivered <br/> straight to your inbox.</p>
            <form onSubmit={handleSubscribe} className="space-y-4">
                <input 
                    type="email" 
                    placeholder="Your Email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 text-xs outline-none focus:bg-white/10 transition-all font-bold tracking-wider"
                />
                <button 
                  type="submit"
                  disabled={status === "loading" || status === "success"}
                  className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl transition-all shadow-black/20 ${
                    status === "success" ? "bg-green-500 text-white" : "bg-white text-slate-900 hover:bg-slate-50 active:scale-95"
                  }`}
                >
                    {status === "loading" ? "Joining..." : status === "success" ? "Joined!" : "Subscribe"}
                </button>
                {status === "error" && <p className="text-[10px] font-black text-rose-400 mt-3 uppercase tracking-widest">Error. Try again.</p>}
            </form>
        </div>
      </div>

    </aside>
  );
}


