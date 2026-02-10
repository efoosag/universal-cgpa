"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardGuard({ children }) {
  const router = useRouter();

  useEffect(() => {
    const data = localStorage.getItem("universal-cgpa-storage");
    if (!data) {
      router.replace("/onboarding");
    }
  }, []);

  return children;
}