"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { calculateCGPA, gradeToPoint } from "@/lib/calculations";
import { GRADING_SCALES } from "@/lib/grading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TargetCGPAPlanner() {
  const { years } = useAcademicStore();
  const gradingScale = GRADING_SCALES["ng-5"];

  const [targetCGPA, setTargetCGPA] = useState("");
  const [requiredAverage, setRequiredAverage] = useState(null);

  const handleCalculate = () => {
    if (!targetCGPA || years.length === 0) return;

    // Calculate total credits and points of completed semesters
    let totalCreditsDone = 0;
    let totalPointsDone = 0;

    years.forEach((year) => {
      year.semesters.forEach((semester) => {
        if (semester.status === "completed") {
          semester.courses.forEach((course) => {
            const point = gradeToPoint(course.grade, gradingScale);
            totalPointsDone += point * course.creditUnit;
            totalCreditsDone += course.creditUnit;
          });
        }
      });
    });

    // Total credits left in ongoing/planned semesters
    let totalCreditsLeft = 0;
    years.forEach((year) => {
      year.semesters.forEach((semester) => {
        if (semester.status !== "completed") {
          semester.courses.forEach((course) => {
            totalCreditsLeft += course.creditUnit;
          });
        }
      });
    });

    if (totalCreditsLeft === 0) {
      alert("No remaining courses to achieve target CGPA.");
      return;
    }

    // Calculate required average points
    const targetPoints = Number(targetCGPA) * (totalCreditsDone + totalCreditsLeft);
    const remainingPoints = targetPoints - totalPointsDone;
    const avgRequired = remainingPoints / totalCreditsLeft;

    setRequiredAverage(Number(avgRequired.toFixed(2)));
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <h3 className="text-lg font-semibold">Target CGPA Planner</h3>

      <div className="flex gap-2 items-center">
        <Input
          type="number"
          placeholder="Enter Target CGPA"
          value={targetCGPA}
          onChange={(e) => setTargetCGPA(e.target.value)}
          className="w-32"
        />
        <Button onClick={handleCalculate}>Calculate</Button>
      </div>

      {requiredAverage !== null && (
        <div>
          <p className="font-medium">
            Required Average Points for Remaining Courses:
          </p>
          <p className="text-xl font-bold">{requiredAverage}</p>
          <p className="text-sm text-muted-foreground">
            Use this as a guide to plan your grades.
          </p>
        </div>
      )}
    </div>
  );
}
