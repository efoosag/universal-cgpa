import { create } from "zustand";
import { persist } from "zustand/middleware";

const uid = () => crypto.randomUUID();

export const useAcademicStore = create(
  persist(
    (set, get) => ({
      // ===== ROOT STATE =====
      appVersion: "1.0",
      years: [],
      profile: null,
      isInitialized: false,
      hasHydrated: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      // ===== ONBOARDING =====
      setProfile: (profile) =>
        set({
          profile: {
            gradingScale: "ng-5", // ✅ default
            ...profile,
          },
          isInitialized: true,
        }),

      // ===== PROFILE EDIT =====
      editProfile: (newProfile) =>
        set((state) => {
          const oldProfile = state.profile || {};

          const structureChanged =
            oldProfile.programYears !== newProfile.programYears ||
            oldProfile.semestersPerYear !== newProfile.semestersPerYear;

          return {
            profile: {
              ...oldProfile,
              ...newProfile, // includes gradingScale
            },
            years: structureChanged ? [] : state.years,
            isInitialized: true,
          };
        }),

      // ===== STRUCTURE =====
      initializeAcademicStructure: (programYears, semestersPerYear) =>
        set(() => ({
          years: Array.from({ length: programYears }, (_, y) => ({
            id: uid(),
            title: `Year ${y + 1}`,
            createdAt: new Date().toISOString(),
            semesters: Array.from({ length: semestersPerYear }, (_, s) => ({
              id: uid(),
              title: `Semester ${s + 1}`,
              status: "planned",
              courses: [],
            })),
          })),
        })),

      resetAcademicData: () =>
        set({
          years: [],
          profile: null,
          isInitialized: false,
        }),

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
                      : sem
                  ),
                }
              : year
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
                            c.id === courseId ? { ...c, ...updatedCourse } : c
                          ),
                        }
                      : sem
                  ),
                }
              : year
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
                          courses: sem.courses.filter(
                            (c) => c.id !== courseId
                          ),
                        }
                      : sem
                  ),
                }
              : year
          ),
        })),
    }),
    {
      name: "universal-cgpa-storage",
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated();
      },
    }
  )
);
