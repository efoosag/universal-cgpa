"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddCourseForm({
  yearId,
  semesterId,
  onAdd,
  gradingScale,
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creditUnit, setCreditUnit] = useState("");
  const [grade, setGrade] = useState(""); // optional
  const [isRetake, setIsRetake] = useState(false);

  // ✅ grade is no longer required
  const isDisabled =
  !name.trim() || Number(creditUnit) <= 0;

  const gradeOptions = Object.keys(gradingScale || {});
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled) return;

    onAdd(yearId, semesterId, {
      name: name.trim(),
      code: code.trim(),
      creditUnit: Number(creditUnit),
      grade: grade || null, // ✅ explicitly allow null
      isRetake,
    });

    setName("");
    setCode("");
    setCreditUnit("");
    setGrade("");
    setIsRetake(false);
  };
console.log(name, code, creditUnit, grade, )
  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border bg-white p-5 shadow-sm dark:bg-neutral-900">
      {/* Course Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Course name</label>
        <Input
          placeholder="e.g. Introduction to Economics"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Code & Credit */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          placeholder="Course code (optional)"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Input
          type="number"
          placeholder="Credit units"
          value={creditUnit}
          onChange={(e) => setCreditUnit(e.target.value)}
        />
      </div>

      {/* Grade (Optional) */}
      <div className="space-y-1">
        <label className="text-sm font-medium">
          Grade <span className="text-xs text-slate-500">(optional)</span>
        </label>

        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          <option value="">No grade yet</option>
          {gradeOptions.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <p className="text-xs text-slate-500">
          You can add a grade later or simulate it in the What-If panel.
        </p>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isDisabled}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        Add Course
      </Button>
    </form>
  );
}
