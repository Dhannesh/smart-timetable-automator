import { supabase } from "./supabaseClient.js";
import { generateTimetable } from "../engine/generator.js";
import {
  validateTimetable,
  validateNoSameDaySubjectRepeat,
} from "../engine/validate.js";

/**
 * Fetches all master data, runs the generation engine, validates the result,
 * and persists it to timetable_slots. Throws if validation fails (no partial writes).
 */
export async function generateAndPersistTimetable() {
  const { data: subjectOfferings, error: err1 } = await supabase
    .from("subject_offerings")
    .select("*");
  if (err1)
    throw new Error(`Failed to fetch subject_offerings: ${err1.message}`);

  const { data: faculty, error: err2 } = await supabase
    .from("faculty")
    .select("*");
  if (err2) throw new Error(`Failed to fetch faculty: ${err2.message}`);

  const { data: rooms, error: err3 } = await supabase.from("rooms").select("*");
  if (err3) throw new Error(`Failed to fetch rooms: ${err3.message}`);

  if (!subjectOfferings?.length)
    throw new Error("No subject offerings found. Seed data first.");

  const { slots, unplaced } = generateTimetable({
    subjectOfferings,
    faculty,
    rooms,
  });

  const validation = validateTimetable(slots);
  const offeringIdToSubjectId = new Map(
    subjectOfferings.map((o) => [o.id, o.subject_id]),
  );
  const sameDayViolations = validateNoSameDaySubjectRepeat(
    slots,
    offeringIdToSubjectId,
  );
  const allViolations = [...validation.violations, ...sameDayViolations];

  if (allViolations.length > 0) {
    throw new Error(
      `Generated timetable failed validation:\n${allViolations.join("\n")}`,
    );
  }

  // Clear old rows first (clean regeneration)
  const { error: deleteError } = await supabase
    .from("timetable_slots")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (deleteError)
    throw new Error(`Failed to clear old timetable: ${deleteError.message}`);

  // Bulk insert in chunks of 200 to stay safely under payload limits
  const chunkSize = 200;
  for (let i = 0; i < slots.length; i += chunkSize) {
    const chunk = slots.slice(i, i + chunkSize);
    const { error: insertError } = await supabase
      .from("timetable_slots")
      .insert(chunk);
    if (insertError)
      throw new Error(
        `Failed to insert timetable slots: ${insertError.message}`,
      );
  }

  return {
    success: true,
    sectionsGenerated: new Set(slots.map((s) => s.section_id)).size,
    totalSlots: slots.length,
    unplacedLectures: unplaced.length,
    unplaced,
  };
}

/**
 * Fetches a section's full weekly timetable, joined with subject/faculty/room names for display.
 */
export async function getSectionTimetable(sectionId) {
  const { data, error } = await supabase
    .from("timetable_slots")
    .select(
      `
      id, day_of_week, period_number,
      faculty:faculty_id ( id, name ),
      room:room_id ( id, name ),
      subject_offering:subject_offering_id ( subject:subject_id ( id, name, code ) )
    `,
    )
    .eq("section_id", sectionId)
    .order("day_of_week", { ascending: true })
    .order("period_number", { ascending: true });

  if (error)
    throw new Error(`Failed to fetch section timetable: ${error.message}`);

  return (data || []).map((row) => ({
    id: row.id,
    day_of_week: row.day_of_week,
    period_number: row.period_number,
    facultyName: row.faculty?.name ?? "Unknown",
    roomName: row.room?.name ?? null,
    subjectName: row.subject_offering?.subject?.name ?? "Unknown",
    subjectCode: row.subject_offering?.subject?.code ?? "",
  }));
}

/**
 * Fetches a specific faculty member's derived personal timetable across all sections.
 */
export async function getFacultyTimetable(facultyId) {
  const { data, error } = await supabase
    .from("timetable_slots")
    .select(
      `
      id, day_of_week, period_number,
      section:section_id ( id, section_label, year ),
      room:room_id ( id, name ),
      subject_offering:subject_offering_id ( subject:subject_id ( id, name, code ) )
    `,
    )
    .eq("faculty_id", facultyId)
    .order("day_of_week", { ascending: true })
    .order("period_number", { ascending: true });

  if (error)
    throw new Error(`Failed to fetch faculty timetable: ${error.message}`);

  return (data || []).map((row) => ({
    id: row.id,
    day_of_week: row.day_of_week,
    period_number: row.period_number,
    sectionLabel: row.section
      ? `${row.section.year} - ${row.section.section_label}`
      : "Unknown",
    roomName: row.room?.name ?? null,
    subjectName: row.subject_offering?.subject?.name ?? "Unknown",
    subjectCode: row.subject_offering?.subject?.code ?? "",
  }));
}

/** Returns all sections, for dropdowns (Admin section-picker, Student view). */
export async function getAllSections() {
  const { data, error } = await supabase
    .from("sections")
    .select("*")
    .order("section_label", { ascending: true });
  if (error) throw new Error(`Failed to fetch sections: ${error.message}`);
  return data || [];
}

/** Returns all faculty, for dropdowns (Faculty picker on Faculty dashboard). */
export async function getAllFaculty() {
  const { data, error } = await supabase
    .from("faculty")
    .select("*")
    .order("name", { ascending: true });
  if (error) throw new Error(`Failed to fetch faculty: ${error.message}`);
  return data || [];
}
