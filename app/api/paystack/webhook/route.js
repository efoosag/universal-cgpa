import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req) {
  const body = await req.json();

  if (body.event === "charge.success") {
    const userId = body.data.metadata.userId;

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    await supabase
      .from("profiles")
      .update({ is_pro: true })
      .eq("id", userId);
  }

  return NextResponse.json({ received: true });
}
