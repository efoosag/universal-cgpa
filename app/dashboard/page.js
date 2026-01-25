"use client";

import { useAcademicStore } from "@/store/academicStore";
import { calculateSemesterGPA, calculateCGPA } from "@/lib/calculations";
import { GRADING_SCALES } from "@/lib/grading";
import AddYearForm from "@/components/AddYearForm";
import AddSemesterForm from "@/components/AddSemesterForm";
import AddCourseForm from "@/components/AddCourseForm";

export default function Dashboard() {
  const { years, addYear, addSemester, addCourse } = useAcademicStore();
  const gradingScale = GRADING_SCALES["ng-5"];

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
                    className="ml-4 flex justify-between text-sm"
                  >
                    <span>
                      {course.name} ({course.creditUnit} CU)
                    </span>
                    <span className="font-medium">{course.grade}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
