import { supabase } from "@/lib/supabaseClient";

export async function POST(req) {
  try {
    const { email, userId, currency = "NGN" } = await req.json();

    if (!email || !userId) {
      return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
    }

    // Amount in kobo (NGN) or cents (USD)
    const amount = currency === "NGN" ? 1000000 : 900; // ₦10,000 or $9
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY;

    const body = {
      email,
      amount,
      currency,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
      metadata: { userId },
    };

    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.status) {
      return new Response(JSON.stringify({ error: "Payment initialization failed" }), { status: 400 });
    }

    return new Response(JSON.stringify({ authorization_url: data.data.authorization_url }));
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}