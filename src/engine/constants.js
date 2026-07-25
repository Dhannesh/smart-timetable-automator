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
