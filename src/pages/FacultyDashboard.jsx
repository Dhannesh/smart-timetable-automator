import { useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  getFacultyTimetable,
  getAllFaculty,
} from "../services/timetableService.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import TimetableGrid from "../components/TimetableGrid.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import MarkLeaveForm from "../components/MarkLeaveForm.jsx";

export default function FacultyDashboard() {
  const { facultyId: ownFacultyId } = useAuth();
  const { data: facultyList } = useAsyncData(getAllFaculty, []);
  const [viewingFacultyIdOverride, setViewingFacultyIdOverride] = useState("");

  const viewingFacultyId =
    viewingFacultyIdOverride || ownFacultyId || facultyList?.[0]?.id || "";
  const viewingOwnTimetable = viewingFacultyId === ownFacultyId;

  const {
    data: slots,
    loading,
    refresh: refreshSlots,
  } = useAsyncData(
    () =>
      viewingFacultyId
        ? getFacultyTimetable(viewingFacultyId)
        : Promise.resolve([]),
    [viewingFacultyId],
  );

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full">
        <Navbar title="Faculty Dashboard" />

        <div className="flex items-center gap-4 mb-6">
          <label htmlFor="faculty-select" className="text-slate-400 text-sm">
            Viewing:
          </label>
          <select
            id="faculty-select"
            value={viewingFacultyId}
            onChange={(e) => setViewingFacultyIdOverride(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {(facultyList || []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.id === ownFacultyId ? `${f.name} (Me)` : f.name}
              </option>
            ))}
          </select>
          {!viewingOwnTimetable && (
            <button
              onClick={() => setViewingFacultyIdOverride(ownFacultyId)}
              className="text-emerald-400 text-sm hover:underline focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded"
            >
              Back to my timetable
            </button>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          {loading ? (
            <div
              className="text-slate-400 p-8 text-center"
              role="status"
              aria-live="polite"
            >
              <span
                className="inline-block w-5 h-5 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin mr-2"
                aria-hidden="true"
              ></span>
              Loading timetable...
            </div>
          ) : (
            <TimetableGrid
              slots={slots}
              emptyMessage="No timetable assigned yet."
            />
          )}
        </div>

        {viewingOwnTimetable && ownFacultyId && (
          <MarkLeaveForm
            facultyId={ownFacultyId}
            ownSlots={slots || []}
            onLeaveMarked={refreshSlots}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
