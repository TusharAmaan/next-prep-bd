"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const [segments, setSegments] = useState<any[]>([]);
  const [newSegment, setNewSegment] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. Fetch existing categories on load
  useEffect(() => {
    fetchSegments();
  }, []);

  async function fetchSegments() {
    const { data, error } = await supabase.from("segments").select("*");
    if (error) console.error("Error fetching:", error);
    else setSegments(data || []);
  }

  // 2. Add a new category
  async function addSegment() {
    if (!newSegment) return;
    setLoading(true);

    const slug = newSegment.toLowerCase().replace(/\s+/g, "-");

    const { error } = await supabase
      .from("segments")
      .insert([{ title: newSegment, slug: slug }]);

    if (error) {
      alert("Error: " + error.message);
    } else {
      setNewSegment(""); 
      fetchSegments(); 
    }
    setLoading(false);
  }

  // 3. Delete a category
  async function deleteSegment(id: number) {
    if(!confirm("Are you sure?")) return;
    
    const { error } = await supabase.from("segments").delete().match({ id });
    if (!error) fetchSegments();
  }

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

        {/* Create Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-semibold mb-4">Add Category (Segment)</h2>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="e.g. HSC, Job Prep"
              className="border p-3 rounded w-full text-black"
              value={newSegment}
              onChange={(e) => setNewSegment(e.target.value)}
            />
            <button
              onClick={addSegment}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Saving..." : "Add"}
            </button>
          </div>
        </div>

        {/* List Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-black">Existing Segments</h2>
          {segments.length === 0 ? (
            <p className="text-gray-500">No segments found. Add one above!</p>
          ) : (
            <ul className="space-y-3">
              {segments.map((seg) => (
                <li key={seg.id} className="flex justify-between items-center bg-gray-50 p-3 rounded border">
                  <span className="font-medium text-lg text-black">{seg.title}</span>
                  <button 
                    onClick={() => deleteSegment(seg.id)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}