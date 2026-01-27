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
import { Select } from "@/components/ui/select";

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

  const [expandedSemesters, setExpandedSemesters] = useState({});
  const [showAcademicYears, setShowAcademicYears] = useState(false);

  // ===== Filter states =====
  const [filterYear, setFilterYear] = useState("");
  const [filterSemester, setFilterSemester] = useState("");

  const safeYears = Array.isArray(years) ? years : [];
  const gradingScale =
    GRADING_SCALES[profile?.gradingScaleId] || GRADING_SCALES["ng-5"];
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
        profile.semestersPerYear
      );
    }
  }, [isInitialized, profile, years.length, initializeAcademicStructure]);

  // Redirect to onboarding if not initialized
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isInitialized) router.replace("/onboarding");
  }, [isInitialized, router, hasHydrated]);

  if (!hasHydrated) return <div className="p-6">Loading dashboard…</div>;

  const toggleSemester = (semesterId) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semesterId]: !prev[semesterId],
    }));
  };

  // ===== Extract unique semesters for filter =====
  const semesterOptions = Array.from(
    new Set(
      safeYears.flatMap((year) => year.semesters.map((s) => s.title))
    )
  );

  // ===== Filtered courses for table =====
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
          }))
        )
    );

  return (
    <div className="p-6 space-y-6">
      {/* ===== CGPA SUMMARY ===== */}
      <div className="border rounded p-4">
        <h2 className="text-lg font-semibold">Cumulative GPA</h2>
        <p className="text-3xl font-bold mt-2">{cgpa}</p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setEditProfileModalOpen(true)}
        >
          Edit Profile
        </Button>
        <EditProfileModal
          open={editProfileModalOpen}
          onOpenChange={setEditProfileModalOpen}
        />
      </div>

      {/* ===== Additional Panels ===== */}
      <WhatIfPanel />
      <TargetCGPAPlanner />

      {/* ===== Filter Component ===== */}
      <div className="flex gap-4 items-center border rounded p-4">
        <Select
          value={filterYear}
          onValueChange={setFilterYear}
          placeholder="All Years"
        >
          <Select.Item value="">All Years</Select.Item>
          {safeYears.map((year) => (
            <Select.Item key={year.id} value={year.title}>
              {year.title}
            </Select.Item>
          ))}
        </Select>

        <Select
          value={filterSemester}
          onValueChange={setFilterSemester}
          placeholder="All Semesters"
        >
          <Select.Item value="">All Semesters</Select.Item>
          {semesterOptions.map((sem) => (
            <Select.Item key={sem} value={sem}>
              {sem}
            </Select.Item>
          ))}
        </Select>
      </div>

      {/* ===== COURSES OVERVIEW TABLE ===== */}
      <div className="border rounded p-4">
        <h2 className="text-lg font-semibold mb-2">All Courses Overview</h2>
        {safeYears.length === 0 ? (
          <p className="text-muted-foreground">No courses added yet.</p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-muted-foreground">
            No courses match the current filter.
          </p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Year</th>
                <th className="border p-2 text-left">Semester</th>
                <th className="border p-2 text-left">Course</th>
                <th className="border p-2 text-center">CU</th>
                <th className="border p-2 text-center">Grade</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                  <td className="border p-2">{course.year}</td>
                  <td className="border p-2">{course.semester}</td>
                  <td className="border p-2">{course.name}</td>
                  <td className="border p-2 text-center">{course.creditUnit}</td>
                  <td className="border p-2 text-center">{course.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ===== TOGGLE ACADEMIC YEARS BUTTON ===== */}
      <Button
        className="w-full"
        variant="outline"
        onClick={() => setShowAcademicYears(!showAcademicYears)}
      >
        {showAcademicYears ? "Hide Academic Years" : "Show Academic Years"}
      </Button>

      {/* ===== ACADEMIC YEARS COLLAPSIBLE ===== */}
      {showAcademicYears && (
        <div className="space-y-4">
          {safeYears.map((year) => (
            <details key={year.id} className="border rounded p-3">
              <summary className="cursor-pointer font-semibold">{year.title}</summary>

              {year.semesters.map((semester) => {
                const semesterGPA = calculateSemesterGPA(semester, gradingScale);
                const isExpanded = expandedSemesters[semester.id] || false;

                return (
                  <div
                    key={semester.id}
                    className="ml-4 border-l pl-4 mt-2 p-2 bg-gray-50 rounded"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span>{semester.title} (GPA: {semesterGPA})</span>
                      <Button size="xs" onClick={() => toggleSemester(semester.id)}>
                        {isExpanded ? "Hide Courses" : "Show Courses"}
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="space-y-2">
                        <AddCourseForm
                          yearId={year.id}
                          semesterId={semester.id}
                          onAdd={addCourse}
                        />

                        {semester.courses.map((course) => (
                          <div
                            key={course.id}
                            className="flex justify-between items-center border p-2 rounded-md bg-white shadow-sm"
                          >
                            <span>
                              {course.name} ({course.creditUnit} CU) - {course.grade}
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

      {/* ===== DELETE COURSE MODAL ===== */}
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
              courseToDelete.courseId
            );
            setCourseToDelete(null);
          }}
        />
      )}

      {/* ===== EDIT COURSE MODAL ===== */}
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
              updatedCourse
            );
            setEditingCourse(null);
          }}
        />
      )}
    </div>
  );
}
