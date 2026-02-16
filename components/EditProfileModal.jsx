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

  useEffect(() => {
    setForm(profile || {});
    setShowWarning(false);
  }, [profile, open]);

  const structureChanged =
    profile?.programYears !== form.programYears ||
    profile?.semestersPerYear !== form.semestersPerYear;

  const saveProfile = async () => {
    await editProfile({
      ...form,
      gradingScaleId: form.gradingScaleId || "ng-5",
    });

    setShowWarning(false);
    onOpenChange(false);

    if (structureChanged) router.refresh();
  };

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Edit Academic Profile">
      <div className="space-y-6">

        {/* Academic Identity */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Academic Identity
          </h3>

          <div>
            <input
              value={form.country || ""}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              placeholder="Country"
              className="w-full rounded-md border p-2
                bg-white text-slate-900
                dark:bg-neutral-900 dark:text-slate-100 dark:border-neutral-700"
            />
            <p className="text-xs text-slate-500 mt-1">
              Country of Study.
            </p>
          </div>

          <div>
            <input
              value={form.university || ""}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              placeholder="University"
              className="w-full rounded-md border p-2
                bg-white text-slate-900
                dark:bg-neutral-900 dark:text-slate-100 dark:border-neutral-700"
            />
            <p className="text-xs text-slate-500 mt-1">
              Univeersity of Study.
            </p>
          </div>

          <div>
            <input
              value={form.program || ""}
              onChange={(e) => setForm({ ...form, program: e.target.value })}
              placeholder="Program of Study"
              className="w-full rounded-md border p-2
                bg-white text-slate-900
                dark:bg-neutral-900 dark:text-slate-100 dark:border-neutral-700"
            />
            <p className="text-xs text-slate-500 mt-1">
              Example: Computer Science, Law, Medicine.
            </p>
          </div>
        </section>

        {/* Program Structure */}
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Program Structure
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <input
                type="number"
                min={1}
                value={form.programYears || 1}
                onChange={(e) =>
                  setForm({
                    ...form,
                    programYears: Math.max(1, Number(e.target.value)),
                  })
                }
                className="w-full rounded-md border p-2
                  bg-white text-slate-900
                  dark:bg-neutral-900 dark:text-slate-100 dark:border-neutral-700"
              />
              <p className="text-xs text-slate-500 mt-1">
                Total duration of your academic program.
              </p>
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
                    semestersPerYear: Math.min(
                      3,
                      Math.max(2, Number(e.target.value)),
                    ),
                  })
                }
                className="w-full rounded-md border p-2
                  bg-white text-slate-900
                  dark:bg-neutral-900 dark:text-slate-100 dark:border-neutral-700"
              />
              <p className="text-xs text-slate-500 mt-1">
                Most universities use 2 semesters per year.
              </p>
            </div>
          </div>
        </section>

        {/* Grading Scale (EMPHASIZED) */}
        <section className="
          rounded-xl border border-blue-200
          bg-blue-50 p-4
          dark:bg-blue-950 dark:border-blue-800
        ">
          <h3 className="text-sm font-semibold text-blue-700 dark:text-blue-300">
            Grading Scale
          </h3>

          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            This determines how GPA and CGPA are calculated.
          </p>

          <select
            value={form.gradingScaleId || "ng-5"}
            onChange={(e) =>
              setForm({ ...form, gradingScaleId: e.target.value })
            }
            className="mt-3 w-full rounded-md border p-2
              bg-white text-slate-900
              focus:ring-2 focus:ring-blue-500
              dark:bg-neutral-900 dark:text-slate-100 dark:border-neutral-700"
          >
            {Object.entries(GRADING_SCALES).map(([key, scale]) => (
              <option key={key} value={key}>
                {scale.label}
              </option>
            ))}
          </select>

          <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
            Changing this recalculates GPA but keeps all your courses intact.
          </p>
        </section>

        {/* Warning */}
        {showWarning && (
          <div className="
            rounded-xl border border-red-300
            bg-red-50 p-4
            dark:bg-red-950 dark:border-red-800
          ">
            <p className="font-semibold text-red-700 dark:text-red-400">
              Structural Change Detected
            </p>
            <p className="text-sm text-red-600 dark:text-red-300 mt-1">
              Changing program years or semesters will reset all academic data.
            </p>

            <div className="flex gap-3 mt-4">
              <Button variant="destructive" onClick={saveProfile}>
                Continue Anyway
              </Button>
              <Button variant="outline" onClick={() => setShowWarning(false)}>
                Go Back
              </Button>
            </div>
          </div>
        )}

        {/* Save */}
        {!showWarning && (
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700"
            onClick={() =>
              structureChanged ? setShowWarning(true) : saveProfile()
            }
          >
            Save Profile Changes
          </Button>
        )}
      </div>
    </Modal>
  );
}
