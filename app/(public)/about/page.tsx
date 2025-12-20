import Link from "next/link";

export const metadata = {
  title: "About Us | NextPrepBD",
  description: "Learn about NextPrepBD, Bangladesh's largest free education portal for SSC and HSC students.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-20 text-center">
        <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider mb-4">
          Our Story
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
          Empowering the Next Generation of <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            Learners in Bangladesh.
          </span>
        </h1>
        <p className="text-lg text-slate-500 max-w-3xl mx-auto leading-relaxed">
          NextPrepBD is a non-profit initiative dedicated to democratizing education. 
          We believe every student, regardless of location, deserves access to high-quality 
          study materials, expert guidelines, and live exams—completely free.
        </p>
      </section>

      {/* 2. STATS SECTION */}
      <section className="bg-white border-y border-slate-200 py-16 mb-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
                { label: "Active Students", value: "1,200+" },
                { label: "Study Notes", value: "5,000+" },
                { label: "Daily Visitors", value: "500+" },
                { label: "Expert Teachers", value: "50+" },
            ].map((stat, i) => (
                <div key={i}>
                    <h3 className="text-3xl md:text-4xl font-black text-slate-900 mb-1">{stat.value}</h3>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                </div>
            ))}
        </div>
      </section>

      {/* 3. MISSION & VISION */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
                {/* Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full blur-[100px] opacity-30"></div>
                <div className="relative z-10">
                    <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
                    <p className="text-slate-300 leading-relaxed mb-8">
                        To remove the barriers of cost and distance from education. We are building 
                        a digital ecosystem where an SSC student in a remote village has access 
                        to the same quality resources as a student in Dhaka.
                    </p>
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-xl">🚀</div>
                        <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl">💡</div>
                        <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center text-xl">🌍</div>
                    </div>
                </div>
            </div>
            
            <div className="space-y-8">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-3">Why NextPrepBD?</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Traditional coaching centers are expensive and time-consuming. We provide a 
                        smart alternative. Our platform is built by top university students and 
                        experienced teachers who understand the current curriculum perfectly.
                    </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-blue-600 text-2xl mb-2">📚</div>
                        <h4 className="font-bold text-slate-900">Verified Content</h4>
                        <p className="text-xs text-slate-500 mt-1">Checked by experts.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <div className="text-purple-600 text-2xl mb-2">⚡</div>
                        <h4 className="font-bold text-slate-900">Fast Updates</h4>
                        <p className="text-xs text-slate-500 mt-1">Latest routines & news.</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Ready to start learning?</h2>
        <Link href="/" className="inline-block bg-blue-600 text-white font-bold py-4 px-10 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-blue-200 hover:-translate-y-1">
            Explore Resources
        </Link>
      </section>

    </div>
  );
}