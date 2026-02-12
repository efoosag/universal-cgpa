"use client";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { supabase } from "@/lib/supabaseClient";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAcademicStore } from "@/store/academicStore";
import { calculateSemesterGPA, calculateCGPA } from "@/lib/calculations";
import { GRADING_SCALES } from "@/lib/grading";

import AddCourseForm from "@/components/AddCourseForm";
import EditCourseModal from "@/components/EditCourseModal";
import EditProfileModal from "@/components/EditProfileModal";
import ConfirmModal from "@/components/ConfirmModal";
import WhatIfPanel from "@/components/WhatIfPanel";
import UngradedTargetPlanner from "@/components/UnGradedTargetPlanner";
import LogoutButton from "@/components/LogoutButton";
import { Button } from "@/components/ui/button";
import { GraduationCap, Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const academicYearsRef = useRef(null);

  const {
    isInitialized,
    hasHydrated,
    years,
    profile,
    addCourse,
    editCourse,
    deleteCourse,
    initializeAcademicStructure,
  } = useAcademicStore();

  const safeYears = Array.isArray(years) ? years : [];

  const gradingScaleFull =
    GRADING_SCALES[profile?.gradingScaleId] || GRADING_SCALES["ng-5"];

  const { label: gradingLabel, gradingScale } = gradingScaleFull;

  const cgpa = calculateCGPA(safeYears, gradingScale);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedSemesters, setExpandedSemesters] = useState({});

  // supabase assess
  useEffect(() => {
    const loadUserProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_pro")
        .eq("id", user.id)
        .single();

      // 🔥 If profile does not exist, create it
      if (error && error.code === "PGRST116") {
        await supabase.from("profiles").insert({
          id: user.id,
          email: user.email,
          is_pro: false,
        });

        setIsPro(false);
      } else if (profile) {
        setIsPro(profile.is_pro);
      }

      setLoading(false);
    };

    loadUserProfile();
  }, [router]);

  //supabase user update
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("profile-changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload) => {
          if (payload.new.id === user.id) {
            setIsPro(payload.new.is_pro);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Redirect protection
  useEffect(() => {
    if (!hasHydrated) return;
    if (!isInitialized) router.replace("/onboarding");
  }, [hasHydrated, isInitialized, router]);

  if (!hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading dashboard...
      </div>
    );
  }

  const toggleSemester = (id) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Export Excel
  const handleExportExcel = () => {
    if (!isPro) {
      router.push("/upgrade");
      return;
    }
    if (!safeYears.length) return;

    const data = safeYears.flatMap((year) =>
      year.semesters.flatMap((semester) =>
        semester.courses.map((course) => ({
          Year: year.title,
          Semester: semester.title,
          Course: course.name,
          CU: course.creditUnit,
          Grade: course.grade,
        })),
      ),
    );

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CGPA Report");
    XLSX.writeFile(workbook, "CGPA_Report.xlsx");
  };

  // Export PDF
  const handleExportPDF = () => {
    if (!isPro) {
      router.push("/upgrade");
      return;
    }
    if (!safeYears.length) return;

    const doc = new jsPDF();
    doc.text("Universal CGPA Report", 14, 15);
    doc.text(`Program: ${profile?.program || "N/A"}`, 14, 25);
    doc.text(`CGPA: ${cgpa}`, 14, 32);

    const rows = safeYears.flatMap((year) =>
      year.semesters.flatMap((semester) =>
        semester.courses.map((course) => [
          year.title,
          semester.title,
          course.name,
          course.creditUnit,
          course.grade,
        ]),
      ),
    );

    autoTable(doc, {
      head: [["Year", "Semester", "Course", "CU", "Grade"]],
      body: rows,
      startY: 40,
    });

    doc.save("CGPA_Report.pdf");
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 space-y-8">
      {/* ===== HEADER SUMMARY ===== */}
      <div className="group rounded-2xl bg-white dark:bg-slate-900 
border border-slate-200 dark:border-slate-700 
shadow-sm hover:shadow-lg 
transition-all duration-300 
hover:-translate-y-1 
p-6 flex flex-col md:flex-row justify-between gap-6">

  {/* ===== GPA SUMMARY ===== */}
  <div className="flex items-center gap-4">
    <div className="p-3 rounded-xl 
      bg-blue-100 dark:bg-blue-950 
      text-blue-600 dark:text-blue-400
      transition-all duration-300
      group-hover:scale-105">
      <GraduationCap size={28} />
    </div>

    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Cumulative GPA
      </p>

      <h1 className="text-4xl font-bold 
        text-blue-600 dark:text-blue-400
        transition-all duration-300
        group-hover:tracking-wide">
        {cgpa}
      </h1>

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Scale: {gradingLabel}
      </p>
    </div>
  </div>

  {/* ===== USER INFO ===== */}
  <div className="flex flex-col md:flex-row md:items-center gap-4">
    <div>
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
        Welcome, {user?.email}
      </h1>

      {isPro ? (
        <span className="mt-2 inline-block rounded-full 
          bg-green-100 text-green-700 
          dark:bg-green-900/40 dark:text-green-400 
          px-3 py-1 text-sm">
          PRO Member
        </span>
      ) : (
        <span className="mt-2 inline-block rounded-full 
          bg-slate-200 text-slate-700 
          dark:bg-slate-700 dark:text-slate-300 
          px-3 py-1 text-sm">
          Free Plan
        </span>
      )}
    </div>

    {!isPro && (
      <Button
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200"
        onClick={() => router.push("/upgrade")}
      >
        Upgrade to Pro
      </Button>
    )}
  </div>

  {/* ===== ACTION BUTTONS ===== */}
  <div className="flex flex-wrap gap-3 items-center">
    <Button
      size="sm"
      variant="outline"
      className="hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      onClick={() => setEditProfileOpen(true)}
    >
      <Settings size={16} className="mr-1" />
      Profile
    </Button>

    <Button
      size="sm"
      variant="outline"
      className="hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      onClick={handleExportPDF}
    >
      Export PDF
    </Button>

    <Button
      size="sm"
      variant="outline"
      className="hover:bg-slate-100 dark:hover:bg-slate-800 transition"
      onClick={handleExportExcel}
    >
      Export Excel
    </Button>

    <ThemeToggle />
    <LogoutButton />
  </div>
</div>


      {/* ===== WHAT IF + TARGET PLANNER ===== */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          {isPro ? (
            <WhatIfPanel gradingScale={gradingScale} years={safeYears} />
          ) : (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    What-If Simulator
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Available on Pro plan
                  </p>
                </div>

                <Button
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  onClick={() => router.push("/upgrade")}
                >
                  Upgrade
                </Button>
              </div>

              <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-4 text-sm text-slate-600 dark:text-slate-300">
                Unlock advanced GPA projections, academic simulations and
                graduation planning tools.
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          {isPro ? (
            <UngradedTargetPlanner
              gradingScale={gradingScale}
              years={safeYears}
            />
          ) : (
            <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    Ungraded Target Planner
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Available on Pro plan
                  </p>
                </div>

                <Button
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  onClick={() => router.push("/upgrade")}
                >
                  Upgrade
                </Button>
              </div>

              <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-4 text-sm text-slate-600 dark:text-slate-300">
                Unlock advanced GPA projections, academic simulations and
                graduation planning tools.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== ACADEMIC STRUCTURE ===== */}
      <div ref={academicYearsRef} className="space-y-6">
        {safeYears.map((year) => (
          <div
            key={year.id}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-5"
          >
            <h2 className="text-lg font-semibold mb-4">{year.title}</h2>

            {year.semesters.map((semester) => {
              const semesterGPA = calculateSemesterGPA(semester, gradingScale);

              const expanded = expandedSemesters[semester.id];

              return (
                <div key={semester.id} className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {semester.title} — GPA: {semesterGPA}
                    </span>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleSemester(semester.id)}
                    >
                      {expanded ? "Hide" : "Show"}
                    </Button>
                  </div>

                  {expanded && (
                    <div className="mt-4 space-y-3">
                      <AddCourseForm
                        yearId={year.id}
                        semesterId={semester.id}
                        onAdd={addCourse}
                        gradingScale={gradingScale}
                      />

                      {semester.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex justify-between items-center border rounded-lg p-3 dark:border-slate-700"
                        >
                          <span>
                            {course.name} • {course.creditUnit} CU •{" "}
                            <strong>{course.grade}</strong>
                          </span>

                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              onClick={() =>
                                setEditingCourse({
                                  ...course,
                                  yearId: year.id,
                                  semesterId: semester.id,
                                })
                              }
                            >
                              Edit
                            </Button>

                            <Button
                              size="xs"
                              variant="destructive"
                              onClick={() =>
                                setDeleteTarget({
                                  yearId: year.id,
                                  semesterId: semester.id,
                                  courseId: course.id,
                                  name: course.name,
                                })
                              }
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ===== MODALS ===== */}
      <EditProfileModal
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
      />

      {editingCourse && (
        <EditCourseModal
          open={!!editingCourse}
          onOpenChange={() => setEditingCourse(null)}
          course={editingCourse}
          onSave={(updated) => {
            editCourse(
              editingCourse.yearId,
              editingCourse.semesterId,
              editingCourse.id,
              updated,
            );
            setEditingCourse(null);
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          open={!!deleteTarget}
          onOpenChange={() => setDeleteTarget(null)}
          title="Delete Course"
          message={`Delete ${deleteTarget.name}?`}
          onConfirm={() => {
            deleteCourse(
              deleteTarget.yearId,
              deleteTarget.semesterId,
              deleteTarget.courseId,
            );
            setDeleteTarget(null);
          }}
        />
      )}
    </main>
  );
}
