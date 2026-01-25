"use client";

import { useState } from "react";
import { useAcademicStore } from "@/store/academicStore";
import { calculateSemesterGPA, calculateCGPA } from "@/lib/calculations";
import { GRADING_SCALES } from "@/lib/grading";
import AddYearForm from "@/components/AddYearForm";
import AddSemesterForm from "@/components/AddSemesterForm";
import AddCourseForm from "@/components/AddCourseForm";
import EditCourseModal from "@/components/EditCourseModal";
import ConfirmModal from "@/components/ConfirmModal";
import WhatIfPanel from "@/components/WhatIfPanel";
import TargetCGPAPlanner from "@/components/TargetCGPAPlanner";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { years, addYear, addSemester, addCourse, editCourse, deleteCourse } =
    useAcademicStore();
  const gradingScale = GRADING_SCALES["ng-5"];
  const [editingCourse, setEditingCourse] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteCourseModalOpen, setDeleteCourseModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState(null);

  const cgpa = calculateCGPA(years, gradingScale);

  return (
    <div className="p-6 space-y-6">
      {/* CGPA SUMMARY */}
      <div className="rounded-lg border p-4">
        <h2 className="text-lg font-semibold">Cumulative GPA</h2>
        <p className="text-3xl font-bold mt-2">{cgpa}</p>
      </div>
      <div className="border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Add Academic Year</h3>
        <AddYearForm onAdd={addYear} />
      </div>
      <WhatIfPanel />
      <TargetCGPAPlanner />

      {/* YEARS */}
      {years.length === 0 && (
        <p className="text-muted-foreground">
          No academic data yet. Add a year to begin.
        </p>
      )}

      {years.map((year) => (
        <div key={year.id} className="space-y-4">
          <h3 className="text-xl font-semibold">{year.title}</h3>
          <AddSemesterForm yearId={year.id} onAdd={addSemester} />

          {/* SEMESTERS */}
          {year.semesters.map((semester) => {
            const semesterGPA = calculateSemesterGPA(semester, gradingScale);

            return (
              <div key={semester.id} className="ml-4 border-l pl-4 space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">
                    {semester.title} ({semester.status})
                  </h4>
                  <span className="font-semibold">GPA: {semesterGPA}</span>
                </div>

                {/* COURSES */}
                {semester.courses.length === 0 && (
                  <p className="text-sm text-muted-foreground ml-4">
                    No courses added
                  </p>
                )}

                {/* Add Course Form */}
                <AddCourseForm
                  yearId={year.id}
                  semesterId={semester.id}
                  onAdd={addCourse}
                />

                {semester.courses.map((course) => (
                  <div
                    key={course.id}
                    className="ml-4 flex justify-between items-center text-sm gap-2"
                  >
                    <span>
                      {course.name} ({course.creditUnit} CU)
                    </span>
                    <span>{course.grade}</span>

                    {/* Buttons */}
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCourse({
                            ...course,
                            yearId: year.id,
                            semesterId: semester.id,
                            id: course.id,
                          });
                          setModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>

                      <Button
                        size="sm"
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
                    open={modalOpen}
                    onOpenChange={setModalOpen}
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
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
