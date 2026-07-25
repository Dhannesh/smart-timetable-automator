import { DAYS, PERIOD_NUMBERS } from "./constants.js";

/**
 * Builds a fresh availability matrix for a list of entity IDs (faculty or rooms).
 * Shape: { [entityId]: { [dayIndex]: { [periodNumber]: true/false } } }
 * true = available, false = already booked.
 */
export function buildAvailabilityMatrix(entityIds) {
  const matrix = {};
  for (const id of entityIds) {
    matrix[id] = {};
    for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
      matrix[id][dayIndex] = {};
      for (const period of PERIOD_NUMBERS) {
        matrix[id][dayIndex][period] = true; // everyone starts fully free
      }
    }
  }
  return matrix;
}

/** Returns true if the entity (faculty or room) is free at this day/period. */
export function isAvailable(matrix, entityId, dayIndex, period) {
  if (!entityId) return true; // no entity required (e.g. no room needed) = always "available"
  return matrix[entityId]?.[dayIndex]?.[period] === true;
}

/** Marks the entity as booked at this day/period. */
export function markBooked(matrix, entityId, dayIndex, period) {
  if (!entityId) return;
  if (matrix[entityId] && matrix[entityId][dayIndex]) {
    matrix[entityId][dayIndex][period] = false;
  }
}

/** Counts how many periods this entity is already booked on a given day (used for max-periods-per-day check). */
export function countBookedOnDay(matrix, entityId, dayIndex) {
  if (!entityId || !matrix[entityId]) return 0;
  const dayMatrix = matrix[entityId][dayIndex];
  return Object.values(dayMatrix).filter((isFree) => isFree === false).length;
}
