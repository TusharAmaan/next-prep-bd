"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { GraduationCap, Briefcase, Plus, Trash2, Eye, EyeOff, Link as LinkIcon, Building } from "lucide-react";
import LocationTracker from "@/components/LocationTracker"; 

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // --- GENERAL STATE ---
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [institution, setInstitution] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState(""); 
  
  // --- STUDENT SPECIFIC ---
  const [currentGoal, setCurrentGoal] = useState("");
  const [dob, setDob] = useState("");

  // --- TUTOR SPECIFIC ---
  // Array of strings for segments
  const [interestedSegments, setInterestedSegments] = useState<string[]>([]);
  // Array of objects for records
  const [academicRecords, setAcademicRecords] = useState<{degree: string, institute: string}[]>([]);

  // --- EDITOR SPECIFIC ---
  const [socialLinks, setSocialLinks] = useState({ facebook: "", linkedin: "" });
  const [skills, setSkills] = useState(""); // Comma separated string for UI

  // --- PASSWORD STATE ---
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // --- MODAL STATE ---
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' });

  // Options
  const goalOptions = [
    { name: "SSC Preparation", value: "SSC" },
    { name: "HSC Preparation", value: "HSC" },
    { name: "University Admission", value: "University Admission" },
    { name: "Medical Admission", value: "Medical Admission" },
    { name: "IBA MBA", value: "IBA MBA" },
    { name: "Job Preparation", value: "Job Preparation" },
  ];

  // --- FETCH PROFILE ---
  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();

      if (data) {
        setUser(data);
        setFullName(data.full_name || "");
        setEmail(data.email || session.user.email || "");
        setBio(data.bio || "");
        setInstitution(data.institution || "");
        setPhone(data.phone || "");
        setCity(data.city || "");
        
        // Student
        setCurrentGoal(data.current_goal || "");
        setDob(data.date_of_birth || "");

        // Tutor
        setInterestedSegments(data.interested_segments || []);
        setAcademicRecords(data.academic_records || []);

        // Editor
        setSocialLinks(data.social_links || { facebook: "", linkedin: "" });
        setSkills(data.skills ? data.skills.join(", ") : "");
      }
      setLoading(false);
    };
    getProfile();
  }, [router]);

  // --- HANDLERS ---

  const handleUpdate = async () => {
    setSaving(true);
    
    const updates: any = {
        full_name: fullName,
        bio: bio,
        institution: institution,
        phone: phone,
        city: city, // Preserve hidden city
    };

    // Role Specific Updates
    if (user.role === 'student') {
        updates.current_goal = currentGoal;
        updates.date_of_birth = dob || null;
    }
    else if (user.role === 'tutor') {
        updates.interested_segments = interestedSegments;
        updates.academic_records = academicRecords;
    }
    else if (user.role === 'editor') {
        updates.social_links = socialLinks;
        updates.skills = skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);

    setSaving(false);
    if (error) setModal({ isOpen: true, type: 'error', message: error.message });
    else {
        setModal({ isOpen: true, type: 'success', message: "Profile updated successfully!" });
        router.refresh();
    }
  };

  const handlePasswordChange = async () => {
      if (!currentPass || !newPass || !confirmPass) return alert("Please fill all password fields");
      if (newPass !== confirmPass) return alert("New passwords do not match");
      if (newPass.length < 6) return alert("Password too short (min 6 chars)");

      setPasswordLoading(true);

      // 1. Verify Current Password by trying to SignIn
      const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email,
          password: currentPass
      });

      if (signInError) {
          setPasswordLoading(false);
          setModal({ isOpen: true, type: 'error', message: "Current password is incorrect." });
          return;
      }

      // 2. Update Password
      const { error } = await supabase.auth.updateUser({ password: newPass });
      
      setPasswordLoading(false);
      if (error) setModal({ isOpen: true, type: 'error', message: error.message });
      else {
          setModal({ isOpen: true, type: 'success', message: "Password updated! Please log in again." });
          setCurrentPass(""); setNewPass(""); setConfirmPass("");
      }
  };

  // Helper for Tutor Segments
  const toggleSegment = (val: string) => {
      if (interestedSegments.includes(val)) {
          setInterestedSegments(interestedSegments.filter(s => s !== val));
      } else {
          setInterestedSegments([...interestedSegments, val]);
      }
  };

  // Helper for Academic Records
  const addRecord = () => setAcademicRecords([...academicRecords, { degree: "", institute: "" }]);
  const updateRecord = (index: number, field: 'degree'|'institute', val: string) => {
      const newRecs = [...academicRecords];
      newRecs[index][field] = val;
      setAcademicRecords(newRecs);
  };
  const removeRecord = (index: number) => {
      const newRecs = academicRecords.filter((_, i) => i !== index);
      setAcademicRecords(newRecs);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-slate-400">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-32 pb-20 px-4 font-sans text-slate-900">
      <LocationTracker />

      {/* MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-pop-in">
            <h3 className={`text-xl font-black mb-2 capitalize ${modal.type === 'error' ? 'text-red-600' : 'text-slate-900'}`}>{modal.type === 'error' ? 'Error!' : 'Success!'}</h3>
            <p className="text-slate-500 text-sm mb-6">{modal.message}</p>
            <button onClick={() => setModal({ ...modal, isOpen: false })} className="px-8 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all">Okay</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        {/* HEADER */}
        <div className="bg-slate-900 p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-30"></div>
          <div className="relative z-10">
            <div className="w-24 h-24 bg-white rounded-full mx-auto flex items-center justify-center text-4xl font-black text-slate-900 border-4 border-slate-200 shadow-lg mb-4">{fullName ? fullName[0].toUpperCase() : "U"}</div>
            <h1 className="text-3xl font-bold text-white mb-1">{fullName || "User Profile"}</h1>
            <p className="inline-block bg-white/10 text-white/90 text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full">{user?.role || "Account"}</p>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="p-8 md:p-10 space-y-8">
          
          {/* 1. COMMON FIELDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Full Name</label>
              <input className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500" value={fullName} onChange={e => setFullName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Email (Read Only)</label>
              <input className="w-full bg-slate-50 border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-400 outline-none cursor-not-allowed" value={email} disabled />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Phone</label>
              <input className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880..." />
            </div>
            {/* Institution is common, but Institute/Tutor might have separate logic. Using general here. */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase block mb-2">{user.role === 'institute' ? 'Institute Name' : 'Current Institution'}</label>
              <input className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500" value={institution} onChange={e => setInstitution(e.target.value)} placeholder={user.role === 'tutor' ? 'Where do you teach?' : 'e.g. Dhaka College'} />
            </div>
          </div>

          {/* 2. ROLE SPECIFIC SECTIONS */}
          
          {/* --- STUDENT --- */}
          {user.role === 'student' && (
              <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl space-y-4">
                  <h4 className="flex items-center gap-2 font-bold text-blue-900"><GraduationCap className="w-5 h-5"/> Student Profile</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Target Goal</label>
                          <select value={currentGoal} onChange={(e) => setCurrentGoal(e.target.value)} className="w-full bg-white border border-blue-200 p-3 rounded-xl font-bold text-slate-700 outline-none">
                              {goalOptions.map((opt) => <option key={opt.name} value={opt.value}>{opt.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-blue-800 uppercase block mb-2">Date of Birth (Optional)</label>
                          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-white border border-blue-200 p-3 rounded-xl font-bold text-slate-700 outline-none" />
                      </div>
                  </div>
              </div>
          )}

          {/* --- TUTOR --- */}
          {user.role === 'tutor' && (
              <div className="space-y-6">
                  {/* Interested Segments */}
                  <div className="bg-purple-50 border border-purple-100 p-5 rounded-2xl space-y-3">
                      <h4 className="flex items-center gap-2 font-bold text-purple-900"><Briefcase className="w-5 h-5"/> Interested to Teach</h4>
                      <div className="flex flex-wrap gap-2">
                          {goalOptions.map(opt => (
                              <button 
                                key={opt.value} 
                                onClick={() => toggleSegment(opt.name)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${interestedSegments.includes(opt.name) ? 'bg-purple-600 text-white border-purple-600 shadow-md' : 'bg-white text-purple-600 border-purple-200 hover:border-purple-400'}`}
                              >
                                  {opt.name}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Academic Records */}
                  <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-3">
                      <div className="flex justify-between items-center">
                          <h4 className="flex items-center gap-2 font-bold text-slate-700"><Building className="w-5 h-5"/> Academic Records</h4>
                          <button onClick={addRecord} className="text-xs bg-slate-900 text-white px-3 py-1 rounded-lg font-bold flex items-center gap-1 hover:bg-black"><Plus className="w-3 h-3"/> Add</button>
                      </div>
                      <div className="space-y-3">
                          {academicRecords.map((rec, i) => (
                              <div key={i} className="flex gap-2">
                                  <input placeholder="Degree (e.g. BSc CSE)" value={rec.degree} onChange={e => updateRecord(i, 'degree', e.target.value)} className="flex-1 bg-white border border-slate-200 p-2 rounded-lg text-sm font-medium outline-none" />
                                  <input placeholder="Institution (e.g. BUET)" value={rec.institute} onChange={e => updateRecord(i, 'institute', e.target.value)} className="flex-1 bg-white border border-slate-200 p-2 rounded-lg text-sm font-medium outline-none" />
                                  <button onClick={() => removeRecord(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4"/></button>
                              </div>
                          ))}
                          {academicRecords.length === 0 && <p className="text-xs text-slate-400 italic">No records added yet.</p>}
                      </div>
                  </div>
              </div>
          )}

          {/* --- EDITOR --- */}
          {user.role === 'editor' && (
              <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-2xl space-y-4">
                  <h4 className="flex items-center gap-2 font-bold text-emerald-900"><LinkIcon className="w-5 h-5"/> Social & Skills</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Facebook Profile Link" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} className="w-full bg-white border border-emerald-200 p-3 rounded-xl text-sm font-medium outline-none" />
                      <input placeholder="LinkedIn Profile Link" value={socialLinks.linkedin} onChange={e => setSocialLinks({...socialLinks, linkedin: e.target.value})} className="w-full bg-white border border-emerald-200 p-3 rounded-xl text-sm font-medium outline-none" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-emerald-800 uppercase block mb-2">Skills (Comma separated)</label>
                      <input placeholder="e.g. Content Writing, SEO, Graphics" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-white border border-emerald-200 p-3 rounded-xl text-sm font-medium outline-none" />
                  </div>
              </div>
          )}

          {/* Bio (For everyone except maybe students if you want) */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Bio / About Me</label>
            <textarea className="w-full bg-white border-2 border-slate-100 p-3 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-500 h-24 resize-none" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." />
          </div>

          {/* 3. SECURITY SECTION */}
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Change Password</h3>
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl space-y-4">
                
                <div className="relative">
                    <label className="text-xs font-bold text-red-400 uppercase block mb-1">Current Password</label>
                    <input type={showPass ? "text" : "password"} value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full bg-white border border-red-200 p-3 rounded-xl font-bold text-slate-700 outline-none" placeholder="Required for verification" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-red-400 uppercase block mb-1">New Password</label>
                        <input type={showPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-white border border-red-200 p-3 rounded-xl font-bold text-slate-700 outline-none" placeholder="Min 6 chars" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-red-400 uppercase block mb-1">Confirm New</label>
                        <input type={showPass ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={`w-full bg-white border p-3 rounded-xl font-bold text-slate-700 outline-none ${confirmPass && newPass !== confirmPass ? 'border-red-500 ring-2 ring-red-200' : 'border-red-200'}`} placeholder="Retype new password" />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                    <button onClick={() => setShowPass(!showPass)} className="text-xs font-bold text-slate-500 flex items-center gap-2 hover:text-slate-800">
                        {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>} {showPass ? "Hide" : "Show"} Passwords
                    </button>
                    <button onClick={handlePasswordChange} disabled={passwordLoading} className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50">
                        {passwordLoading ? "Verifying..." : "Update Password"}
                    </button>
                </div>
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
            <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
            <button onClick={handleUpdate} disabled={saving} className="px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}