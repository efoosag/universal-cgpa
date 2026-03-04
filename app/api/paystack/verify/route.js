import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing reference" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔹 Verify payment with Paystack
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await res.json();

    if (!data.status || data.data.status !== "success") {
      return new Response(
        JSON.stringify({ success: false, message: "Payment verification failed" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const email = data.data.customer.email;

    // 🔹 Find user profile by email
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    if (profileError || !profile) {
      console.error("Profile not found:", profileError);
      return new Response(
        JSON.stringify({ success: false, message: "User profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔹 Update profile to PRO
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        is_pro: true,
        plan_type: "pro",
        pro_expires_at: expiresAt,
      })
      .eq("id", profile.id);

    if (updateError) {
      console.error("Failed to update profile:", updateError);
      return new Response(
        JSON.stringify({ success: false, message: "Failed to update profile" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Payment verified, PRO activated" }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ success: false, message: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}