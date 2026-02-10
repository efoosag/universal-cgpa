"use client";

import { useState, useMemo } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { simulateWhatIf, calculateCGPA } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function UngradedTargetPlanner({ gradingScale }) {
  const { years } = useAcademicStore();
  const [target, setTarget] = useState("");
  const [simulation, setSimulation] = useState(null);

  // Grades sorted highest → lowest
  const gradeEntries = useMemo(
    () =>
      Object.entries(gradingScale || {}).sort((a, b) => b[1] - a[1]),
    [gradingScale]
  );

  // Only ungraded courses
  const ungradedCourses = useMemo(() => {
    return years.flatMap((year) =>
      year.semesters.flatMap((semester) =>
        semester.courses
          .filter((c) => c.grade == null)
          .map((c) => ({
            ...c,
            yearTitle: year.title,
            semesterTitle: semester.title,
          }))
      )
    );
  }, [years]);

  const currentCGPA = useMemo(
    () => calculateCGPA(years, gradingScale),
    [years, gradingScale]
  );

  const handleSimulate = () => {
    if (!target || ungradedCourses.length === 0) return;

    // Start with lowest grades for all ungraded courses
    const overrides = {};
    ungradedCourses.forEach((c) => {
      overrides[c.id] = gradeEntries[gradeEntries.length - 1][0];
    });

    let improved = true;

    // Greedy per-course loop: pick the grade that gets closest to target CGPA
    while (improved) {
      improved = false;
      let closestDiff = Math.abs(
        simulateWhatIf(years, gradingScale, overrides) - Number(target)
      );

      for (const course of ungradedCourses) {
        const currentGrade = overrides[course.id];

        for (const [grade] of gradeEntries) {
          if (grade === currentGrade) continue;

          const testOverrides = { ...overrides, [course.id]: grade };
          const simulatedCGPA = simulateWhatIf(years, gradingScale, testOverrides);
          const diff = Math.abs(simulatedCGPA - Number(target));

          if (diff < closestDiff) {
            overrides[course.id] = grade; // Assign better grade
            closestDiff = diff;
            improved = true;
            break; // go to next course
          }
        }
      }
    }

    setSimulation({
      status:
        simulateWhatIf(years, gradingScale, overrides) >= Number(target)
          ? "achievable"
          : "closest",
      cgpa: simulateWhatIf(years, gradingScale, overrides),
      courses: ungradedCourses.map((c) => ({
        ...c,
        simulatedGrade: overrides[c.id],
      })),
    });
  };

  return (
    <section className="rounded-2xl border p-5 space-y-5 bg-white dark:bg-slate-900">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold">🎯 Ungraded Course Simulator</h3>
        <p className="text-sm text-slate-500">
          Simulates different grades for ungraded courses to reach or get closest to your target CGPA.
        </p>
      </div>

      {/* Target Input */}
      <div className="space-y-1">
        <label className="text-sm font-medium">Target CGPA</label>
        <Input
          type="number"
          step="0.01"
          placeholder="e.g. 4.00"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
      </div>

      {/* Action */}
      <Button
        onClick={handleSimulate}
        disabled={!target || ungradedCourses.length === 0}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
      >
        Simulate Grades
      </Button>

      {/* Results */}
      {simulation && (
        <>
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Simulated Grades (Ungraded Courses)</h4>

            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 dark:bg-slate-800">
                  <tr>
                    <th className="px-3 py-2 text-left">Course</th>
                    <th className="px-3 py-2">Credits</th>
                    <th className="px-3 py-2">Simulated Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {simulation.courses.map((course) => (
                    <tr key={course.id} className="border-t">
                      <td className="px-3 py-2">
                        <p className="font-medium">{course.name}</p>
                        <p className="text-xs text-slate-500">
                          {course.yearTitle} • {course.semesterTitle}
                        </p>
                      </td>
                      <td className="px-3 py-2 text-center">{course.creditUnit}</td>
                      <td className="px-3 py-2 text-center font-semibold text-blue-600">
                        {course.simulatedGrade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div
            className={`rounded-xl border p-4 text-center ${
              simulation.status === "achievable"
                ? "bg-blue-50 border-blue-300 text-blue-700"
                : "bg-yellow-50 border-yellow-300 text-yellow-700"
            }`}
          >
            {simulation.status === "achievable" ? (
              <>
                <p className="font-semibold">✅ Target CGPA achievable</p>
                <p className="text-sm mt-1">
                  Projected CGPA: <span className="font-bold">{simulation.cgpa}</span>
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold">⚠️ Closest achievable CGPA</p>
                <p className="text-sm mt-1">
                  Projected CGPA: <span className="font-bold">{simulation.cgpa}</span>
                </p>
              </>
            )}
          </div>
        </>
      )}
    </section>
  );
}
