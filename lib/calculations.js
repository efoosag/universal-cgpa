// Grading helper function
export function gradeToPoint(grade, gradingScale) {
  return gradingScale[grade] ?? null;
}

// Semester GPA calculation
export function calculateSemesterGPA(semester, gradingScale) {
  if (!semester || !Array.isArray(semester.courses)) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  semester.courses.forEach((course) => {
    const point = gradeToPoint(course.grade, gradingScale);
    if (point === null) return;

    totalPoints += point * course.creditUnit;
    totalCredits += course.creditUnit;
  });

  if (totalCredits === 0) return 0;
  return Number((totalPoints / totalCredits).toFixed(2));
}

// CGPA calculation across years & semesters
export function calculateCGPA(years, gradingScale) {
  if (!Array.isArray(years)) return 0;

  let totalPoints = 0;
  let totalCredits = 0;

  years.forEach((year) => {
    if (!Array.isArray(year.semesters)) return;

    year.semesters.forEach((semester) => {
      if (semester.status !== "completed") return;
      if (!Array.isArray(semester.courses)) return;

      semester.courses.forEach((course) => {
        const point = gradeToPoint(course.grade, gradingScale);
        if (point === null) return;

        totalPoints += point * course.creditUnit;
        totalCredits += course.creditUnit;
      });
    });
  });

  if (totalCredits === 0) return 0;
  return Number((totalPoints / totalCredits).toFixed(2));
}

// What-If simulation helper
export function simulateWhatIf(years, gradingScale, overrides = {}) {
  if (!Array.isArray(years)) return 0;

  const clonedYears = JSON.parse(JSON.stringify(years));

  clonedYears.forEach((year) => {
    if (!Array.isArray(year.semesters)) return;

    year.semesters.forEach((semester) => {
      if (!Array.isArray(semester.courses)) return;

      semester.courses.forEach((course) => {
        const override = overrides[course.id];
        if (override) {
          course.grade = override.grade;
        }
      });
    });
  });

  return calculateCGPA(clonedYears, gradingScale);
}
