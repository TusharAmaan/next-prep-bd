"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Save, Building, Crown, Image as ImageIcon, Loader2 } from "lucide-react";

export default function TutorSettings() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [instituteName, setInstituteName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase.from('profiles').select('institute_name, avatar_url, subscription_plan').eq('id', user.id).single();
        if (data) {
            setInstituteName(data.institute_name || "");
            setLogoUrl(data.avatar_url || ""); // Using avatar_url as logo for now
            setIsPro(data.subscription_plan === 'pro' || data.subscription_plan === 'trial');
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        const { error } = await supabase.from('profiles').update({
            institute_name: instituteName,
            avatar_url: logoUrl // Saving logo URL
        }).eq('id', user.id);

        if (error) alert("Failed to save.");
        else alert("Settings saved successfully!");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-black text-slate-800">Tutor Settings</h1>
        <p className="text-slate-500">Manage your default branding for exams.</p>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        
        {/* Banner for Free Users */}
        {!isPro && (
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3 items-start">
                <Crown className="w-5 h-5 text-amber-600 mt-0.5 shrink-0"/>
                <div>
                    <h4 className="font-bold text-amber-800 text-sm">Pro Feature Locked</h4>
                    <p className="text-amber-700/80 text-xs mt-1">
                        Upgrade to Pro to save your Institute Name and Logo. Your exams currently use the default NextPrep branding.
                    </p>
                </div>
            </div>
        )}

        {/* Institute Name */}
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <Building className="w-4 h-4"/> Institute Name
            </label>
            <input 
                disabled={!isPro}
                value={instituteName}
                onChange={(e) => setInstituteName(e.target.value)}
                placeholder="e.g. Science Care Academy"
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
            />
            <p className="text-xs text-slate-400">This will appear as the main header on all your printed exams.</p>
        </div>

        {/* Logo URL (Simple text for now, can be file upload later) */}
        <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4"/> Logo URL
            </label>
            <input 
                disabled={!isPro}
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://..."
                className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400"
            />
        </div>

        <div className="pt-4">
            <button 
                onClick={handleSave}
                disabled={!isPro || saving}
                className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black disabled:opacity-50 transition-all"
            >
                {saving ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>}
                Save Changes
            </button>
        </div>

      </div>
    </div>
  );
}