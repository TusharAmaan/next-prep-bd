import { Metadata } from "next";
import Link from "next/link";
import { 
  GraduationCap, Banknote, TrendingUp, Users, 
  Search, Rocket, ArrowRight, CheckCircle2, Mail 
} from "lucide-react";

export const metadata: Metadata = {
  title: "Join as a Teacher | NextPrepBD",
  description: "Become an instructor on NextPrepBD. Earn money by sharing notes and promote your profile to thousands of students looking for tutors.",
};

export default function JoinTeacherPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-28 pb-20">
      
      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 mb-20">
        <div className="bg-[#1e1b4b] rounded-3xl p-8 md:p-16 relative overflow-hidden text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-12">
            
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/20 rounded-full blur-[80px] pointer-events-none -ml-10 -mb-10"></div>

            {/* Content */}
            <div className="relative z-10 max-w-2xl">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-6">
                    <Rocket className="w-3 h-3" /> Coming Soon
                </span>
                <h1 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
                    Teach, Inspire, & <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Earn Revenue.</span>
                </h1>
                <p className="text-lg text-indigo-100 mb-8 leading-relaxed max-w-xl">
                    NextPrepBD is building the largest ecosystem for educators in Bangladesh. Soon, you will be able to monetize your premium content and get hired by students as a private tutor.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                    <button disabled className="px-8 py-3.5 bg-white text-slate-900 rounded-xl font-bold text-sm opacity-80 cursor-not-allowed">
                        Registration Opens Soon
                    </button>
                    <a href="#early-access" className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-all border border-indigo-500/50 flex items-center gap-2">
                        Get Early Access <ArrowRight className="w-4 h-4"/>
                    </a>
                </div>
            </div>

            {/* Visual Icon/Graphic */}
            <div className="relative z-10 hidden md:block">
                <div className="w-64 h-64 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                    <GraduationCap className="w-32 h-32 text-indigo-300 opacity-80" />
                </div>
                {/* Floating Badges */}
                <div className="absolute -bottom-6 -left-12 bg-white p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce duration-[3000ms]">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"><Banknote className="w-5 h-5"/></div>
                    <div>
                        <p className="text-xs text-slate-400 font-bold uppercase">Estimated Earnings</p>
                        <p className="text-slate-900 font-black">৳15,000+</p>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* VALUE PROPOSITION GRID */}
      <section className="max-w-6xl mx-auto px-6 mb-24">
        <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Why Join NextPrepBD?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We provide the tools you need to build your personal brand and generate a steady income stream from your knowledge.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Earn Money */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                    <Banknote className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Monetize Content</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                    Upload high-quality notes, suggestions, and video courses. Set your price, and earn royalties every time a student purchases your material.
                </p>
            </div>

            {/* Card 2: Find Tutor Profile */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform">
                    <Search className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">"Find Tutor" Profile</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                    Create a professional profile on our upcoming <strong>"Find Tutor"</strong> search engine. Students in your area can discover you and hire you for private tuition directly.
                </p>
            </div>

            {/* Card 3: Impact & Reach */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Build Your Brand</h3>
                <p className="text-slate-500 leading-relaxed text-sm">
                    Reach thousands of active students daily. Build a reputation as a top educator by providing free resources and answering community questions.
                </p>
            </div>
        </div>
      </section>

      {/* HOW IT WILL WORK PREVIEW */}
      <section className="bg-white border-y border-slate-100 py-20 mb-20">
        <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 mb-6">How It Will Work</h2>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">1</div>
                            <div>
                                <h4 className="font-bold text-slate-900">Create Instructor Account</h4>
                                <p className="text-sm text-slate-500 mt-1">Sign up with your academic credentials and verify your identity.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">2</div>
                            <div>
                                <h4 className="font-bold text-slate-900">Upload & Publish</h4>
                                <p className="text-sm text-slate-500 mt-1">Use our advanced editor to create courses, quizzes, or upload PDF notes.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold shrink-0">3</div>
                            <div>
                                <h4 className="font-bold text-slate-900">Start Earning</h4>
                                <p className="text-sm text-slate-500 mt-1">Withdraw your earnings directly to your bKash, Nagad, or Bank account.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                     <div className="space-y-4 opacity-50 blur-[1px] select-none pointer-events-none">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-32 bg-slate-200 rounded w-full"></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="h-10 bg-slate-200 rounded"></div>
                            <div className="h-10 bg-slate-200 rounded"></div>
                        </div>
                     </div>
                     <div className="absolute inset-0 flex items-center justify-center">
                         <div className="bg-white px-6 py-3 rounded-xl shadow-lg border border-slate-100 font-bold text-slate-800 flex items-center gap-2">
                             <TrendingUp className="w-5 h-5 text-indigo-600"/> Dashboard Preview
                         </div>
                     </div>
                </div>
            </div>
        </div>
      </section>

      {/* EARLY ACCESS CTA */}
      <section id="early-access" className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-indigo-600 rounded-3xl p-10 md:p-14 shadow-2xl shadow-indigo-200 relative overflow-hidden">
              <div className="relative z-10">
                  <h2 className="text-3xl font-black text-white mb-4">Want to Join the Beta?</h2>
                  <p className="text-indigo-100 mb-8 font-medium">
                      We are manually onboarding a few select teachers before the public launch. 
                      If you have high-quality content ready, send us your CV or portfolio.
                  </p>
                  <Link 
                    href="mailto:careers@nextprepbd.com?subject=Teacher%20Application%20-%20[Your%20Name]" 
                    className="inline-flex items-center gap-2 px-8 py-3 bg-white text-indigo-700 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
                  >
                      <Mail className="w-5 h-5" /> Send CV for Early Access
                  </Link>
                  <p className="mt-6 text-xs text-indigo-200 font-medium opacity-70">
                      * Limited spots available for the beta program.
                  </p>
              </div>

              {/* Decorative Circle */}
              <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-900/20 rounded-full blur-3xl"></div>
          </div>
      </section>

    </div>
  );
}