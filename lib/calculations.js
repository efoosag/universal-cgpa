// lib/calculations.js

// Convert grade → point safely
export function gradeToPoint(grade, gradingScale) {
  if (!grade || !gradingScale) return null;

  return gradingScale[String(grade).toUpperCase()] ?? null;
}

// Semester GPA
export function calculateSemesterGPA(semester, gradingScale) {
  if (!semester?.courses?.length) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  semester.courses.forEach((course) => {
    const credit = Number(course.creditUnit);
    if (!credit || credit <= 0) return;

    const point = gradeToPoint(course.grade, gradingScale);
    if (point === null) return; // ✅ skip ungraded courses

    totalPoints += point * credit;
    totalCredits += credit;
  });

  return totalCredits === 0
    ? 0
    : +(totalPoints / totalCredits).toFixed(2);
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
        const credit = Number(course.creditUnit);
        if (!credit || credit <= 0) return;

        const point = gradeToPoint(course.grade, gradingScale);
        if (point === null) return; // ✅ ignore ungraded

        totalPoints += point * credit;
        totalCredits += credit;
      });
    });
  });

  return totalCredits === 0
    ? 0
    : +(totalPoints / totalCredits).toFixed(2);
}

// What-If simulation
export function simulateWhatIf(years, gradingScale, overrides = {}) {
  if (!Array.isArray(years)) return 0;

  const clonedYears = structuredClone(years);

  clonedYears.forEach((year) => {
    year.semesters?.forEach((semester) => {
      semester.courses?.forEach((course) => {
        // ✅ apply override even if original grade is null
        if (overrides.hasOwnProperty(course.id)) {
          course.grade = overrides[course.id] || null;
        }
      });
    });
  });

  return calculateCGPA(clonedYears, gradingScale);
}
