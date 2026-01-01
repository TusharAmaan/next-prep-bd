"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // If user is not authenticated (via the magic link), kick them out
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/login");
    });
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({ password });

    if (error) alert(error.message);
    else {
      alert("Password updated! Redirecting...");
      router.push("/"); // Send them to home or dashboard
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl">
        <h1 className="text-2xl font-black text-slate-900 mb-6">Set New Password</h1>
        <form onSubmit={handleUpdate} className="space-y-4">
          <input 
            type="password" required placeholder="New Password"
            className="w-full border-2 border-slate-100 p-3 rounded-xl font-bold outline-none focus:border-indigo-500"
            value={password} onChange={e => setPassword(e.target.value)}
          />
          <button disabled={loading} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700">
            {loading ? "Updating..." : "Confirm New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}