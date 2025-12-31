import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About NextPrepBD | Revolutionizing Education in Bangladesh",
  description: "NextPrepBD is Bangladesh's fastest-growing free education portal. We provide high-quality notes, suggestions, and question banks for SSC, HSC, and Admission candidates without the clutter.",
  keywords: ["NextPrepBD", "Education BD", "Free Notes", "SSC Suggestion", "HSC Question Bank", "Admission Prep", "NCTB"],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      
      {/* 1. HERO SECTION: THE HOOK */}
      <section className="max-w-5xl mx-auto px-6 mb-24 text-center">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-widest mb-6 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
          Our Story
        </div>
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1.1]">
          We are fixing the <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            broken learning experience
          </span>
          <br/> in Bangladesh.
        </h1>
        <p className="text-lg md:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Education should be simple, fast, and free. Yet, most students in Bangladesh struggle with 
          cluttered websites, broken links, and expensive paywalls. 
          <span className="font-bold text-slate-700"> NextPrepBD</span> is here to change that.
        </p>
      </section>

      {/* 2. STATS: SOCIAL PROOF */}
      <section className="bg-white border-y border-slate-200 py-16 mb-24 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-slate-50/50 -z-10"></div>
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100/0 md:divide-slate-200">
                {[
                    { label: "Students Helped", value: "15,000+" },
                    { label: "Resources Uploaded", value: "5,200+" },
                    { label: "Districts Reached", value: "64" },
                    { label: "Cost to Students", value: "0৳" },
                ].map((stat, i) => (
                    <div key={i} className="p-4">
                        <h3 className="text-4xl md:text-5xl font-black text-slate-900 mb-2 tracking-tighter">{stat.value}</h3>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>
        </div>
      </section>

      {/* 3. MISSION & VISION: THE "WHY" */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Mission Card */}
            <div className="bg-slate-900 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between h-full">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] -mr-20 -mt-20"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl mb-6 backdrop-blur-md">🚀</div>
                    <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
                    <p className="text-slate-300 leading-relaxed text-lg">
                        To democratize academic resources. We are building a centralized, open-source library where 
                        every SSC, HSC, and Admission candidate—whether from a village in Kurigram or a city in Dhaka—has 
                        equal access to the highest quality study materials.
                    </p>
                </div>
            </div>

            {/* Vision Card */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-10 md:p-14 text-slate-900 relative overflow-hidden shadow-sm flex flex-col justify-between h-full">
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/50 rounded-full blur-[120px] -ml-20 -mb-20"></div>
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-2xl mb-6 text-purple-600">👁️</div>
                    <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">
                        A Bangladesh where "lack of resources" is never the reason a student fails. We envision a future 
                        where technology bridges the gap between potential and opportunity, creating a generation of 
                        self-learners equipped for the future.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* 4. THE PROBLEM VS SOLUTION (COMPARISON) */}
      <section className="max-w-7xl mx-auto px-6 mb-24">
        <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Why We Are Different</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
                We analyzed the top educational websites in Bangladesh and found a common problem: <br/> 
                <span className="italic">they are built for ad revenue, not for students.</span> We took a different path.
            </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">⚡</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Lightning Fast</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Other sites are bloated with pop-ups and heavy scripts that kill your data plan. 
                    <span className="font-bold text-slate-700"> NextPrepBD</span> is built on modern tech (Next.js) for instant loading, even on 3G.
                </p>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-red-500 rounded-full"></div>
                </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">🎯</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Structured Learning</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    No more endless searching. We organize content logically: 
                    <span className="font-bold text-slate-700"> Segment &rarr; Group &rarr; Subject</span>. 
                    Find exactly what you need in 3 clicks or less.
                </p>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-full bg-blue-500 rounded-full"></div>
                </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center text-xl mb-6 group-hover:scale-110 transition-transform">✅</div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Content</h3>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">
                    Most sites copy-paste outdated info. Our notes are curated by university students 
                    and verified by teachers to ensure they match the latest <span className="font-bold text-slate-700">NCTB Syllabus</span>.
                </p>
                <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full w-[90%] bg-emerald-500 rounded-full"></div>
                </div>
            </div>
        </div>
      </section>

      {/* 5. TEAM / CREDIT */}
      <section className="max-w-4xl mx-auto px-6 text-center mb-24">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Who Builds NextPrepBD?</h2>
        <p className="text-slate-600 leading-relaxed text-lg">
            We are a collective of university students, software engineers, and passionate educators. 
            We were once in your shoes, frustrated by the lack of organized online resources. 
            We built the platform we wished we had.
        </p>
      </section>

      {/* 6. CTA */}
      <section className="px-6 text-center">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-10"></div>
            <div className="relative z-10">
                <h2 className="text-3xl md:text-5xl font-black mb-6">Stop Searching. Start Learning.</h2>
                <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                    Join thousands of students who have already switched to a smarter way of studying.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/" className="bg-white text-blue-700 font-bold py-4 px-10 rounded-xl hover:bg-blue-50 transition shadow-lg hover:shadow-white/20 transform hover:-translate-y-1">
                        Explore Resources
                    </Link>
                    <Link href="/contact" className="bg-blue-800/50 backdrop-blur-sm border border-blue-400/30 text-white font-bold py-4 px-10 rounded-xl hover:bg-blue-800 transition transform hover:-translate-y-1">
                        Contact Us
                    </Link>
                </div>
            </div>
        </div>
      </section>

    </div>
  );
}