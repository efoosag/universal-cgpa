"use client";

import { useState, useMemo } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { calculateCGPA } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AISmartPlanner({ gradingScale }) {
  const { years } = useAcademicStore();
  const [target, setTarget] = useState("");
  const [suggestion, setSuggestion] = useState(null);

  const gradeEntries = Object.entries(gradingScale).sort(
    (a, b) => b[1] - a[1], // highest grade first
  );

  const allCourses = useMemo(
    () =>
      years.flatMap((y) =>
        y.semesters.flatMap((s) => s.courses),
      ),
    [years],
  );

  const currentCGPA = useMemo(
    () => calculateCGPA(years, gradingScale),
    [years, gradingScale],
  );

  const handleSuggest = () => {
    if (!target || allCourses.length === 0) return;

    const overrides = {};
    let achieved = false;

    for (const [grade] of gradeEntries) {
      allCourses.forEach((c) => {
        overrides[c.id] = grade;
      });

      const simulated = calculateCGPA(
        years,
        gradingScale,
        overrides,
      );

      if (Number(simulated) >= Number(target)) {
        achieved = true;
        setSuggestion({
          grade,
          simulated,
          status: "achievable",
        });
        break;
      }
    }

    if (!achieved) {
      setSuggestion({
        status: "unlikely",
        simulated: currentCGPA,
      });
    }
  };

  return (
    <div
      className="
        rounded-2xl border p-5 space-y-4
        bg-white border-slate-200 shadow-sm
        dark:bg-slate-900 dark:border-slate-700
      "
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        AI Grade Planner
      </h3>

      <p className="text-sm text-slate-600 dark:text-slate-400">
        Enter your target CGPA and let the system suggest the minimum grades
        required to reach it.
      </p>

      <Input
        type="number"
        step="0.01"
        placeholder="Target CGPA (e.g. 4.00)"
        value={target}
        onChange={(e) => setTarget(e.target.value)}
        className="
          bg-white dark:bg-slate-800
          border-slate-300 dark:border-slate-600
        "
      />

      <Button onClick={handleSuggest} className="w-full">
        Get AI Suggestion
      </Button>

      {suggestion && (
        <div
          className={`rounded-xl p-4 text-center border
            ${
              suggestion.status === "achievable"
                ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300"
                : "bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-300"
            }
          `}
        >
          {suggestion.status === "achievable" ? (
            <>
              <p className="font-semibold">Target is achievable 🎯</p>
              <p className="mt-1 text-sm">
                Aim for at least:
              </p>
              <p className="text-2xl font-bold mt-1">
                {suggestion.grade} in remaining courses
              </p>
              <p className="text-sm mt-1">
                Projected CGPA: {suggestion.simulated}
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold">Target may be unrealistic ⚠️</p>
              <p className="text-sm mt-1">
                Even maximum grades won’t reach the target.
              </p>
              <p className="text-sm mt-1">
                Current CGPA: {currentCGPA}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
