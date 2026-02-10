"use client";

import { useState, useMemo } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { simulateWhatIf, calculateCGPA } from "@/lib/calculations";
import { Button } from "@/components/ui/button";

export default function WhatIfPanel({ gradingScale }) {
  const { years } = useAcademicStore();

  const [overrides, setOverrides] = useState({});
  const [expandedYears, setExpandedYears] = useState(new Set());
  const [expandedSemesters, setExpandedSemesters] = useState(new Set());
  const [result, setResult] = useState(null);

  const gradeOptions = Object.keys(gradingScale || {});
  const currentCGPA = useMemo(
    () => calculateCGPA(years, gradingScale),
    [years, gradingScale]
  );

  const handleChange = (courseId, grade) => {
    setOverrides((prev) => ({ ...prev, [courseId]: grade || null }));
  };

  const toggleYear = (yearId) => {
    setExpandedYears((prev) => {
      const next = new Set(prev);
      next.has(yearId) ? next.delete(yearId) : next.add(yearId);
      return next;
    });
  };

  const toggleSemester = (semesterId) => {
    setExpandedSemesters((prev) => {
      const next = new Set(prev);
      next.has(semesterId) ? next.delete(semesterId) : next.add(semesterId);
      return next;
    });
  };

  const handleCalculate = () => {
    const value = simulateWhatIf(years, gradingScale, overrides);
    setResult(value);
  };

  const handleReset = () => {
    setOverrides({});
    setExpandedYears(new Set());
    setExpandedSemesters(new Set());
    setResult(null);
  };

  const difference = result !== null ? Number(result) - Number(currentCGPA) : 0;

  // Helper: count ungraded courses
  const countUngradedCourses = (courses) =>
    courses.filter((c) => !c.grade).length;

  return (
    <section className="rounded-2xl border p-5 space-y-5 shadow-sm bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
          What-If GPA Simulator
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Temporarily change grades for your ungraded courses to see potential CGPA.
        </p>
      </div>

      {/* Collapsible Years & Semesters */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
        {years.map((year) => {
          const ungradedInYear = year.semesters.reduce(
            (sum, s) => sum + countUngradedCourses(s.courses),
            0
          );
          if (ungradedInYear === 0) return null; // skip years with no ungraded courses

          const yearExpanded = expandedYears.has(year.id);

          return (
            <div key={year.id} className="border rounded-lg">
              {/* Year Header */}
              <button
                onClick={() => toggleYear(year.id)}
                className="w-full flex justify-between p-3 bg-slate-100 dark:bg-slate-700 font-medium text-sm"
              >
                {year.title} ({ungradedInYear} ungraded) {yearExpanded ? "▼" : "▶"}
              </button>

              {/* Semesters */}
              {yearExpanded &&
                year.semesters.map((semester) => {
                  const ungradedInSem = countUngradedCourses(semester.courses);
                  if (ungradedInSem === 0) return null; // skip semesters with no ungraded courses

                  const semExpanded = expandedSemesters.has(semester.id);

                  return (
                    <div key={semester.id} className="border-t">
                      <button
                        onClick={() => toggleSemester(semester.id)}
                        className="w-full flex justify-between p-2 pl-6 bg-slate-50 dark:bg-slate-800 text-sm font-medium"
                      >
                        {semester.title} ({ungradedInSem} ungraded) {semExpanded ? "▼" : "▶"}
                      </button>

                      {/* Courses */}
                      {semExpanded &&
                        semester.courses
                          .filter((course) => !course.grade) // only ungraded
                          .map((course) => (
                            <div
                              key={course.id}
                              className="flex items-center justify-between gap-3 rounded-lg border p-2 pl-12 mt-1 bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700"
                            >
                              <div className="min-w-0">
                                <p className="text-sm font-medium truncate">{course.name}</p>
                                <p className="text-xs text-slate-500">Current grade: -</p>
                              </div>
                              <select
                                value={overrides[course.id] ?? ""}
                                onChange={(e) => handleChange(course.id, e.target.value)}
                                className="w-20 rounded-md border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                              >
                                <option value="">Select</option>
                                {gradeOptions.map((g) => (
                                  <option key={g} value={g}>
                                    {g}
                                  </option>
                                ))}
                              </select>
                            </div>
                          ))}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-3">
        <Button onClick={handleCalculate} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
          Simulate CGPA
        </Button>
        <Button variant="outline" onClick={handleReset} className="flex-1">
          Reset
        </Button>
      </div>

      {/* Result */}
      {result !== null && (
        <div
          className={`rounded-xl p-4 text-center border ${
            difference > 0
              ? "bg-blue-50 border-blue-300 text-blue-700 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-300"
              : difference < 0
              ? "bg-red-50 border-red-300 text-red-700 dark:bg-red-950 dark:border-red-700 dark:text-red-300"
              : "bg-slate-50 border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300"
          }`}
        >
          <p className="text-sm">Projected CGPA</p>
          <p className="text-2xl font-bold">{result}</p>
          <p className="text-xs mt-1">Current CGPA: {Number(currentCGPA).toFixed(2)}</p>
          {difference !== 0 && (
            <p className="text-sm mt-2">
              {difference > 0 ? "▲ Increase of" : "▼ Decrease of"} {Math.abs(difference).toFixed(2)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
