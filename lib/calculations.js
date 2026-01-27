// lib/calculations.js

// Convert grade → point safely
export function gradeToPoint(grade, gradingScale) {
  if (!grade) return null;
  return gradingScale[grade.toUpperCase()] ?? null;
}

// Semester GPA
export function calculateSemesterGPA(semester, gradingScale) {
  if (!semester?.courses?.length) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  semester.courses.forEach((course) => {
    const point = gradeToPoint(course.grade, gradingScale);
    if (point === null) return;

    totalPoints += point * course.creditUnit;
    totalCredits += course.creditUnit;
  });

  return totalCredits === 0 ? 0 : +(totalPoints / totalCredits).toFixed(2);
}

// CGPA (supports completedOnly mode)
export function calculateCGPA(years, gradingScale, options = {}) {
  const { completedOnly = false } = options;

  if (!Array.isArray(years)) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  years.forEach((year) => {
    year.semesters?.forEach((semester) => {
      if (completedOnly && semester.status !== "completed") return;

      semester.courses?.forEach((course) => {
        const point = gradeToPoint(course.grade, gradingScale);
        if (point === null) return;

        totalPoints += point * course.creditUnit;
        totalCredits += course.creditUnit;
      });
    });
  });

  return totalCredits === 0 ? 0 : +(totalPoints / totalCredits).toFixed(2);
}

// What-If simulation
export function simulateWhatIf(years, gradingScale, overrides = {}) {
  if (!Array.isArray(years)) return 0;

  const clonedYears = structuredClone(years);

  clonedYears.forEach((year) => {
    year.semesters?.forEach((semester) => {
      semester.courses?.forEach((course) => {
        if (overrides[course.id]) {
          course.grade = overrides[course.id];
        }
      });
    });
  });

  return calculateCGPA(clonedYears, gradingScale);
}
