"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { 
  GraduationCap, 
  School, 
  BookOpenCheck, 
  ArrowRight, 
  Check, 
  User, 
  Mail, 
  Lock, 
  Phone, 
  FileText,
  ChevronLeft
} from "lucide-react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

// --- COMPONENT: ROLE CARD ---
const RoleCard = ({ icon: Icon, title, description, onClick, active }: any) => (
  <button 
    onClick={onClick}
    type="button"
    className={`w-full text-left p-6 rounded-xl border transition-all duration-300 group relative overflow-hidden flex items-start gap-4 ${
      active 
        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600' 
        : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:-translate-y-0.5'
    }`}
  >
    <div className={`w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors duration-300 ${
      active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
    }`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <h3 className={`text-base font-bold mb-1 ${active ? 'text-indigo-900' : 'text-slate-900'}`}>{title}</h3>
      <p className={`text-xs font-medium leading-relaxed ${active ? 'text-indigo-700' : 'text-slate-500'}`}>{description}</p>
    </div>
    {active && (
      <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-200">
        <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
          <Check className="w-3 h-3" />
        </div>
      </div>
    )}
  </button>
);

// --- COMPONENT: INPUT FIELD ---
const InputField = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
        <Icon className="w-4 h-4" />
      </div>
      <input 
        {...props}
        className={`w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all placeholder:text-slate-300 
          focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 ${props.className || ''}`}
      />
    </div>
  </div>
);

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { executeRecaptcha } = useGoogleReCaptcha();
  
  const token = searchParams.get("token");
  const invitedRole = searchParams.get("role"); 
  const alertType = searchParams.get("alert");

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>(""); 
  
  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) { setStep(2); setSelectedRole(invitedRole || 'editor'); }
  }, [token, invitedRole]);

  useEffect(() => {
    if (alertType === 'no_account') {
        setError("No account found with that email. Please create one below.");
    }
  }, [alertType]);

  const handleRoleSelect = (role: string) => { setSelectedRole(role); setStep(2); setError(""); };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedRole) { setError("Role is missing."); return; }
    
    setLoading(true);
    setError("");

    if (!executeRecaptcha) { setError("Security check not ready. Refresh page."); setLoading(false); return; }

    try {
      const recaptchaToken = await executeRecaptcha("signup_submit");
      if (!recaptchaToken) throw new Error("Security verification failed.");

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, role: selectedRole, phone: phone, bio: bio }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed.");

      if (token) {
          const res = await fetch("/api/invite/accept", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token, userId: authData.user.id }),
          });
          if (!res.ok) throw new Error((await res.json()).error);
          router.replace("/admin");
      } else {
          await supabase.from('profiles').update({ phone, bio }).eq('id', authData.user.id);
          router.push("/login?signup=success"); // Optional: Add a success query param for login page to show toast
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* LEFT SIDE: BRANDING / TESTIMONIAL (Hidden on Mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-slate-900/50"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
             <div className="w-8 h-8 bg-indigo-500 rounded-lg"></div>
             <span className="text-xl font-bold tracking-tight">NextPrepBD</span>
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight leading-tight mb-6">
            Master your exams with <br/>
            <span className="text-indigo-400">intelligent learning.</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-md leading-relaxed">
            Join thousands of students and educators transforming the way Bangladesh prepares for the future.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
           <div className="flex gap-4">
              <div className="flex -space-x-3">
                 {[1,2,3,4].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-700"></div>)}
              </div>
              <div>
                 <p className="font-bold">10k+ Learners</p>
                 <p className="text-xs text-slate-400">Trust our platform</p>
              </div>
           </div>
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 bg-slate-50/50">
        <div className="w-full max-w-md animate-in slide-in-from-right-8 duration-500 fade-in">
          
          {/* STEP 1: ROLE SELECTION */}
          {step === 1 && !token && (
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Get Started</h1>
                <p className="text-slate-500">Choose your account type to personalize your experience.</p>
              </div>

              <div className="space-y-4">
                <RoleCard 
                  icon={GraduationCap} 
                  title="Student" 
                  description="Access exams, quizzes, study materials and track your progress." 
                  onClick={() => handleRoleSelect('student')} 
                  active={selectedRole === 'student'} 
                />
                <RoleCard 
                  icon={BookOpenCheck} 
                  title="Tutor / Teacher" 
                  description="Create content, manage students batches, and offer courses." 
                  onClick={() => handleRoleSelect('tutor')} 
                  active={selectedRole === 'tutor'} 
                />
                <RoleCard 
                  icon={School} 
                  title="Institution" 
                  description="Manage multiple tutors, students and exams under one roof." 
                  onClick={() => handleRoleSelect('institute')} 
                  active={selectedRole === 'institute'} 
                />
              </div>

              <div className="text-center pt-4">
                <p className="text-sm font-medium text-slate-500">
                  Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: DETAILS FORM */}
          {(step === 2 || token) && (
            <div className="space-y-8">
              <div className="space-y-2">
                {!token && (
                  <button 
                    onClick={() => setStep(1)} 
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-1 mb-4 transition-colors group"
                  >
                    <ChevronLeft className="w-3 h-3 group-hover:-translate-x-0.5 transition-transform" /> Back to roles
                  </button>
                )}
                <h1 className="text-3xl font-black text-slate-900 tracking-tight capitalize">
                  {token ? "Join the Team" : `Create ${selectedRole} Account`}
                </h1>
                <p className="text-slate-500">
                  {token ? `You are joining as a ${invitedRole || 'member'}.` : "Enter your details to complete setup."}
                </p>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2">
                  <div className="mt-0.5"><div className="w-4 h-4 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">!</div></div>
                  <p>{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-5">
                <InputField 
                  label={selectedRole === 'institute' ? "Institution Name" : "Full Name"} 
                  icon={selectedRole === 'institute' ? School : User}
                  placeholder={selectedRole === 'institute' ? "e.g. Dhaka College" : "John Doe"}
                  value={fullName} onChange={(e: any) => setFullName(e.target.value)} required 
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <InputField 
                    label="Email Address" 
                    icon={Mail} type="email"
                    placeholder="name@example.com"
                    value={email} onChange={(e: any) => setEmail(e.target.value)} 
                    readOnly={!!token} className={token ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''} required 
                  />
                  <InputField 
                    label="Phone (Optional)" 
                    icon={Phone} type="tel"
                    placeholder="017..."
                    value={phone} onChange={(e: any) => setPhone(e.target.value)} 
                  />
                </div>

                {/* Bio Field - Full Width */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Goal / Bio (Optional)</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-3 text-slate-400 pointer-events-none"><FileText className="w-4 h-4" /></div>
                    <textarea 
                      className="w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 h-24 resize-none"
                      placeholder="e.g. I want to prepare for HSC exams..."
                      value={bio} onChange={e => setBio(e.target.value)}
                    />
                  </div>
                </div>

                <InputField 
                  label="Password" 
                  icon={Lock} type="password"
                  placeholder="••••••••"
                  value={password} onChange={(e: any) => setPassword(e.target.value)} required 
                />

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Creating Account...</>
                  ) : (
                    <>{token ? "Accept Invitation" : "Create Account"} <ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                 <p className="text-[10px] text-slate-400">
                    Protected by reCAPTCHA and Google <a href="#" className="hover:text-indigo-500">Privacy Policy</a> & <a href="#" className="hover:text-indigo-500">Terms</a>.
                 </p>
                 {!token && (
                   <p className="text-sm font-medium text-slate-500 mt-4 md:hidden">
                      Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
                   </p>
                 )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

  if (!recaptchaKey) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
       <div className="p-6 bg-red-50 text-red-600 rounded-xl font-bold border border-red-100 flex items-center gap-2">
          <span>⚠️</span> Error: Missing reCAPTCHA Key
       </div>
    </div>
  );

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <div className="font-sans antialiased text-slate-900 bg-white">
         <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
            <SignupContent />
         </Suspense>
      </div>
    </GoogleReCaptchaProvider>
  );
}