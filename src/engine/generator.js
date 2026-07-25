import { DAYS, PERIOD_NUMBERS } from "./constants.js";
import {
  buildAvailabilityMatrix,
  isAvailable,
  markBooked,
  markFree,
  countBookedOnDay,
} from "./availability.js";

function rotatedDayOrder(offset) {
  const indices = [0, 1, 2, 3, 4];
  const rotated = [
    ...indices.slice(offset % 5),
    ...indices.slice(0, offset % 5),
  ];
  return rotated;
}

function orderOfferings(subjectOfferings) {
  return [...subjectOfferings].sort((a, b) => {
    const aHasRoom = a.required_room_id ? 1 : 0;
    const bHasRoom = b.required_room_id ? 1 : 0;
    if (aHasRoom !== bHasRoom) return bHasRoom - aHasRoom;
    return b.weekly_lecture_count - a.weekly_lecture_count;
  });
}

/**
 * Attempts to find ANY already-placed slot (for a different subject, same section)
 * that could be moved elsewhere to free up a specific day/period for a stuck lecture.
 * Returns the slot object to move, or null if no swap candidate exists.
 */
function findSwapCandidate(
  slots,
  section_id,
  dayIndex,
  period,
  subjectPerSectionDay,
  subject_id,
) {
  return (
    slots.find((s) => {
      if (s.section_id !== section_id) return false;
      if (s.day_of_week !== dayIndex || s.period_number !== period)
        return false;
      return true;
    }) || null
  );
}

/**
 * Tries to relocate an existing slot to any other free day/period,
 * respecting all the same constraints. Returns true if successful.
 */
function tryRelocateSlot(
  slot,
  slots,
  facultyAvailability,
  roomAvailability,
  sectionAvailability,
  subjectPerSectionDay,
  facultyMaxPeriods,
  offeringLookup,
  excludeDay,
  excludePeriod,
) {
  const offering = offeringLookup.get(slot.subject_offering_id);
  if (!offering) return false;

  for (const dayIndex of [0, 1, 2, 3, 4]) {
    for (const period of PERIOD_NUMBERS) {
      if (dayIndex === excludeDay && period === excludePeriod) continue;
      if (dayIndex === slot.day_of_week && period === slot.period_number)
        continue;

      const subjectsOnDay =
        subjectPerSectionDay[slot.section_id][dayIndex] || new Set();
      if (subjectsOnDay.has(offering.subject_id)) continue;

      const sectionFree =
        sectionAvailability[slot.section_id][dayIndex][period];
      const facultyFree = isAvailable(
        facultyAvailability,
        slot.faculty_id,
        dayIndex,
        period,
      );
      const roomFree = isAvailable(
        roomAvailability,
        slot.room_id,
        dayIndex,
        period,
      );
      const facultyUnderMax =
        countBookedOnDay(facultyAvailability, slot.faculty_id, dayIndex) <
        (facultyMaxPeriods[slot.faculty_id] ?? 6);

      if (sectionFree && facultyFree && roomFree && facultyUnderMax) {
        // Free the old slot
        sectionAvailability[slot.section_id][slot.day_of_week][
          slot.period_number
        ] = true;
        markFree(
          facultyAvailability,
          slot.faculty_id,
          slot.day_of_week,
          slot.period_number,
        );
        markFree(
          roomAvailability,
          slot.room_id,
          slot.day_of_week,
          slot.period_number,
        );
        subjectPerSectionDay[slot.section_id][slot.day_of_week].delete(
          offering.subject_id,
        );

        // Book the new slot
        sectionAvailability[slot.section_id][dayIndex][period] = false;
        markBooked(facultyAvailability, slot.faculty_id, dayIndex, period);
        markBooked(roomAvailability, slot.room_id, dayIndex, period);
        if (!subjectPerSectionDay[slot.section_id][dayIndex])
          subjectPerSectionDay[slot.section_id][dayIndex] = new Set();
        subjectPerSectionDay[slot.section_id][dayIndex].add(
          offering.subject_id,
        );

        slot.day_of_week = dayIndex;
        slot.period_number = period;
        return true;
      }
    }
  }
  return false;
}

export function generateTimetable(masterData) {
  const { subjectOfferings, faculty, rooms } = masterData;

  const facultyIds = faculty.map((f) => f.id);
  const roomIds = rooms.map((r) => r.id);
  const facultyMaxPeriods = Object.fromEntries(
    faculty.map((f) => [f.id, f.max_periods_per_day]),
  );
  const offeringLookup = new Map(subjectOfferings.map((o) => [o.id, o]));

  const facultyAvailability = buildAvailabilityMatrix(facultyIds);
  const roomAvailability = buildAvailabilityMatrix(roomIds);

  const subjectPerSectionDay = {};
  const sectionAvailability = {};

  const slots = [];
  const unplaced = [];

  const sectionIds = [...new Set(subjectOfferings.map((o) => o.section_id))];
  for (const sectionId of sectionIds) {
    subjectPerSectionDay[sectionId] = {};
    sectionAvailability[sectionId] = {};
    for (let d = 0; d < DAYS.length; d++) {
      sectionAvailability[sectionId][d] = {};
      subjectPerSectionDay[sectionId][d] = new Set();
      for (const p of PERIOD_NUMBERS)
        sectionAvailability[sectionId][d][p] = true;
    }
  }

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

    for (let lectureNum = 0; lectureNum < weekly_lecture_count; lectureNum++) {
      let placed = false;
      const dayOrder = rotatedDayOrder(offeringIndex + lectureNum);

      // Pass 1: normal placement
      for (const dayIndex of dayOrder) {
        if (placed) break;
        const subjectsToday = subjectPerSectionDay[section_id][dayIndex];
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
            sectionAvailability[section_id][dayIndex][period] = false;
            markBooked(facultyAvailability, faculty_id, dayIndex, period);
            markBooked(roomAvailability, required_room_id, dayIndex, period);
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
            break;
          }
        }
      }

      // Pass 2: backtracking — try to swap an existing slot out of the way
      if (!placed) {
        for (const dayIndex of dayOrder) {
          if (placed) break;
          const subjectsToday = subjectPerSectionDay[section_id][dayIndex];
          if (subjectsToday.has(subject_id)) continue;

          for (const period of PERIOD_NUMBERS) {
            const occupyingSlot = findSwapCandidate(
              slots,
              section_id,
              dayIndex,
              period,
              subjectPerSectionDay,
              subject_id,
            );
            if (!occupyingSlot) continue;

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
            if (!facultyFree || !roomFree || !facultyUnderDailyMax) continue;

            const relocated = tryRelocateSlot(
              occupyingSlot,
              slots,
              facultyAvailability,
              roomAvailability,
              sectionAvailability,
              subjectPerSectionDay,
              facultyMaxPeriods,
              offeringLookup,
              dayIndex,
              period,
            );
            if (relocated) {
              sectionAvailability[section_id][dayIndex][period] = false;
              markBooked(facultyAvailability, faculty_id, dayIndex, period);
              markBooked(roomAvailability, required_room_id, dayIndex, period);
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
              break;
            }
          }
        }
      }

      if (!placed) {
        unplaced.push({
          subject_offering_id: subjectOfferingId,
          section_id,
          subject_id,
          lectureAttempt: lectureNum + 1,
          reason: "No valid slot found even after attempting a swap",
        });
      }
    }
  });

  return { slots, unplaced };
}
