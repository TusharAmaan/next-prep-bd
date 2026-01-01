"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        // Fetch Role to determine redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        router.refresh(); // Refresh middleware cookie

        setTimeout(() => {
          if (profile && profile.role !== 'student') {
            router.replace("/admin"); // Staff go to Dashboard
          } else {
            router.replace("/"); // Students go to Home
          }
        }, 500);
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 w-full max-w-md">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome Back</h1>
          <p className="text-slate-500 text-sm font-medium">Please enter your details to sign in.</p>
        </div>

        {/* Error Message */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-bold flex items-center gap-2 justify-center animate-fade-in">
            <span>⚠️</span> {errorMsg}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
              placeholder="hello@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2 ml-1">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wide">Password</label>
                <Link href="/forgot-password" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                    Forgot Password?
                </Link>
            </div>
            <input 
              type="password" 
              required
              className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 p-3.5 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder:text-slate-300"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Signing In...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Footer: Signup Link */}
        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-400">
            Don't have an account? <Link href="/signup" className="text-slate-900 hover:text-indigo-600 transition-colors underline decoration-2 decoration-indigo-200 hover:decoration-indigo-600">Create one</Link>
          </p>
        </div>

      </div>
    </div>
  );
}