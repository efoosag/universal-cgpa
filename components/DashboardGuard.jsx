"use client"

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardGuard({ children }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {router.replace("/login");} else {setLoading(false)}
    };

    checkUser();
  }, []);

  if(loading) return null;

  return children;
}
