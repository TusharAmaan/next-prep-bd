"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form State
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(""); // Added Email State
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [phone, setPhone] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Modal State
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' });

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Fetch profile data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        setUser(data);
        setFullName(data.full_name || "");
        setEmail(data.email || session.user.email || ""); // Fallback to auth email
        setBio(data.bio || "");
        setInstitution(data.institution || "");
        setPhone(data.phone || "");
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
      })
      .eq('id', user.id);

    setSaving(false);
    if (error) {
      setModal({ isOpen: true, type: 'error', message: error.message });
    } else {
      setModal({ isOpen: true, type: 'success', message: "Profile updated successfully!" });
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
      
      {/* CUSTOM MODAL (No more browser alerts) */}
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
        <div className="bg-slate-900 p-10 text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-4xl font-black text-slate-900 border-4 border-slate-200 shadow-lg mb-4">
            {fullName ? fullName[0].toUpperCase() : "U"}
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">{fullName || "User Profile"}</h1>
          <p className="inline-block bg-white/10 text-white/90 text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full">
            {user?.role || "Student"} Account
          </p>
        </div>

        {/* Form */}
        <div className="p-8 md:p-10 space-y-6">
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