"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { 
  GraduationCap, Briefcase, Plus, Trash2, Eye, EyeOff, 
  Link as LinkIcon, Building, MapPin, Save, Loader2, X 
} from "lucide-react";
import LocationTracker from "@/components/LocationTracker"; 

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);

  // --- DATABASE DATA ---
  const [dbGroups, setDbGroups] = useState<any[]>([]);
  const [dbSubjects, setDbSubjects] = useState<any[]>([]);

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
  const [academicRecords, setAcademicRecords] = useState<{degree: string, institute: string}[]>([]);
  // New Teaching Expertise System
  const [tutorSubjects, setTutorSubjects] = useState<string[]>([]); // Stores ["HSC Science > Physics", "SSC > Math"]
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // --- EDITOR SPECIFIC ---
  const [socialLinks, setSocialLinks] = useState({ facebook: "", linkedin: "" });
  const [skills, setSkills] = useState(""); 

  // --- PASSWORD STATE ---
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // --- MODAL STATE ---
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' });

  // Student Goal Options (Static)
  const goalOptions = [
    { name: "SSC Preparation", value: "SSC" },
    { name: "HSC Preparation", value: "HSC" },
    { name: "University Admission", value: "University Admission" },
    { name: "Medical Admission", value: "Medical Admission" },
    { name: "Job Preparation", value: "Job Preparation" },
  ];

  // --- 1. FETCH INITIAL DATA ---
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.push("/login"); return; }

      // Parallel Fetch: Profile + Groups + Subjects
      const [profileRes, groupsRes, subjectsRes] = await Promise.all([
         supabase.from('profiles').select('*').eq('id', session.user.id).single(),
         supabase.from('groups').select('id, title, slug'),
         supabase.from('subjects').select('id, title, slug, group_id')
      ]);

      if (groupsRes.data) setDbGroups(groupsRes.data);
      if (subjectsRes.data) setDbSubjects(subjectsRes.data);

      const data = profileRes.data;
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
        setAcademicRecords(data.academic_records || []);
        // Safely parse subjects if it's JSON or ensure it's an array
        let loadedSubjects = data.subjects || []; 
        if (typeof loadedSubjects === 'string') {
            try { loadedSubjects = JSON.parse(loadedSubjects); } catch { loadedSubjects = []; }
        }
        setTutorSubjects(Array.isArray(loadedSubjects) ? loadedSubjects : []);

        // Editor
        setSocialLinks(data.social_links || { facebook: "", linkedin: "" });
        setSkills(data.skills ? data.skills.join(", ") : "");
      }
      setLoading(false);
    };
    init();
  }, [router]);

  // --- HANDLERS ---

  const handleUpdate = async () => {
    setSaving(true);
    
    const updates: any = {
        full_name: fullName,
        bio: bio,
        institution: institution,
        phone: phone,
        city: city, 
    };

    if (user.role === 'student') {
        updates.current_goal = currentGoal;
        updates.date_of_birth = dob || null;
    }
    else if (user.role === 'tutor') {
        updates.academic_records = academicRecords;
        updates.subjects = tutorSubjects; // Saving the new expertise list
        // We can also save this to 'interested_segments' if you need legacy support
        updates.interested_segments = tutorSubjects; 
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
      if (!currentPass || !newPass || !confirmPass) return alert("Please fill all fields");
      if (newPass !== confirmPass) return alert("Passwords do not match");
      setPasswordLoading(true);

      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: currentPass });
      if (signInError) {
          setPasswordLoading(false);
          setModal({ isOpen: true, type: 'error', message: "Current password incorrect." });
          return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPass });
      setPasswordLoading(false);
      
      if (error) setModal({ isOpen: true, type: 'error', message: error.message });
      else {
          setModal({ isOpen: true, type: 'success', message: "Password updated! Please log in again." });
          setCurrentPass(""); setNewPass(""); setConfirmPass("");
      }
  };

  // --- TUTOR EXPERTISE LOGIC ---
  
  // Filter subjects based on selected group
  const filteredSubjects = selectedGroup 
    ? dbSubjects.filter(s => {
        const group = dbGroups.find(g => g.slug === selectedGroup);
        return group && s.group_id === group.id;
      })
    : [];

  const addTutorSubject = () => {
      if (!selectedGroup || !selectedSubject) return;
      const groupTitle = dbGroups.find(g => g.slug === selectedGroup)?.title || selectedGroup;
      const subjectTitle = dbSubjects.find(s => s.slug === selectedSubject)?.title || selectedSubject;
      
      // Format: "Group > Subject"
      const entry = `${groupTitle} > ${subjectTitle}`;
      
      if (!tutorSubjects.includes(entry)) {
          setTutorSubjects([...tutorSubjects, entry]);
      }
      // Reset subject but keep group for faster entry
      setSelectedSubject(""); 
  };

  const removeTutorSubject = (idx: number) => {
      setTutorSubjects(tutorSubjects.filter((_, i) => i !== idx));
  };

  // --- ACADEMIC RECORDS LOGIC ---
  const addRecord = () => setAcademicRecords([...academicRecords, { degree: "", institute: "" }]);
  const updateRecord = (index: number, field: 'degree'|'institute', val: string) => {
      const newRecs = [...academicRecords];
      newRecs[index][field] = val;
      setAcademicRecords(newRecs);
  };
  const removeRecord = (index: number) => {
      setAcademicRecords(academicRecords.filter((_, i) => i !== index));
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600"/>
        <p className="font-bold text-slate-400 animate-pulse">Loading Profile...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 pt-24 md:pt-32 px-4 font-sans text-slate-900">
      <LocationTracker />

      {/* MODAL */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 max-w-sm w-full text-center animate-pop-in">
            <h3 className={`text-xl font-black mb-2 capitalize ${modal.type === 'error' ? 'text-red-600' : 'text-slate-900'}`}>{modal.type === 'error' ? 'Error!' : 'Success!'}</h3>
            <p className="text-slate-500 text-sm mb-6">{modal.message}</p>
            <button onClick={() => setModal({ ...modal, isOpen: false })} className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all">Okay</button>
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        
        {/* HEADER */}
        <div className="bg-slate-900 p-6 md:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/30 to-purple-600/30 opacity-40"></div>
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center text-3xl md:text-4xl font-black text-slate-900 border-4 border-slate-200 shadow-lg mb-3">
                {fullName ? fullName[0].toUpperCase() : "U"}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">{fullName || "User Profile"}</h1>
            <div className="flex items-center gap-2 mt-2">
                 <span className="bg-white/10 text-white/90 text-[10px] md:text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full border border-white/10">
                    {user?.role || "Member"}
                 </span>
                 {city && <span className="flex items-center gap-1 text-white/70 text-xs font-bold"><MapPin className="w-3 h-3"/> {city}</span>}
            </div>
          </div>
        </div>

        {/* FORM BODY */}
        <div className="p-6 md:p-10 space-y-8">
          
          {/* 1. COMMON FIELDS */}
          <section className="space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 mb-4">Personal Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 ml-1">Full Name</label>
                    <input className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 ml-1">Email (Read Only)</label>
                    <input className="w-full bg-slate-100 border border-slate-200 p-3 rounded-xl font-bold text-slate-400 outline-none cursor-not-allowed" value={email} disabled />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 ml-1">Phone</label>
                    <input className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880..." />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 ml-1">{user.role === 'institute' ? 'Institute Name' : 'Institution'}</label>
                    <input className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500 transition-all" value={institution} onChange={e => setInstitution(e.target.value)} placeholder={user.role === 'tutor' ? 'Current University/College' : 'e.g. Dhaka College'} />
                </div>
              </div>
          </section>

          {/* 2. ROLE SPECIFIC SECTIONS */}
          
          {/* --- STUDENT --- */}
          {user.role === 'student' && (
              <div className="bg-blue-50/50 border border-blue-100 p-5 rounded-2xl space-y-4">
                  <h4 className="flex items-center gap-2 font-bold text-blue-900"><GraduationCap className="w-5 h-5"/> Student Profile</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                          <label className="text-xs font-bold text-blue-800/70 uppercase block mb-1.5 ml-1">Target Goal</label>
                          <select value={currentGoal} onChange={(e) => setCurrentGoal(e.target.value)} className="w-full bg-white border border-blue-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200">
                              <option value="">Select Goal</option>
                              {goalOptions.map((opt) => <option key={opt.name} value={opt.value}>{opt.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="text-xs font-bold text-blue-800/70 uppercase block mb-1.5 ml-1">Date of Birth</label>
                          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="w-full bg-white border border-blue-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-200" />
                      </div>
                  </div>
              </div>
          )}

          {/* --- TUTOR --- */}
          {user.role === 'tutor' && (
              <div className="space-y-6 animate-fade-in">
                  
                  {/* TEACHING EXPERTISE (Dynamic) */}
                  <div className="bg-purple-50/50 border border-purple-100 p-5 md:p-6 rounded-2xl space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <h4 className="flex items-center gap-2 font-bold text-purple-900"><Briefcase className="w-5 h-5"/> Expertise & Segments</h4>
                        <span className="text-[10px] text-purple-700 bg-purple-100 px-2 py-1 rounded-lg">Select what you want to teach</span>
                      </div>

                      {/* Selector Area */}
                      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
                           <div className="sm:col-span-2">
                               <label className="text-[10px] font-bold text-purple-700 uppercase block mb-1 ml-1">1. Select Group</label>
                               <select 
                                 value={selectedGroup} 
                                 onChange={(e) => setSelectedGroup(e.target.value)} 
                                 className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-purple-500"
                               >
                                   <option value="">-- Choose Group --</option>
                                   {dbGroups.map(g => <option key={g.id} value={g.slug}>{g.title}</option>)}
                               </select>
                           </div>

                           <div className="sm:col-span-2">
                               <label className="text-[10px] font-bold text-purple-700 uppercase block mb-1 ml-1">2. Select Subject</label>
                               <select 
                                 value={selectedSubject} 
                                 onChange={(e) => setSelectedSubject(e.target.value)} 
                                 disabled={!selectedGroup}
                                 className="w-full p-2.5 rounded-xl border border-purple-200 bg-white text-sm font-bold text-slate-700 outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                               >
                                   <option value="">-- Choose Subject --</option>
                                   {filteredSubjects.map(s => <option key={s.id} value={s.slug}>{s.title}</option>)}
                               </select>
                           </div>

                           <button 
                             onClick={addTutorSubject}
                             disabled={!selectedSubject}
                             className="sm:col-span-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white p-2.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-1"
                           >
                              <Plus className="w-4 h-4" /> Add
                           </button>
                      </div>

                      {/* Selected List */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-purple-100">
                          {tutorSubjects.length === 0 ? (
                              <p className="text-xs text-purple-400 italic">No teaching preferences added yet. Add some above!</p>
                          ) : (
                              tutorSubjects.map((sub, i) => (
                                  <span key={i} className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-bold text-purple-700 shadow-sm animate-pop-in">
                                      {sub}
                                      <button onClick={() => removeTutorSubject(i)} className="hover:text-red-500"><X className="w-3 h-3"/></button>
                                  </span>
                              ))
                          )}
                      </div>
                  </div>

                  {/* Academic Records */}
                  <div className="bg-slate-50 border border-slate-100 p-5 md:p-6 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                          <h4 className="flex items-center gap-2 font-bold text-slate-700"><Building className="w-5 h-5"/> Academic Records</h4>
                          <button onClick={addRecord} className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 hover:bg-black transition-colors"><Plus className="w-3 h-3"/> Add Record</button>
                      </div>
                      <div className="space-y-3">
                          {academicRecords.map((rec, i) => (
                              <div key={i} className="flex flex-col sm:flex-row gap-2">
                                  <input placeholder="Degree (e.g. BSc CSE)" value={rec.degree} onChange={e => updateRecord(i, 'degree', e.target.value)} className="flex-1 bg-white border border-slate-200 p-2.5 rounded-xl text-sm font-medium outline-none focus:border-indigo-500" />
                                  <input placeholder="Institution (e.g. BUET)" value={rec.institute} onChange={e => updateRecord(i, 'institute', e.target.value)} className="flex-1 bg-white border border-slate-200 p-2.5 rounded-xl text-sm font-medium outline-none focus:border-indigo-500" />
                                  <button onClick={() => removeRecord(i)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl border border-transparent hover:border-red-100 transition-colors self-end sm:self-auto"><Trash2 className="w-4 h-4"/></button>
                              </div>
                          ))}
                          {academicRecords.length === 0 && <p className="text-xs text-slate-400 italic">No academic records added.</p>}
                      </div>
                  </div>
              </div>
          )}

          {/* --- EDITOR --- */}
          {user.role === 'editor' && (
              <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-4">
                  <h4 className="flex items-center gap-2 font-bold text-emerald-900"><LinkIcon className="w-5 h-5"/> Social & Skills</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input placeholder="Facebook Profile Link" value={socialLinks.facebook} onChange={e => setSocialLinks({...socialLinks, facebook: e.target.value})} className="w-full bg-white border border-emerald-200 p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-200" />
                      <input placeholder="LinkedIn Profile Link" value={socialLinks.linkedin} onChange={e => setSocialLinks({...socialLinks, linkedin: e.target.value})} className="w-full bg-white border border-emerald-200 p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
                  <div>
                      <label className="text-xs font-bold text-emerald-800 uppercase block mb-1.5 ml-1">Skills (Comma separated)</label>
                      <input placeholder="e.g. Content Writing, SEO, Graphics" value={skills} onChange={e => setSkills(e.target.value)} className="w-full bg-white border border-emerald-200 p-3 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-200" />
                  </div>
              </div>
          )}

          {/* Bio */}
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5 ml-1">Bio / About Me</label>
            <textarea className="w-full bg-slate-50 border border-slate-200 focus:bg-white p-3 rounded-xl font-medium text-slate-700 outline-none focus:border-indigo-500 h-28 resize-none transition-all" value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." />
          </div>

          {/* 3. SECURITY SECTION */}
          <section className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Change Password</h3>
            <div className="bg-red-50 border border-red-100 p-5 md:p-6 rounded-2xl space-y-4">
                
                <div>
                    <label className="text-xs font-bold text-red-400 uppercase block mb-1.5 ml-1">Current Password</label>
                    <input type={showPass ? "text" : "password"} value={currentPass} onChange={e => setCurrentPass(e.target.value)} className="w-full bg-white border border-red-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-100" placeholder="Required for verification" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-red-400 uppercase block mb-1.5 ml-1">New Password</label>
                        <input type={showPass ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)} className="w-full bg-white border border-red-200 p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-100" placeholder="Min 6 chars" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-red-400 uppercase block mb-1.5 ml-1">Confirm New</label>
                        <input type={showPass ? "text" : "password"} value={confirmPass} onChange={e => setConfirmPass(e.target.value)} className={`w-full bg-white border p-3 rounded-xl font-bold text-slate-700 outline-none focus:ring-2 focus:ring-red-100 ${confirmPass && newPass !== confirmPass ? 'border-red-500' : 'border-red-200'}`} placeholder="Retype new password" />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                    <button onClick={() => setShowPass(!showPass)} className="text-xs font-bold text-slate-500 flex items-center gap-2 hover:text-slate-800 transition-colors">
                        {showPass ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>} {showPass ? "Hide" : "Show"} Passwords
                    </button>
                    <button onClick={handlePasswordChange} disabled={passwordLoading} className="w-full sm:w-auto px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {passwordLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4"/>} 
                        {passwordLoading ? "Verifying..." : "Update Password"}
                    </button>
                </div>
            </div>
          </section>

          {/* SAVE BUTTON */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3 md:gap-4 sticky bottom-0 bg-white/95 backdrop-blur p-4 -mx-6 md:-mx-10 -mb-6 md:-mb-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] md:shadow-none md:static md:p-0">
            <button onClick={() => router.back()} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-colors order-2 sm:order-1">Cancel</button>
            <button onClick={handleUpdate} disabled={saving} className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 order-1 sm:order-2">
              {saving ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5"/>}
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}