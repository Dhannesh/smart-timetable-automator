import { useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import {
  getFacultyTimetable,
  getAllFaculty,
} from "../services/timetableService.js";
import TimetableGrid from "../components/TimetableGrid.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";

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

  useEffect(() => {
    if (!viewingFacultyId) return;
    setLoading(true);
    getFacultyTimetable(viewingFacultyId)
      .then(setSlots)
      .finally(() => setLoading(false));
  }, [viewingFacultyId]);

  const viewingOwnTimetable = viewingFacultyId === ownFacultyId;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col">
      <div className="flex-1">
        <Navbar title="Faculty Dashboard" />

        <div className="flex items-center gap-4 mb-6">
          <label className="text-slate-400 text-sm">Viewing:</label>
          <select
            value={viewingFacultyId}
            onChange={(e) => setViewingFacultyId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
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

        <div className="bg-slate-800/50 rounded-lg p-4">
          {loading ? (
            <div className="text-slate-400 p-4">Loading timetable...</div>
          ) : (
            <TimetableGrid
              slots={slots}
              emptyMessage="No timetable assigned yet."
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
