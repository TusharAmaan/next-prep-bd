import { supabase } from "@/lib/supabaseClient";
import DonateForm from "@/components/DonateForm"; // We will create this component next
import { Suspense } from "react";

export const dynamic = "force-dynamic";

// Fetch Top Donors Component
async function TopDonors() {
  const { data: donors } = await supabase
    .from("donations")
    .select("name, amount, is_anonymous")
    .eq("status", "approved") // Only show verified donations
    .order("amount", { ascending: false })
    .limit(8);

  if (!donors || donors.length === 0) {
    return (
      <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
        <p className="text-slate-400 text-sm">Be the first to donate and appear here!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {donors.map((donor, index) => (
        <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group relative overflow-hidden">
          {index === 0 && <div className="absolute top-0 right-0 bg-yellow-400 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">TOP CONTRIBUTOR</div>}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform ${index === 0 ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-50 text-blue-600'}`}>
            {index === 0 ? '👑' : '❤️'}
          </div>
          <h3 className="font-bold text-slate-900">{donor.is_anonymous ? "Anonymous" : donor.name}</h3>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Supporter</p>
          <div className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
            ৳{donor.amount.toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* HERO */}
      <section className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Support <span className="text-blue-400">NextPrepBD</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Your contribution keeps our servers running and ensures free education for thousands of students across Bangladesh.
          </p>
          <button 
             // We use a simple script to scroll because this is a Server Component
             // In a real app, you might use a client component wrapper for the button
             className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all"
          >
             <a href="#donate-form">Donate Now</a>
          </button>
        </div>
      </section>

      {/* HALL OF FAME */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900">🏆 Wall of Appreciation</h2>
          <p className="text-slate-500 mt-2">Special thanks to the heroes supporting our mission.</p>
        </div>
        <Suspense fallback={<div className="text-center">Loading donors...</div>}>
           <TopDonors />
        </Suspense>
      </section>

      {/* DONATION FORM SECTION */}
      <section id="donate-form" className="bg-white border-t border-slate-100 py-16 px-6">
         <div className="max-w-3xl mx-auto">
             <div className="text-center mb-10">
                 <h2 className="text-2xl font-bold text-slate-900">Make a Contribution</h2>
                 <p className="text-slate-500 text-sm mt-2">Send money via bKash/Nagad and fill the form below.</p>
             </div>
             
             {/* Payment Instructions Card */}
             <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-8 flex flex-col md:flex-row gap-6 items-center justify-between">
                 <div className="flex items-center gap-4">
                     <div className="bg-pink-600 text-white p-3 rounded-xl font-bold text-xl">bKash</div>
                     <div>
                         <p className="text-xs font-bold text-slate-500 uppercase">Personal Number</p>
                         <p className="text-xl font-black text-slate-900 select-all">01XXXXXXXXX</p>
                     </div>
                 </div>
                 <div className="flex items-center gap-4">
                     <div className="bg-orange-500 text-white p-3 rounded-xl font-bold text-xl">Nagad</div>
                     <div>
                         <p className="text-xs font-bold text-slate-500 uppercase">Personal Number</p>
                         <p className="text-xl font-black text-slate-900 select-all">01XXXXXXXXX</p>
                     </div>
                 </div>
             </div>

             {/* Client Side Form Component */}
             <DonateForm />
             
         </div>
      </section>
    </div>
  );
}