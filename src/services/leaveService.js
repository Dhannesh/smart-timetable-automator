import { supabase } from "./supabaseClient.js";

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/**
 * Creates a single leave request for a faculty member, after confirming they actually
 * have a scheduled slot at that day/period, and there isn't already a pending
 * request for the same slot.
 */
export async function createLeaveRequest({ facultyId, dayIndex, period }) {
  const { data: existingSlot, error: slotError } = await supabase
    .from("timetable_slots")
    .select("id")
    .eq("faculty_id", facultyId)
    .eq("day_of_week", dayIndex)
    .eq("period_number", period)
    .maybeSingle();

  if (slotError)
    throw new Error(`Failed to check timetable: ${slotError.message}`);
  if (!existingSlot) {
    throw new Error(
      `No class scheduled at ${DAY_LABELS[dayIndex]} period ${period}.`,
    );
  }

  const { data: existingRequest, error: dupError } = await supabase
    .from("leave_requests")
    .select("id")
    .eq("faculty_id", facultyId)
    .eq("day_of_week", dayIndex)
    .eq("period_number", period)
    .eq("status", "pending")
    .maybeSingle();

  if (dupError)
    throw new Error(`Failed to check existing requests: ${dupError.message}`);
  if (existingRequest) {
    throw new Error(
      `Already has a pending request for ${DAY_LABELS[dayIndex]} period ${period}.`,
    );
  }

  const { data, error } = await supabase
    .from("leave_requests")
    .insert({
      faculty_id: facultyId,
      day_of_week: dayIndex,
      period_number: period,
      status: "pending",
    })
    .select()
    .single();

  if (error)
    throw new Error(`Failed to create leave request: ${error.message}`);
  return data;
}

/**
 * Creates leave requests for multiple selected slots in one submission.
 * Each slot is validated independently; successes and failures are both reported
 * back so the UI can show a clear summary (e.g. "3 submitted, 1 skipped: already pending").
 */
export async function createLeaveRequests(facultyId, slotList) {
  const results = { succeeded: [], failed: [] };

  for (const { dayIndex, period } of slotList) {
    try {
      await createLeaveRequest({ facultyId, dayIndex, period });
      results.succeeded.push({ dayIndex, period });
    } catch (err) {
      results.failed.push({ dayIndex, period, reason: err.message });
    }
  }

  return results;
}

/**
 * Fetches all pending leave requests, joined with faculty name and the
 * subject/section they'd be missing, for the Admin's Leave Requests list.
 */
export async function getPendingLeaveRequests() {
  const { data: requests, error } = await supabase
    .from("leave_requests")
    .select(
      `id, faculty_id, day_of_week, period_number, created_at, faculty:faculty_id ( name )`,
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error)
    throw new Error(`Failed to fetch leave requests: ${error.message}`);
  if (!requests || requests.length === 0) return [];

  const enriched = await Promise.all(
    requests.map(async (req) => {
      const { data: slot } = await supabase
        .from("timetable_slots")
        .select(
          `section:section_id ( section_label, year ), subject_offering:subject_offering_id ( subject:subject_id ( name ) )`,
        )
        .eq("faculty_id", req.faculty_id)
        .eq("day_of_week", req.day_of_week)
        .eq("period_number", req.period_number)
        .maybeSingle();

      return {
        id: req.id,
        facultyId: req.faculty_id,
        facultyName: req.faculty?.name ?? "Unknown",
        dayIndex: req.day_of_week,
        dayLabel: DAY_LABELS[req.day_of_week],
        period: req.period_number,
        sectionLabel: slot?.section
          ? `${slot.section.year} - ${slot.section.section_label}`
          : "Unknown",
        subjectName: slot?.subject_offering?.subject?.name ?? "Unknown",
        createdAt: req.created_at,
      };
    }),
  );

  return enriched;
}

/** Marks a leave request as handled once the admin has resolved it via the agent. */
export async function markLeaveRequestHandled(
  leaveRequestId,
  resolvedByAdminId,
) {
  const { error } = await supabase
    .from("leave_requests")
    .update({ status: "handled", resolved_by_admin_id: resolvedByAdminId })
    .eq("id", leaveRequestId);

  if (error)
    throw new Error(`Failed to update leave request: ${error.message}`);
}
