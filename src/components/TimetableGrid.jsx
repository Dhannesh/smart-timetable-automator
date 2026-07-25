const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function TimetableGrid({
  slots,
  emptyMessage = "No timetable data yet.",
}) {
  if (!slots || slots.length === 0) {
    return <div className="text-slate-400 text-sm p-4">{emptyMessage}</div>;
  }

  const grid = {};
  for (const day of [0, 1, 2, 3, 4]) {
    grid[day] = {};
    for (const period of PERIODS) {
      grid[day][period] = null;
    }
  }
  for (const slot of slots) {
    if (grid[slot.day_of_week]) {
      grid[slot.day_of_week][slot.period_number] = slot;
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse text-sm">
        <thead>
          <tr>
            <th className="border border-slate-700 bg-slate-800 text-slate-300 p-2 text-left">
              Period
            </th>
            {DAY_LABELS.map((label) => (
              <th
                key={label}
                className="border border-slate-700 bg-slate-800 text-slate-300 p-2 text-left"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {PERIODS.map((period) => (
            <tr key={period}>
              <td className="border border-slate-700 bg-slate-800 text-slate-300 p-2 font-semibold">
                {period}
              </td>
              {[0, 1, 2, 3, 4].map((day) => {
                const slot = grid[day][period];
                return (
                  <td
                    key={day}
                    className="border border-slate-700 p-2 align-top"
                  >
                    {slot ? (
                      <div>
                        <div className="text-white font-medium">
                          {slot.subjectName}
                        </div>
                        <div className="text-slate-400 text-xs">
                          {slot.facultyName || slot.sectionLabel}
                        </div>
                        {slot.roomName && (
                          <div className="text-slate-500 text-xs">
                            {slot.roomName}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
