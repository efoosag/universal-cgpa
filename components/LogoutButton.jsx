"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAcademicStore } from "@/store/academicStore";
import { supabase } from "@/lib/supabaseClient";

export default function LogoutButton() {
  const router = useRouter();
  const resetAll = useAcademicStore((s) => s.resetAll);

  async function handleLogout() {
    // 1️⃣ Sign out from Supabase
    await supabase.auth.signOut();

    // 2️⃣ Clear local persisted Zustand storage
    localStorage.removeItem("universal-cgpa-storage");

    // 3️⃣ Reset in-memory store
    resetAll();

    // 4️⃣ Redirect to login
    router.replace("/");
  }

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={handleLogout}
    >
      Logout
    </Button>
  );
}
