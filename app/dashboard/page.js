"use client";

import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
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
import { Select } from "@/components/ui/select";
import { GraduationCap, Settings } from "lucide-react";
import AISmartPlanner from "@/components/AISmartPlanner";
import ThemeToggle from "@/components/ThemeToggle";

export default function Dashboard() {
  const { theme, setTheme } = useTheme();
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
  const cgpa = calculateCGPA(safeYears, gradingScale);

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
      <div
  className="
    rounded-2xl border p-6 shadow-md
    flex flex-col md:flex-row md:items-center md:justify-between gap-4
    bg-white border-slate-200
    dark:bg-slate-900 dark:border-slate-700
    transition-colors
  "
>
  {/* Left: CGPA Info */}
  <div className="flex items-center gap-4">
    <div
      className="
        p-3 rounded-xl
        bg-blue-100 text-blue-600
        dark:bg-blue-950 dark:text-blue-400
      "
    >
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

  {/* Right: Actions */}
  <div className="flex items-center gap-2">
    <Button
      size="sm"
      variant="outline"
      className="
        flex items-center gap-2
        border-blue-500 text-blue-600
        hover:bg-blue-50
        dark:border-blue-400 dark:text-blue-400
        dark:hover:bg-blue-950
      "
      onClick={() => setEditProfileModalOpen(true)}
    >
      <Settings size={16} />
      Edit Profile
    </Button>

    <EditProfileModal
      open={editProfileModalOpen}
      onOpenChange={setEditProfileModalOpen}
    />

    <ThemeToggle />
  </div>
</div>


      {/* PANELS */}
      <div className="grid md:grid-cols-2 gap-6">
  {/* Left Side Panels */}
  <div className="grid md:grid-cols-2 gap-6">
    <div
      className="
        rounded-2xl border p-4 shadow-sm
        bg-white border-slate-200
        dark:bg-slate-900 dark:border-slate-700
        transition-colors
      "
    >
      <WhatIfPanel gradingScale={gradingScale} years={safeYears} />
    </div>

    <div
      className="
        rounded-2xl border p-4 shadow-sm
        bg-white border-slate-200
        dark:bg-slate-900 dark:border-slate-700
        transition-colors
      "
    >
      <AISmartPlanner gradingScale={gradingScale} />
    </div>
  </div>

  {/* Right Side Panel */}
  <div
    className="
      rounded-2xl border p-4 shadow-sm
      bg-white border-slate-200
      dark:bg-slate-900 dark:border-slate-700
      transition-colors
    "
  >
    <TargetCGPAPlanner gradingScale={gradingScale} years={safeYears} />
  </div>
</div>


      {/* FILTERS */}
      <div
  className="
    sticky top-4 z-30
    flex flex-col md:flex-row gap-4 items-center
    rounded-2xl border p-4 shadow-sm backdrop-blur
    bg-white/90 border-slate-200
    dark:bg-slate-900/90 dark:border-slate-700
    transition-colors
  "
>
  {/* Year Filter */}
  <Select
    value={filterYear}
    onValueChange={setFilterYear}
    className="
      md:w-1/2
      bg-white dark:bg-slate-800
      border-slate-300 dark:border-slate-600
      text-slate-900 dark:text-slate-100
      focus:ring-2 focus:ring-blue-500
    "
  >
    <option value="">All Years</option>
    {safeYears.map((year) => (
      <option key={year.id} value={year.title}>
        {year.title}
      </option>
    ))}
  </Select>

  {/* Semester Filter */}
  <Select
    value={filterSemester}
    onValueChange={setFilterSemester}
    className="
      md:w-1/2
      bg-white dark:bg-slate-800
      border-slate-300 dark:border-slate-600
      text-slate-900 dark:text-slate-100
      focus:ring-2 focus:ring-blue-500
    "
  >
    <option value="">All Semesters</option>
    {semesterOptions.map((sem) => (
      <option key={sem} value={sem}>
        {sem}
      </option>
    ))}
  </Select>

  {/* Reset Button */}
  <Button
    variant="outline"
    className="
      border-blue-500 text-blue-600
      hover:bg-blue-50
      dark:border-blue-400 dark:text-blue-400
      dark:hover:bg-blue-950
      transition-colors
    "
    onClick={() => {
      setFilterYear("");
      setFilterSemester("");
    }}
  >
    Reset Filters
  </Button>
</div>


      {/* COURSES TABLE */}
      <div className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm">
        <h2 className="text-lg font-semibold mb-2 text-slate-900">
          All Courses Overview
        </h2>
        {safeYears.length === 0 ? (
          <p className="text-slate-500">No courses added yet.</p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-slate-500">No courses match the current filter.</p>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-blue-100 text-slate-900">
              <tr className="hover:bg-blue-50 transition">
                <th className="border p-2 text-left">Year</th>
                <th className="border p-2 text-left">Semester</th>
                <th className="border p-2 text-left">Course</th>
                <th className="border p-2 text-center">CU</th>
                <th className="border p-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-blue-50">
                  <td className="border p-2">{course.year}</td>
                  <td className="border p-2">{course.semester}</td>
                  <td className="border p-2">{course.name}</td>
                  <td className="border p-2 text-center">
                    {course.creditUnit}
                  </td>
                  <td className="border p-2 text-center">{course.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ACADEMIC YEARS COLLAPSIBLE */}
      <Button
        className="bg-blue-600 hover:bg-blue-700 text-white w-full"
        variant="outline"
        onClick={() => setShowAcademicYears(!showAcademicYears)}
      >
        {showAcademicYears ? "Hide Academic Years" : "Show Academic Years"}
      </Button>

      {showAcademicYears && (
        <div className="space-y-4">
          {safeYears.map((year) => (
            <details
              key={year.id}
              className="rounded-2xl border border-slate-200 p-4 bg-white shadow-sm"
            >
              <summary className="cursor-pointer font-semibold text-slate-900">
                {year.title}
              </summary>

              {year.semesters.map((semester) => {
                const semesterGPA = calculateSemesterGPA(
                  semester,
                  gradingScale,
                );
                const isExpanded = expandedSemesters[semester.id] || false;

                return (
                  <div
                    key={semester.id}
                    className="ml-4 border-l pl-4 mt-2 p-2 bg-blue-50 rounded"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-slate-900">
                        {semester.title} (GPA: {semesterGPA})
                      </span>
                      <Button
                        variant="outline"
                        className="border-slate-300"
                        size="xs"
                        onClick={() => toggleSemester(semester.id)}
                      >
                        {isExpanded ? "Hide Courses" : "Show Courses"}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2">
                        <AddCourseForm
                          yearId={year.id}
                          semesterId={semester.id}
                          onAdd={addCourse}
                          gradingScale={gradingScale}
                        />

                        {semester.courses.map((course) => (
                          <div
                            key={course.id}
                            className="flex justify-between items-center border p-2 rounded-md bg-white shadow-sm"
                          >
                            <span>
                              {course.name} ({course.creditUnit} CU) -{" "}
                              {course.grade}
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
