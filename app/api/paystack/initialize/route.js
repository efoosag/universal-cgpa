import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  try {
    const { email, userId, currency = "NGN" } = await req.json();

    if (!email || !userId) {
      return NextResponse.json(
        { error: "Missing parameters" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 🔹 Check current subscription
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_pro, pro_expires_at")
      .eq("id", userId)
      .single();

    const now = new Date();

    if (
      profile?.is_pro &&
      profile?.pro_expires_at &&
      new Date(profile.pro_expires_at) > now
    ) {
      return NextResponse.json(
        { error: "You already have an active PRO subscription." },
        { status: 400 }
      );
    }

    const amount = currency === "NGN" ? 1000000 : 900;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount,
          currency,
          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment-success`,
          metadata: {
            userId,
          },
        }),
      }
    );

    const data = await response.json();

    if (!data.status) {
      return NextResponse.json(
        { error: "Payment initialization failed" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}