"use client";

import { useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAcademicStore } from "@/store/academicStore";

export default function UploadCoursesModal({ open, onOpenChange, semesterId }) {
  const { bulkInsertCourses } = useAcademicStore();

  const [file, setFile] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);

  // =========================
  // HANDLE FILE CHANGE
  // =========================
  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const reader = new FileReader();

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      setPreviewData(parsed);
    };

    reader.readAsArrayBuffer(selectedFile);
    setFile(selectedFile);
  };

  // =========================
  // UPDATE TABLE CELL
  // =========================
  const updateCell = (index, key, value) => {
    setPreviewData((prev) => {
      const updated = [...prev];
      updated[index][key] = value;
      return updated;
    });
  };

  // =========================
  // HANDLE UPLOAD
  // =========================
  const handleUpload = async () => {
    if (!semesterId) {
      console.error("No semester selected");
      return;
    }

    if (previewData.length === 0) {
      console.error("No courses to upload");
      return;
    }

    setLoading(true);

    const result = await bulkInsertCourses(previewData, semesterId);

    setLoading(false);

    if (result?.error) {
      console.error(result.error);
      return;
    }

    // Reset state
    setPreviewData([]);
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-blue-700 dark:text-blue-300">
            Upload Courses for This Semester
          </DialogTitle>
        </DialogHeader>

        {/* File Input */}
        <div className="mt-4">
          <Input
            type="file"
            accept=".xlsx,.csv"
            onChange={handleFileChange}
            className="mb-4"
          />
          {file && (
            <p className="text-sm text-slate-500">Selected file: {file.name}</p>
          )}
        </div>

        {/* Preview Table */}
        {previewData.length > 0 && (
          <div className="overflow-x-auto mt-4 border border-blue-200 dark:border-blue-700 rounded-xl">
            <table className="min-w-full divide-y divide-blue-200 dark:divide-blue-700">
              <thead className="bg-blue-50 dark:bg-blue-950">
                <tr>
                  {[
                    "Course Name",
                    "Course Code",
                    "Credit Units",
                    "Grade",
                    "Is Retake",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-3 py-2 text-left text-xs font-semibold text-blue-700 dark:text-blue-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-blue-200 dark:divide-blue-700">
                {previewData.map((row, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-blue-100 dark:hover:bg-blue-900"
                  >
                    <td>
                      <Input
                        value={row["Course Name"] || ""}
                        onChange={(e) =>
                          updateCell(idx, "Course Name", e.target.value)
                        }
                        className="border-blue-300 dark:border-blue-700"
                      />
                    </td>

                    <td>
                      <Input
                        value={row["Course Code"] || ""}
                        onChange={(e) =>
                          updateCell(idx, "Course Code", e.target.value)
                        }
                        className="border-blue-300 dark:border-blue-700"
                      />
                    </td>

                    <td>
                      <Input
                        type="number"
                        value={row["Credit Units"] || ""}
                        onChange={(e) =>
                          updateCell(
                            idx,
                            "Credit Units",
                            Number(e.target.value),
                          )
                        }
                        className="w-20 border-blue-300 dark:border-blue-700"
                      />
                    </td>

                    <td className="px-2 py-2">
                      <select
                        value={row["Grade"] || ""}
                        onChange={(e) =>
                          updateCell(idx, "Grade", e.target.value)
                        }
                        className="border rounded px-2 py-1 w-20 bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700"
                      >
                        <option value="">Grade</option>
                        {["A", "B", "C", "D", "E", "F", " "].map((g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-2 py-2">
                      <select
                        value={row["Is Retake"] ? "TRUE" : "FALSE"}
                        onChange={(e) =>
                          updateCell(
                            idx,
                            "Is Retake",
                            e.target.value === "TRUE",
                          )
                        }
                        className="border rounded px-2 py-1 w-24 bg-white dark:bg-slate-800 border-blue-300 dark:border-blue-700"
                      >
                        <option value="FALSE">FALSE</option>
                        <option value="TRUE">TRUE</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter className="mt-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setPreviewData([]);
              setFile(null);
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>

          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={handleUpload}
            disabled={previewData.length === 0 || loading}
          >
            {loading ? "Uploading..." : "Upload Courses"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
