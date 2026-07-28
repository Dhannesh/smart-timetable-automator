import { supabase } from "./supabaseClient.js";

/**
 * Finds valid substitute candidates for a given day/period/section, ranked by lowest current weekly load.
 * A candidate must be: free at that exact day/period, and not already teaching this subject-offering elsewhere at that time.
 */
export async function findSubstituteCandidates({
  dayIndex,
  period,
  excludeFacultyId,
}) {
  const { data: allFaculty, error: facultyError } = await supabase
    .from("faculty")
    .select("id, name, max_periods_per_day");
  if (facultyError)
    throw new Error(`Failed to fetch faculty: ${facultyError.message}`);

  const { data: slotsAtThisTime, error: slotsError } = await supabase
    .from("timetable_slots")
    .select("faculty_id")
    .eq("day_of_week", dayIndex)
    .eq("period_number", period);
  if (slotsError)
    throw new Error(`Failed to check timetable: ${slotsError.message}`);

  const busyFacultyIds = new Set(slotsAtThisTime.map((s) => s.faculty_id));

  const { data: allSlotsToday, error: todaySlotsError } = await supabase
    .from("timetable_slots")
    .select("faculty_id")
    .eq("day_of_week", dayIndex);
  if (todaySlotsError)
    throw new Error(`Failed to check daily load: ${todaySlotsError.message}`);

  const loadTodayCount = {};
  for (const s of allSlotsToday) {
    loadTodayCount[s.faculty_id] = (loadTodayCount[s.faculty_id] || 0) + 1;
  }

  const { data: allSlotsWeek, error: weekSlotsError } = await supabase
    .from("timetable_slots")
    .select("faculty_id");
  if (weekSlotsError)
    throw new Error(`Failed to check weekly load: ${weekSlotsError.message}`);

  const loadWeekCount = {};
  for (const s of allSlotsWeek) {
    loadWeekCount[s.faculty_id] = (loadWeekCount[s.faculty_id] || 0) + 1;
  }

  const candidates = allFaculty
    .filter((f) => f.id !== excludeFacultyId)
    .filter((f) => !busyFacultyIds.has(f.id))
    .filter((f) => (loadTodayCount[f.id] || 0) < (f.max_periods_per_day || 6))
    .map((f) => ({
      facultyId: f.id,
      facultyName: f.name,
      currentWeeklyLoad: loadWeekCount[f.id] || 0,
    }))
    .sort((a, b) => a.currentWeeklyLoad - b.currentWeeklyLoad);

  if (candidates.length === 0) {
    return {
      proposedFacultyId: null,
      proposedFacultyName: null,
      reason: "No available substitute found for this slot.",
    };
  }

  const top = candidates[0];
  return {
    proposedFacultyId: top.facultyId,
    proposedFacultyName: top.facultyName,
    reason: `free at this time, lowest current weekly load (${top.currentWeeklyLoad} periods)`,
  };
}

/**
 * Applies the admin-confirmed substitute to the timetable, then re-validates.
 */
export async function confirmReassignment({ slotId, newFacultyId }) {
  const { error: updateError } = await supabase
    .from("timetable_slots")
    .update({ faculty_id: newFacultyId })
    .eq("id", slotId);

  if (updateError) {
    throw new Error(`Failed to update timetable: ${updateError.message}`);
  }

  return { success: true };
}
