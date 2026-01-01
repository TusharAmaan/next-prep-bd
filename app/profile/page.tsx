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
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [phone, setPhone] = useState("");

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
        // You can add more fields here based on role if needed
      })
      .eq('id', user.id);

    setSaving(false);
    if (error) alert("Error saving profile");
    else alert("Profile Updated Successfully!");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center">
          <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-4xl font-black text-slate-900 border-4 border-slate-200 shadow-lg mb-4">
            {fullName ? fullName[0].toUpperCase() : "U"}
          </div>
          <h1 className="text-2xl font-bold text-white">{fullName || user.email}</h1>
          <p className="text-slate-400 text-sm uppercase tracking-widest font-bold mt-1">{user.role} Account</p>
        </div>

        {/* Form */}
        <div className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Full Name</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Phone Number</label>
              <input 
                className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+880..."
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Institution / School</label>
            <input 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              placeholder="e.g. Dhaka College"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Bio / About</label>
            <textarea 
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl font-medium text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 h-32 resize-none"
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button 
              onClick={handleUpdate} 
              disabled={saving}
              className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95"
            >
              {saving ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}