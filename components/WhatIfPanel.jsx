"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { simulateWhatIf } from "@/lib/calculations";
import { GRADING_SCALES } from "@/lib/grading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function WhatIfPanel() {
  const { years } = useAcademicStore();
  const gradingScale = GRADING_SCALES["ng-5"];

  // State to track temporary grade overrides
  const [overrides, setOverrides] = useState({});

  const handleGradeChange = (courseId, newGrade) => {
    setOverrides((prev) => ({
      ...prev,
      [courseId]: { grade: newGrade.toUpperCase() },
    }));
  };

  const projectedCGPA = simulateWhatIf(years, gradingScale, overrides);

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="font-semibold text-lg">What-If GPA Simulator</h3>

      {years.length === 0 && (
        <p className="text-muted-foreground">Add years and courses first.</p>
      )}

      {years.map((year) =>
        year.semesters.map((semester) =>
          semester.courses.map((course) => (
            <div key={course.id} className="flex gap-2 items-center">
              <span className="w-48">{course.name}</span>
              <Input
                value={overrides[course.id]?.grade || course.grade}
                onChange={(e) => handleGradeChange(course.id, e.target.value)}
                className="w-20 text-center"
              />
              <span className="text-sm text-muted-foreground">
                Current: {course.grade}
              </span>
            </div>
          ))
        )
      )}

      <div className="mt-4">
        <span className="font-medium">Projected CGPA: </span>
        <span className="text-xl font-bold">{projectedCGPA}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        Grades here do not affect real records.
      </p>
    </div>
  );
}
