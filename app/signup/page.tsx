"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { 
  GraduationCap, School, BookOpenCheck, ArrowRight, Check, 
  User, Mail, Lock, Phone, FileText, ChevronLeft, AlertCircle, 
  MessageCircle, Calendar, Target, ChevronDown
} from "lucide-react";
import { GoogleReCaptchaProvider, useGoogleReCaptcha } from "react-google-recaptcha-v3";

// --- CONSTANTS ---
const goalOptions = [
  { name: "SSC Preparation", value: "/resources/ssc" },
  { name: "HSC Preparation", value: "/resources/hsc" },
  { name: "University Admission", value: "/resources/university-admission" },
  { name: "Medical Admission", value: "/resources/university-admission/science/medical-admission" },
  { name: "IBA MBA", value: "/resources/master's-admission/mba/iba" },
  { name: "Job Preparation", value: "/resources/job-prep" },
];

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

const InputField = ({ label, icon: Icon, ...props }: any) => (
  <div className="space-y-1.5 w-full">
    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors pointer-events-none">
        <Icon className="w-4 h-4" />
      </div>
      <input 
        {...props}
        className={`w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all placeholder:text-slate-300 
          focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 disabled:bg-slate-50 disabled:text-slate-500 ${props.className || ''}`}
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
  const prefilledEmail = searchParams.get("email"); 

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState<string>(""); 
  
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [isWhatsappSame, setIsWhatsappSame] = useState(false);
  
  // Student Specific
  const [batch, setBatch] = useState("");
  const [currentGoal, setCurrentGoal] = useState(""); // New Mandatory Goal State

  const [bio, setBio] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (token) { setStep(2); setSelectedRole(invitedRole || 'editor'); }
  }, [token, invitedRole]);

  useEffect(() => {
    if (alertType === 'no_account' && prefilledEmail) setEmail(prefilledEmail);
  }, [alertType, prefilledEmail]);

  const handlePhoneChange = (val: string) => {
    setPhone(val);
    if (isWhatsappSame) setWhatsapp(val);
  };

  const handleWhatsappCheck = (checked: boolean) => {
    setIsWhatsappSame(checked);
    if (checked) setWhatsapp(phone);
  };

  const handleRoleSelect = (role: string) => { setSelectedRole(role); setStep(2); setError(""); };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedRole) { setError("Role is missing."); return; }
    
    // --- VALIDATION FOR STUDENT GOAL ---
    if (selectedRole === 'student' && !currentGoal) {
        setError("Please select your primary academic goal.");
        return;
    }

    setLoading(true);
    setError("");

    if (!executeRecaptcha) { setError("Security check not ready. Refresh page."); setLoading(false); return; }

    try {
      const recaptchaToken = await executeRecaptcha("signup_submit");
      if (!recaptchaToken) throw new Error("Security verification failed.");

      // 1. SIGN UP
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
            full_name: fullName, 
            role: selectedRole, 
            phone, 
            whatsapp, 
            bio,
            // Save specific fields for student
            batch: selectedRole === 'student' ? batch : null,
            current_goal: selectedRole === 'student' ? currentGoal : null 
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed.");

      // 2. TRIGGER WELCOME EMAIL (NEW)
      // Call the API route silently in the background
      fetch('/api/send-welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            email: email, 
            name: fullName 
        }),
      }).catch(err => console.error("Failed to send welcome email:", err));

      // 3. SUCCESS & REDIRECT LOGIC
      if (token) {
          await fetch("/api/invite/accept", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, token, userId: authData.user.id }),
          });
          router.replace("/admin");
      } else {
          // Double check Profile Update (Redundancy for safety)
          await supabase.from('profiles').update({ 
             phone, 
             whatsapp, 
             bio, 
             batch: selectedRole === 'student' ? batch : null,
             current_goal: selectedRole === 'student' ? currentGoal : null 
          }).eq('id', authData.user.id);

          if (authData.session) {
             if (selectedRole === 'student' || selectedRole === 'tutor') {
                router.replace("/"); // Home Page
             } else {
                router.replace("/admin"); // Dashboard
             }
          } else {
             alert("Account created! Please check your email to confirm.");
             router.push("/login");
          }
      }
    } catch (err: any) {
      if (err.message.includes("already registered")) {
          setError("This email is already associated with an account. Please Log In.");
      } else {
          setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-start pt-32 pb-12 px-4">
      
      {alertType === 'no_account' && (
        <div className="w-full max-w-lg mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="bg-white border-l-4 border-indigo-600 rounded-r-xl shadow-lg p-6 flex items-start gap-4">
                <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 shrink-0"><AlertCircle className="w-6 h-6" /></div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900">New to NextPrepBD?</h3>
                    <p className="text-sm text-slate-500 mt-1">We noticed you used <strong>{prefilledEmail}</strong>. Let's create your account.</p>
                </div>
            </div>
        </div>
      )}

      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative">
          
          <div className="h-1.5 bg-slate-100 w-full">
              <div className={`h-full bg-indigo-600 transition-all duration-500 ${step === 1 ? 'w-1/2' : 'w-full'}`}></div>
          </div>

          <div className="p-8 md:p-10">
            
            {!token && step === 2 && (
                <button 
                  onClick={() => setStep(1)} 
                  className="mb-6 text-xs font-bold text-slate-400 hover:text-indigo-600 flex items-center gap-1 transition-colors group"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
                    Choose a different role
                </button>
            )}

            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2 capitalize">
                    {step === 1 ? "Choose Your Path" : `${selectedRole} Registration`}
                </h1>
                <p className="text-slate-500 font-medium">
                    {step === 1 ? "Select how you will use NextPrepBD." : "Fill in your details to get started."}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl flex items-center gap-3 animate-pulse">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>{error}
                </div>
            )}

            {step === 1 && !token && (
                <div className="space-y-4 animate-in slide-in-from-left-8 duration-300">
                    <RoleCard icon={GraduationCap} title="Student" description="I want to study, take exams & access materials." onClick={() => handleRoleSelect('student')} active={selectedRole === 'student'} />
                    <RoleCard icon={BookOpenCheck} title="Tutor" description="I want to create content & manage students." onClick={() => handleRoleSelect('tutor')} active={selectedRole === 'tutor'} />
                    <RoleCard icon={School} title="Institution" description="I represent a school or coaching center." onClick={() => handleRoleSelect('institute')} active={selectedRole === 'institute'} />
                    <div className="text-center pt-6"><p className="text-sm text-slate-400 font-medium">Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link></p></div>
                </div>
            )}

            {(step === 2 || token) && (
                <form onSubmit={handleSignup} className="space-y-5 animate-in slide-in-from-right-8 duration-300">
                    
                    <InputField 
                        label={selectedRole === 'institute' ? "Institution Name" : "Full Name"} 
                        icon={selectedRole === 'institute' ? School : User}
                        placeholder={selectedRole === 'institute' ? "e.g. Dhaka College" : "John Doe"}
                        value={fullName} onChange={(e:any) => setFullName(e.target.value)} required 
                    />

                    <InputField 
                        label="Email Address" icon={Mail} type="email" placeholder="name@example.com"
                        value={email} onChange={(e:any) => setEmail(e.target.value)} 
                        readOnly={!!token} className={token ? 'opacity-70 cursor-not-allowed bg-slate-50' : ''} required 
                    />

                    <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-100 space-y-4">
                        <InputField 
                            label="Phone Number" icon={Phone} type="tel" placeholder="017..."
                            value={phone} onChange={(e:any) => handlePhoneChange(e.target.value)} 
                        />
                        
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">WhatsApp Number</label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isWhatsappSame ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300'}`}>
                                        {isWhatsappSame && <Check className="w-3 h-3 text-white" />}
                                    </div>
                                    <input type="checkbox" className="hidden" checked={isWhatsappSame} onChange={(e) => handleWhatsappCheck(e.target.checked)} />
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Same as Phone</span>
                                </label>
                            </div>
                            <div className="relative group">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><MessageCircle className="w-4 h-4" /></div>
                                <input 
                                    className="w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 disabled:bg-slate-100 disabled:text-slate-500"
                                    placeholder="017..."
                                    value={whatsapp}
                                    onChange={(e) => setWhatsapp(e.target.value)}
                                    disabled={isWhatsappSame}
                                />
                            </div>
                        </div>
                    </div>

                    {selectedRole === 'student' && (
                        <>
                            <InputField 
                                label="Batch / Year" icon={Calendar} type="text"
                                placeholder="e.g. HSC 2025, SSC 2026"
                                value={batch} onChange={(e:any) => setBatch(e.target.value)} 
                            />

                            {/* --- MANDATORY GOAL SELECTION --- */}
                            <div className="space-y-1.5 w-full bg-indigo-50 border border-indigo-100 p-4 rounded-xl">
                                <label className="text-xs font-bold text-indigo-800 uppercase tracking-wide ml-1 flex items-center gap-1">
                                    Primary Goal <span className="text-red-500">*</span>
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none">
                                        <Target className="w-4 h-4" />
                                    </div>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400 pointer-events-none">
                                        <ChevronDown className="w-4 h-4" />
                                    </div>
                                    <select 
                                        required
                                        value={currentGoal}
                                        onChange={(e) => setCurrentGoal(e.target.value)}
                                        className="w-full bg-white border border-indigo-200 text-slate-900 pl-10 pr-8 py-3 rounded-lg text-sm font-bold outline-none transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer hover:border-indigo-300"
                                    >
                                        <option value="" disabled>Select what you are preparing for...</option>
                                        {goalOptions.map((option) => (
                                            <option key={option.name} value={option.value}>{option.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <p className="text-[11px] text-indigo-600/80 font-medium leading-tight mt-1 ml-1">
                                    We use this to customize your <span className="font-bold">Materials</span> dashboard. You can change this later in settings.
                                </p>
                            </div>
                        </>
                    )}

                    {selectedRole !== 'student' && (
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wide ml-1">Bio / About</label>
                            <div className="relative">
                                <div className="absolute left-3 top-3 text-slate-400 pointer-events-none"><FileText className="w-4 h-4" /></div>
                                <textarea 
                                    className="w-full bg-white border border-slate-200 text-slate-900 pl-10 pr-4 py-3 rounded-lg text-sm font-medium outline-none transition-all placeholder:text-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 hover:border-slate-300 h-20 resize-none"
                                    placeholder="Tell us about your expertise or institution..."
                                    value={bio} onChange={e => setBio(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <InputField 
                        label="Password" icon={Lock} type="password" placeholder="••••••••"
                        value={password} onChange={(e:any) => setPassword(e.target.value)} required 
                    />

                    <button 
                        type="submit" disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? "Creating Account..." : <>{token ? "Accept Invitation" : "Create Account"} <ArrowRight className="w-4 h-4" /></>}
                    </button>
                </form>
            )}
          </div>
      </div>
      
      <p className="text-[10px] text-slate-400 text-center mt-8 pb-8">
          Protected by reCAPTCHA and Google <a href="#" className="hover:text-indigo-600">Privacy Policy</a> & <a href="#" className="hover:text-indigo-600">Terms</a>.
      </p>
    </div>
  );
}

export default function SignupPage() {
  const recaptchaKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (!recaptchaKey) return <div className="min-h-screen flex items-center justify-center">Error: Missing reCAPTCHA Key</div>;

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-6 h-6 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div></div>}>
        <SignupContent />
      </Suspense>
    </GoogleReCaptchaProvider>
  );
}