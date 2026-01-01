"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const token = searchParams.get("token");
  const role = searchParams.get("role"); // Just for display

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
        setError("Invalid invitation link.");
    }
  }, [token]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName } // This triggers the handle_new_user SQL function
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed.");

      // 2. Call API to verify token and upgrade role
      const res = await fetch("/api/invite/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            email, 
            token, 
            userId: authData.user.id 
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error);

      // 3. Success! Redirect to Dashboard
      router.push("/admin"); // Or /profile
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
            <h1 className="text-2xl font-bold text-red-500 mb-2">Invalid Link</h1>
            <p className="text-slate-500">This invitation link is missing a token.</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-xl border border-slate-100">
        <div className="text-center mb-8">
            <h1 className="text-3xl font-black text-slate-900 mb-2">Join the Team</h1>
            <p className="text-slate-500 text-sm">
                You have been invited to join as a <span className="font-bold text-indigo-600 uppercase">{role || "Member"}</span>.
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Full Name</label>
                <input 
                    required
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                />
            </div>
            
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Email Address</label>
                <input 
                    required
                    type="email"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    placeholder="Enter the email you were invited with"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                />
                <p className="text-[10px] text-slate-400 mt-1">* Must match the invitation email</p>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Set Password</label>
                <input 
                    required
                    type="password"
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 mt-4"
            >
                {loading ? "Creating Account..." : "Accept & Join"}
            </button>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="text-center p-10">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}