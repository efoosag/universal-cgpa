"use client";

import { useState, useMemo } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { simulateWhatIf, calculateCGPA } from "@/lib/calculations";
import { Button } from "@/components/ui/button";

export default function WhatIfPanel({ gradingScale }) {
  const { years } = useAcademicStore();

  const [selectedYearId, setSelectedYearId] = useState("");
  const [selectedSemesterId, setSelectedSemesterId] = useState("");
  const [overrides, setOverrides] = useState({});
  const [result, setResult] = useState(null);

  const gradeOptions = Object.keys(gradingScale || {});

  const selectedYear = years.find((y) => y.id === selectedYearId);
  const selectedSemester = selectedYear?.semesters.find(
    (s) => s.id === selectedSemesterId,
  );

  const currentCGPA = useMemo(
    () => calculateCGPA(years, gradingScale),
    [years, gradingScale],
  );

  const handleChange = (courseId, grade) => {
    setOverrides((prev) => ({ ...prev, [courseId]: grade }));
  };

  const handleCalculate = () => {
    const value = simulateWhatIf(years, gradingScale, overrides);
    setResult(value);
  };

  const handleReset = () => {
    setOverrides({});
    setResult(null);
  };

  const difference =
    result !== null ? Number(result) - Number(currentCGPA) : 0;

  return (
    <section
      className="
        rounded-2xl border p-5 space-y-4 shadow-sm
        bg-white border-slate-200
        dark:bg-slate-900 dark:border-slate-700
      "
    >
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
        What-If GPA Simulator
      </h3>

      {/* Year & Semester Select */}
      <div className="grid grid-cols-2 gap-3">
        <select
          value={selectedYearId}
          onChange={(e) => {
            setSelectedYearId(e.target.value);
            setSelectedSemesterId("");
            handleReset();
          }}
          className="
            rounded-md border px-3 py-2 text-sm
            bg-white text-slate-900
            focus:outline-none focus:ring-2 focus:ring-blue-500
            dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600
          "
        >
          <option value="">Select Year</option>
          {years.map((year) => (
            <option key={year.id} value={year.id}>
              {year.title}
            </option>
          ))}
        </select>

        <select
          value={selectedSemesterId}
          onChange={(e) => {
            setSelectedSemesterId(e.target.value);
            handleReset();
          }}
          disabled={!selectedYear}
          className="
            rounded-md border px-3 py-2 text-sm
            bg-white text-slate-900
            focus:outline-none focus:ring-2 focus:ring-blue-500
            disabled:opacity-50
            dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600
          "
        >
          <option value="">Select Semester</option>
          {selectedYear?.semesters.map((sem) => (
            <option key={sem.id} value={sem.id}>
              {sem.title}
            </option>
          ))}
        </select>
      </div>

      {/* Courses */}
      {selectedSemester && (
        <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
          {selectedSemester.courses.map((course) => (
            <div
              key={course.id}
              className="
                flex items-center gap-3 rounded-lg border p-2
                bg-blue-50 border-blue-200
                dark:bg-blue-950 dark:border-blue-800
              "
            >
              <span className="flex-1 text-sm truncate text-slate-900 dark:text-slate-100">
                {course.name}
              </span>

              <select
                value={overrides[course.id] || course.grade}
                onChange={(e) =>
                  handleChange(course.id, e.target.value)
                }
                className="
                  w-20 rounded-md border px-2 py-1 text-sm
                  bg-white text-slate-900
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600
                "
              >
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleCalculate}
          disabled={!selectedSemester}
          className="flex-1"
        >
          Calculate
        </Button>

        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1"
        >
          Reset
        </Button>
      </div>

      {/* Result */}
      {result !== null && (
        <div
          className={`rounded-xl p-3 text-center border transition-colors
            ${
              difference > 0
                ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300"
                : difference < 0
                ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-300"
                : "bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
            }
          `}
        >
          <p className="text-sm">Projected CGPA</p>
          <p className="text-2xl font-bold">{result}</p>

          {difference !== 0 && (
            <p className="text-sm mt-1">
              {difference > 0 ? "▲ Improved by" : "▼ Reduced by"}{" "}
              {Math.abs(difference).toFixed(2)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
