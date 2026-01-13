import TutorSidebar from "@/components/tutor/TutorSidebar";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function TutorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Check Role (Security Gate)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "tutor" && profile?.role !== "admin") {
    // Ideally redirect to an "Unauthorized" or "Apply to be Tutor" page
    redirect("/"); 
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TutorSidebar />
      
      {/* Main Content Area - Offset by sidebar width on desktop */}
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Mobile Header Placeholder (You can add a real one later) */}
        <header className="lg:hidden h-16 bg-slate-900 flex items-center px-4 sticky top-0 z-40">
           <span className="font-bold text-white">NextPrep Tutor Dashboard</span>
        </header>

        <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}