"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GRADING_SCALES } from "@/lib/grading";

export default function OnboardingPage() {
  const router = useRouter();

  const { setProfile, initializeAcademicStructure, hasHydrated, isInitialized } =
    useAcademicStore();
  useEffect(() => {
    if (!hasHydrated) return;
    if (isInitialized) {
      router.replace("/dashboard");
    }
  }, [hasHydrated, isInitialized, router]);

  const [form, setForm] = useState({
    country: "",
    university: "",
    program: "",
    programYears: "",
    semestersPerYear: 2,
    gradingScaleId: "ng-5",
  });

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  function handleSubmit() {
    if (
      !form.country ||
      !form.university ||
      !form.program ||
      Number(form.programYears) <= 0
    ) {
      alert("Please complete all required fields.");
      return;
    }

    setProfile({
      country: form.country,
      university: form.university,
      program: form.program,
      programYears: Number(form.programYears),
      semestersPerYear: form.semestersPerYear,
      gradingScaleId: form.gradingScaleId,
    });

    initializeAcademicStructure(
      Number(form.programYears),
      form.semestersPerYear,
    );

    router.push("/dashboard");
  }
if (!hasHydrated) return null;
  return (
    <main
      className="
  min-h-screen
  bg-linear-to-br
  from-blue-50 via-white to-slate-100
  dark:from-slate-950 dark:via-slate-900 dark:to-slate-800
  flex items-center justify-center px-6
  transition-colors
"
    >
      <div className="w-full max-w-xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl shadow-sm border border-blue-300 dark:border-blue-700 p-8 space-y-8 transition-colors">
        {/* HEADER */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-blue-900 dark:text-blue-100">
            Academic Profile Setup
          </h1>
          <p className="text-blue-700 dark:text-blue-300">
            Provide your program details so we can create your academic
            structure.
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <Input
            placeholder="Country"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className="border border-blue-300 dark:border-blue-700 focus:ring-blue-500"
          />
          <Input
            placeholder="University"
            value={form.university}
            onChange={(e) => update("university", e.target.value)}
            className="border border-blue-300 dark:border-blue-700 focus:ring-blue-500"
          />
          <Input
            placeholder="Program (e.g. Computer Science)"
            value={form.program}
            onChange={(e) => update("program", e.target.value)}
            className="border border-blue-300 dark:border-blue-700 focus:ring-blue-500"
          />
          <Input
            type="number"
            placeholder="Program duration (years)"
            value={form.programYears}
            onChange={(e) => update("programYears", e.target.value)}
            className="border border-blue-300 dark:border-blue-700 focus:ring-blue-500"
          />

          {/* SEMESTERS */}
          <div>
            <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Semesters per year
            </label>
            <select
              value={form.semestersPerYear}
              onChange={(e) =>
                update("semestersPerYear", Number(e.target.value))
              }
              className="mt-1 w-full rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 p-2 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500"
            >
              <option value={2}>2 Semesters</option>
              <option value={3}>3 Semesters</option>
            </select>
          </div>

          {/* GRADING SCALE */}
          <div>
            <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
              Grading system
            </label>
            <select
              value={form.gradingScaleId}
              onChange={(e) => update("gradingScaleId", e.target.value)}
              className="mt-1 w-full rounded-xl border border-blue-300 dark:border-blue-700 bg-white dark:bg-slate-900 p-2 text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(GRADING_SCALES).map(([id, scale]) => (
                <option key={id} value={id}>
                  {scale.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INFO BOX */}
        <div className="rounded-xl bg-blue-50 dark:bg-slate-800 border border-blue-300 dark:border-blue-700 p-4 text-blue-900 dark:text-blue-100 text-sm">
          <strong>What happens next?</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Academic years are created automatically</li>
            <li>Each year will contain the correct number of semesters</li>
            <li>You’ll start adding courses per semester afterward</li>
          </ul>
        </div>

        {/* CTA BUTTON */}
        <Button
          size="lg"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
          onClick={handleSubmit}
        >
          Create Profile & Continue
        </Button>
      </div>
    </main>
  );
}
