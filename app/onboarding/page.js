"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function OnboardingPage() {
  const router = useRouter();
  const { setProfile, initializeAcademicStructure } = useAcademicStore();

  const [form, setForm] = useState({
    country: "",
    university: "",
    program: "",
    programYears: 4,
    semestersPerYear: 2,
  });

  function handleSubmit() {
    setProfile(form);

    initializeAcademicStructure(
      form.programYears,
      form.semestersPerYear
    );

    router.push("/dashboard");
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Academic Setup</h1>

      <Input
        placeholder="Country"
        value={form.country}
        onChange={(e) => setForm({ ...form, country: e.target.value })}
      />

      <Input
        placeholder="University"
        value={form.university}
        onChange={(e) => setForm({ ...form, university: e.target.value })}
      />

      <Input
        placeholder="Program"
        value={form.program}
        onChange={(e) => setForm({ ...form, program: e.target.value })}
      />

      <Input
        type="number"
        placeholder="Program Duration (years)"
        value={form.programYears}
        onChange={(e) =>
          setForm({ ...form, programYears: Number(e.target.value) })
        }
      />

      <Input
        type="number"
        placeholder="Semesters per year (2 or 3)"
        value={form.semestersPerYear}
        onChange={(e) =>
          setForm({ ...form, semestersPerYear: Number(e.target.value) })
        }
      />

      <Button className="w-full" onClick={handleSubmit}>
        Continue to Dashboard
      </Button>
    </div>
  );
}
