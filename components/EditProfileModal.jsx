"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { GRADING_SCALES } from "@/lib/grading";

export default function EditProfileModal({ open, onOpenChange }) {
  const router = useRouter();
  const { profile, editProfile } = useAcademicStore();
  const [form, setForm] = useState(profile || {});
  const [showWarning, setShowWarning] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync form when modal opens
  useEffect(() => {
    setForm(profile || {});
    setShowWarning(false);
  }, [profile, open]);

  const structureChanged =
    profile?.programYears !== form.programYears ||
    profile?.semestersPerYear !== form.semestersPerYear;

  const saveProfile = async () => {
    setSaving(true);

    await editProfile({
      ...form,
      gradingScaleId: form.gradingScaleId || "ng-5",
    });

    setShowWarning(false);
    onOpenChange(false);

    if (structureChanged) router.refresh();

    setSaving(false);
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit Academic Profile">
      <div className="space-y-2 scrollbar-thin scrollbar-thumb-blue-400 overflow-y-auto max-h-[80vh] p-2">

        {/* Academic Identity */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Academic Identity
          </h3>

          <div>
            <input
              value={form.country || ""}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Country"
              className="w-full rounded-md border p-2
                border-blue-300 bg-blue-50 text-blue-900
                dark:bg-blue-950 dark:text-blue-100 dark:border-blue-700"
            />
            <p className="text-xs text-blue-600 mt-1">Country of Study.</p>
          </div>

          <div>
            <input
              value={form.university || ""}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              placeholder="University"
              className="w-full rounded-md border p-2
                border-blue-300 bg-blue-50 text-blue-900
                dark:bg-blue-950 dark:text-blue-100 dark:border-blue-700"
            />
            <p className="text-xs text-blue-600 mt-1">University of Study.</p>
          </div>

          <div>
            <input
              value={form.program || ""}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              placeholder="Program of Study"
              className="w-full rounded-md border p-2
                border-blue-300 bg-blue-50 text-blue-900
                dark:bg-blue-950 dark:text-blue-100 dark:border-blue-700"
            />
            <p className="text-xs text-blue-600 mt-1">
              Example: Computer Science, Law, Medicine.
            </p>
          </div>
        </section>

        {/* Program Structure */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
            Program Structure
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                min={1}
                value={form.programYears || 1}
                onChange={(e) =>
                  setForm({ ...form, programYears: Math.max(1, Number(e.target.value)) })
                }
                className="w-full rounded-md border p-2
                  border-blue-300 bg-blue-50 text-blue-900
                  dark:bg-blue-950 dark:text-blue-100 dark:border-blue-700"
              />
              <p className="text-xs text-blue-600 mt-1">Total duration of your academic program.</p>
            </div>

            <div>
              <input
                type="number"
                min={2}
                max={3}
                value={form.semestersPerYear || 2}
                onChange={(e) =>
                  setForm({
                    ...form,
                    semestersPerYear: Math.min(3, Math.max(2, Number(e.target.value))),
                  })
                }
                className="w-full rounded-md border p-2
                  border-blue-300 bg-blue-50 text-blue-900
                  dark:bg-blue-950 dark:text-blue-100 dark:border-blue-700"
              />
              <p className="text-xs text-blue-600 mt-1">Most universities use 2 semesters per year.</p>
            </div>
          </div>
        </section>

        {/* Grading Scale */}
        <section className="rounded-xl border border-blue-300 bg-blue-100 p-4 dark:bg-blue-950 dark:border-blue-700">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">Grading Scale</h3>
          <p className="text-xs text-blue-600 mt-1">
            Determines how GPA and CGPA are calculated.
          </p>
          <select
            value={form.gradingScaleId || "ng-5"}
            onChange={(e) => setForm({ ...form, gradingScaleId: e.target.value })}
            className="mt-3 w-full rounded-md border p-2
              border-blue-300 bg-blue-50 text-blue-900 focus:ring-2 focus:ring-blue-500
              dark:bg-blue-950 dark:text-blue-100 dark:border-blue-700"
          >
            {Object.entries(GRADING_SCALES).map(([key, scale]) => (
              <option key={key} value={key}>
                {scale.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-blue-600 mt-2">
            Changing this recalculates GPA but keeps all courses intact.
          </p>
        </section>

        {/* Warning (blue theme) */}
        {showWarning && (
          <div className="rounded-xl border border-blue-300 bg-blue-50 p-4 dark:bg-blue-950 dark:border-blue-700">
            <p className="font-semibold text-blue-800 dark:text-blue-300">Structural Change Detected</p>
            <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
              Changing program years or semesters will reset all academic data.
            </p>
            <div className="flex gap-3 mt-4">
              <Button
                variant="destructive"
                onClick={saveProfile}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Continue Anyway
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowWarning(false)}
                className="text-blue-700 border-blue-300 hover:bg-blue-50"
              >
                Go Back
              </Button>
            </div>
          </div>
        )}

        {/* Save Button */}
        {!showWarning && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() => (structureChanged ? setShowWarning(true) : saveProfile())}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Profile Changes"}
          </Button>
        )}
      </div>
    </Modal>
  );
}
