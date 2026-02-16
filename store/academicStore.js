import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { supabase } from "@/lib/supabaseClient";

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
      editProfile: async (newProfile) => {
        const { profile } = get();

        const oldProfile = profile || {};

        const structureChanged =
          oldProfile.programYears !== newProfile.programYears ||
          oldProfile.semestersPerYear !== newProfile.semestersPerYear;

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) return;

        // 1️⃣ Update database first
        const { error } = await supabase
          .from("profiles")
          .update({
            country: newProfile.country,
            university: newProfile.university,
            program: newProfile.program,
            program_years: newProfile.programYears,
            semesters_per_year: newProfile.semestersPerYear,
            grading_scale_id:
              newProfile.gradingScaleId ?? oldProfile.gradingScaleId ?? "ng-5",
            updated_at: new Date(),
          })
          .eq("id", user.id);

        if (error) {
          console.error("Profile update failed:", error);
          return;
        }

        // 2️⃣ Then update Zustand state
        set({
          profile: {
            ...oldProfile,
            ...newProfile,
            gradingScaleId:
              newProfile.gradingScaleId ?? oldProfile.gradingScaleId ?? "ng-5",
          },
          years: structureChanged ? [] : get().years,
          isInitialized: true,
        });
      },

      // ===== STRUCTURE INITIALIZATION =====
      initializeAcademicStructure: (programYears = 0, semestersPerYear = 0) =>
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
          isInitialized: true,
        })),

      hydrateAcademicData: (yearsFromDB) =>
        set(() => ({
          years: Array.isArray(yearsFromDB) ? yearsFromDB : [],
          isInitialized: true,
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
         RESET / LOGOUT
      =============================== */

      resetAll: () => {
        set({
          profile: null,
          years: [],
          isInitialized: false,
        });
        localStorage.removeItem("universal-cgpa-storage");
      },
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
