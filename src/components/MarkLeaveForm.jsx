import { useState } from "react";
import { createLeaveRequests } from "../services/leaveService.js";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function MarkLeaveForm({ facultyId, ownSlots, onLeaveMarked }) {
  const [selectedKeys, setSelectedKeys] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const sortedSlots = [...(ownSlots || [])].sort(
    (a, b) =>
      a.day_of_week - b.day_of_week || a.period_number - b.period_number,
  );

  function toggleSlot(key) {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (selectedKeys.size === 0) return;

    const slotList = [...selectedKeys].map((key) => {
      const [dayIndex, period] = key.split("-").map(Number);
      return { dayIndex, period };
    });

    setSubmitting(true);
    setMessage(null);
    try {
      const results = await createLeaveRequests(facultyId, slotList);

      if (results.succeeded.length > 0 && results.failed.length === 0) {
        setMessage({
          type: "success",
          text: `${results.succeeded.length} leave request(s) submitted successfully.`,
        });
      } else if (results.succeeded.length > 0 && results.failed.length > 0) {
        setMessage({
          type: "success",
          text: `${results.succeeded.length} submitted. ${results.failed.length} skipped: ${results.failed.map((f) => `${DAY_LABELS[f.dayIndex]} P${f.period} (${f.reason})`).join("; ")}`,
        });
      } else {
        setMessage({
          type: "error",
          text: `All requests failed: ${results.failed.map((f) => f.reason).join("; ")}`,
        });
      }

      setSelectedKeys(new Set());
      if (onLeaveMarked) onLeaveMarked();
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (sortedSlots.length === 0) {
    return (
      <div className="bg-slate-800/50 rounded-lg p-4 text-slate-400 text-sm">
        No scheduled classes found for you yet — generate a timetable first.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700 rounded-xl p-5">
      <h2 className="text-white font-semibold mb-1">Mark Myself on Leave</h2>
      <p className="text-slate-400 text-sm mb-4">
        Select one or more classes you'll be absent for.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="max-h-64 overflow-y-auto border border-slate-700 rounded-lg divide-y divide-slate-700 mb-4">
          {sortedSlots.map((slot) => {
            const key = `${slot.day_of_week}-${slot.period_number}`;
            const checked = selectedKeys.has(key);
            return (
              <label
                key={key}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors ${
                  checked ? "bg-amber-900/30" : "hover:bg-slate-800/70"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSlot(key)}
                  disabled={submitting}
                  className="w-4 h-4 accent-amber-500 focus:ring-2 focus:ring-amber-400"
                />
                <span className="text-white text-sm">
                  {DAY_LABELS[slot.day_of_week]}, Period {slot.period_number}
                  <span className="text-slate-400">
                    {" "}
                    — {slot.subjectName} ({slot.sectionLabel})
                  </span>
                </span>
              </label>
            );
          })}
        </div>

        <button
          type="submit"
          disabled={selectedKeys.size === 0 || submitting}
          className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          {submitting
            ? "Submitting..."
            : `Submit Leave Request${selectedKeys.size > 1 ? "s" : ""}${selectedKeys.size > 0 ? ` (${selectedKeys.size})` : ""}`}
        </button>
      </form>

      {message && (
        <div
          className={`mt-3 p-3 rounded-lg text-sm animate-[fadeIn_0.2s_ease-in] ${
            message.type === "error"
              ? "bg-red-900/50 text-red-300 border border-red-700"
              : "bg-emerald-900/50 text-emerald-300 border border-emerald-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
