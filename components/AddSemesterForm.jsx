"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AddSemesterForm({ yearId, onAdd }) {
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("planned");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onAdd(yearId, title.trim(), status);
    setTitle("");
    setStatus("planned");
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-center">
      <Input
        placeholder="e.g. First Semester"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="h-9 rounded-md border px-2 text-sm"
      >
        <option value="planned">Planned</option>
        <option value="ongoing">Ongoing</option>
        <option value="completed">Completed</option>
      </select>

      <Button type="submit" size="sm">
        Add
      </Button>
    </form>
  );
}
