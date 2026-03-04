import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function POST(req) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature");

  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest("hex");

  if (hash !== signature) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 401 }
    );
  }

  const event = JSON.parse(rawBody);

  if (event.event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const data = event.data;
  const userId = data.metadata.userId;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // 🔹 Prevent duplicate webhook processing
  const { data: existingPayment } = await supabase
    .from("payments")
    .select("id")
    .eq("reference", data.reference)
    .single();

  if (existingPayment) {
    return NextResponse.json({ received: true });
  }

  // 🔹 Store payment
  await supabase.from("payments").insert({
    user_id: userId,
    reference: data.reference,
    amount: data.amount,
    currency: data.currency,
    status: data.status,
    paid_at: new Date(data.paid_at),
  });

  // 🔹 Get current subscription
  const { data: profile } = await supabase
    .from("profiles")
    .select("pro_expires_at")
    .eq("id", userId)
    .single();

  const now = new Date();
  let newExpiry;

  const currentExpiry = profile?.pro_expires_at
    ? new Date(profile.pro_expires_at)
    : null;

  // ✅ EXTEND by 1 year if active
  if (currentExpiry && currentExpiry > now) {
    currentExpiry.setFullYear(currentExpiry.getFullYear() + 1);
    newExpiry = currentExpiry;
  } else {
    // ✅ Restart from today for 1 year
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() + 1);
    newExpiry = startDate;
  }

  await supabase
    .from("profiles")
    .update({
      is_pro: true,
      plan_type: "pro",
      pro_expires_at: newExpiry.toISOString(),
    })
    .eq("id", userId);

  return NextResponse.json({ received: true });
}