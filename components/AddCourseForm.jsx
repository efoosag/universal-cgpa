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
      className="
        space-y-4 rounded-2xl border
        bg-white p-5 shadow-sm
        dark:border-neutral-800 dark:bg-neutral-900
      "
    >
      {/* Course Name */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Course name
        </label>
        <Input
          placeholder="e.g. Introduction to Economics"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Course Code & Credit Unit */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Course code
          </label>
          <Input
            placeholder="e.g. ECO 101"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Credit units
          </label>
          <Input
            type="number"
            min="0"
            placeholder="e.g. 3"
            value={creditUnit}
            onChange={(e) => setCreditUnit(e.target.value)}
          />
        </div>
      </div>

      {/* Grade */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Grade
        </label>
        <select
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="
            w-full rounded-md border px-3 py-2 text-sm
            bg-white text-gray-900
            focus:outline-none focus:ring-2 focus:ring-blue-500
            dark:bg-neutral-800 dark:text-gray-100
            dark:border-neutral-700
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
      </div>

      {/* Retake */}
      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
        <input
          type="checkbox"
          checked={isRetake}
          onChange={(e) => setIsRetake(e.target.checked)}
          className="h-4 w-4 accent-blue-600"
        />
        Retake course
      </label>

      {/* Submit */}
      <Button
        type="submit"
        disabled={isDisabled}
        className="
          w-full rounded-lg bg-blue-600
          hover:bg-blue-700
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        Add Course
      </Button>
    </form>
  );
}
