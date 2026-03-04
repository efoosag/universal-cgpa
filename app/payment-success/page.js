"use client";

// import { useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { useAcademicStore } from "@/store/academicStore";
// import { Button } from "@/components/ui/button";

// export default function PaymentSuccess() {
//   const router = useRouter();
//   const { loadUserAndProfile } = useAcademicStore();

//   useEffect(() => {
//     loadUserAndProfile();
//   }, [loadUserAndProfile]);

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-6">
//       <h1 className="text-2xl font-bold">
//         🎉 Payment successful! PRO activated.
//       </h1>

//       <Button onClick={() => router.push("/dashboard")}>
//         Go to Dashboard
//       </Button>
//     </div>
//   );
// }

// local development

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const reference = searchParams.get("reference");

    if (!reference) {
      setStatus("No payment reference found.");
      return;
    }

    const verifyPayment = async () => {
      const res = await fetch(
        `/api/paystack/dev-verify?reference=${reference}`
      );

      const data = await res.json();

      if (data.success) {
        setStatus("🎉 PRO activated successfully!");
      } else {
        setStatus("Verification failed.");
      }
    };

    verifyPayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
      <h1 className="text-2xl font-bold">{status}</h1>

      <Button onClick={() => router.push("/dashboard")}>
        Go to Dashboard
      </Button>
    </div>
  );
}