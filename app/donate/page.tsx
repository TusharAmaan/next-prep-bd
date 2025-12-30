"use client";
import Link from "next/link";
import { useState } from "react";

// Mock Data for Top Donors (Replace with Supabase fetch later)
const topDonors = [
  { name: "Rahim Ahmed", amount: "5,000 BDT", title: "Gold Supporter" },
  { name: "Fatima Khan", amount: "2,000 BDT", title: "Silver Supporter" },
  { name: "John Doe", amount: "1,000 BDT", title: "Bronze Supporter" },
  { name: "Sabiha Nur", amount: "500 BDT", title: "Early Backer" },
];

export default function DonatePage() {
  const [customAmount, setCustomAmount] = useState("");

  const handleDonate = (amount: string) => {
    // Integrate your Payment Gateway logic here (e.g., bKash, Stripe, SSLCommerz)
    alert(`Thank you! Proceeding to donate ${amount} BDT.`);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      
      {/* HERO SECTION */}
      <section className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-6">
            Support Our <span className="text-blue-400">Mission</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Help us build the largest free educational platform in Bangladesh. Your contribution keeps our servers running and our content free for everyone.
          </p>
          <div className="flex justify-center gap-4">
            <button 
              onClick={() => document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all hover:scale-105"
            >
              Donate Now
            </button>
            <Link href="/" className="px-8 py-3 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-700 transition-all">
              Back Home
            </Link>
          </div>
        </div>
      </section>

      {/* WHY DONATE / APPRECIATION */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-slate-900">Why We Need Your Help?</h2>
            <p className="text-slate-600 leading-relaxed">
              We are a small team of educators and developers working tirelessly to provide high-quality study materials, question banks, and video classes completely free of charge.
            </p>
            <p className="text-slate-600 leading-relaxed">
              <strong>Your donation helps us cover:</strong>
            </p>
            <ul className="space-y-2">
              {['Server & Database Costs', 'Content Creation & Typing', 'App Development & Maintenance', 'Keeping the Platform Ad-Free'].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                  <span className="text-green-500">✔</span> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
            <h3 className="text-xl font-bold text-slate-800 mb-2">Our Promise</h3>
            <div className="text-4xl mb-4">🤝</div>
            <p className="text-slate-500 text-sm">
              "Every single Taka you donate goes directly into improving the platform. We believe education should be accessible to all, regardless of financial background."
            </p>
            <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">— The NextPrepBD Team</p>
          </div>
        </div>
      </section>

      {/* DONATION ACTION AREA */}
      <section id="donate-section" className="bg-blue-50 py-16 px-6">
        <div className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-blue-100 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose an Amount</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {['100', '500', '1000', '5000'].map((amt) => (
              <button 
                key={amt} 
                onClick={() => handleDonate(amt)}
                className="py-4 rounded-xl border-2 border-slate-100 font-bold text-lg hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                ৳{amt}
              </button>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
            <input 
              type="number" 
              placeholder="Enter Custom Amount (BDT)" 
              className="w-full md:w-64 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
            />
            <button 
              onClick={() => handleDonate(customAmount)}
              disabled={!customAmount}
              className="w-full md:w-auto px-8 py-3 bg-black text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-all"
            >
              Donate Custom
            </button>
          </div>
          
          <p className="text-xs text-slate-400 mt-6 flex items-center justify-center gap-2">
            <span>🔒</span> Secure Payment via bKash / Nagad / Card
          </p>
        </div>
      </section>

      {/* TOP DONORS HALL OF FAME */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-slate-900">🏆 Hall of Fame</h2>
          <p className="text-slate-500 mt-2">Special thanks to our top supporters.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topDonors.map((donor, index) => (
            <div key={index} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 group-hover:scale-110 transition-transform">
                👑
              </div>
              <h3 className="font-bold text-slate-900">{donor.name}</h3>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{donor.title}</p>
              <div className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-100">
                Donated {donor.amount}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}