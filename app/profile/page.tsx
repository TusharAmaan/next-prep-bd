"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { BookOpen, GraduationCap, Briefcase, Activity, MapPin } from "lucide-react";
import LocationTracker from "@/components/LocationTracker"; // <--- 1. IMPORT TRACKER

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(""); // <--- 2. NEW CITY STATE
  
  // Student Specific State
  const [currentGoal, setCurrentGoal] = useState("");

  // Password State
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' });

  // --- GOAL OPTIONS ---
  const goalOptions = [
    { name: "Select your goal...", value: "" },
    { name: "SSC Preparation", value: "/resources/ssc" },
    { name: "HSC Preparation", value: "/resources/hsc" },
    { name: "University Admission", value: "/resources/university-admission" },
    { name: "Medical Admission", value: "/resources/university-admission/science/medical-admission" },
    { name: "IBA MBA", value: "/resources/master's-admission/mba/iba" },
    { name: "Job Preparation", value: "/resources/job-prep" },
  ];

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUser(data);
        setFullName(data.full_name || "");
        setEmail(data.email || session.user.email || "");
        setBio(data.bio || "");
        setInstitution(data.institution || "");
        setPhone(data.phone || "");
        setCity(data.city || ""); // <--- 3. LOAD CITY
        setCurrentGoal(data.current_goal || "");
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  const handleUpdate = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName,
        bio: bio,
        institution: institution,
        phone: phone,
        current_goal: currentGoal,
        // We preserve the city here so manual edits to other fields don't wipe it
        city: city, 
      })
      .eq('id', user.id);

    setSaving(false);
    if (error) {
      setModal({ isOpen: true, type: 'error', message: error.message });
    } else {
      setModal({ isOpen: true, type: 'success', message: "Profile updated successfully!" });
      router.refresh();
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) return alert("Password must be at least 6 characters");
    
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    setPasswordLoading(false);
    if (error) setModal({ isOpen: true, type: 'error', message: error.message });
    else {
      setModal({ isOpen: true, type: 'success', message: "Password updated successfully!" });
      setNewPassword("");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 font-sans text-slate-900">
      
      {/* 4. MOUNT TRACKER (This is the invisible secret agent) */}
      <LocationTracker />

      {/* CUSTOM MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-pop-in">
            <h3 className={`text-xl font-black mb-2 capitalize ${modal.type === 'error' ? 'text-red-600' : 'text-slate-900'}`}>
              {modal.type === 'error' ? 'Error!' : 'Success!'}
            </h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              {modal.message}
            </p>
            <button 
              onClick={() => setModal({ ...modal, isOpen: false })} 
              className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-30"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-4xl font-black text-slate-900 border-4 border-slate-200 shadow-lg mb-4">
                {fullName ? fullName[0].toUpperCase() : "U"}
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">{fullName || "User Profile"}</h1>
            <p className="inline-block bg-white/10 text-white/90 text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full">
                {user?.role || "Student"} Account
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10 space-y-6">
          
          {/* --- STUDENT GOAL SELECTOR --- */}
          {user?.role === 'student' && (
             <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl animate-in slide-in-from-top-4">
                <div className="flex items-center gap-2 mb-3">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                    <label className="text-sm font-black text-blue-800 uppercase tracking-wide">Currently Preparing For</label>
                </div>
                <p className="text-xs text-blue-600/80 mb-3 font-medium">
                    Select your goal. This will configure your <b>Materials</b> dashboard.
                </p>
                <div className="relative">
                    <select 
                        value={currentGoal}
                        onChange={(e) => setCurrentGoal(e.target.value)}
                        className="w-full bg-white border-2 border-blue-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none"
                    >
                        {goalOptions.map((opt) => (
                            <option key={opt.name} value={opt.value}>{opt.name}</option>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Briefcase className="w-4 h-4 text-slate-400" />
                    </div>
                </div>
             </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Full Name</label>
              <input 
                className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Email (Read Only)</label>
              <input 
                className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-400 outline-none cursor-not-allowed"
                value={email}
                disabled
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Phone Number</label>
                <input 
                  className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+880..."
                />
             </div>
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Institution / School</label>
                <input 
                  className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-colors"
                  value={institution}
                  onChange={e => setInstitution(e.target.value)}
                  placeholder="e.g. Dhaka College"
                />
             </div>
          </div>

          {/* 5. LOCATION DISPLAY FIELD (NEW) */}
          <div className="grid grid-cols-1">
             <div>
                <label className="text-xs font-bold text-slate-500 uppercase block mb-2 flex items-center gap-2">
                   <MapPin className="w-3 h-3" /> Location (Auto-Detected)
                </label>
                <input 
                  className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-500 outline-none cursor-not-allowed"
                  value={city || "Detecting..."}
                  placeholder="Dhaka, Bangladesh"
                  disabled
                />
                <p className="text-[10px] text-slate-400 mt-1.5 ml-1">
                   We periodically update this to show relevant content near you.
                </p>
             </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Bio / About</label>
            <textarea 
              className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-500 h-32 resize-none transition-colors"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          {/* --- PASSWORD SECTION --- */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Security</h3>
            <div className="bg-red-50 border border-red-100 p-5 rounded-2xl">
              <label className="text-xs font-bold text-red-400 uppercase block mb-2">New Password</label>
              <div className="flex gap-3">
                <input 
                  type="password"
                  className="w-full bg-white border border-red-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-200"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button 
                  onClick={handleChangePassword}
                  disabled={passwordLoading || !newPassword}
                  className="whitespace-nowrap px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50"
                >
                  {passwordLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button 
              onClick={handleUpdate} 
              disabled={saving}
              className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}