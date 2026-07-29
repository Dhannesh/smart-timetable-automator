import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  getFacultyTimetable,
  getAllFaculty,
} from "../services/timetableService.js";
import TimetableGrid from "../components/TimetableGrid.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import MarkLeaveForm from "../components/MarkLeaveForm.jsx";

export default function FacultyDashboard() {
  const { facultyId: ownFacultyId } = useAuth();
  const [facultyList, setFacultyList] = useState([]);
  const [viewingFacultyId, setViewingFacultyId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllFaculty().then((list) => {
      setFacultyList(list);
      setViewingFacultyId(ownFacultyId || (list[0]?.id ?? ""));
    });
  }, [ownFacultyId]);

  async function refreshSlots() {
    if (!viewingFacultyId) return;
    setLoading(true);
    try {
      const data = await getFacultyTimetable(viewingFacultyId);
      setSlots(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshSlots();
  }, [viewingFacultyId]);

  const viewingOwnTimetable = viewingFacultyId === ownFacultyId;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full">
        <Navbar title="Faculty Dashboard" />

        <div className="flex items-center gap-4 mb-6">
          <label className="text-slate-400 text-sm">Viewing:</label>
          <select
            value={viewingFacultyId}
            onChange={(e) => setViewingFacultyId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {facultyList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.id === ownFacultyId ? `${f.name} (Me)` : f.name}
              </option>
            ))}
          </select>
          {!viewingOwnTimetable && (
            <button
              onClick={() => setViewingFacultyId(ownFacultyId)}
              className="text-emerald-400 text-sm hover:underline"
            >
              Back to my timetable
            </button>
          )}
        </div>

        <div className="bg-slate-800/50 rounded-lg p-4 mb-6">
          {loading ? (
            <div className="text-slate-400 p-8 text-center">
              <span className="inline-block w-5 h-5 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin mr-2"></span>
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
            ownSlots={slots}
            onLeaveMarked={refreshSlots}
          />
        )}
      </div>
      <Footer />
    </div>
  );
}
