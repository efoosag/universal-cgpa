"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        router.replace("/auth/callback");
      }
    };

    checkUser();
  }, [router]);

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 to-white dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-20">

        {/* Hero Section */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-800 dark:text-white">
            Universal <span className="text-blue-600 dark:text-blue-400">CGPA</span> Calculator
          </h1>

          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Track, calculate and simulate your academic performance across
            multiple grading systems — all in one place.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
            >
              Get Started
            </Link>

            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Login
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          {[
            {
              title: "Multi Grading Systems",
              desc: "Supports 4.0, 5.0, percentage and custom grading systems."
            },
            {
              title: "What-If Scenarios",
              desc: "Simulate future semester performance before exams."
            },
            {
              title: "Cloud Sync",
              desc: "Access your academic records on any device."
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-6 shadow-sm hover:shadow-md transition"
            >
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-24 text-center text-sm text-slate-500 dark:text-slate-500">
          © {new Date().getFullYear()} CGPA Pro. Built by Victor Osagie.
        </div>
      </div>
    </main>
  );
}
