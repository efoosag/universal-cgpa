"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Home() {
  const router = useRouter();
  

  useEffect(() => {
    const stored = localStorage.getItem("universal-cgpa-storage")
    if(stored){
      router.replace("/dashboard")
    }
  }, [router]);

   return (
    <main
      className="
        min-h-screen
        bg-linear-to-br
        from-blue-50 via-white to-slate-100
        dark:from-slate-950 dark:via-slate-900 dark:to-slate-800
        transition-colors
      "
    >
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-28 pb-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">
          Universal{" "}
          <span className="text-blue-600 dark:text-blue-400">
            CGPA Calculator
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10">
          Accurately calculate, track, and plan your CGPA across semesters and
          grading systems — all in one simple, reliable tool.
        </p>

        <div className="flex justify-center gap-4">
          <Link href="/onboarding">
            <Button size="lg" className="px-8" onClick={() => router.push("onboarding")}>
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white dark:bg-slate-900 py-20 border-t dark:border-slate-800 transition-colors">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-14">
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            <StepCard
              title="1. Add Your Courses"
              description="Enter your courses semester by semester, including credit units and grades — supporting multiple grading systems."
            />
            <StepCard
              title="2. Track Your CGPA"
              description="Instantly view your GPA per semester and cumulative CGPA with accurate calculations."
            />
            <StepCard
              title="3. Plan & Improve"
              description="Use What-If scenarios and target CGPA planning to understand what grades you need to reach your goals."
            />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-slate-100 mb-14">
            Why Students Love It
          </h2>

          <div className="grid md:grid-cols-2 gap-10">
            <Feature
              title="Multiple Grading Systems"
              description="Supports 4.0, 5.0, 10.0 scales and custom grading rules."
            />
            <Feature
              title="Semester-Based Organization"
              description="Courses are neatly grouped by academic year and semester."
            />
            <Feature
              title="What-If Analysis"
              description="Experiment with future grades and see how they affect your CGPA."
            />
            <Feature
              title="Clean & Distraction-Free"
              description="Focused purely on CGPA calculation, tracking, and planning."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-900 dark:bg-slate-950 text-white py-20 transition-colors">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-6">
            Take Control of Your Academic Journey
          </h2>
          <p className="text-slate-300 mb-8">
            Stop guessing your CGPA. Track it accurately, plan ahead, and
            graduate with confidence.
          </p>

          <Link href="/onboarding">
            <Button size="lg" variant="secondary" className="px-8" onClick={() => router.push("onboarding")}>
              Start Calculating
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}

/* ---------------- COMPONENTS ---------------- */

function StepCard({ title, description }) {
  return (
    <div className="p-8 rounded-2xl border bg-slate-50 dark:bg-slate-800 dark:border-slate-700 transition-colors">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}

function Feature({ title, description }) {
  return (
    <div className="p-8 rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700 transition-colors">
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-3">
        {title}
      </h3>
      <p className="text-slate-600 dark:text-slate-300">
        {description}
      </p>
    </div>
  );
}
