const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

const PERIOD_TIMES = {
  1: "8:50 - 9:40",
  2: "9:40 - 10:30",
  3: "10:40 - 11:30",
  4: "11:30 - 12:20",
  5: "1:10 - 2:00",
  6: "2:00 - 2:50",
  7: "2:50 - 3:40",
  8: "3:40 - 4:30",
};

export default function TimetableGrid({
  slots,
  emptyMessage = "No timetable data yet.",
  highlightSlotId = null,
}) {
  if (!slots || slots.length === 0) {
    return (
      <div className="text-slate-400 text-sm p-8 text-center border border-dashed border-slate-700 rounded-lg">
        <div className="text-3xl mb-2">🗓️</div>
        {emptyMessage}
      </div>
    );
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
    <div>
      <div className="sm:hidden text-slate-500 text-xs mb-2 flex items-center gap-1">
        <span>↔️</span> Scroll sideways to see all periods
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-700">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-r border-slate-700 bg-slate-800 text-slate-300 p-3 text-left font-semibold sticky left-0 z-10">
                Day
              </th>
              {PERIODS.map((period) => (
                <th
                  key={period}
                  className="border-b border-slate-700 bg-slate-800 text-slate-300 p-3 text-left font-semibold min-w-[140px]"
                >
                  <div>Period {period}</div>
                  <div className="text-slate-500 text-xs font-normal mt-0.5">
                    {PERIOD_TIMES[period]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4].map((day, rowIdx) => (
              <tr
                key={day}
                className={
                  rowIdx % 2 === 0 ? "bg-slate-900" : "bg-slate-900/60"
                }
              >
                <td className="border-r border-slate-700 bg-slate-800 text-slate-300 p-3 font-semibold sticky left-0">
                  {DAY_LABELS[day]}
                </td>
                {PERIODS.map((period) => {
                  const slot = grid[day][period];
                  const isHighlighted = slot && slot.id === highlightSlotId;
                  return (
                    <td
                      key={period}
                      className={`p-3 align-top transition-colors duration-500 ${
                        isHighlighted
                          ? "bg-emerald-900/40 ring-1 ring-inset ring-emerald-500"
                          : "hover:bg-slate-800/50"
                      }`}
                    >
                      {slot ? (
                        <div>
                          <div className="text-white font-medium leading-tight">
                            {slot.subjectName}
                          </div>
                          <div className="text-slate-400 text-xs mt-0.5">
                            {slot.facultyName || slot.sectionLabel}
                          </div>
                          {slot.roomName && (
                            <div className="text-slate-500 text-xs mt-0.5">
                              📍 {slot.roomName}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-700">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}