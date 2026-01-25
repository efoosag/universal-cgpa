// Grading helper function
export function gradeToPoint(grade, gradingScale) {
  return gradingScale[grade] ?? null;
}

//Semester GPA calculation function
export function calculateSemesterGPA(semester, gradingScale) {
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

//CGPA calculation function across Academic Year and Semester
export function calculateCGPA(years, gradingScale) {
  let totalPoints = 0;
  let totalCredits = 0;

  years.forEach((year) => {
    year.semesters.forEach((semester) => {
      if (semester.status !== "completed") return;

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

//What-If-Simulation healper function
export function simulateWhatIf(years, gradingScale, overrides = {}) {
  const clonedYears = JSON.parse(JSON.stringify(years));

  clonedYears.forEach((year) => {
    year.semesters.forEach((semester) => {
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


