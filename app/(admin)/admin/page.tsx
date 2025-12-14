"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminDashboard() {
  const [segments, setSegments] = useState<any[]>([]);
  const [newSegment, setNewSegment] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    fetchSegments();
  }, []);

  async function fetchSegments() {
    const { data, error } = await supabase.from("segments").select("*");
    if (data) setSegments(data);
  }

  // Add category
  async function addSegment() {
    if (!newSegment) return;
    setLoading(true);
    const slug = newSegment.toLowerCase().replace(/\s+/g, "-");
    const { error } = await supabase.from("segments").insert([{ title: newSegment, slug }]);
    
    if (!error) {
      setNewSegment("");
      fetchSegments();
    } else {
      alert(error.message);
    }
    setLoading(false);
  }

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <div className="flex gap-2 mb-6">
        <input 
          className="border p-2 text-black" 
          value={newSegment} 
          onChange={(e) => setNewSegment(e.target.value)} 
          placeholder="New Category (e.g. HSC)" 
        />
        <button onClick={addSegment} disabled={loading} className="bg-blue-500 text-white p-2 rounded">
          {loading ? "Adding..." : "Add"}
        </button>
      </div>
      <ul>
        {segments.map(seg => (
          <li key={seg.id} className="p-2 border-b">{seg.title}</li>
        ))}
      </ul>
    </div>
  );
}