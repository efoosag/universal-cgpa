"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      // 🔥 Check if profile exists
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      // If profile does not exist → create it
      if (!profile) {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || "",
          is_pro: false,
        });
      }

      setLoading(false);
    };

    checkUser();
  }, []);

  if (loading) return null;

  return children;
}
