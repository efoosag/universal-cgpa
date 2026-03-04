"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchPayments = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setPayments(data || []);
    };

    fetchPayments();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment History</h1>

      {payments.length === 0 && <p>No payments yet.</p>}

      {payments.map((payment) => (
        <div
          key={payment.id}
          className="border p-4 rounded mb-3"
        >
          <p>Amount: {payment.currency} {payment.amount / 100}</p>
          <p>Status: {payment.status}</p>
          <p>Date: {new Date(payment.paid_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}