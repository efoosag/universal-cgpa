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
import UploadCoursesModal from "@/components/UploadCoursesModal";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedSemesterId, setSelectedSemesterId] = useState(null);

  const router = useRouter();
  const academicYearsRef = useRef(null);

  const {
    years,
    profile,
    addCourse,
    editCourse,
    deleteCourse,
    fetchProfile,
  } = useAcademicStore();

  const { fetchAcademicData } = useAcademicStore();

  const safeYears = Array.isArray(years) ? years : [];

  const gradingScaleFull =
    GRADING_SCALES[profile?.gradingScaleId] || GRADING_SCALES["ng-5"];

  const { label: gradingLabel, gradingScale } = gradingScaleFull;

  const cgpa = calculateCGPA(safeYears, gradingScale);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedSemesters, setExpandedSemesters] = useState({});

  // Supabase user verification
  useEffect(() => {
    const checkAccess = async () => {
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
        .select(
          "is_pro, onboarding_completed, program_years, semesters_per_year"
        )
        .eq("id", user.id)
        .maybeSingle();

      if (error || !profile) {
        console.error("Profile fetch error:", error);
        router.replace("/login");
        return;
      }

      if (!profile.onboarding_completed) {
        router.replace("/onboarding");
        return;
      }

      setIsPro(profile.is_pro);
      setLoading(false);
    };

    checkAccess();
  }, [router]);

  // Fetch academic data
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      await fetchAcademicData();
      setDataLoading(false);
    };
    load();
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, []);

  // Real-time pro status
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
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user]);

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
        }))
      )
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
        ])
      )
    );

    autoTable(doc, {
      head: [["Year", "Semester", "Course", "CU", "Grade"]],
      body: rows,
      startY: 40,
    });

    doc.save("CGPA_Report.pdf");
  };

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-blue-950">
        <div className="px-6 py-4 rounded-2xl bg-white dark:bg-slate-900 border border-blue-100 dark:border-slate-700 shadow-md text-blue-600 dark:text-blue-400 font-medium">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-blue-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 space-y-8">
      {/* ===== HEADER SUMMARY ===== */}
      <div className="group rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 p-6 flex flex-col md:flex-row justify-between gap-6">
        {/* GPA Summary */}
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-105">
            <GraduationCap size={28} />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cumulative GPA</p>
            <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:tracking-wide">
              {cgpa}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Scale: {gradingLabel}</p>
          </div>
        </div>

        {/* User Info */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
              Welcome, {user?.email}
            </h1>
            {isPro ? (
              <span className="mt-2 inline-block rounded-full bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400 px-3 py-1 text-sm">
                PRO Member
              </span>
            ) : (
              <span className="mt-2 inline-block rounded-full bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 px-3 py-1 text-sm">
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

        {/* Action Buttons */}
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
          <Button size="sm" variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={handleExportPDF}>
            Export PDF
          </Button>
          <Button size="sm" variant="outline" className="hover:bg-slate-100 dark:hover:bg-slate-800 transition" onClick={handleExportExcel}>
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
            <div className="p-5 text-center text-slate-500 dark:text-slate-400">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">What-If Simulator</h3>
              <p className="text-sm mt-1">Available on Pro plan</p>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black mt-2" onClick={() => router.push("/upgrade")}>
                Upgrade
              </Button>
              <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-4 text-sm text-slate-600 dark:text-slate-300">
                Unlock advanced GPA projections, academic simulations and graduation planning tools.
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          {isPro ? (
            <UngradedTargetPlanner gradingScale={gradingScale} years={safeYears} />
          ) : (
            <div className="p-5 text-center text-slate-500 dark:text-slate-400">
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Ungraded Target Planner</h3>
              <p className="text-sm mt-1">Available on Pro plan</p>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black mt-2" onClick={() => router.push("/upgrade")}>
                Upgrade
              </Button>
              <div className="mt-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 p-4 text-sm text-slate-600 dark:text-slate-300">
                Unlock advanced GPA projections, academic simulations and graduation planning tools.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== ACADEMIC STRUCTURE ===== */}
      <div ref={academicYearsRef} className="space-y-6">
        {safeYears.length === 0 && (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">No academic structure found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Set up your academic years to start tracking your CGPA.
            </p>
            <Button onClick={() => router.push("/onboarding")}>Go to Onboarding</Button>
          </div>
        )}

        {safeYears.map((year) => (
          <div key={year.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm p-5 space-y-4">
            <h2 className="text-lg font-semibold mb-2">{year.title}</h2>

            {year.semesters.map((semester) => {
              const semesterGPA = calculateSemesterGPA(semester, gradingScale);
              const expanded = expandedSemesters[semester.id];

              return (
                <div key={semester.id} className="mb-4">
                  {/* Semester Header */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-blue-800 dark:text-blue-300">
                      {semester.title} — GPA: {semesterGPA}
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => toggleSemester(semester.id)}>
                      {expanded ? "Hide" : "Show"}
                    </Button>
                  </div>

                  {/* Expanded Semester Card */}
                  {expanded && (
                    <div className="space-y-4">
                      {/* Semester Card */}
                      <div className="p-4 border border-blue-200 rounded-lg bg-blue-50 dark:bg-blue-950 dark:border-blue-700 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
                          <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                            Semester {semester.number} - {semester.name}
                          </h4>

                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-blue-600 hover:bg-blue-700 text-white transition-all"
                              onClick={() => {
                                setSelectedSemesterId(semester.id);
                                setUploadOpen(true);
                              }}
                            >
                              Upload Courses
                            </Button>

                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-semibold leading-none text-white bg-blue-500 rounded-full">
                              {semester.courses?.length || 0}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-blue-200 dark:border-blue-700 pt-4">
                          <AddCourseForm
                            yearId={year.id}
                            semesterId={semester.id}
                            onAdd={addCourse}
                            gradingScale={gradingScale}
                          />
                        </div>
                      </div>

                      {/* Courses List */}
                      {semester.courses.map((course) => (
                        <div
                          key={course.id}
                          className="flex justify-between items-center p-3 border rounded-lg bg-white dark:bg-slate-900 dark:border-blue-700 shadow-sm"
                        >
                          <span className="text-blue-900 dark:text-blue-100">
                            {course.name} • {course.creditUnit} CU • <strong>{course.grade}</strong>
                          </span>

                          <div className="flex gap-2">
                            <Button
                              size="xs"
                              variant="outline"
                              className="border-blue-300 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-100 dark:hover:bg-blue-950"
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
                              className="bg-red-600 hover:bg-red-700 text-white"
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
      <EditProfileModal open={editProfileOpen} onOpenChange={setEditProfileOpen} />
      <UploadCoursesModal open={uploadOpen} onOpenChange={setUploadOpen} semesterId={selectedSemesterId} />

      {editingCourse && (
        <EditCourseModal
          open={!!editingCourse}
          onOpenChange={() => setEditingCourse(null)}
          course={editingCourse}
          onSave={(updated) => {
            editCourse(editingCourse.id, updated);
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
          onConfirm={async () => {
            await deleteCourse(deleteTarget.courseId);
            setDeleteTarget(null);
          }}
        />
      )}
    </main>
 
    );
  }