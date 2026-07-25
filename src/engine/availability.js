import { DAYS, PERIOD_NUMBERS } from "./constants.js";

export function buildAvailabilityMatrix(entityIds) {
  const matrix = {};
  for (const id of entityIds) {
    matrix[id] = {};
    for (let dayIndex = 0; dayIndex < DAYS.length; dayIndex++) {
      matrix[id][dayIndex] = {};
      for (const period of PERIOD_NUMBERS) {
        matrix[id][dayIndex][period] = true;
      }
    }
  }
  return matrix;
}

export function isAvailable(matrix, entityId, dayIndex, period) {
  if (!entityId) return true;
  return matrix[entityId]?.[dayIndex]?.[period] === true;
}

export function markBooked(matrix, entityId, dayIndex, period) {
  if (!entityId) return;
  if (matrix[entityId] && matrix[entityId][dayIndex]) {
    matrix[entityId][dayIndex][period] = false;
  }
}

export function markFree(matrix, entityId, dayIndex, period) {
  if (!entityId) return;
  if (matrix[entityId] && matrix[entityId][dayIndex]) {
    matrix[entityId][dayIndex][period] = true;
  }
}

export function countBookedOnDay(matrix, entityId, dayIndex) {
  if (!entityId || !matrix[entityId]) return 0;
  const dayMatrix = matrix[entityId][dayIndex];
  return Object.values(dayMatrix).filter((isFree) => isFree === false).length;
}
