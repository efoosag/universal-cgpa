"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";

export default function TargetCGPAPlanner({ gradingScale }) {
  const { years } = useAcademicStore();
  const [target, setTarget] = useState("");
  const [required, setRequired] = useState(null);

  const handleCalculate = () => {
    let completedCredits = 0;
    let completedPoints = 0;
    let remainingCredits = 0;

    years.forEach((year) => {
      year.semesters.forEach((semester) => {
        semester.courses.forEach((course) => {
          const point = gradingScale[course.grade];
          if (semester.status === "completed" && point != null) {
            completedPoints += point * course.creditUnit;
            completedCredits += course.creditUnit;
          } else {
            remainingCredits += course.creditUnit;
          }
        });
      });
    });

    if (!target || remainingCredits === 0) return;

    const needed =
      (target * (completedCredits + remainingCredits) - completedPoints) /
      remainingCredits;

    setRequired(+needed.toFixed(2));
  };

  const maxGrade = Math.max(...Object.values(gradingScale));

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
          🎯 Target CGPA Planner
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Enter your desired CGPA and calculate the minimum GPA you need in your
          remaining courses.
        </p>
      </div>

      {/* Target Input */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Target CGPA
        </label>
        <input
          type="number"
          step="0.01"
          placeholder="e.g. 4.00"
          value={target}
          onChange={(e) => setTarget(Number(e.target.value))}
          className="
            w-full rounded-md border px-3 py-2 text-sm
            bg-white text-slate-900
            focus:outline-none focus:ring-2 focus:ring-blue-500
            dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600
          "
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          The CGPA you want to achieve at the end of your program.
        </p>
      </div>

      {/* Action Button */}
      <Button
        onClick={handleCalculate}
        disabled={!target}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Calculate Required GPA
      </Button>

      {/* Result Card */}
      {required !== null && (
        <div
          className={`rounded-xl border p-4 text-center transition-colors
            ${
              required > maxGrade
                ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-300"
                : "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300"
            }
          `}
        >
          {required > maxGrade ? (
            <>
              <p className="font-semibold text-sm">
                ⚠️ Target may be unrealistic
              </p>
              <p className="mt-1 text-xs">
                Even achieving the highest possible grades cannot reach this
                CGPA.
              </p>
              <p className="text-2xl font-bold mt-2">{required}</p>
            </>
          ) : (
            <>
              <p className="font-semibold text-sm">✅ Required GPA</p>
              <p className="mt-1 text-xs">
                Minimum GPA needed in your remaining courses to reach your
                target.
              </p>
              <p className="text-2xl font-bold mt-2">{required}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
