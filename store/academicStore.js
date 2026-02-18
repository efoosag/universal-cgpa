import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

export const useAcademicStore = create((set, get) => ({
  // =========================
  // ROOT STATE
  // =========================
  profile: null,
  years: [],
  loading: false,
  isInitialized: false,

  // =========================
  // FETCH FULL PROFILE DATA
  // =========================
  fetchProfile: async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .single();

    if (error) {
      console.error("Fetch profile error:", error);
      return;
    }

    if (data) {
      set({
        profile: {
          id: data.id, // ✅ VERY IMPORTANT
          country: data.country || "",
          university: data.university || "",
          program: data.program || "",
          gradingScaleId: data.grading_scale_id || "ng-5",
          programYears: data.program_years,
          semestersPerYear: data.semesters_per_year,
        },
      });
    }
  },

  // =========================
  // FETCH FULL ACADEMIC DATA
  // =========================
  fetchAcademicData: async () => {
    set({ loading: true });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data, error } = await supabase
      .from("academic_years")
      .select(
        `
        id,
        year_number,
        semesters (
          id,
          semester_number,
          status,
          courses (
            id,
            name,
            code,
            credit_unit,
            grade,
            is_retake
          )
        )
      `,
      )
      .eq("user_id", user.id)
      .order("year_number");

    if (error) {
      console.error(error);
      set({ loading: false });
      return;
    }

    const formatted = data.map((year) => ({
      id: year.id,
      title: `Year ${year.year_number}`,
      semesters: year.semesters.map((sem) => ({
        id: sem.id,
        title: `Semester ${sem.semester_number}`,
        status: sem.status,
        courses: sem.courses.map((c) => ({
          id: c.id,
          name: c.name,
          code: c.code,
          creditUnit: c.credit_unit,
          grade: c.grade,
          isRetake: c.is_retake,
        })),
      })),
    }));

    set({ years: formatted, loading: false, isInitialized: true });
  },

  // =========================
  // INITIALIZE STRUCTURE
  // =========================
  initializeAcademicStructure: async (programYears, semestersPerYear) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Delete existing structure
    await supabase.from("academic_years").delete().eq("user_id", user.id);

    for (let y = 1; y <= programYears; y++) {
      const { data: year } = await supabase
        .from("academic_years")
        .insert({
          user_id: user.id,
          year_number: y,
        })
        .select()
        .single();

      for (let s = 1; s <= semestersPerYear; s++) {
        await supabase.from("semesters").insert({
          year_id: year.id,
          semester_number: s,
          status: "planned",
        });
      }
    }

    await get().fetchAcademicData();
  },

  // =========================
  // EDIT PROFILE
  // =========================
  editProfile: async (newProfile) => {
    const { profile, fetchAcademicData } = get(); // fetchAcademicData will refresh dashboard

    const oldProfile = profile || {};

    const structureChanged =
      oldProfile.programYears !== newProfile.programYears ||
      oldProfile.semestersPerYear !== newProfile.semestersPerYear;

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1️⃣ Update profiles table
    const { error } = await supabase
      .from("profiles")
      .update({
        country: newProfile.country,
        university: newProfile.university,
        program: newProfile.program,
        program_years: newProfile.programYears,
        semesters_per_year: newProfile.semestersPerYear,
        grading_scale_id: newProfile.gradingScaleId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating profile:", error.message);
      return;
    }

    // 2️⃣ Reset academic structure if program/semesters changed
    if (structureChanged) {
      const { error: rpcError } = await supabase.rpc(
        "reset_academic_structure",
        {
          p_user_id: user.id, // ⚠ parameter name must match RPC
          p_program_years: Number(newProfile.programYears),
          p_semesters_per_year: Number(newProfile.semestersPerYear),
        },
      );

      if (rpcError) {
        console.error("Error resetting academic structure:", rpcError.message);
        return;
      }
    }

    // 3️⃣ Update store
    set({
      profile: {
        ...profile,
        ...newProfile,
      },
    });

    // 4️⃣ Refresh academic data for dashboard
    await fetchAcademicData();
  },

  // =========================
  // ADD COURSE
  // =========================
  addCourse: async (semesterId, courseData) => {
    const { error } = await supabase.from("courses").insert({
      semester_id: semesterId,
      name: courseData?.name?.trim(),
      code: courseData?.code?.trim() || "",
      credit_unit: Number(courseData?.creditUnit),
      grade: courseData?.grade ?? null,
      is_retake: !!courseData?.isRetake,
    });

    if (error) console.error(error);

    await get().fetchAcademicData();
  },

  // =========================
  // EDIT COURSE
  // =========================
  editCourse: async (courseId, updatedData) => {
    const { error } = await supabase
      .from("courses")
      .update({
        name: updatedData.name.trim(),
        code: updatedData.code?.trim() || "",
        credit_unit: Number(updatedData.creditUnit),
        grade: updatedData.grade?.toUpperCase() || null,
        is_retake: !!updatedData.isRetake,
        updated_at: new Date().toISOString(),
      })
      .eq("id", courseId);

    if (error) {
      console.error("Failed to update course:", error);
      return false;
    }

    // ✅ Update the nested course in the store
    set((state) => ({
      years: state.years.map((year) => ({
        ...year,
        semesters: year.semesters.map((sem) => ({
          ...sem,
          courses: sem.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  name: updatedData.name.trim(),
                  code: updatedData.code?.trim() || "",
                  creditUnit: Number(updatedData.creditUnit),
                  grade: updatedData.grade?.toUpperCase() || null,
                  isRetake: !!updatedData.isRetake,
                }
              : c,
          ),
        })),
      })),
    }));

    return true;
  },

  // =========================
  // DELETE COURSE
  // =========================
  deleteCourse: async (courseId) => {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) {
      console.error("Failed to delete course:", error);
      return false;
    }

    // ✅ Remove the course from the local store immediately
    set((state) => ({
      years: state.years.map((year) => ({
        ...year,
        semesters: year.semesters.map((sem) => ({
          ...sem,
          courses: sem.courses.filter((c) => c.id !== courseId),
        })),
      })),
    }));

    return true;
  },

  // Bulk Courses Upload
  bulkInsertCourses: async (courses, semesterId) => {
    if (!semesterId) {
      return { error: "No semester selected." };
    }

    if (!courses || courses.length === 0) {
      return { error: "No courses provided." };
    }

    const mapped = courses
      .map((c) => ({
        semester_id: semesterId,
        name: c["Course Name"]?.trim(),
        code: c["Course Code"]?.trim() || "",
        credit_unit: Number(c["Credit Units"]) || 0,
        grade: c["Grade"]?.toUpperCase() || null,
        is_retake: c["Is Retake"] === true || c["Is Retake"] === "TRUE",
      }))
      .filter((c) => c.name && c.credit_unit > 0);

    if (mapped.length === 0) {
      return { error: "No valid courses found." };
    }

    const { error } = await supabase.from("courses").insert(mapped);

    if (error) {
      console.error(error);
      return { error: error.message };
    }

    await get().fetchAcademicData();

    return { success: true };
  },

  // =========================
  // UPDATE SEMESTER STATUS
  // =========================
  updateSemesterStatus: async (semesterId, status) => {
    const { error } = await supabase
      .from("semesters")
      .update({ status })
      .eq("id", semesterId);

    if (error) console.error(error);

    await get().fetchAcademicData();
  },

  // =========================
  // RESET ACADEMIC DATA
  // =========================
  resetAcademicData: async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase.from("academic_years").delete().eq("user_id", user.id);

    set({ years: [], isInitialized: false });
  },

  // =========================
  // RESET EVERYTHING
  // =========================
  resetAll: () =>
    set({
      profile: null,
      years: [],
      isInitialized: false,
    }),
}));
