"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GRADING_SCALES } from "@/lib/grading";

export default function OnboardingPage() {
  const router = useRouter();

  const {
    setProfile,
    initializeAcademicStructure,
    hasHydrated,
    isInitialized,
  } = useAcademicStore();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single();

      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
      }
    };

    checkUser();
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

  async function handleSubmit() {
  if (
    !form.country ||
    !form.university ||
    !form.program ||
    Number(form.programYears) <= 0
  ) {
    alert("Please complete all required fields.");
    return;
  }

  setLoading(true);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    router.replace("/login");
    return;
  }

  // 1️⃣ Update profile table
  const { error } = await supabase
    .from("profiles")
    .update({
      country: form.country,
      university: form.university,
      program: form.program,
      program_years: Number(form.programYears),
      semesters_per_year: form.semestersPerYear,
      grading_scale_id: form.gradingScaleId,
      onboarding_completed: true,
    })
    .eq("id", user.id);

  if (error) {
    alert(error.message);
    setLoading(false);
    return;
  }

  // 2️⃣ Generate structure ONCE
  const academicStructure = Array.from(
    { length: Number(form.programYears) },
    (_, y) => ({
      id: crypto.randomUUID(),
      title: `Year ${y + 1}`,
      semesters: Array.from({ length: form.semestersPerYear }, (_, s) => ({
        id: crypto.randomUUID(),
        title: `Semester ${s + 1}`,
        status: "planned",
        courses: [],
      })),
    }),
  );

  // 3️⃣ Save ONE row per user
  const { error: recordError } = await supabase
    .from("academic_records")
    .upsert({
      user_id: user.id,
      data: academicStructure,
      updated_at: new Date().toISOString(),
    });

  if (recordError) {
    alert(recordError.message);
    setLoading(false);
    return;
  }

  // 4️⃣ Update Zustand profile
  setProfile({
    country: form.country,
    university: form.university,
    program: form.program,
    programYears: Number(form.programYears),
    semestersPerYear: form.semestersPerYear,
    gradingScaleId: form.gradingScaleId,
  });

  // 5️⃣ Hydrate Zustand using SAME structure
  useAcademicStore.getState().hydrateAcademicData(academicStructure);
  
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
      transition-colors duration-300
      "
    >
      <div
        className="
        group w-full max-w-xl
        bg-white/90 dark:bg-slate-900/90
        backdrop-blur-md
        rounded-2xl
        shadow-sm hover:shadow-lg
        border border-blue-200 dark:border-blue-700
        p-8 space-y-8
        transition-all duration-300
        "
      >
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
            className="border-blue-300 dark:border-blue-700 focus:ring-blue-500"
          />

          <Input
            placeholder="University"
            value={form.university}
            onChange={(e) => update("university", e.target.value)}
            className="border-blue-300 dark:border-blue-700 focus:ring-blue-500"
          />

          <Input
            placeholder="Program (e.g. Computer Science)"
            value={form.program}
            onChange={(e) => update("program", e.target.value)}
            className="border-blue-300 dark:border-blue-700 focus:ring-blue-500"
          />

          <Input
            type="number"
            placeholder="Program duration (years)"
            value={form.programYears}
            onChange={(e) => update("programYears", e.target.value)}
            className="border-blue-300 dark:border-blue-700 focus:ring-blue-500"
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
              className="
              mt-1 w-full rounded-xl
              border border-blue-300 dark:border-blue-700
              bg-white dark:bg-slate-900
              p-2
              text-blue-900 dark:text-blue-100
              focus:ring-2 focus:ring-blue-500
              transition
              "
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
              className="
              mt-1 w-full rounded-xl
              border border-blue-300 dark:border-blue-700
              bg-white dark:bg-slate-900
              p-2
              text-blue-900 dark:text-blue-100
              focus:ring-2 focus:ring-blue-500
              transition
              "
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
        <div
          className="
          rounded-xl
          bg-blue-50 dark:bg-slate-800
          border border-blue-200 dark:border-blue-700
          p-4
          text-blue-900 dark:text-blue-100
          text-sm
          transition
          "
        >
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
          disabled={loading}
          className="
          w-full
          bg-blue-600 hover:bg-blue-700
          text-white
          dark:bg-blue-500 dark:hover:bg-blue-600
          transition-all duration-200
          disabled:opacity-50
          "
          onClick={handleSubmit}
        >
          {loading ? "Creating Profile..." : "Create Profile & Continue"}
        </Button>
      </div>
    </main>
  );
}
