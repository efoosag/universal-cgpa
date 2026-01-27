"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GRADING_SCALES } from "@/lib/grading"; // Make sure this file exports an object

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, initializeAcademicStructure } = useAcademicStore();

  const [form, setForm] = useState({
    country: "",
    university: "",
    program: "",
    programYears: 0,
    semestersPerYear: 2, // default
    gradingScaleId: "ng-5", // default
  });

  function handleSubmit() {
    // Basic validation
    if (!form.country || !form.university || !form.program || form.programYears <= 0) {
      alert("Please fill all required fields correctly!");
      return;
    }

    setProfile(form);
    initializeAcademicStructure(form.programYears, form.semestersPerYear);

    router.push("/dashboard");
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Academic Setup</h1>

      <Input
        placeholder="Enter your country"
        value={form.country}
        onChange={(e) => setForm({ ...form, country: e.target.value })}
      />

      <Input
        placeholder="Enter your university"
        value={form.university}
        onChange={(e) => setForm({ ...form, university: e.target.value })}
      />

      <Input
        placeholder="Enter your program"
        value={form.program}
        onChange={(e) => setForm({ ...form, program: e.target.value })}
      />

      <Input
        type="number"
        placeholder="Program duration (years)"
        value={form.programYears || ""}
        onChange={(e) =>
          setForm({ ...form, programYears: Number(e.target.value) })
        }
      />

      {/* Semesters per year dropdown: only 2 or 3 */}
      <select
        value={form.semestersPerYear}
        onChange={(e) => setForm({ ...form, semestersPerYear: Number(e.target.value) })}
        className="w-full border rounded p-2"
      >
        <option value={2}>2 Semesters per year</option>
        <option value={3}>3 Semesters per year</option>
      </select>

      {/* Grading scale dropdown */}
      <select
        value={form.gradingScaleId}
        onChange={(e) => setForm({ ...form, gradingScaleId: e.target.value })}
        className="w-full border rounded p-2"
      >
        {Object.entries(GRADING_SCALES).map(([key, scale]) => (
          <option key={key} value={key}>
            {scale.label}
          </option>
        ))}
      </select>

      <Button className="w-full mt-2" onClick={handleSubmit}>
        Continue to Dashboard
      </Button>
    </div>
  );
}
