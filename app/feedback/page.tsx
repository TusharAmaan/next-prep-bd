"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle, Send } from "lucide-react";

export default function FeedbackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  // Form State
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login?redirect=/feedback");
        return;
      }
      setUser(session.user);
      
      const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      setProfile(data);
    };
    checkUser();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("You must be logged in.");
    
    setLoading(true);

    try {
        const { error } = await supabase.from("feedbacks").insert({
          user_id: user.id,
          full_name: profile?.full_name || user.email,
          role: profile?.role || "student", // Default to student if undefined
          category,
          message, // Accepts any length
        });
    
        if (error) {
          console.error("Supabase Error:", error);
          alert("Error sending feedback: " + error.message);
        } else {
          setSuccess(true);
          setMessage("");
        }
    } catch (err) {
        console.error("Unexpected Error:", err);
        alert("Something went wrong. Check console.");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 px-4 pb-10">
      <div className="max-w-xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-10">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-slate-900 mb-2">Help Us Improve</h1>
          <p className="text-slate-500">
            Hi <span className="font-bold text-blue-600 capitalize">{profile?.full_name || "there"}</span>! 
            Your feedback helps us build a better platform.
          </p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center animate-in fade-in">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-green-800">Feedback Sent!</h3>
            <p className="text-green-600 mb-4">Thank you. We've sent this to the admin panel.</p>
            <button 
              onClick={() => setSuccess(false)}
              className="text-green-700 font-bold underline hover:text-green-900"
            >
              Send another?
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">What is this about?</label>
              <div className="grid grid-cols-2 gap-3">
                {['bug', 'feature', 'content', 'general'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`py-3 px-4 rounded-xl border font-bold text-sm transition-all capitalize ${
                      category === cat 
                      ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30" 
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Area */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Your Message</label>
              <textarea
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us what's on your mind..."
                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              ></textarea>
            </div>

            {/* Info Note */}
            <div className="flex items-start gap-3 bg-blue-50 p-4 rounded-xl">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-800 leading-relaxed">
                Your feedback will be tagged with your current role. 
                Admins will review this in the Dashboard.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-95 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? "Sending..." : <><Send className="w-5 h-5" /> Submit Feedback</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}