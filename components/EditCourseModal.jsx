"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditCourseModal({
  open,
  onOpenChange,
  course,
  onSave,
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creditUnit, setCreditUnit] = useState("");
  const [grade, setGrade] = useState("");
  const [isRetake, setIsRetake] = useState(false);  
  useEffect(() => {
    if (course) {
      setName(course.name || "");
      setCode(course.code || "");
      setCreditUnit(course.creditUnit || "");
      setGrade(course.grade || "");
      setIsRetake(course.isRetake || false);
    }
  }, [course]);

  const isDisabled = !name.trim() || !creditUnit || !grade;

  const handleSave = () => {
    if (isDisabled) return;
    
    onSave({
      id: course.id,
      name: name.trim(),
      code: code.trim(),
      creditUnit: Number(creditUnit),
      grade: grade.toUpperCase().trim(),
      isRetake,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          max-w-md rounded-2xl
          bg-white text-slate-900
          dark:bg-slate-900 dark:text-slate-100
        "
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Edit Course
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          {/* Course Name */}
          <div>
            <Input
              placeholder="Course name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="dark:bg-slate-800 dark:border-slate-600"
            />
            <p className="text-xs text-slate-500 mt-1">
              Example: Introduction to Economics
            </p>
          </div>

          {/* Code + Credit Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Input
                placeholder="Course code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">
                Optional (e.g. ECO101)
              </p>
            </div>

            <div>
              <Input
                type="number"
                min="0"
                placeholder="Credit units"
                value={creditUnit}
                onChange={(e) => setCreditUnit(e.target.value)}
                className="dark:bg-slate-800 dark:border-slate-600"
              />
              <p className="text-xs text-slate-500 mt-1">
                Usually between 1 – 6
              </p>
            </div>
          </div>

          {/* Grade (Emphasized) */}
          <div
            className="
              rounded-xl border border-blue-200 p-3
              bg-blue-50
              dark:bg-blue-950 dark:border-blue-800
            "
          >
            <label className="text-sm font-semibold text-blue-700 dark:text-blue-300">
              Course Grade
            </label>

            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="
                mt-2 w-full rounded-md border px-3 py-2
                bg-white text-slate-900
                focus:ring-2 focus:ring-blue-500
                dark:bg-slate-800 dark:text-slate-100 dark:border-slate-600
              "
            >
              <option value="" disabled>
                Select grade
              </option>
              {["A", "B", "C", "D", "E", "F"].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>

            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              This grade directly affects your GPA.
            </p>
          </div>

          {/* Retake */}
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
            <input
              type="checkbox"
              checked={isRetake}
              onChange={(e) => setIsRetake(e.target.checked)}
              className="accent-blue-600"
            />
            Mark as retake course
          </label>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={handleSave}
            disabled={isDisabled}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
