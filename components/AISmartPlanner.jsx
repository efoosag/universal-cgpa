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
    <section
      className="
        rounded-2xl border p-5 space-y-4 shadow-sm
        bg-white border-slate-200
        dark:bg-slate-900 dark:border-slate-700
      "
    >
      {/* Header */}
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          🎓 AI Smart Grade Planner
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Tell the system your desired CGPA and it will estimate the minimum
          grades you need going forward.
        </p>
      </div>

      {/* Target Input */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Target CGPA
        </label>
        <Input
          type="number"
          step="0.01"
          placeholder="e.g. 4.00"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="
            bg-white dark:bg-slate-800
            border-slate-300 dark:border-slate-600
            focus:ring-2 focus:ring-blue-500
          "
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Your desired final CGPA based on your grading scale.
        </p>
      </div>

      {/* Action */}
      <Button
        onClick={handleSuggest}
        disabled={!target}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Get AI Recommendation
      </Button>

      {/* Result */}
      {suggestion && (
        <div
          className={`rounded-xl p-4 text-center border transition-colors
            ${
              suggestion.status === "achievable"
                ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300"
                : "bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-300"
            }
          `}
        >
          {suggestion.status === "achievable" ? (
            <>
              <p className="font-semibold text-base">
                🎯 Target is achievable
              </p>

              <p className="text-sm mt-1">
                Aim for at least this grade in your remaining courses:
              </p>

              <p className="text-3xl font-bold mt-2">
                {suggestion.grade}
              </p>

              <p className="text-sm mt-2">
                Projected CGPA:{" "}
                <span className="font-semibold">
                  {suggestion.simulated}
                </span>
              </p>
            </>
          ) : (
            <>
              <p className="font-semibold text-base">
                ⚠️ Target may be unrealistic
              </p>

              <p className="text-sm mt-1">
                Even with maximum grades, the target cannot be reached.
              </p>

              <p className="text-sm mt-2">
                Current CGPA:{" "}
                <span className="font-semibold">
                  {currentCGPA}
                </span>
              </p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
