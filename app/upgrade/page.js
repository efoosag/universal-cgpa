"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUser(user);
    };

    getUser();
  }, [router]);

  const handleUpgrade = async () => {
    if (!user) return;

    setLoading(true);

    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: user.email,
        userId: user.id,
        currency: "NGN",
      }),
    });

    const data = await res.json();

    if (data.authorization_url) {
      window.location.href = data.authorization_url;
    } else {
      alert("Payment failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6">
      <h1 className="text-3xl font-bold mb-6">Upgrade to Pro</h1>

      <Button
        onClick={handleUpgrade}
        disabled={loading}
        className="bg-blue-600 text-white"
      >
        {loading ? "Processing..." : "Upgrade Now"}
      </Button>
    </div>
  );
}