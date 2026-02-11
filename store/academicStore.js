import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// ================================
// Hydration-safe ID generator
// ================================
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

      // PRO Status
      isPro: false,

      setHasHydrated: () => set({ hasHydrated: true }),

      // ===== ONBOARDING =====
      setProfile: (profile) =>
        set({
          profile: {
            gradingScaleId: "ng-5", // default grading scale
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
              ...newProfile,
              gradingScaleId:
                newProfile.gradingScaleId ??
                oldProfile.gradingScaleId ??
                "ng-5",
            },
            years: structureChanged ? [] : state.years,
            isInitialized: true,
          };
        }),

      // ===== STRUCTURE INITIALIZATION =====
      initializeAcademicStructure: (programYears, semestersPerYear) =>
        set(() => ({
          years: Array.from({ length: programYears }, (_, y) => ({
            id: uid(),
            title: `Year ${y + 1}`,
            semesters: Array.from({ length: semestersPerYear }, (_, s) => ({
              id: uid(),
              title: `Semester ${s + 1}`,
              status: "planned", // planned | ongoing | completed
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
                              name: courseData.name.trim(),
                              code: courseData.code?.trim() || "",
                              creditUnit: Number(courseData.creditUnit),
                              grade: courseData.grade ?? null, // allow ungraded
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
                          courses: sem.courses.map((course) =>
                            course.id === courseId
                              ? {
                                  ...course,
                                  ...updatedCourse,
                                  creditUnit:
                                    updatedCourse.creditUnit !== undefined
                                      ? Number(updatedCourse.creditUnit)
                                      : course.creditUnit,
                                  grade:
                                    updatedCourse.grade !== undefined
                                      ? (updatedCourse.grade ?? null)
                                      : course.grade,
                                }
                              : course,
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
                          courses: sem.courses.filter(
                            (course) => course.id !== courseId,
                          ),
                        }
                      : sem,
                  ),
                }
              : year,
          ),
        })),

      // ===== SEMESTER STATUS =====
      updateSemesterStatus: (yearId, semesterId, status) =>
        set((state) => ({
          years: state.years.map((year) =>
            year.id === yearId
              ? {
                  ...year,
                  semesters: year.semesters.map((sem) =>
                    sem.id === semesterId ? { ...sem, status } : sem,
                  ),
                }
              : year,
          ),
        })),

      /* ===============================
         PRO LOGIC
      =============================== */

      upgradeToPro: () =>
        set({
          isPro: true,
        }),

      downgradeFromPro: () =>
        set({
          isPro: false,
        }),
      /* ===============================
         RESET / LOGOUT
      =============================== */

      resetAll: () =>{
        set({
          profile: null,
          years: [],
          isInitialized: false,
          isPro: false,
        });
        localStorage.removeItem("universal-cgpa-storage");
      }
    }),

    {
      name: "universal-cgpa-storage",
      storage: createJSONStorage(() => localStorage),
      version: 1,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
