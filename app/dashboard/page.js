"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { calculateSemesterGPA, calculateCGPA } from "@/lib/calculations";
import { GRADING_SCALES } from "@/lib/grading";
import AddCourseForm from "@/components/AddCourseForm";
import EditCourseModal from "@/components/EditCourseModal";
import EditProfileModal from "@/components/EditProfileModal";
import ConfirmModal from "@/components/ConfirmModal";
import WhatIfPanel from "@/components/WhatIfPanel";
import TargetCGPAPlanner from "@/components/TargetCGPAPlanner";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const router = useRouter();

  const {
    isInitialized,
    hasHydrated,
    years,
    profile,
    addCourse,
    editCourse,
    deleteCourse,
    initializeAcademicStructure,
  } = useAcademicStore();

  const [editingCourse, setEditingCourse] = useState(null);
  const [editCourseModalOpen, setEditCourseModalOpen] = useState(false);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);
  const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

  const safeYears = Array.isArray(years) ? years : [];
  const gradingScale =
    GRADING_SCALES[profile?.gradingScale || "ng-5"];

  const cgpa = calculateCGPA(safeYears, gradingScale);

  // ✅ Auto rebuild
  useEffect(() => {
    if (
      isInitialized &&
      profile &&
      years.length === 0 &&
      profile.programYears &&
      profile.semestersPerYear
    ) {
      initializeAcademicStructure(
        profile.programYears,
        profile.semestersPerYear
      );
    }
  }, [isInitialized, profile, years.length, initializeAcademicStructure]);

  // ✅ Redirect
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isInitialized) router.replace("/onboarding");
  }, [isInitialized, router, hasHydrated]);


  if (!hasHydrated) {
  return <div className="p-6">Loading dashboard…</div>;
}

  return (
    <div className="p-6 space-y-6">
      <div className="border rounded p-4">
        <h2 className="text-lg font-semibold">Cumulative GPA</h2>
        <p className="text-3xl font-bold mt-2">{cgpa}</p>
        <Button size="sm" variant="outline" onClick={() => setEditProfileModalOpen(true)}>
          Edit Profile
        </Button>
        <EditProfileModal open={editProfileModalOpen} onOpenChange={setEditProfileModalOpen} />
      </div>

      <WhatIfPanel />
      <TargetCGPAPlanner />

      {safeYears.map((year) => (
        <div key={year.id}>
          <h3 className="text-xl font-semibold">{year.title}</h3>

          {year.semesters.map((semester) => {
            const semesterGPA = calculateSemesterGPA(semester, gradingScale);

            return (
              <div key={semester.id} className="ml-4 border-l pl-4">
                <div className="flex justify-between">
                  <span>{semester.title}</span>
                  <span>GPA: {semesterGPA}</span>
                </div>

                <AddCourseForm
                  yearId={year.id}
                  semesterId={semester.id}
                  onAdd={addCourse}
                />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
