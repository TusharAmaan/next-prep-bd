import { createClient } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Check if table exists (handled by SQL migration, but let's be safe)
    const { error } = await supabase
      .from("newsletter_subscribers")
      .upsert({ email, status: "active" }, { onConflict: "email" });

    if (error) throw error;

    return NextResponse.json({ success: true, message: "Subscribed successfully!" });
  } catch (error: any) {
    console.error("Newsletter API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
