"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddCourseForm({ yearId, semesterId, onAdd }) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [creditUnit, setCreditUnit] = useState("");
  const [grade, setGrade] = useState("");
  const [isRetake, setIsRetake] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !creditUnit || !grade.trim()) return;

    onAdd(yearId, semesterId, {
      name: name.trim(),
      code: code.trim(),
      creditUnit: Number(creditUnit),
      grade: grade.trim(),
      isRetake,
    });

    // Reset form
    setName("");
    setCode("");
    setCreditUnit("");
    setGrade("");
    setIsRetake(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <Input
        placeholder="Course Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        placeholder="Course Code (Optional)"
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <Input
        type="number"
        placeholder="Credit Units"
        value={creditUnit}
        onChange={(e) => setCreditUnit(e.target.value)}
      />
      <Input
        placeholder="Grade (e.g., A, B)"
        value={grade}
        onChange={(e) => setGrade(e.target.value.toUpperCase())}
      />
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={isRetake}
          onChange={(e) => setIsRetake(e.target.checked)}
        />
        Retake
      </label>
      <Button type="submit">Add Course</Button>
    </form>
  );
}
