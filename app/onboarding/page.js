"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GRADING_SCALES } from "@/lib/grading";

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, initializeAcademicStructure } = useAcademicStore();

  const [form, setForm] = useState({
    country: "",
    university: "",
    program: "",
    programYears: "",
    semestersPerYear: 2,
    gradingScaleId: "ng-5",
  });

  const update = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

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
      form.semestersPerYear
    );

    router.push("/dashboard");
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-xl bg-white/80 backdrop-blur rounded-2xl shadow-md border border-slate-200 p-8 space-y-8">
        {/* HEADER */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-bold text-slate-900">
            Academic Profile Setup
          </h1>
          <p className="text-slate-600">
            Tell us about your program so we can automatically create your
            academic years and semesters.
          </p>
        </div>

        {/* FORM */}
        <div className="space-y-4">
          <Input
            placeholder="Country"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
          />

          <Input
            placeholder="University"
            value={form.university}
            onChange={(e) => update("university", e.target.value)}
          />

          <Input
            placeholder="Program (e.g. Computer Science)"
            value={form.program}
            onChange={(e) => update("program", e.target.value)}
          />

          <Input
            type="number"
            placeholder="Program duration (years)"
            value={form.programYears}
            onChange={(e) => update("programYears", e.target.value)}
          />

          {/* SEMESTERS */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Semesters per year
            </label>
            <select
              value={form.semestersPerYear}
              onChange={(e) =>
                update("semestersPerYear", Number(e.target.value))
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2"
            >
              <option value={2}>2 Semesters</option>
              <option value={3}>3 Semesters</option>
            </select>
          </div>

          {/* GRADING SCALE */}
          <div>
            <label className="text-sm font-medium text-slate-700">
              Grading system
            </label>
            <select
              value={form.gradingScaleId}
              onChange={(e) =>
                update("gradingScaleId", e.target.value)
              }
              className="mt-1 w-full rounded-md border border-slate-300 bg-white p-2"
            >
              {Object.entries(GRADING_SCALES).map(([id, scale]) => (
                <option key={id} value={id}>
                  {scale.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INFO */}
        <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900">
          <strong>What happens next?</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Your academic years are created automatically</li>
            <li>Each year contains the correct number of semesters</li>
            <li>You’ll then start adding courses per semester</li>
          </ul>
        </div>

        {/* CTA */}
        <Button size="lg" className="w-full" onClick={handleSubmit}>
          Create Profile & Continue
        </Button>
      </div>
    </main>
  );
}
