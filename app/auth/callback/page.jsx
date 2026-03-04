"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";

export default function AuthCallback() {
  const router = useRouter();
  const { fetchAcademicData, initializeAcademicStructure } =
    useAcademicStore();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // ✅ Supabase v2 way
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session) {
          router.replace("/login");
          return;
        }

        const user = session.user;

        // ✅ Check if profile exists
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        // ✅ Create minimal profile if none
        if (!profile) {
          await supabase.from("profiles").insert({
            id: user.id,
            email: user.email,
            full_name:
              user.user_metadata?.full_name ||
              user.user_metadata?.name ||
              "",
            is_pro: false,
            plan_type: "free",
          });

          router.replace("/onboarding");
          return;
        }

        // ✅ Ensure academic structure exists
        const { data: years } = await supabase
          .from("academic_years")
          .select("id")
          .eq("user_id", user.id)
          .limit(1);

        if (!years?.length) {
          await initializeAcademicStructure(
            profile.program_years || 4,
            profile.semesters_per_year || 2
          );
        }

        await fetchAcademicData();

        router.replace("/dashboard");
      } catch (err) {
        console.error("Auth handling failed:", err);
        router.replace("/login");
      }
    };

    handleAuth();
  }, [router, fetchAcademicData, initializeAcademicStructure]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      Processing login...
    </div>
  );
}