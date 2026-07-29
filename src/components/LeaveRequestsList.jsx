const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export default function LeaveRequestsList({
  requests,
  loading,
  onResolveClick,
}) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📋</span>
        <h2 className="text-white font-semibold">
          Leave Requests{" "}
          {requests?.length > 0 && (
            <span className="text-amber-400">({requests.length} pending)</span>
          )}
        </h2>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm p-4">
          Loading leave requests...
        </div>
      ) : !requests || requests.length === 0 ? (
        <div className="text-slate-400 text-sm p-4 text-center border border-dashed border-slate-700 rounded-lg">
          No pending leave requests.
        </div>
      ) : (
        <ul className="space-y-2">
          {requests.map((req) => (
            <li
              key={req.id}
              className="flex items-center justify-between bg-slate-900 border border-slate-700 rounded-lg px-4 py-3"
            >
              <div>
                <div className="text-white font-medium">{req.facultyName}</div>
                <div className="text-slate-400 text-sm">
                  {req.dayLabel}, Period {req.period} — {req.subjectName} (
                  {req.sectionLabel})
                </div>
              </div>
              <button
                onClick={() => onResolveClick(req)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-400"
              >
                Resolve via Agent
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
