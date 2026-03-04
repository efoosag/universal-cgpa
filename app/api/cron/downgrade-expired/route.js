import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const now = new Date().toISOString();

  await supabase
    .from("profiles")
    .update({
      is_pro: false,
      plan_type: "free",
    })
    .lt("pro_expires_at", now);

  return NextResponse.json({ success: true });
}