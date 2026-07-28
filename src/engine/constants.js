// Named constants — never use raw numbers for days/periods elsewhere in the codebase.

export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const DAY_INDEX = {
  MONDAY: 0,
  TUESDAY: 1,
  WEDNESDAY: 2,
  THURSDAY: 3,
  FRIDAY: 4,
};

export const PERIODS_PER_DAY = 8;

// Periods are 1-indexed in the UI/database (Period 1 through Period 8)
export const PERIOD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8];

// Real clock times for each period, for display purposes only (not used in generation logic).
export const PERIOD_TIMES = {
  1: "8:50 - 9:40",
  2: "9:40 - 10:30",
  3: "10:40 - 11:30",
  4: "11:30 - 12:20",
  5: "1:10 - 2:00",
  6: "2:00 - 2:50",
  7: "2:50 - 3:40",
  8: "3:40 - 4:30",
};
