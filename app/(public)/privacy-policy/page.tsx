export const metadata = {
  title: "Privacy Policy | NextPrepBD",
  description: "Privacy Policy and Data Protection guidelines for NextPrepBD users.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#FAFBFD] font-sans relative overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none blur-[100px] bg-gradient-to-b from-indigo-200 via-purple-100 to-transparent"></div>
      
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Header Section */}
        <div className="text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-sm font-bold uppercase tracking-widest shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Legal Documentation
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Privacy Policy
          </h1>
          <p className="text-lg text-slate-500 font-medium">
            Last Updated: <span className="text-indigo-600 font-bold">March 25, 2026</span>
          </p>
        </div>

        {/* Content Box */}
        <div className="bg-white/80 backdrop-blur-xl p-8 md:p-14 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/50 text-slate-700 leading-relaxed space-y-12">
            
            <section className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">1</div>
                  <h2 className="text-2xl font-bold text-slate-900">Introduction</h2>
                </div>
                <div className="pl-14 space-y-4">
                  <p className="text-lg">
                      Welcome to <strong className="text-slate-900">NextPrepBD</strong>. We respect your privacy and are committed to protecting your personal data using industry-leading security practices.
                  </p>
                  <p>
                      This privacy policy will inform you as to how we look after your personal data when you visit our website 
                      and tell you about your privacy rights and how the law protects you. Rest assured, your data is never sold to third parties.
                  </p>
                </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            <section className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">2</div>
                  <h2 className="text-2xl font-bold text-slate-900">Information We Collect</h2>
                </div>
                <div className="pl-14">
                  <p className="mb-4 text-lg">We carefully collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                      <h3 className="font-bold text-slate-900 mb-2">Identity Data</h3>
                      <p className="text-sm">Includes first name, last name, username, or any similar identifier you provide when registering.</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                      <h3 className="font-bold text-slate-900 mb-2">Contact Data</h3>
                      <p className="text-sm">Includes your billing address, delivery address, email address, and telephone numbers.</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                      <h3 className="font-bold text-slate-900 mb-2">Technical Data</h3>
                      <p className="text-sm">Includes IP address, browser type and version, time zone setting and location, operating system and platform.</p>
                    </div>
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all">
                      <h3 className="font-bold text-slate-900 mb-2">Usage Data</h3>
                      <p className="text-sm">Information about how you use our website, products, and services to deliver a better experience.</p>
                    </div>
                  </div>
                </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            <section className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">3</div>
                  <h2 className="text-2xl font-bold text-slate-900">How We Use Your Information</h2>
                </div>
                <div className="pl-14">
                  <p className="mb-4 text-lg">We generally use the information to maintain our website, provide customer support, detect fraud, and improve the user experience. Specifically:</p>
                  <ul className="space-y-3">
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>To provide and maintain our cutting-edge educational Service.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>To notify you about changes to our Service and new features.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>To allow you to participate in interactive features (like Quizzes/Exams).</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <div className="mt-1 w-2 h-2 rounded-full bg-indigo-500"></div>
                        <span>To provide analysis or valuable information so that we can constantly improve the Service.</span>
                      </li>
                  </ul>
                </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            <section className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">4</div>
                  <h2 className="text-2xl font-bold text-slate-900">Cookies & Trackers</h2>
                </div>
                <div className="pl-14 space-y-4">
                  <p className="text-lg">
                      NextPrepBD uses cookies to track user behavior and serve relevant educational content to you. 
                  </p>
                  <p>
                      Users may opt out of personalized tracking or advertising by visiting their <a href="https://www.google.com/settings/ads" target="_blank" className="text-indigo-600 font-bold hover:underline">Browser Settings</a>. Our cookies are strictly used to keep you logged in and track your exam progress.
                  </p>
                </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            <section className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">5</div>
                  <h2 className="text-2xl font-bold text-slate-900">Data Security</h2>
                </div>
                <div className="pl-14">
                  <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl inline-block w-full">
                    <h3 className="text-emerald-800 font-bold mb-2">Bank-Grade Encryption</h3>
                    <p className="text-emerald-700/80">
                        We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. 
                        We utilize modern Supabase-backed security protocols with row-level security (RLS) to ensure your exam scores and activity remain private.
                    </p>
                  </div>
                </div>
            </section>

            <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>

            <section className="group">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">6</div>
                  <h2 className="text-2xl font-bold text-slate-900">Contact Us</h2>
                </div>
                <div className="pl-14">
                  <p className="mb-4 text-lg">If you have any questions about this Privacy Policy, our team is always ready to help:</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                      <a href="mailto:support@nextprepbd.com" className="flex items-center gap-3 bg-slate-50 hover:bg-indigo-50 px-6 py-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">📧</div>
                          <div>
                            <span className="block text-xs uppercase tracking-widest font-bold text-slate-400">Email Us</span>
                            <span className="font-bold text-slate-900">support@nextprepbd.com</span>
                          </div>
                      </a>
                      <a href="tel:+8801745775697" className="flex items-center gap-3 bg-slate-50 hover:bg-indigo-50 px-6 py-4 rounded-xl border border-slate-200 hover:border-indigo-200 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">📞</div>
                          <div>
                            <span className="block text-xs uppercase tracking-widest font-bold text-slate-400">Call Us</span>
                            <span className="font-bold text-slate-900">+880 1745-775697</span>
                          </div>
                      </a>
                  </div>
                </div>
            </section>

        </div>
      </div>
    </div>
  );
}