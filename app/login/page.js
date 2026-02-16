"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) alert(error.message);

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg dark:bg-gray-800">
        <h1 className="mb-6 text-2xl font-bold text-center">
          Login to Universal CGPA
        </h1>

        <button
          onClick={handleGoogleLogin}
          className="mb-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Continue with Google
        </button>

        <form onSubmit={handleEmailLogin}>
          <input
            type="email"
            placeholder="Enter your email"
            required
            className="mb-3 w-full rounded-md border px-3 py-2 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-black px-4 py-2 text-white"
          >
            {loading ? "Sending..." : "Login with Email"}
          </button>
        </form>
      </div>
    </div>
  );
}
