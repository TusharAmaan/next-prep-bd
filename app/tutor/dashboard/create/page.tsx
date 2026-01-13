"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient"; 
import ContentEditor from "@/components/admin/sections/ContentEditor"; 
import { Layers, ChevronRight } from "lucide-react";

export default function CreateContentPage() {
  const [step, setStep] = useState(1); 
  
  // FIX: Explicitly type these state variables as any[]
  const [segments, setSegments] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  const [selectedSegment, setSelectedSegment] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const { data: s } = await supabase.from('segments').select('*');
      setSegments(s || []);
    };
    fetchData();
  }, []);

  // Fetch groups when segment changes
  useEffect(() => {
    if(!selectedSegment) return;
    const fetchGroups = async () => {
        const { data } = await supabase.from('groups').select('*').eq('segment_id', selectedSegment);
        setGroups(data || []);
    };
    fetchGroups();
  }, [selectedSegment]);

  // Fetch subjects when group changes
  useEffect(() => {
    if(!selectedGroup) return;
    const fetchSubjects = async () => {
        const { data } = await supabase.from('subjects').select('*').eq('group_id', selectedGroup);
        setSubjects(data || []);
    };
    fetchSubjects();
  }, [selectedGroup]);


  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto mt-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">What are you teaching?</h1>
              <p className="text-slate-500 text-sm">Select the category to help students find your content.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Segment</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                onChange={(e) => setSelectedSegment(e.target.value)}
              >
                <option value="">Select Level (e.g. HSC)</option>
                {segments.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            {selectedSegment && (
              <div className="animate-in slide-in-from-top-2 fade-in">
                <label className="block text-sm font-bold text-slate-700 mb-2">Group</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  onChange={(e) => setSelectedGroup(e.target.value)}
                >
                  <option value="">Select Group (e.g. Science)</option>
                  {groups.map((g: any) => <option key={g.id} value={g.id}>{g.title}</option>)}
                </select>
              </div>
            )}

            {selectedGroup && (
              <div className="animate-in slide-in-from-top-2 fade-in">
                <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  onChange={(e) => setSelectedSubject(e.target.value)}
                >
                  <option value="">Select Subject (e.g. Physics)</option>
                  {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                </select>
              </div>
            )}

            <button 
              disabled={!selectedSubject}
              onClick={() => setStep(2)}
              className="w-full mt-4 py-4 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all"
            >
              Continue to Editor <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Editor
  return (
    <div className="animate-in fade-in">
        <ContentEditor 
            // Note: You might get a prop error here next if your ContentEditor 
            // doesn't accept these props yet. We can fix that next.
            selectedSegment={selectedSegment}
            selectedGroup={selectedGroup}
            selectedSubject={selectedSubject}
            isTutorMode={true} 
        />
    </div>
  );
}