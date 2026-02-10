"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LogoutButton() {
  const router = useRouter();

  function handleLogout() {
    localStorage.clear();
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
