"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAcademicStore } from "@/store/academicStore";

export default function LogoutButton() {
  const router = useRouter();
  const resetAll = useAcademicStore((s) => s.resetAll);

  function handleLogout() {
    localStorage.removeItem("universal-cgpa-storage");
  resetAll();
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
