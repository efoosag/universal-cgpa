"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { calculateCGPA } from "@/lib/calculations";
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

    if (remainingCredits === 0) return;

    const needed =
      ((target * (completedCredits + remainingCredits)) - completedPoints) /
      remainingCredits;

    setRequired(+needed.toFixed(2));
  };

  return (
    <div className="border rounded p-4 space-y-3">
      <h3 className="font-semibold">Target CGPA Planner</h3>

      <input
        type="number"
        step="0.01"
        placeholder="Target CGPA"
        className="border px-2 py-1 w-full"
        value={target}
        onChange={(e) => setTarget(Number(e.target.value))}
      />

      <Button onClick={handleCalculate}>Calculate Required GPA</Button>

      {required !== null && (
        <p className="font-bold">
          Required GPA in remaining courses:{" "}
          <span className={required > 5 ? "text-red-600" : "text-green-600"}>
            {required}
          </span>
        </p>
      )}
    </div>
  );
}
