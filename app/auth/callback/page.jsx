"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      // If no profile → create minimal one
      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name:
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            "",
          is_pro: false,
          onboarding_completed: false,
        });

        router.replace("/onboarding");
        return;
      }

      // If onboarding incomplete
      // if (!profile.onboarding_completed) {
      //   router.replace("/onboarding");
      //   return;
      // }

      // Otherwise go to dashboard
      router.replace("/dashboard");
    };

    handleAuth();
  }, [router]);

  return null;
}
