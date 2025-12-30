"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Supabase Admin Client (to bypass RLS for inserts if needed, or just use standard client)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function submitDonation(formData: FormData) {
  const name = formData.get("name") as string;
  const amount = formData.get("amount") as string;
  const method = formData.get("method") as string;
  const trxId = formData.get("trxId") as string;
  const message = formData.get("message") as string;
  const isAnonymous = formData.get("isAnonymous") === "on";

  if (!name || !amount || !trxId) {
    return { error: "Please fill in all required fields." };
  }

  const { error } = await supabase.from("donations").insert({
    name,
    amount: Number(amount),
    payment_method: method,
    transaction_id: trxId,
    message,
    is_anonymous: isAnonymous,
    status: "pending", // Default status
  });

  if (error) {
    if (error.code === '23505') return { error: "This Transaction ID has already been submitted." };
    return { error: "Failed to submit donation. Please try again." };
  }

  revalidatePath("/donate");
  return { success: true };
}