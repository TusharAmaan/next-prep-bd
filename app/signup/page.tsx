"use client";
import { useState, Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { GraduationCap, School, BookOpenCheck, ArrowRight } from "lucide-react";

// --- UI COMPONENTS FOR ROLE SELECTION ---
const RoleCard = ({ icon: Icon, title, description, onClick, active }: any) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 group relative overflow-hidden ${active ? 'border-indigo-600 bg-indigo-50 shadow-md' : 'border-slate-100 bg-white hover:border-indigo-300 hover:shadow-sm'}`}
  >
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${active ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'}`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className={`text-lg font-black mb-2 ${active ? 'text-indigo-900' : 'text-slate-900'}`}>{title}</h3>
    <p className={`text-sm font-medium leading-relaxed ${active ? 'text-indigo-700' : 'text-slate-500'}`}>{description}</p>
    {active && <div className="absolute top-4 right-4 text-indigo-600"><div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">✓</div></div>}
  </button>
);

function SignupContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Params from invitation link
  const token = searchParams.get("token");
  const invitedRole = searchParams.get("role"); 

  // State for multi-step flow
  const [step, setStep] = useState(1); // Step 1: Role Select, Step 2: Form
  const [selectedRole, setSelectedRole] = useState<string>(""); // 'student', 'tutor', 'institute'

  // Form State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --- EFFECT: Handle Invited Users ---
  useEffect(() => {
    // If a token exists, skip step 1 and automatically set the role
    if (token) {
        setStep(2);
        setSelectedRole(invitedRole || 'editor'); // Default to editor if role is missing in param
    }
  }, [token, invitedRole]);


  // --- HANDLERS ---

  const handleRoleSelect = (role: string) => {
      setSelectedRole(role);
      setStep(2);
      setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!selectedRole) { setError("Please select a role first."); return; }

    setLoading(true);
    setError("");

    try {
      // 1. Create Authentication User
      // IMPORTANT: We pass the selectedRole in metadata so the DB trigger uses it.
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { 
              full_name: fullName,
              role: selectedRole // Passing the chosen role here
          } 
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Signup failed.");

      // 2. Logic Branch: Invite vs Public
      if (token) {
          // --- SCENARIO A: INVITED USER (Finalize acceptance) ---
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

          // Success: Staff goes to Dashboard
          router.replace("/admin"); 
      } else {
          // --- SCENARIO B: PUBLIC USER ---
          // The DB trigger has already set their correct role.
          alert(`Account created successfully as a ${selectedRole}! Please sign in.`);
          router.push("/login");
      }
      
    } catch (err: any) {
      setError(err.message);
      // If it failed and it wasn't an invite, let them go back to step 1 if needed
      if (!token && err.message.includes("role")) setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDER: STEP 1 (Role Selection) ---
  if (step === 1 && !token) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans animate-fade-in">
           <div className="w-full max-w-2xl">
              <div className="text-center mb-10">
                 <h1 className="text-4xl font-black text-slate-900 mb-3">Create Your Account</h1>
                 <p className="text-lg text-slate-500 font-medium">To get started, tell us how you will use the platform.</p>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                 <RoleCard 
                    icon={GraduationCap}
                    title="Student"
                    description="Access exams, quizzes, and learning materials."
                    onClick={() => handleRoleSelect('student')}
                    active={selectedRole === 'student'}
                 />
                 <RoleCard 
                    icon={BookOpenCheck}
                    title="Tutor"
                    description="Create content, manage students, and offer courses."
                    onClick={() => handleRoleSelect('tutor')}
                    active={selectedRole === 'tutor'}
                 />
                 <RoleCard 
                    icon={School}
                    title="Institution"
                    description="Manage multiple tutors and students under one roof."
                    onClick={() => handleRoleSelect('institute')}
                    active={selectedRole === 'institute'}
                 />
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-slate-400">
                    Already have an account? <Link href="/login" className="text-slate-900 hover:text-indigo-600 transition-colors underline decoration-2 decoration-indigo-200 hover:decoration-indigo-600">Sign In</Link>
                </p>
            </div>
           </div>
        </div>
      );
  }

  // --- RENDER: STEP 2 (Signup Form) ---
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 font-sans animate-fade-in-up">
      <div className="bg-white w-full max-w-md p-10 rounded-3xl shadow-xl border border-slate-100 relative">
        
        {/* Back Button for Public Users */}
        {!token && step === 2 && (
            <button onClick={() => setStep(1)} className="absolute top-6 left-6 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-bold">
                ← Back
            </button>
        )}

        {/* Dynamic Header */}
        <div className="text-center mb-8 mt-4">
            <h1 className="text-3xl font-black text-slate-900 mb-2 capitalize">
                {token ? "Join the Team" : `${selectedRole} Signup`}
            </h1>
            <p className="text-slate-500 text-sm font-medium">
                {token ? (
                    <>You are joining as a <span className="font-bold text-indigo-600 uppercase">{invitedRole || "Member"}</span>.</>
                ) : (
                    `Complete your details to create your ${selectedRole} account.`
                )}
            </p>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2">
                <span>⚠️</span> {error}
            </div>
        )}

        <form onSubmit={handleSignup} className="space-y-5">
            <div>
                <label className="text-xs font-black text-slate-400 uppercase block mb-1.5 ml-1">
                    {selectedRole === 'institute' ? "Institution Name" : "Full Name"}
                </label>
                <input 
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    placeholder={selectedRole === 'institute' ? "e.g. Dhaka College" : "John Doe"}
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                />
            </div>
            
            <div>
                <label className="text-xs font-black text-slate-400 uppercase block mb-1.5 ml-1">Email Address</label>
                <input 
                    required
                    type="email"
                    className={`w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all placeholder:text-slate-300 ${token ? 'cursor-not-allowed opacity-70' : ''}`}
                    placeholder={token ? "Must match invite email" : "hello@example.com"}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    readOnly={!!token} // Can't change email if invited
                />
                {token && <p className="text-[10px] font-bold text-indigo-500 mt-1 ml-1">* Email is locked to invitation</p>}
            </div>

            <div>
                <label className="text-xs font-black text-slate-400 uppercase block mb-1.5 ml-1">Set Password</label>
                <input 
                    required
                    type="password"
                    className="w-full bg-slate-50 border-2 border-slate-100 p-3.5 rounded-xl outline-none focus:bg-white focus:border-indigo-500 font-bold text-slate-700 transition-all placeholder:text-slate-300"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
            >
                {loading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Creating Account...
                    </>
                ) : (
                    <>
                     {token ? "Accept & Join" : "Create Account"} <ArrowRight className="w-5 h-5" />
                    </>
                )}
            </button>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400 font-bold bg-[#F8FAFC]">Loading...</div>}>
      <SignupContent />
    </Suspense>
  );
}