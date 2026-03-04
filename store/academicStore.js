import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";

export const useAcademicStore = create((set, get) => ({
  // =========================
  // ROOT STATE
  // =========================
  user: null,
  profile: null,
  years: [],
  loading: false,
  isInitialized: false,

  // =========================
  // LOAD USER + PROFILE
  // =========================
  loadUserAndProfile: async () => {
    set({ loading: true });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      set({ user: null, profile: null, loading: false, isInitialized: true });
      return;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    console.log("PROFILE ERROR:", error);
    console.log("PROFILE DATA:", profile);

    if (error) {
      console.error(error);
    }

    set({
      user,
      profile: profile
        ? {
            id: profile.id,
            country: profile.country,
            university: profile.university,
            program: profile.program,
            gradingScaleId: profile.grading_scale_id || "ng-5",
            programYears: profile.program_years,
            semestersPerYear: profile.semesters_per_year,
            isPro: profile.is_pro,
            planType: profile.plan_type,
            proExpiresAt: profile.pro_expires_at,
          }
        : null,
    });

    await get().fetchAcademicData();

    set({ loading: false, isInitialized: true });
  },

  // =========================
  // INITIALIZE ACADEMIC STRUCTURE
  // =========================
  initializeAcademicStructure: async (years, semestersPerYear) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error("User not found");

    // ✅ Check if structure already exists (prevents duplicates)
    const { data: existingYears } = await supabase
      .from("academic_years")
      .select("id")
      .eq("user_id", user.id)
      .limit(1);

    if (existingYears && existingYears.length > 0) {
      console.log("Academic structure already exists");
      return true;
    }

    // ✅ Prepare years array
    const yearsData = Array.from({ length: years }, (_, i) => ({
      user_id: user.id,
      year_number: i + 1,
    }));

    // ✅ Bulk insert years
    const { data: insertedYears, error: yearError } = await supabase
      .from("academic_years")
      .insert(yearsData)
      .select();

    if (yearError) throw yearError;

    // ✅ Prepare semesters array
    const semestersData = [];

    insertedYears.forEach((year) => {
      for (let sem = 1; sem <= semestersPerYear; sem++) {
        semestersData.push({
          user_id: user.id,
          academic_year_id: year.id,
          semester_number: sem,
        });
      }
    });

    // ✅ Bulk insert semesters
    const { error: semError } = await supabase
      .from("semesters")
      .insert(semestersData);

    if (semError) throw semError;

    return true;
  },
  // =========================
  // FETCH ACADEMIC DATA
  // =========================
  fetchAcademicData: async () => {
    set({ loading: true });

    try {
      const { user } = get();

      if (!user) {
        set({ years: [] });
        return;
      }

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

      if (error) throw error;

      const formatted = (data || []).map((year) => ({
        id: year.id,
        title: `Year ${year.year_number}`,
        semesters: (year.semesters || []).map((sem) => ({
          id: sem.id,
          title: `Semester ${sem.semester_number}`,
          status: sem.status,
          courses: (sem.courses || []).map((c) => ({
            id: c.id,
            name: c.name,
            code: c.code,
            creditUnit: c.credit_unit,
            grade: c.grade,
            isRetake: c.is_retake,
          })),
        })),
      }));

      set({ years: formatted });
    } catch (err) {
      console.error("Fetch academic data failed:", err);
      set({ years: [] }); // prevent crash
    } finally {
      // 🔥 THIS GUARANTEES ONBOARDING PAGE WON’T HANG
      set({ loading: false, isInitialized: true });
    }
  },
  // =========================
  // EDIT PROFILE
  // =========================
  editProfile: async (updatedData) => {
    const { user, profile } = get();
    if (!user) return;

    const structureChanged =
      profile.programYears !== updatedData.programYears ||
      profile.semestersPerYear !== updatedData.semestersPerYear;

    const { error } = await supabase
      .from("profiles")
      .update({
        country: updatedData.country,
        university: updatedData.university,
        program: updatedData.program,
        grading_scale_id: updatedData.gradingScaleId,
        program_years: updatedData.programYears,
        semesters_per_year: updatedData.semestersPerYear,
      })
      .eq("id", user.id);

    if (error) {
      console.error(error);
      return { error: error.message };
    }

    if (structureChanged) {
      await get().initializeAcademicStructure(
        updatedData.programYears,
        updatedData.semestersPerYear,
      );
    }

    await get().loadUserAndProfile();
    return { success: true };
  },

  // =========================
  // ADD COURSE
  // =========================
  addCourse: async (semesterId, courseData) => {
    const { profile } = get();

    if (!profile?.isPro) {
      const semester = get()
        .years.flatMap((y) => y.semesters)
        .find((s) => s.id === semesterId);

      if (semester?.courses.length >= 10) {
        return { error: "Free plan limit reached. Upgrade to Pro." };
      }
    }

    const { error } = await supabase.from("courses").insert({
      semester_id: semesterId,
      name: courseData.name.trim(),
      code: courseData.code?.trim() || "",
      credit_unit: Number(courseData.creditUnit),
      grade: courseData.grade || null,
      is_retake: !!courseData.isRetake,
    });

    if (error) return { error: error.message };

    await get().fetchAcademicData();
    return { success: true };
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
        grade: updatedData.grade || null,
        is_retake: !!updatedData.isRetake,
      })
      .eq("id", courseId);

    if (error) return { error: error.message };

    set((state) => ({
      years: state.years.map((year) => ({
        ...year,
        semesters: year.semesters.map((sem) => ({
          ...sem,
          courses: sem.courses.map((c) =>
            c.id === courseId
              ? {
                  ...c,
                  ...updatedData,
                }
              : c,
          ),
        })),
      })),
    }));

    return { success: true };
  },

  // =========================
  // DELETE COURSE
  // =========================
  deleteCourse: async (courseId) => {
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseId);

    if (error) return { error: error.message };

    set((state) => ({
      years: state.years.map((year) => ({
        ...year,
        semesters: year.semesters.map((sem) => ({
          ...sem,
          courses: sem.courses.filter((c) => c.id !== courseId),
        })),
      })),
    }));

    return { success: true };
  },

  // =========================
  // BULK INSERT (PRO ONLY)
  // =========================
  bulkInsertCourses: async (courses, semesterId) => {
    const { profile } = get();
    if (!profile?.isPro) {
      return { error: "Bulk upload is Pro only." };
    }

    const mapped = courses.map((c) => ({
      semester_id: semesterId,
      name: c["Course Name"],
      code: c["Course Code"],
      credit_unit: Number(c["Credit Units"]),
      grade: c["Grade"],
      is_retake: false,
    }));

    const { error } = await supabase.from("courses").insert(mapped);
    if (error) return { error: error.message };

    await get().fetchAcademicData();
    return { success: true };
  },

  // =========================
  // RESET
  // =========================
  resetAll: () =>
    set({
      user: null,
      profile: null,
      years: [],
      isInitialized: false,
    }),
}));
