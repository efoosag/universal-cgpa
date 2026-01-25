"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function EditCourseModal({ open, onOpenChange, course, onSave }) {
  const [name, setName] = useState(course?.name || "");
  const [code, setCode] = useState(course?.code || "");
  const [creditUnit, setCreditUnit] = useState(course?.creditUnit || "");
  const [grade, setGrade] = useState(course?.grade || "");
  const [isRetake, setIsRetake] = useState(course?.isRetake || false);

  // Sync when course changes
  useEffect(() => {
    if (course) {
      setName(course.name);
      setCode(course.code || "");
      setCreditUnit(course.creditUnit);
      setGrade(course.grade);
      setIsRetake(course.isRetake || false);
    }
  }, [course]);

  const handleSave = () => {
    onSave({
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Course</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-2">
          <Input placeholder="Course Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Course Code" value={code} onChange={(e) => setCode(e.target.value)} />
          <Input type="number" placeholder="Credit Units" value={creditUnit} onChange={(e) => setCreditUnit(e.target.value)} />
          <Input placeholder="Grade (A, B, etc.)" value={grade} onChange={(e) => setGrade(e.target.value)} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={isRetake} onChange={(e) => setIsRetake(e.target.checked)} />
            Retake
          </label>
        </div>

        <DialogFooter>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
