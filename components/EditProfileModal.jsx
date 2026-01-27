"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

export default function EditProfileModal({ open, onOpenChange }) {
  const router = useRouter();
  const { profile, editProfile } = useAcademicStore();

  const [form, setForm] = useState(profile || {});
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    setForm(profile || {});
    setShowWarning(false);
  }, [profile, open]);

  const structureChanged =
    profile?.programYears !== form.programYears ||
    profile?.semestersPerYear !== form.semestersPerYear;

  const saveProfile = () => {
    editProfile(form);
    setShowWarning(false);
    onOpenChange(false);
    if (structureChanged) router.refresh();
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit Academic Profile">
      <div className="space-y-3">
        <input
          value={form.country || ""}
          onChange={(e) => setForm({ ...form, country: e.target.value })}
          placeholder="Country"
          className="w-full border rounded p-2"
        />

        <input
          value={form.university || ""}
          onChange={(e) => setForm({ ...form, university: e.target.value })}
          placeholder="University"
          className="w-full border rounded p-2"
        />

        <input
          value={form.program || ""}
          onChange={(e) => setForm({ ...form, program: e.target.value })}
          placeholder="Program"
          className="w-full border rounded p-2"
        />

        <input
          type="number"
          value={form.programYears || 0}
          onChange={(e) =>
            setForm({ ...form, programYears: Number(e.target.value) })
          }
          placeholder="Program Years"
          className="w-full border rounded p-2"
        />

        <input
          type="number"
          value={form.semestersPerYear || 0}
          onChange={(e) =>
            setForm({ ...form, semestersPerYear: Number(e.target.value) })
          }
          placeholder="Semesters per Year"
          className="w-full border rounded p-2"
        />

        {/* ✅ Grading Scale */}
        <select
          value={form.gradingScale || "ng-5"}
          onChange={(e) =>
            setForm({ ...form, gradingScale: e.target.value })
          }
          className="w-full border rounded p-2"
        >
          <option value="ng-5">Nigeria (5.0)</option>
          <option value="ng-4">Nigeria (4.0)</option>
          <option value="us-4">USA (4.0)</option>
          <option value="uk">UK</option>
        </select>

        {showWarning && (
          <div className="border border-red-300 bg-red-50 p-3 rounded">
            <p className="text-red-600 font-semibold">Warning</p>
            <p className="text-sm">
              Changing years or semesters will delete all academic data.
            </p>
            <div className="flex gap-2 mt-3">
              <Button variant="destructive" onClick={saveProfile}>
                Continue
              </Button>
              <Button variant="outline" onClick={() => setShowWarning(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {!showWarning && (
          <Button
            className="w-full"
            onClick={() =>
              structureChanged ? setShowWarning(true) : saveProfile()
            }
          >
            Save Profile
          </Button>
        )}
      </div>
    </Modal>
  );
}
