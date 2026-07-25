import { useState, useEffect } from "react";
import {
  getSectionTimetable,
  getAllSections,
} from "../services/timetableService.js";
import TimetableGrid from "../components/TimetableGrid.jsx";

export default function StudentView() {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAllSections()
      .then(setSections)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!selectedSectionId) {
      setSlots([]);
      return;
    }
    setLoading(true);
    getSectionTimetable(selectedSectionId)
      .then(setSlots)
      .finally(() => setLoading(false));
  }, [selectedSectionId]);

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Student Timetable View</h1>

      <div className="flex items-center gap-4 mb-6">
        <span className="text-slate-400">Year: 2nd Year</span>
        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
        >
          <option value="">Select a section...</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              Section {s.section_label}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-slate-800/50 rounded-lg p-4">
        {loading ? (
          <div className="text-slate-400 p-4">Loading...</div>
        ) : (
          <TimetableGrid
            slots={slots}
            emptyMessage="Select a section above to view its timetable."
          />
        )}
      </div>
    </div>
  );
}
