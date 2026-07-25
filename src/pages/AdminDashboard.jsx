import { useState, useEffect } from "react";
import {
  generateAndPersistTimetable,
  getSectionTimetable,
  getAllSections,
} from "../services/timetableService.js";
import TimetableGrid from "../components/TimetableGrid.jsx";

export default function AdminDashboard() {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [slots, setSlots] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [loadingGrid, setLoadingGrid] = useState(false);

  useEffect(() => {
    getAllSections()
      .then((data) => {
        setSections(data);
        if (data.length > 0) setSelectedSectionId(data[0].id);
      })
      .catch((err) => setMessage({ type: "error", text: err.message }));
  }, []);

  useEffect(() => {
    if (!selectedSectionId) return;
    setLoadingGrid(true);
    getSectionTimetable(selectedSectionId)
      .then((data) => setSlots(data))
      .catch((err) => setMessage({ type: "error", text: err.message }))
      .finally(() => setLoadingGrid(false));
  }, [selectedSectionId]);

  async function handleGenerate() {
    setGenerating(true);
    setMessage(null);
    try {
      const result = await generateAndPersistTimetable();
      setMessage({
        type: "success",
        text: `Generated ${result.totalSlots} lectures across ${result.sectionsGenerated} sections. Unplaced: ${result.unplacedLectures}.`,
      });
      if (selectedSectionId) {
        const data = await getSectionTimetable(selectedSectionId);
        setSlots(data);
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg transition-colors"
        >
          {generating ? "Generating..." : "Generate Timetable"}
        </button>

        <select
          value={selectedSectionId}
          onChange={(e) => setSelectedSectionId(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-white px-3 py-2 rounded-lg"
        >
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.year} - Section {s.section_label}
            </option>
          ))}
        </select>
      </div>

      {message && (
        <div
          className={`mb-6 p-3 rounded-lg text-sm ${
            message.type === "error"
              ? "bg-red-900/50 text-red-300 border border-red-700"
              : "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-slate-800/50 rounded-lg p-4">
        {loadingGrid ? (
          <div className="text-slate-400 p-4">Loading timetable...</div>
        ) : (
          <TimetableGrid
            slots={slots}
            emptyMessage="No timetable generated yet. Click 'Generate Timetable' above."
          />
        )}
      </div>
    </div>
  );
}
