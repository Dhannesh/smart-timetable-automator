import { DAYS } from "./constants.js";

/**
 * Independent validation pass — re-checks every hard rule against the generated slots,
 * without reusing the generator's own bookkeeping. Acts as a safety net.
 * Returns { valid: boolean, violations: string[] }
 */
export function validateTimetable(slots) {
  const violations = [];

  // Rule: no faculty double-booked at the same day/period
  const facultySlotMap = new Map(); // key: `${faculty_id}-${day}-${period}` -> count
  for (const slot of slots) {
    const key = `${slot.faculty_id}-${slot.day_of_week}-${slot.period_number}`;
    facultySlotMap.set(key, (facultySlotMap.get(key) || 0) + 1);
  }
  for (const [key, count] of facultySlotMap.entries()) {
    if (count > 1) {
      violations.push(`Faculty double-booked: ${key} appears ${count} times`);
    }
  }

  // Rule: no section double-booked in its own grid (two lectures same section/day/period)
  const sectionSlotMap = new Map();
  for (const slot of slots) {
    const key = `${slot.section_id}-${slot.day_of_week}-${slot.period_number}`;
    sectionSlotMap.set(key, (sectionSlotMap.get(key) || 0) + 1);
  }
  for (const [key, count] of sectionSlotMap.entries()) {
    if (count > 1) {
      violations.push(
        `Section slot double-booked: ${key} appears ${count} times`,
      );
    }
  }

  // Rule: no room double-booked at the same day/period (only for slots that require a room)
  const roomSlotMap = new Map();
  for (const slot of slots) {
    if (!slot.room_id) continue;
    const key = `${slot.room_id}-${slot.day_of_week}-${slot.period_number}`;
    roomSlotMap.set(key, (roomSlotMap.get(key) || 0) + 1);
  }
  for (const [key, count] of roomSlotMap.entries()) {
    if (count > 1) {
      violations.push(`Room double-booked: ${key} appears ${count} times`);
    }
  }

  // Rule: no subject repeated same day for a section
  // (requires subject_id per slot — passed in via subjectOfferingLookup at call time; see checkNoSameDayRepeat)

  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Separate check for "no subject repeated same day" since it needs subject_id,
 * which isn't directly on the slot (only subject_offering_id is).
 * @param {Array} slots
 * @param {Map} offeringIdToSubjectId - subject_offering_id -> subject_id lookup
 */
export function validateNoSameDaySubjectRepeat(slots, offeringIdToSubjectId) {
  const violations = [];
  const seen = new Map(); // key: `${section_id}-${day}-${subject_id}` -> count

  for (const slot of slots) {
    const subjectId = offeringIdToSubjectId.get(slot.subject_offering_id);
    const key = `${slot.section_id}-${slot.day_of_week}-${subjectId}`;
    seen.set(key, (seen.get(key) || 0) + 1);
  }

  for (const [key, count] of seen.entries()) {
    if (count > 1) {
      violations.push(
        `Subject repeated same day: ${key} appears ${count} times`,
      );
    }
  }

  return violations;
}

/** Pretty-prints a summary for the console test harness. */
export function printValidationSummary(result, extraViolations = []) {
  const allViolations = [...result.violations, ...extraViolations];
  if (allViolations.length === 0) {
    console.log("✅ VALIDATION PASSED — zero rule violations found.");
  } else {
    console.log(`❌ VALIDATION FAILED — ${allViolations.length} violation(s):`);
    allViolations.forEach((v) => console.log("   - " + v));
  }
}
