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
  const [grade, setGrade] = useState("");
  const [isRetake, setIsRetake] = useState(false);

  const isDisabled = !name.trim() || !creditUnit || !grade;

  // Extract grade labels from grading scale
  const gradeOptions = Object.keys(gradingScale || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isDisabled) return;

    onAdd(yearId, semesterId, {
      name: name.trim(),
      code: code.trim(),
      creditUnit: Number(creditUnit),
      grade,
      isRetake,
    });

    setName("");
    setCode("");
    setCreditUnit("");
    setGrade("");
    setIsRetake(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-xl border
        bg-white p-4 shadow-sm"
    >
      <Input
        placeholder="Course name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          placeholder="Course code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />
        <Input
          type="number"
          min="0"
          placeholder="Credit units"
          value={creditUnit}
          onChange={(e) => setCreditUnit(e.target.value)}
        />
      </div>

      {/* ✅ Blue themed grade dropdown */}
      <select
        value={grade}
        onChange={(e) => setGrade(e.target.value)}
        className="
          w-full rounded-md border
          bg-white px-3 py-2 text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500
          focus:border-blue-500
          transition
        "
      >
        <option value="" disabled>
          Select grade
        </option>

        {gradeOptions.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm text-gray-600">
        <input
          type="checkbox"
          checked={isRetake}
          onChange={(e) => setIsRetake(e.target.checked)}
          className="accent-blue-500"
        />
        Retake course
      </label>

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
