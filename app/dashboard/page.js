"use client";

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
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { GraduationCap, Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Dashboard() {
  const router = useRouter();
  const academicYearsRef = useRef(null);

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
  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [showAcademicYears, setShowAcademicYears] = useState(false);

  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");

  const safeYears = Array.isArray(years) ? years : [];

  // Extract grading scale
  const gradingScaleFull =
    GRADING_SCALES[profile?.gradingScaleId] || GRADING_SCALES["ng-5"];
  const { label: gradingLabel, ...gradingScale } = gradingScaleFull;

  // CGPA calculation
  const cgpa = calculateCGPA(safeYears, gradingScale.points);
  console.log(cgpa);
  //If user does not exist
  useEffect(() => {
    const stored = localStorage.getItem("universal-cgpa-storage");
    if (!stored) {
      router.replace("/onboarding");
    }
  }, [router]);

  // Auto initialize academic structure
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
        profile.semestersPerYear,
      );
    }
  }, [isInitialized, profile, years.length, initializeAcademicStructure]);

  // Redirect if onboarding not complete
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isInitialized) router.replace("/onboarding");
  }, [isInitialized, router, hasHydrated]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-600">
        Loading dashboard…
      </div>
    );
  }

  const toggleSemester = (semesterId) =>
    setExpandedSemesters((prev) => ({
      ...prev,
      [semesterId]: !prev[semesterId],
    }));

  const semesterOptions = Array.from(
    new Set(safeYears.flatMap((year) => year.semesters.map((s) => s.title))),
  );

  const filteredCourses = safeYears
    .filter((y) => !filterYear || y.title === filterYear)
    .flatMap((year) =>
      year.semesters
        .filter((s) => !filterSemester || s.title === filterSemester)
        .flatMap((semester) =>
          semester.courses.map((course) => ({
            year: year.title,
            semester: semester.title,
            ...course,
          })),
        ),
    );

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-100 p-6 space-y-6">
      {/* CGPA SUMMARY */}
      <div className="rounded-2xl border p-6 shadow-md flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 transition-colors">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
            <GraduationCap size={28} />
          </div>
          <div>
            <h2 className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Cumulative GPA
            </h2>
            <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
              {cgpa}
            </p>
            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">
              Grading Scale: {gradingLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-2 border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950"
            onClick={() => setEditProfileModalOpen(true)}
          >
            <Settings size={16} /> Edit Profile
          </Button>
          <EditProfileModal
            open={editProfileModalOpen}
            onOpenChange={setEditProfileModalOpen}
          />
          <ThemeToggle />
          <LogoutButton />
        </div>
      </div>

      {/* GPA PANELS */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* What-If Panel */}
        <div className="rounded-2xl border p-5 shadow-sm bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 transition-colors">
          <WhatIfPanel gradingScale={gradingScale} years={safeYears} />
        </div>

        {/* AI Planner */}
        <div className="rounded-2xl border p-5 shadow-sm bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700 transition-colors">
          <UngradedTargetPlanner gradingScale={gradingScale} />
        </div>
      </div>

      {/* FILTERS */}
      <div className="sticky top-4 z-30 flex flex-col md:flex-row gap-4 items-center rounded-2xl border p-4 shadow-sm backdrop-blur bg-white/90 border-slate-200 dark:bg-slate-900/90 dark:border-slate-700 transition-colors">
        <Select
          value={filterYear}
          onValueChange={setFilterYear}
          className="md:w-1/2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Years</option>
          {safeYears.map((year) => (
            <option key={year.id} value={year.title}>
              {year.title}
            </option>
          ))}
        </Select>

        <Select
          value={filterSemester}
          onValueChange={setFilterSemester}
          className="md:w-1/2 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Semesters</option>
          {semesterOptions.map((sem) => (
            <option key={sem} value={sem}>
              {sem}
            </option>
          ))}
        </Select>

        <Button
          variant="outline"
          className="border-blue-500 text-blue-600 hover:bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-blue-950 transition-colors"
          onClick={() => {
            setFilterYear("");
            setFilterSemester("");
          }}
        >
          Reset Filters
        </Button>
      </div>

      {/* COURSES TABLE */}
      <div className="rounded-2xl border border-blue-300 dark:border-blue-700 p-4 bg-white dark:bg-blue-950 shadow-sm transition-colors">
        <h2 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
          All Courses Overview
        </h2>

        {safeYears.length === 0 ? (
          <p className="text-blue-700 dark:text-blue-300">
            No courses added yet.
          </p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-blue-700 dark:text-blue-300">
            No courses match the current filter.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-blue-300 dark:border-blue-700">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 z-10 bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-100">
                <tr>
                  <th className="border border-blue-300 dark:border-blue-700 p-2 text-left">
                    Year
                  </th>
                  <th className="border border-blue-300 dark:border-blue-700 p-2 text-left">
                    Semester
                  </th>
                  <th className="border border-blue-300 dark:border-blue-700 p-2 text-left">
                    Course
                  </th>
                  <th className="border border-blue-300 dark:border-blue-700 p-2 text-center">
                    CU
                  </th>
                  <th className="border border-blue-300 dark:border-blue-700 p-2 text-center">
                    Grade
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredCourses.map((course) => {
                  const gradeColor =
                    course.grade === "A"
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : course.grade === "F"
                        ? "text-red-600 dark:text-red-400 font-semibold"
                        : "text-blue-900 dark:text-blue-200";

                  return (
                    <tr
                      key={course.id}
                      className="hover:bg-blue-50 dark:hover:bg-blue-800 transition"
                    >
                      <td className="border border-blue-300 dark:border-blue-700 p-2">
                        {course.year}
                      </td>
                      <td className="border border-blue-300 dark:border-blue-700 p-2">
                        {course.semester}
                      </td>
                      <td className="border border-blue-300 dark:border-blue-700 p-2">
                        {course.name}
                      </td>
                      <td className="border border-blue-300 dark:border-blue-700 p-2 text-center">
                        {course.creditUnit}
                      </td>
                      <td
                        className={`border border-blue-300 dark:border-blue-700 p-2 text-center ${gradeColor}`}
                      >
                        {course.grade}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ACADEMIC YEARS COLLAPSIBLE */}
      <Button
        className="w-full rounded-xl font-medium transition bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
        onClick={() => {
          setShowAcademicYears((prev) => {
            const next = !prev;

            // scroll AFTER render
            if (!prev) {
              setTimeout(() => {
                academicYearsRef.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
                academicYearsRef.current?.focus?.();
              }, 50);
            }

            return next;
          });
        }}
      >
        {showAcademicYears ? "Hide Academic Years" : "Show Academic Years"}
      </Button>

      {showAcademicYears && (
        <div
          ref={academicYearsRef}
          tabIndex={-1}
          className="space-y-5 outline-none"
        >
          {safeYears.map((year) => (
            <details
              key={year.id}
              className="rounded-2xl border p-5 shadow-sm transition bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700"
            >
              <summary className="cursor-pointer font-semibold text-lg text-slate-900 dark:text-slate-100">
                {year.title}
              </summary>
              <div className="mt-4 space-y-3">
                {year.semesters.map((semester) => {
                  const semesterGPA = calculateSemesterGPA(
                    semester,
                    gradingScale,
                  );
                  const isExpanded = expandedSemesters[semester.id] || false;

                  return (
                    <div
                      key={semester.id}
                      className="ml-4 rounded-xl border-l-4 p-4 transition border-blue-400 bg-blue-50 dark:border-blue-500 dark:bg-slate-800"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {semester.title}{" "}
                          <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                            GPA: {semesterGPA}
                          </span>
                        </span>
                        <Button
                          size="xs"
                          variant="outline"
                          className="border-blue-400 text-blue-600 hover:bg-blue-50 dark:border-blue-500 dark:text-blue-400 dark:hover:bg-slate-700"
                          onClick={() => toggleSemester(semester.id)}
                        >
                          {isExpanded ? "Hide Courses" : "Show Courses"}
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="space-y-3">
                          <AddCourseForm
                            yearId={year.id}
                            semesterId={semester.id}
                            onAdd={addCourse}
                            gradingScale={gradingScale}
                          />
                          {semester.courses.map((course) => (
                            <div
                              key={course.id}
                              className="flex justify-between items-center rounded-lg border p-3 shadow-sm transition bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700"
                            >
                              <span className="text-sm text-slate-800 dark:text-slate-200">
                                {course.name}{" "}
                                <span className="mx-1 text-slate-400">•</span>
                                {course.creditUnit} CU{" "}
                                <span className="mx-1 text-slate-400">•</span>
                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                  {course.grade}
                                </span>
                              </span>
                              <div className="flex gap-2">
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingCourse({
                                      ...course,
                                      yearId: year.id,
                                      semesterId: semester.id,
                                    });
                                    setEditCourseModalOpen(true);
                                  }}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="xs"
                                  variant="destructive"
                                  onClick={() => {
                                    setCourseToDelete({
                                      yearId: year.id,
                                      semesterId: semester.id,
                                      courseId: course.id,
                                      name: course.name,
                                    });
                                    setDeleteCourseModalOpen(true);
                                  }}
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
            </details>
          ))}
        </div>
      )}

      {/* DELETE & EDIT MODALS */}
      {courseToDelete && (
        <ConfirmModal
          open={deleteCourseModalOpen}
          onOpenChange={setDeleteCourseModalOpen}
          title="Delete Course"
          message={`Are you sure you want to delete course ${courseToDelete.name}?`}
          onConfirm={() => {
            deleteCourse(
              courseToDelete.yearId,
              courseToDelete.semesterId,
              courseToDelete.courseId,
            );
            setCourseToDelete(null);
          }}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          open={editCourseModalOpen}
          onOpenChange={setEditCourseModalOpen}
          course={editingCourse}
          onSave={(updatedCourse) => {
            editCourse(
              editingCourse.yearId,
              editingCourse.semesterId,
              editingCourse.id,
              updatedCourse,
            );
            setEditingCourse(null);
          }}
        />
      )}
    </main>
  );
}
