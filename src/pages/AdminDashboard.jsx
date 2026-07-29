import { useState } from "react";
import {
  generateAndPersistTimetable,
  getSectionTimetable,
  getAllSections,
} from "../services/timetableService.js";
import { getPendingLeaveRequests } from "../services/leaveService.js";
import { useAsyncData } from "../hooks/useAsyncData.js";
import TimetableGrid from "../components/TimetableGrid.jsx";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import AgentRequestBox from "../components/AgentRequestBox.jsx";
import LeaveRequestsList from "../components/LeaveRequestsList.jsx";

export default function AdminDashboard() {
  const { data: sections } = useAsyncData(getAllSections, []);
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState(null);
  const [highlightSlotId, setHighlightSlotId] = useState(null);
  const [agentInitialContext, setAgentInitialContext] = useState(null);

  const effectiveSectionId = selectedSectionId || sections?.[0]?.id || "";

  const {
    data: slots,
    loading: loadingGrid,
    refresh: refreshGrid,
  } = useAsyncData(
    () =>
      effectiveSectionId
        ? getSectionTimetable(effectiveSectionId)
        : Promise.resolve([]),
    [effectiveSectionId],
  );

  const {
    data: leaveRequests,
    loading: loadingLeaveRequests,
    refresh: refreshLeaveRequests,
  } = useAsyncData(getPendingLeaveRequests, []);

  async function handleGenerate() {
    setGenerating(true);
    setMessage(null);
    setHighlightSlotId(null);
    try {
      const result = await generateAndPersistTimetable();
      setMessage({
        type: "success",
        text: `Generated ${result.totalSlots} lectures across ${result.sectionsGenerated} sections.${
          result.unplacedLectures > 0
            ? ` Warning: ${result.unplacedLectures} lecture(s) could not be placed.`
            : " Unplaced: 0."
        }`,
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
    await refreshLeaveRequests();
    setHighlightSlotId(changedSlotId);
    setTimeout(() => setHighlightSlotId(null), 4000);
  }

  function handleResolveClick(leaveRequest) {
    setAgentInitialContext({
      facultyId: leaveRequest.facultyId,
      facultyName: leaveRequest.facultyName,
      dayIndex: leaveRequest.dayIndex,
      dayLabel: leaveRequest.dayLabel,
      period: leaveRequest.period,
      leaveRequestId: leaveRequest.id,
    });
    document
      .getElementById("agent-request-box")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col">
      <div className="flex-1 max-w-6xl mx-auto w-full">
        <Navbar title="Admin Dashboard" />

        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleGenerate}
            disabled={generating}
            aria-busy={generating}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-emerald-900/30 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            {generating ? (
              <span className="flex items-center gap-2">
                <span
                  className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                ></span>
                Generating...
              </span>
            ) : (
              "Generate Timetable"
            )}
          </button>

          <label htmlFor="section-select" className="sr-only">
            Select section
          </label>
          <select
            id="section-select"
            value={effectiveSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-white px-3 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {(sections || []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.year} - Section {s.section_label}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div
            role="status"
            aria-live="polite"
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
            <div
              className="text-slate-400 p-8 text-center border border-slate-700 rounded-lg"
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
              emptyMessage="No timetable generated yet. Click 'Generate Timetable' above."
              highlightSlotId={highlightSlotId}
            />
          )}
        </div>

        <div className="mb-6">
          <LeaveRequestsList
            requests={leaveRequests}
            loading={loadingLeaveRequests}
            onResolveClick={handleResolveClick}
          />
        </div>

        <div id="agent-request-box">
          <AgentRequestBox
            onReassignmentComplete={handleReassignmentComplete}
            initialContext={agentInitialContext}
            onInitialContextConsumed={() => setAgentInitialContext(null)}
          />
        </div>
      </div>
      <Footer />
    </div>
  );
}
