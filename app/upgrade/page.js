"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function UpgradePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace("/login");
      setUser(user);
    };
    getUser();
  }, [router]);

  const handleUpgrade = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          userId: user.id,
          currency: "NGN",
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert("Payment initialization failed. Try again.");
        setLoading(false);
        return;
      }

      window.location.href = data.authorization_url;
    } catch (err) {
      alert("Payment initialization failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-slate-950">
      <h1 className="text-3xl font-bold mb-6">Upgrade to Pro</h1>
      <p className="mb-6 text-center">
        Unlock advanced academic analytics, export tools, and simulations.
      </p>
      <div className="flex gap-4">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleUpgrade} disabled={loading}>
          {loading ? "Processing..." : "Upgrade Now"}
        </Button>
        <Button className="bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600" onClick={() => router.push("/dashboard")}>
          Cancel
        </Button>
      </div>
    </div>
  );
}