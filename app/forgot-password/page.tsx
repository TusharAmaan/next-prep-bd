"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Redirects them to the update page after clicking the email link
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });

    setLoading(false);
    if (error) alert(error.message);
    else setMsg("Check your email for the password reset link!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-black text-slate-900 mb-2">Reset Password</h1>
        <p className="text-slate-500 text-sm mb-6">Enter your email to receive a reset link.</p>
        
        {msg ? (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl font-bold text-center">
            {msg}
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <input 
              type="email" required placeholder="Enter your email"
              className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-indigo-500"
              value={email} onChange={e => setEmail(e.target.value)}
            />
            <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}