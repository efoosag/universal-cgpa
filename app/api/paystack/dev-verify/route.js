import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    // 🔹 Verify directly with Paystack
    const verifyRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const verifyData = await verifyRes.json();

    if (!verifyData.status || verifyData.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    const userId = verifyData.data.metadata.userId;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();

    await supabase
      .from("profiles")
      .update({
        is_pro: true,
        plan_type: "pro",
        pro_expires_at: expiresAt,
      })
      .eq("id", userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}