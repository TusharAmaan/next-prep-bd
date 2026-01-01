"use client";
import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

// --- INTERNAL FORM COMPONENT ---
// We separate this so we can use the 'useGoogleReCaptcha' hook inside the provider
function LoginForm() {
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // --- 1. GOOGLE LOGIN HANDLER ---
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg("");
    
    // Determine redirect URL (Localhost vs Production)
    const redirectTo = process.env.NEXT_PUBLIC_SITE_URL 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` 
      : `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      setErrorMsg(error.message);
      setGoogleLoading(false);
    }
  };

  // --- 2. EMAIL LOGIN HANDLER (With reCAPTCHA) ---
  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    // Check if ReCaptcha is loaded
    if (!executeRecaptcha) {
      setErrorMsg("Security check not ready. Please refresh the page.");
      setLoading(false);
      return;
    }

    try {
      // A. Verify User Interaction
      const token = await executeRecaptcha("login_submit");
      if (!token) {
        setErrorMsg("Security verification failed. Are you a robot?");
        setLoading(false);
        return;
      }

      // B. Proceed with Supabase Login
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
        // C. Fetch Profile & Redirect
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, status')
          .eq('id', data.user.id)
          .single();

        router.refresh();

        setTimeout(() => {
          if (profile) {
             if (profile.status === 'pending') {
                 router.replace("/verification-pending");
             } else if (profile.role !== 'student') {
                 router.replace("/admin");
             } else {
                 router.replace("/");
             }
          } else {
             router.replace("/");
          }
        }, 500);
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please check your connection.");
      setLoading(false);
    }
  }, [executeRecaptcha, email, password, router]);

  return (
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

        <div className="space-y-5">
            {/* GOOGLE BUTTON */}
            <button 
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                className="w-full bg-white border-2 border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3 relative group"
            >
                {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin"></div>
                ) : (
                    <>
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        <span>Continue with Google</span>
                    </>
                )}
            </button>

            {/* DIVIDER */}
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-xs font-bold text-slate-400 uppercase">Or with email</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* EMAIL FORM */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-wide mb-2 ml-1">Email</label>
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
                disabled={loading || googleLoading}
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
        </div>

        {/* Footer */}
        <div className="mt-8 text-center pt-6 border-t border-slate-100">
          <p className="text-sm font-bold text-slate-400">
            Don't have an account? <Link href="/signup" className="text-slate-900 hover:text-indigo-600 transition-colors underline decoration-2 decoration-indigo-200 hover:decoration-indigo-600">Create one</Link>
          </p>
        </div>

        {/* ReCaptcha Legal Text */}
        <p className="text-[10px] text-slate-300 text-center mt-6 leading-tight">
           This site is protected by reCAPTCHA and the Google 
           <a href="https://policies.google.com/privacy" className="text-slate-400 hover:underline"> Privacy Policy</a> and 
           <a href="https://policies.google.com/terms" className="text-slate-400 hover:underline"> Terms of Service</a> apply.
        </p>
    </div>
  );
}

// --- MAIN EXPORT WITH PROVIDER ---
export default function LoginPage() {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaKey) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
            <div className="p-6 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100">
                ⚠️ Error: Missing reCAPTCHA Key in .env.local
            </div>
        </div>
      );
  }

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] px-4 font-sans">
         <LoginForm />
      </div>
    </GoogleReCaptchaProvider>
  );
}