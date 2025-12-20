export const metadata = {
  title: "Privacy Policy | NextPrepBD",
  description: "Privacy Policy and Data Protection guidelines for NextPrepBD users.",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-6">
        
        {/* Header */}
        <div className="mb-12 border-b border-slate-200 pb-8">
            <h1 className="text-4xl font-black text-slate-900 mb-4">Privacy Policy</h1>
            <p className="text-slate-500">Last Updated: December 20, 2025</p>
        </div>

        {/* Content - Using standard styling for readability */}
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200 text-slate-700 leading-relaxed space-y-8">
            
            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">1. Introduction</h2>
                <p>
                    Welcome to <strong>NextPrepBD</strong>. We respect your privacy and are committed to protecting your personal data. 
                    This privacy policy will inform you as to how we look after your personal data when you visit our website 
                    and tell you about your privacy rights and how the law protects you.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">2. Information We Collect</h2>
                <p className="mb-2">We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                <ul className="list-disc pl-5 space-y-1 text-slate-600">
                    <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                    <li><strong>Contact Data:</strong> includes email address and telephone numbers.</li>
                    <li><strong>Technical Data:</strong> includes internet protocol (IP) address, browser type and version, time zone setting and location, browser plug-in types and versions, operating system and platform.</li>
                    <li><strong>Usage Data:</strong> includes information about how you use our website, products and services.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">3. How We Use Your Information</h2>
                <p>We generally use the information to maintain our website, provide customer support, detect fraud, and improve the user experience. Specifically:</p>
                <ul className="list-disc pl-5 space-y-1 mt-2 text-slate-600">
                    <li>To provide and maintain our Service.</li>
                    <li>To notify you about changes to our Service.</li>
                    <li>To allow you to participate in interactive features (like Quizzes/Exams).</li>
                    <li>To provide analysis or valuable information so that we can improve the Service.</li>
                </ul>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">4. Google AdSense & Cookies</h2>
                <p className="mb-3">
                    NextPrepBD uses <strong>Google AdSense</strong> to display ads. Google uses cookies to serve ads based on a user's prior visits to your website or other websites.
                </p>
                <p>
                    Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet. 
                    Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" className="text-blue-600 hover:underline">Ads Settings</a>.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">5. Data Security</h2>
                <p>
                    We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it. 
                    But remember that no method of transmission over the internet, or method of electronic storage is 100% secure and reliable, and we cannot guarantee its absolute security.
                </p>
            </section>

            <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3">6. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, please contact us:</p>
                <ul className="mt-2 space-y-1 font-medium text-slate-900">
                    <li>By email: support@nextprepbd.com</li>
                    <li>By phone: +8801745775697</li>
                </ul>
            </section>

        </div>
      </div>
    </div>
  );
}