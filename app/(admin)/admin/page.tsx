"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  // Data States
  const [segments, setSegments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  
  // Input States
  const [newSegment, setNewSegment] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("");
  
  const [loading, setLoading] = useState(false);

  // --- 1. INITIAL LOAD ---
  useEffect(() => {
    fetchSegments();
  }, []);

  // When a segment is selected, fetch its subjects
  useEffect(() => {
    if (selectedSegmentId) {
      fetchSubjects(selectedSegmentId);
    } else {
      setSubjects([]);
    }
  }, [selectedSegmentId]);

  // --- 2. FETCH FUNCTIONS ---
  async function fetchSegments() {
    const { data } = await supabase.from("segments").select("*").order('id', { ascending: true });
    if (data) setSegments(data);
  }

  async function fetchSubjects(segmentId: string) {
    const { data } = await supabase
      .from("subjects")
      .select("*")
      .eq("segment_id", segmentId)
      .order('id', { ascending: true });
    
    if (data) setSubjects(data);
  }

  // --- 3. ADD FUNCTIONS ---
  async function addSegment() {
    if (!newSegment) return;
    setLoading(true);
    const slug = newSegment.toLowerCase().replace(/\s+/g, "-");
    
    const { error } = await supabase
      .from("segments")
      .insert([{ title: newSegment, slug }]);

    if (!error) {
      setNewSegment("");
      fetchSegments();
    } else {
      alert(error.message);
    }
    setLoading(false);
  }

  async function addSubject() {
    if (!newSubject || !selectedSegmentId) return;
    setLoading(true);
    const slug = newSubject.toLowerCase().replace(/\s+/g, "-");

    const { error } = await supabase.from("subjects").insert([
      { 
        title: newSubject, 
        slug: slug, 
        segment_id: Number(selectedSegmentId) 
      }
    ]);

    if (!error) {
      setNewSubject("");
      fetchSubjects(selectedSegmentId); // Refresh list
    } else {
      alert(error.message);
    }
    setLoading(false);
  }

  // --- 4. DELETE FUNCTION ---
  async function deleteItem(table: string, id: number, refreshCallback: () => void) {
    if(!confirm("Are you sure?")) return;
    await supabase.from(table).delete().match({ id });
    refreshCallback();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-blue-900">Admin Control Center</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* --- LEFT COLUMN: SEGMENTS (SSC, HSC) --- */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">1. Main Categories</h2>
            
            {/* Add Segment Input */}
            <div className="flex gap-2 mb-4">
              <input 
                className="border p-2 rounded w-full border-gray-300" 
                value={newSegment} 
                onChange={(e) => setNewSegment(e.target.value)} 
                placeholder="New Category (e.g. HSC)" 
              />
              <button 
                onClick={addSegment} 
                disabled={loading} 
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                +
              </button>
            </div>

            {/* List Segments */}
            <ul className="space-y-2">
              {segments.map(seg => (
                <li 
                  key={seg.id} 
                  onClick={() => setSelectedSegmentId(seg.id)}
                  className={`p-3 rounded cursor-pointer flex justify-between items-center transition-colors ${
                    Number(selectedSegmentId) === seg.id 
                      ? "bg-blue-100 border-blue-500 border" 
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <span className="font-medium">{seg.title}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); deleteItem("segments", seg.id, fetchSegments); }}
                    className="text-red-400 hover:text-red-600 text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* --- RIGHT COLUMN: SUBJECTS (English, Math) --- */}
          <div className="bg-white p-6 rounded shadow">
            <h2 className="text-xl font-bold mb-4 border-b pb-2">2. Manage Subjects</h2>
            
            {!selectedSegmentId ? (
              <p className="text-gray-400 italic mt-10 text-center">
                Select a Category from the left to manage subjects.
              </p>
            ) : (
              <>
                <p className="mb-4 text-sm text-gray-500">
                  Adding subjects to: <strong>{segments.find(s => s.id == selectedSegmentId)?.title}</strong>
                </p>

                {/* Add Subject Input */}
                <div className="flex gap-2 mb-4">
                  <input 
                    className="border p-2 rounded w-full border-gray-300" 
                    value={newSubject} 
                    onChange={(e) => setNewSubject(e.target.value)} 
                    placeholder="Subject Name (e.g. English 1st)" 
                  />
                  <button 
                    onClick={addSubject} 
                    disabled={loading} 
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  >
                    Add
                  </button>
                </div>

                {/* List Subjects */}
                <ul className="space-y-2 max-h-[400px] overflow-y-auto">
                  {subjects.length === 0 && <p className="text-gray-400 text-sm">No subjects yet.</p>}
                  {subjects.map(sub => (
                    <li key={sub.id} className="p-3 bg-gray-50 rounded flex justify-between border-l-4 border-green-500">
                      <span>{sub.title}</span>
                      <button 
                         onClick={() => deleteItem("subjects", sub.id, () => fetchSubjects(selectedSegmentId))}
                         className="text-red-400 hover:text-red-600 text-sm"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}