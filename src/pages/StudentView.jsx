import { useState } from "react";
import {
  getSectionTimetable,
  getAllSections,
} from "../services/timetableService.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import TimetableGrid from "../components/TimetableGrid.jsx";
import Footer from "../components/Footer.jsx";

export default function StudentView() {
  const { data: sections } = useAsyncData(getAllSections, []);
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const { data: slots, loading } = useAsyncData(
    () =>
      selectedSectionId
        ? getSectionTimetable(selectedSectionId)
        : Promise.resolve([]),
    [selectedSectionId],
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Student Timetable View</h1>
          <p className="text-slate-400 text-sm">
            Select your section to view the weekly schedule.
          </p>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <span className="text-slate-400 text-sm bg-slate-800 px-3 py-2.5 rounded-lg">
            Year: 2nd Year
          </span>
          <label htmlFor="student-section-select" className="sr-only">
            Select section
          </label>
          <select
            id="student-section-select"
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Select a section...</option>
            {(sections || []).map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.section_label}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div
            className="text-slate-400 p-8 text-center border border-slate-700 rounded-lg"
            role="status"
            aria-live="polite"
          >
            <span
              className="inline-block w-5 h-5 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin mr-2"
              aria-hidden="true"
            ></span>
            Loading...
          </div>
        ) : (
          <TimetableGrid
            slots={slots}
            emptyMessage="Select a section above to view its timetable."
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
