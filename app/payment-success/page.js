"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";

export default function PaymentSuccess({ searchParams }) {
  const router = useRouter();
  const { loadUserAndProfile } = useAcademicStore();
  const [status, setStatus] = useState("Verifying payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = searchParams.reference;

        const res = await fetch(`/api/paystack/verify?reference=${reference}`);
        const data = await res.json();

        if (data.success) {
          setStatus("Payment successful! PRO activated.");
          await loadUserAndProfile(); // Refresh profile so dashboard shows PRO
        } else {
          setStatus(`Payment verification failed: ${data.message}`);
        }
      } catch (err) {
        console.error(err);
        setStatus("Error verifying payment. Try again.");
      }
    };

    if (searchParams?.reference) {
      verifyPayment();
    } else {
      setStatus("No payment reference found.");
    }
  }, [searchParams, loadUserAndProfile]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 space-y-4">
      <h1 className="text-2xl font-bold">{status}</h1>
      <Button onClick={() => router.push("/dashboard")}>Go to Dashboard</Button>
    </div>
  );
}