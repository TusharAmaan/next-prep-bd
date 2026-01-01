"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { GraduationCap, School, BookOpenCheck, ArrowRight, Check } from "lucide-react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

// --- COMPONENT: ROLE CARD ---
const RoleCard = ({ icon: Icon, title, description, onClick, active }: any) => (
  <button 
    onClick={onClick}
    type="button"
    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${active ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 bg-white hover:border-indigo-200 hover:shadow-sm'}`}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
      <Icon className="w-5 h-5" />
    </div>
    <h3 className={`text-base font-black mb-1 ${active ? 'text-indigo-900' : 'text-slate-900'}`}>{title}</h3>
    <p className={`text-xs font-medium leading-relaxed ${active ? 'text-indigo-700' : 'text-slate-500'}`}>{description}</p>
    {active && <div className="absolute top-4 right-4 text-indigo-600"><div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center"><Check className="w-3 h-3"/></div></div>}
  </button>
);

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const token = searchParams.get("token");
  const invitedRole = searchParams.get("role"); 

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>(""); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Handle Invitation
  useEffect(() => {
    if (token) {
        setStep(2);
        setSelectedRole(invitedRole || 'editor'); 
    }
  }, [token, invitedRole]);

  const handleRoleSelect = (role: string) => {
      setSelectedRole(role);
      setStep(2);
      setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedRole) { setError("Role is missing."); return; }
    
    setLoading(true);
    setError("");

    // ReCAPTCHA Check
    if (!executeRecaptcha) {
        setError("Security check not ready. Please refresh.");
        setLoading(false);
        return;
    }

    try {
      // 1. Get ReCAPTCHA Token
      const recaptchaToken = await executeRecaptcha("signup_submit");
      if (!recaptchaToken) throw new Error("Security verification failed.");

      // 2. Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Important: Metadata is used by the DB trigger to assign roles
          data: { 
              full_name: fullName,
              role: selectedRole 
          },
          // Ensure captcha token is not interfering with Supabase's own captcha if enabled there.
          // Usually Supabase handles its own captcha if enabled in dashboard.
          // This client-side check is for your own logic/Edge Function if you had one.
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed. Please try again.");

      // 3. Logic: Invite vs Public
      if (token) {
          // Verify Invite API
          const res = await fetch("/api/invite/accept", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token, userId: authData.user.id }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error);
          
          router.replace("/admin"); // Redirect staff to dashboard
      } else {
          // Public User
          alert("Account created successfully! Please sign in.");
          router.push("/login");
      }
      
    } catch (err: any) {
      setError(err.message);
      // If error relates to role, go back
      if (!token && err.message.toLowerCase().includes("role")) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // --- STEP 1: Role Selection ---
  if (step === 1 && !token) {
      return (
        <div className="bg-white w-full max-w-xl p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="text-center mb-8">
                 <h1 className="text-3xl font-black text-slate-900 mb-2">Join NextPrepBD</h1>
                 <p className="text-slate-500 font-medium text-sm">Choose your account type to get started.</p>
            </div>
            
            <div className="space-y-3 mb-8">
                 <RoleCard 
                    icon={GraduationCap}
                    title="Student"
                    description="I want to study, take exams, and access resources."
                    onClick={() => handleRoleSelect('student')}
                    active={selectedRole === 'student'}
                 />
                 <RoleCard 
                    icon={BookOpenCheck}
                    title="Tutor / Teacher"
                    description="I want to create content and manage students."
                    onClick={() => handleRoleSelect('tutor')}
                    active={selectedRole === 'tutor'}
                 />
                 <RoleCard 
                    icon={School}
                    title="Institution"
                    description="I represent a school or coaching center."
                    onClick={() => handleRoleSelect('institute')}
                    active={selectedRole === 'institute'}
                 />
            </div>

            <div className="text-center">
                <p className="text-xs font-bold text-slate-400">
                    Already have an account? <Link href="/login" className="text-slate-900 hover:text-indigo-600 underline decoration-2">Sign In</Link>
                </p>
            </div>
        </div>
      );
  }

  // --- STEP 2: Signup Form ---
  return (
    <div className="bg-white w-full max-w-md p-8 md:p-10 rounded-3xl shadow-xl border border-slate-100 relative">
        
        {!token && step === 2 && (
            <button onClick={() => setStep(1)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-700 text-xs font-bold flex items-center gap-1">
                ← Back
            </button>
        )}

        <div className="text-center mb-8 mt-2">
            <h1 className="text-2xl font-black text-slate-900 mb-1 capitalize">
                {token ? "Join the Team" : `Create ${selectedRole} Account`}
            </h1>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">
                {token ? `Role: ${invitedRole}` : "Enter your details"}
            </p>
        </div>

        {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-lg text-center">
                {error}
            </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
            <div>
                <label className="text-xs font-black text-slate-400 uppercase block mb-1.5 ml-1">
                    {selectedRole === 'institute' ? "Institution Name" : "Full Name"}
                </label>
                <input 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all text-sm placeholder:text-slate-300"
                    placeholder={selectedRole === 'institute' ? "e.g. Dhaka College" : "John Doe"}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                />
            </div>
            
            <div>
                <label className="text-xs font-black text-slate-400 uppercase block mb-1.5 ml-1">Email</label>
                <input 
                    required
                    type="email"
                    className={`w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all text-sm placeholder:text-slate-300 ${token ? 'opacity-60 cursor-not-allowed' : ''}`}
                    placeholder="hello@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    readOnly={!!token}
                />
            </div>

            <div>
                <label className="text-xs font-black text-slate-400 uppercase block mb-1.5 ml-1">Password</label>
                <input 
                    required
                    type="password"
                    className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all text-sm placeholder:text-slate-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 mt-2 flex items-center justify-center gap-2 text-sm"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                    </>
                ) : (
                    <>
                     {token ? "Accept & Join" : "Create Account"} <ArrowRight className="w-4 h-4" />
                    </>
                )}
            </button>
        </form>
        
        <p className="text-[10px] text-slate-300 text-center mt-6 leading-tight">
           Protected by reCAPTCHA and Google <a href="https://policies.google.com/privacy" className="hover:underline">Privacy Policy</a> & <a href="https://policies.google.com/terms" className="hover:underline">Terms</a>.
        </p>
      </div>
  );
}

export default function SignupPage() {
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
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans animate-fade-in-up">
         <Suspense fallback={<div className="text-slate-400 font-bold">Loading...</div>}>
            <SignupContent />
         </Suspense>
      </div>
    </GoogleReCaptchaProvider>
  );
}