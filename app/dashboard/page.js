"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { calculateSemesterGPA, calculateCGPA } from "@/lib/calculations";
import { GRADING_SCALES } from "@/lib/grading";

import AddCourseForm from "@/components/AddCourseForm";
import EditCourseModal from "@/components/EditCourseModal";
import EditProfileModal from "@/components/EditProfileModal";
import ConfirmModal from "@/components/ConfirmModal";
import WhatIfPanel from "@/components/WhatIfPanel";
import UngradedTargetPlanner from "@/components/UnGradedTargetPlanner";
import LogoutButton from "@/components/LogoutButton";
import UploadCoursesModal from "@/components/UploadCoursesModal";
import { Button } from "@/components/ui/button";
import { GraduationCap, Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Dashboard() {
  const router = useRouter();
  const academicYearsRef = useRef(null);

  const {
    user,
    profile,
    years,
    loading,
    loadUserAndProfile,
    fetchAcademicData,
    addCourse,
    editCourse,
    deleteCourse,
  } = useAcademicStore();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedSemesters, setExpandedSemesters] = useState({});

  const safeYears = Array.isArray(years) ? years : [];
  const isPro = profile?.isPro;

  const gradingScaleFull =
    GRADING_SCALES[profile?.gradingScaleId] || GRADING_SCALES["ng-5"];

  const { label: gradingLabel, gradingScale } = gradingScaleFull;
  const cgpa = calculateCGPA(safeYears, gradingScale);

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    loadUserAndProfile();
  }, []);

  useEffect(() => {
    if (user) fetchAcademicData();
  }, [user]);

  // =========================
  // TOGGLE SEMESTER
  // =========================
  const toggleSemester = (id) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // =========================
  // EXPORT FUNCTIONS
  // =========================
  const handleExportExcel = () => {
    if (!isPro) return router.push("/upgrade");
    if (!safeYears.length) return;

    const data = safeYears.flatMap((year) =>
      year.semesters.flatMap((semester) =>
        semester.courses.map((course) => ({
          Year: year.title,
          Semester: semester.title,
          Course: course.name,
          CU: course.creditUnit,
          Grade: course.grade,
        })),
      ),
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CGPA Report");
    XLSX.writeFile(workbook, "CGPA_Report.xlsx");
  };

  const handleExportPDF = () => {
    if (!isPro) return router.push("/upgrade");
    if (!safeYears.length) return;

    const doc = new jsPDF();
    doc.text("Universal CGPA Report", 14, 15);
    doc.text(`Program: ${profile?.program || "N/A"}`, 14, 25);
    doc.text(`CGPA: ${cgpa}`, 14, 32);

    const rows = safeYears.flatMap((year) =>
      year.semesters.flatMap((semester) =>
        semester.courses.map((course) => [
          year.title,
          semester.title,
          course.name,
          course.creditUnit,
          course.grade,
        ]),
      ),
    );

    autoTable(doc, {
      head: [["Year", "Semester", "Course", "CU", "Grade"]],
      body: rows,
      startY: 40,
    });

    doc.save("CGPA_Report.pdf");
  };

  // =========================
  // LOADING SCREEN
  // =========================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  // =========================
  // MAIN UI
  // =========================
  return (
    <main className="min-h-screen p-6 space-y-8">
      {/* ===== HEADER ===== */}
      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-sm p-6 flex flex-col md:flex-row justify-between gap-6">
        {/* GPA SUMMARY */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600">
            <GraduationCap size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500">Cumulative GPA</p>
            <h1 className="text-4xl font-bold text-blue-600">{cgpa}</h1>
            <p className="text-xs text-slate-500">Scale: {gradingLabel}</p>
          </div>
        </div>

        {/* USER INFO */}
        <div>
          <h1 className="text-xl font-bold">Welcome, {user?.email}</h1>

          {isPro ? (
            <span className="mt-2 inline-block rounded-full bg-green-100 text-green-700 px-3 py-1 text-sm">
              PRO Member
            </span>
          ) : (
            <span className="mt-2 inline-block rounded-full bg-slate-200 text-slate-700 px-3 py-1 text-sm">
              Free Plan
            </span>
          )}

          {!isPro && (
            <Button
              size="sm"
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => router.push("/upgrade")}
            >
              Upgrade to Pro
            </Button>
          )}
        </div>

        {/* ACTIONS */}
        <div className="flex gap-3 items-center">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditProfileOpen(true)}
          >
            <Settings size={16} className="mr-1" />
            Profile
          </Button>

          <Button size="sm" variant="outline" onClick={handleExportPDF}>
            Export PDF
          </Button>

          <Button size="sm" variant="outline" onClick={handleExportExcel}>
            Export Excel
          </Button>

          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      {/* ===== PRO TOOLS SECTION ===== */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* WHAT IF SIMULATOR */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          {isPro ? (
            <WhatIfPanel gradingScale={gradingScale} years={safeYears} />
          ) : (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                What-If Simulator
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Simulate future grades and predict your CGPA.
              </p>

              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={() => router.push("/upgrade")}
              >
                Upgrade to Unlock
              </Button>

              <div className="mt-3 text-xs text-slate-400">
                Available on Pro plan
              </div>
            </div>
          )}
        </div>

        {/* UNGRADED TARGET PLANNER */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          {isPro ? (
            <UngradedTargetPlanner
              gradingScale={gradingScale}
              years={safeYears}
            />
          ) : (
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                Ungraded Target Planner
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Plan grades needed to reach your desired CGPA.
              </p>

              <Button
                size="sm"
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={() => router.push("/upgrade")}
              >
                Upgrade to Unlock
              </Button>

              <div className="mt-3 text-xs text-slate-400">
                Available on Pro plan
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== ACADEMIC STRUCTURE ===== */}
      <div ref={academicYearsRef} className="space-y-6">
        {safeYears.map((year) => (
          <div
            key={year.id}
            className="rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4"
          >
            <h2 className="text-lg font-semibold">{year.title}</h2>

            {year.semesters.map((semester) => {
              const semesterGPA = calculateSemesterGPA(semester, gradingScale);
              const expanded = expandedSemesters[semester.id];

              return (
                <div key={semester.id}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-700">
                      {semester.title} — GPA: {semesterGPA}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSemester(semester.id)}
                    >
                      {expanded ? "Hide" : "Show"}
                    </Button>
                  </div>

                  {expanded && (
                    <div className="space-y-4">
                      {/* Semester Actions */}
                      <div className="flex justify-between items-center">
                        <AddCourseForm
                          yearId={year.id}
                          semesterId={semester.id}
                          onAdd={addCourse}
                          gradingScale={gradingScale}
                        />

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => {
                              setSelectedSemesterId(semester.id);
                              setUploadOpen(true);
                            }}
                          >
                            Upload
                          </Button>

                          <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded-full">
                            {semester.courses?.length || 0}
                          </span>
                        </div>
                      </div>

                      {/* Courses */}
                      {semester.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex justify-between items-center p-3 border rounded-lg"
                        >
                          <span className="flex grow text-sm text-blue-800 dark:text-blue-300">
                            <span className="flex-1">{course.name}</span><span className="flex-1">{course.creditUnit} CU
                            </span> 
                            <strong className="flex-1 font-semibold text-blue-900 dark:text-blue-100">
                              {course.grade}
                            </strong>
                          </span>

                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setEditingCourse({
                                  ...course,
                                  semesterId: semester.id,
                                })
                              }
                            >
                              Edit
                            </Button>

                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() =>
                                setDeleteTarget({
                                  courseId: course.id,
                                  name: course.name,
                                })
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* MODALS */}
      <EditProfileModal
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />
      <UploadCoursesModal
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        semesterId={selectedSemesterId}
      />

      {editingCourse && (
        <EditCourseModal
          open={!!editingCourse}
          onOpenChange={() => setEditingCourse(null)}
          course={editingCourse}
          onSave={(updated) => {
            editCourse(editingCourse.id, updated);
            setEditingCourse(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Delete Course"
          message={`Delete ${deleteTarget.name}?`}
          onConfirm={async () => {
            await deleteCourse(deleteTarget.courseId);
            setDeleteTarget(null);
          }}
        />
      )}
    </main>
  );
}
