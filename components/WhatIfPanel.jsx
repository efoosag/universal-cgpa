"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { simulateWhatIf } from "@/lib/calculations";
import { Button } from "@/components/ui/button";

export default function WhatIfPanel({ gradingScale }) {
  const { years } = useAcademicStore();
  const [overrides, setOverrides] = useState({});
  const [result, setResult] = useState(null);

  const handleChange = (courseId, grade) => {
    setOverrides((prev) => ({ ...prev, [courseId]: grade }));
  };

  const handleCalculate = () => {
    const value = simulateWhatIf(years, gradingScale, overrides);
    setResult(value);
  };

  return (
    <div className="border rounded p-4 space-y-3">
      <h3 className="font-semibold">What-If GPA Simulator</h3>

      {years.map((year) =>
        year.semesters.map((semester) =>
          semester.courses.map((course) => (
            <div key={course.id} className="flex gap-2 items-center">
              <span className="flex-1 text-sm">{course.name}</span>
              <input
                className="border px-2 py-1 w-16"
                placeholder={course.grade}
                onChange={(e) =>
                  handleChange(course.id, e.target.value.toUpperCase())
                }
              />
            </div>
          ))
        )
      )}

      <Button onClick={handleCalculate}>Calculate What-If CGPA</Button>

      {result !== null && (
        <p className="font-bold text-green-600">What-If CGPA: {result}</p>
      )}
    </div>
  );
}
