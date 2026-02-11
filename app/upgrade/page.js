"use client";

import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function UpgradePage() {
  const router = useRouter();
  const { isPro, upgradeToPro } = useAcademicStore();

  if (isPro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-green-600">
            You're Already Pro 🎉
          </h1>
          <Button onClick={() => router.push("/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6">

      {/* HERO */}
      <div className="max-w-4xl mx-auto text-center mt-12 space-y-6">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Upgrade to Pro
        </h1>

        <p className="text-lg text-slate-600 dark:text-slate-400">
          Unlock advanced academic analytics and export tools to take control
          of your academic future.
        </p>
      </div>

      {/* PRICING CARD */}
      <div className="max-w-md mx-auto mt-12">
        <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-700 p-8 space-y-6">

          <div className="text-center">
            <h2 className="text-2xl font-bold">Pro Plan</h2>
            <p className="text-4xl font-bold text-blue-600 mt-3">
              ₦2,000
            </p>
            <p className="text-sm text-slate-500">
              One-time payment
            </p>
          </div>

          <div className="space-y-4">
            <Feature text="Unlimited What-If Simulations" />
            <Feature text="Advanced Target GPA Planner" />
            <Feature text="PDF & Excel Export" />
            <Feature text="Future AI Insights (coming soon)" />
            <Feature text="Priority Feature Updates" />
          </div>

          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => {
              // temporary local upgrade (replace later with Stripe)
              upgradeToPro();
              router.push("/dashboard");
            }}
          >
            Upgrade Now
          </Button>

          <p className="text-xs text-center text-slate-400">
            Secure payment • Instant activation
          </p>
        </div>
      </div>

      {/* FREE VS PRO COMPARISON */}
      <div className="max-w-5xl mx-auto mt-20">
        <h2 className="text-2xl font-semibold text-center mb-10">
          Free vs Pro
        </h2>

        <div className="grid md:grid-cols-2 gap-6">

          <ComparisonCard
            title="Free Plan"
            features={[
              "Basic GPA calculation",
              "Limited simulations",
              "Basic planner",
              "No export",
            ]}
          />

          <ComparisonCard
            title="Pro Plan"
            highlight
            features={[
              "Unlimited GPA simulations",
              "Advanced AI planner",
              "PDF & Excel export",
              "Future premium features",
            ]}
          />
        </div>
      </div>
    </main>
  );
}

function Feature({ text }) {
  return (
    <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
      <CheckCircle className="text-green-500" size={18} />
      <span>{text}</span>
    </div>
  );
}

function ComparisonCard({ title, features, highlight }) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        highlight
          ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
          : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
      }`}
    >
      <h3 className="text-xl font-semibold mb-4">{title}</h3>

      <ul className="space-y-3 text-sm">
        {features.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
