import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { dodo } from '@/lib/dodo';

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { plan } = await req.json(); // 'monthly' or 'yearly'

  // 1. Define Product IDs (Create these in Dodo Dashboard first!)
  // Replace these strings with actual Product IDs from Dodo
  const productId = plan === 'monthly' ? 'pdt_monthly_id' : 'pdt_yearly_id'; 
  const amount = plan === 'monthly' ? 500 : 5000; // Your price in BDT (converted to USD/cent if needed by Dodo)

  try {
    const session = await dodo.payments.create({
      billing: {
        city: "Dhaka",
        country: "BD", // Default country or get from user profile
        state: "Dhaka",
        street: "123 Street",
        zipcode: "1000"
      },
      customer: {
        email: user.email!,
        name: user.user_metadata?.full_name || "Tutor",
      },
      product_cart: [{ product_id: productId, quantity: 1 }],
      payment_link: true,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/tutor/dashboard/subscription?success=true`,
      metadata: {
        user_id: user.id, // CRITICAL: Pass User ID to webhook
        plan_type: `pro_${plan}`
      }
    });

    return NextResponse.json({ url: session.payment_link });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}