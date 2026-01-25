import { create } from "zustand";
import { persist } from "zustand/middleware";

// simple ID generator
const uid = () => crypto.randomUUID();

export const useAcademicStore = create(
  persist(
    (set, get) => ({
      // ===== ROOT STATE =====
      appVersion: "1.0",

      years: [],

      // ===== YEAR ACTIONS =====
      addYear: (title) =>
        set((state) => ({
          years: [
            ...state.years,
            {
              id: uid(),
              title,
              createdAt: new Date().toISOString(),
              semesters: [],
            },
          ],
        })),

      deleteYear: (yearId) =>
        set((state) => ({
          years: state.years.filter((y) => y.id !== yearId),
        })),

      // ===== SEMESTER ACTIONS =====
      addSemester: (yearId, title, status = "planned") =>
        set((state) => ({
          years: state.years.map((year) =>
            year.id === yearId
              ? {
                  ...year,
                  semesters: [
                    ...year.semesters,
                    {
                      id: uid(),
                      title,
                      status, // completed | ongoing | planned
                      courses: [],
                    },
                  ],
                }
              : year,
          ),
        })),

      deleteSemester: (yearId, semesterId) =>
        set((state) => ({
          years: state.years.map((year) =>
            year.id === yearId
              ? {
                  ...year,
                  semesters: year.semesters.filter((s) => s.id !== semesterId),
                }
              : year,
          ),
        })),

      // ===== COURSE ACTIONS =====
      addCourse: (yearId, semesterId, courseData) =>
        set((state) => ({
          years: state.years.map((year) =>
            year.id === yearId
              ? {
                  ...year,
                  semesters: year.semesters.map((sem) =>
                    sem.id === semesterId
                      ? {
                          ...sem,
                          courses: [
                            ...sem.courses,
                            {
                              id: uid(),
                              name: courseData.name,
                              code: courseData.code || "",
                              creditUnit: Number(courseData.creditUnit),
                              grade: courseData.grade,
                              isRetake: !!courseData.isRetake,
                            },
                          ],
                        }
                      : sem,
                  ),
                }
              : year,
          ),
        })),

      editCourse: (yearId, semesterId, courseId, updatedCourse) =>
        set((state) => ({
          years: state.years.map((year) =>
            year.id === yearId
              ? {
                  ...year,
                  semesters: year.semesters.map((sem) =>
                    sem.id === semesterId
                      ? {
                          ...sem,
                          courses: sem.courses.map((c) =>
                            c.id === courseId ? { ...c, ...updatedCourse } : c,
                          ),
                        }
                      : sem,
                  ),
                }
              : year,
          ),
        })),

      deleteCourse: (yearId, semesterId, courseId) =>
        set((state) => ({
          years: state.years.map((year) =>
            year.id === yearId
              ? {
                  ...year,
                  semesters: year.semesters.map((sem) =>
                    sem.id === semesterId
                      ? {
                          ...sem,
                          courses: sem.courses.filter((c) => c.id !== courseId),
                        }
                      : sem,
                  ),
                }
              : year,
          ),
        })),

      // ===== UTILITIES =====
      resetAll: () => set({ years: [] }),
    }),
    {
      name: "universal-cgpa-storage",
      version: 1,
    },
  ),
);
