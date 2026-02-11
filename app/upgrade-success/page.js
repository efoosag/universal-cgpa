"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function UpgradeSuccess() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = params.get("session_id");

    if (sessionId) {
      fetch("/api/verify-payment", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      }).then(() => {
        router.push("/dashboard");
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Verifying payment...</p>
    </div>
  );
}
