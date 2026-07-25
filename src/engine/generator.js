import { DAYS, PERIOD_NUMBERS } from "./constants.js";
import {
  buildAvailabilityMatrix,
  isAvailable,
  markBooked,
  countBookedOnDay,
} from "./availability.js";

/**
 * Rotates the day-iteration order so lectures don't all cluster on Monday.
 * Pure helper — no side effects.
 */
function rotatedDayOrder(offset) {
  const indices = [0, 1, 2, 3, 4];
  const rotated = [
    ...indices.slice(offset % 5),
    ...indices.slice(0, offset % 5),
  ];
  return rotated;
}

/**
 * Orders subject_offerings "hardest to place first":
 * 1. Offerings that require a specific room/lab
 * 2. Then by highest weekly_lecture_count
 */
function orderOfferings(subjectOfferings) {
  return [...subjectOfferings].sort((a, b) => {
    const aHasRoom = a.required_room_id ? 1 : 0;
    const bHasRoom = b.required_room_id ? 1 : 0;
    if (aHasRoom !== bHasRoom) return bHasRoom - aHasRoom; // room-required first
    return b.weekly_lecture_count - a.weekly_lecture_count; // then by lecture count desc
  });
}

/**
 * Core generation function.
 * @param {Object} masterData - { subjectOfferings, faculty, rooms }
 * @returns {Object} { slots, unplaced }
 *   slots: [{ section_id, subject_offering_id, faculty_id, room_id, day_of_week, period_number }]
 *   unplaced: [{ subject_offering_id, reason }]
 */
export function generateTimetable(masterData) {
  const { subjectOfferings, faculty, rooms } = masterData;

  const facultyIds = faculty.map((f) => f.id);
  const roomIds = rooms.map((r) => r.id);
  const facultyMaxPeriods = Object.fromEntries(
    faculty.map((f) => [f.id, f.max_periods_per_day]),
  );

  const facultyAvailability = buildAvailabilityMatrix(facultyIds);
  const roomAvailability = buildAvailabilityMatrix(roomIds);

  // Tracks which subjects are already placed on a given (section, day) — prevents same-day repeats
  const subjectPerSectionDay = {}; // { [section_id]: { [dayIndex]: Set(subject_id) } }

  // Tracks section's own slot usage — prevents a section having two lectures in the same slot
  const sectionAvailability = {}; // { [section_id]: { [dayIndex]: { [period]: true/false } } }

  const slots = [];
  const unplaced = [];

  const ordered = orderOfferings(subjectOfferings);

  ordered.forEach((offering, offeringIndex) => {
    const {
      id: subjectOfferingId,
      section_id,
      subject_id,
      faculty_id,
      weekly_lecture_count,
      required_room_id,
    } = offering;

    if (!subjectPerSectionDay[section_id])
      subjectPerSectionDay[section_id] = {};
    if (!sectionAvailability[section_id]) {
      sectionAvailability[section_id] = {};
      for (let d = 0; d < DAYS.length; d++) {
        sectionAvailability[section_id][d] = {};
        for (const p of PERIOD_NUMBERS)
          sectionAvailability[section_id][d][p] = true;
      }
    }

    let placedCount = 0;

    for (let lectureNum = 0; lectureNum < weekly_lecture_count; lectureNum++) {
      let placed = false;
      const dayOrder = rotatedDayOrder(offeringIndex + lectureNum);

      for (const dayIndex of dayOrder) {
        if (placed) break;

        // Rule: no subject twice on the same day for this section
        const subjectsToday =
          subjectPerSectionDay[section_id][dayIndex] || new Set();
        if (subjectsToday.has(subject_id)) continue;

        for (const period of PERIOD_NUMBERS) {
          const sectionFree = sectionAvailability[section_id][dayIndex][period];
          const facultyFree = isAvailable(
            facultyAvailability,
            faculty_id,
            dayIndex,
            period,
          );
          const roomFree = isAvailable(
            roomAvailability,
            required_room_id,
            dayIndex,
            period,
          );
          const facultyUnderDailyMax =
            countBookedOnDay(facultyAvailability, faculty_id, dayIndex) <
            (facultyMaxPeriods[faculty_id] ?? 6);

          if (sectionFree && facultyFree && roomFree && facultyUnderDailyMax) {
            // Place it
            sectionAvailability[section_id][dayIndex][period] = false;
            markBooked(facultyAvailability, faculty_id, dayIndex, period);
            markBooked(roomAvailability, required_room_id, dayIndex, period);

            if (!subjectPerSectionDay[section_id][dayIndex]) {
              subjectPerSectionDay[section_id][dayIndex] = new Set();
            }
            subjectPerSectionDay[section_id][dayIndex].add(subject_id);

            slots.push({
              section_id,
              subject_offering_id: subjectOfferingId,
              faculty_id,
              room_id: required_room_id || null,
              day_of_week: dayIndex,
              period_number: period,
            });

            placed = true;
            placedCount++;
            break;
          }
        }
      }

      if (!placed) {
        unplaced.push({
          subject_offering_id: subjectOfferingId,
          section_id,
          subject_id,
          lectureAttempt: lectureNum + 1,
          reason: "No valid day/period found after checking all slots",
        });
      }
    }
  });

  return { slots, unplaced };
}
