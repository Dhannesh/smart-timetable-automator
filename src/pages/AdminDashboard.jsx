import { useState, useEffect } from "react";
import {
  generateAndPersistTimetable,
  getSectionTimetable,
  getAllSections,
} from "../services/timetableService.js";
import TimetableGrid from "../components/TimetableGrid.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import AgentRequestBox from "../components/AgentRequestBox.jsx";

export default function AdminDashboard() {
  const [sections, setSections] = useState([]);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [slots, setSlots] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [highlightSlotId, setHighlightSlotId] = useState(null);

  useEffect(() => {
    getAllSections()
      .then((data) => {
        setSections(data);
        if (data.length > 0) setSelectedSectionId(data[0].id);
      })
      .catch((err) => setMessage({ type: "error", text: err.message }));
  }, []);

  async function refreshGrid() {
    if (!selectedSectionId) return;
    setLoadingGrid(true);
    try {
      const data = await getSectionTimetable(selectedSectionId);
      setSlots(data);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoadingGrid(false);
    }
  }

  useEffect(() => {
    refreshGrid();
  }, [selectedSectionId]);

  async function handleGenerate() {
    setGenerating(true);
    setMessage(null);
    setHighlightSlotId(null);
    try {
      const result = await generateAndPersistTimetable();
      setMessage({
        type: "success",
        text: `Generated ${result.totalSlots} lectures across ${result.sectionsGenerated} sections. Unplaced: ${result.unplacedLectures}.`,
      });
      await refreshGrid();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setGenerating(false);
    }
  }

  async function handleReassignmentComplete(changedSlotId) {
    await refreshGrid();
    setHighlightSlotId(changedSlotId);
    setTimeout(() => setHighlightSlotId(null), 4000);
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full">
        <Navbar title="Admin Dashboard" />

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
                Generating...
              </span>
            ) : (
              "Generate Timetable"
            )}
          </button>

          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
            className={`mb-6 p-3 rounded-lg text-sm animate-[fadeIn_0.2s_ease-in] ${
              message.type === "error"
                ? "bg-red-900/50 text-red-300 border border-red-700"
                : "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="mb-6">
          {loadingGrid ? (
            <div className="text-slate-400 p-8 text-center border border-slate-700 rounded-lg">
              <span className="inline-block w-5 h-5 border-2 border-slate-600 border-t-emerald-500 rounded-full animate-spin mr-2"></span>
              Loading timetable...
            </div>
          ) : (
            <TimetableGrid
              slots={slots}
              emptyMessage="No timetable generated yet. Click 'Generate Timetable' above."
              highlightSlotId={highlightSlotId}
            />
          )}
        </div>

        <AgentRequestBox onReassignmentComplete={handleReassignmentComplete} />
      </div>
      <Footer />
    </div>
  );
}
