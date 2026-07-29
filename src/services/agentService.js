import { supabase } from "./supabaseClient.js";

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

const DAY_NAME_TO_INDEX = {
  monday: 0,
  mon: 0,
  tuesday: 1,
  tue: 1,
  tues: 1,
  wednesday: 2,
  wed: 2,
  thursday: 3,
  thu: 3,
  thurs: 3,
  friday: 4,
  fri: 4,
};

const DAY_LABELS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/**
 * Sends the admin's plain-English request to Groq (Llama 3.3) and returns a structured action.
 * Only used for genuinely free-typed messages — NOT for leave-request-triggered resolutions,
 * which have exact structured data already and should skip the LLM (see validateAbsenceActionDirect).
 */
export async function parseAbsenceRequest(message) {
  if (!GROQ_API_KEY) {
    throw new Error(
      "Groq API key is missing. Add VITE_GROQ_API_KEY to .env.local.",
    );
  }

  const systemPrompt = `You are a parser for a college timetable system. Extract structured data from the admin's message about a faculty absence.

Return ONLY a raw JSON object, no markdown fences, no explanation, in exactly this shape:
{"facultyName": "string", "day": "monday|tuesday|wednesday|thursday|friday", "period": number}

If the message doesn't clearly contain a faculty name, a day, and a period number, return:
{"error": "could not understand the request"}`;

  const response = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ],
      temperature: 0,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.choices?.[0]?.message?.content ?? "";

  const cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(
      `Could not understand the request. Please rephrase (e.g. "Ms. Sharma is absent Monday period 3").`,
    );
  }

  if (parsed.error) {
    throw new Error(
      'Could not understand the request. Please rephrase (e.g. "Ms. Sharma is absent Monday period 3").',
    );
  }

  const dayIndex = DAY_NAME_TO_INDEX[String(parsed.day).toLowerCase()];
  if (dayIndex === undefined) {
    throw new Error(
      `Unrecognized day: "${parsed.day}". Please use a weekday name (Monday-Friday).`,
    );
  }

  const period = Number(parsed.period);
  if (!period || period < 1 || period > 8) {
    throw new Error(
      `Unrecognized period: "${parsed.period}". Please use a period number 1-8.`,
    );
  }

  return {
    facultyNameRaw: parsed.facultyName,
    dayIndex,
    period,
  };
}

/**
 * Validates a parsed (LLM-derived) action against real data: fuzzy-matches the faculty name,
 * confirms they have an actual slot at that day/period. Used for manually-typed requests.
 */
export async function validateAbsenceAction({
  facultyNameRaw,
  dayIndex,
  period,
}) {
  const { data: allFaculty, error: facultyError } = await supabase
    .from("faculty")
    .select("id, name");
  if (facultyError)
    throw new Error(`Failed to fetch faculty: ${facultyError.message}`);

  const nameLower = facultyNameRaw.toLowerCase();
  const matches = allFaculty.filter(
    (f) =>
      f.name.toLowerCase().includes(nameLower) ||
      nameLower.includes(f.name.toLowerCase().replace(/^(dr\.|prof\.)\s*/, "")),
  );

  if (matches.length === 0) {
    throw new Error(
      `No faculty member found matching "${facultyNameRaw}". Please check the spelling.`,
    );
  }
  if (matches.length > 1) {
    throw new Error(
      `Multiple faculty members match "${facultyNameRaw}": ${matches.map((m) => m.name).join(", ")}. Please be more specific.`,
    );
  }

  return validateAbsenceActionDirect({
    facultyId: matches[0].id,
    facultyName: matches[0].name,
    dayIndex,
    period,
  });
}

/**
 * Validates a KNOWN, exact absence action (facultyId already known — no name matching, no LLM
 * involved). Used when resolving a leave request, where we already have the faculty's ID directly
 * from the database, not from free-text parsing. This is the safe, deterministic path.
 */
export async function validateAbsenceActionDirect({
  facultyId,
  facultyName,
  dayIndex,
  period,
}) {
  const { data: slotMatches, error: slotError } = await supabase
    .from("timetable_slots")
    .select(
      `
      id, section_id, day_of_week, period_number,
      section:section_id ( section_label, year ),
      subject_offering:subject_offering_id ( subject:subject_id ( name ) )
    `,
    )
    .eq("faculty_id", facultyId)
    .eq("day_of_week", dayIndex)
    .eq("period_number", period);

  if (slotError)
    throw new Error(`Failed to check timetable: ${slotError.message}`);

  if (!slotMatches || slotMatches.length === 0) {
    throw new Error(
      `${facultyName} has no class scheduled at ${DAY_LABELS[dayIndex]} period ${period}. It may have already been reassigned.`,
    );
  }

  const slot = slotMatches[0];

  return {
    slotId: slot.id,
    facultyId,
    facultyName,
    dayIndex,
    period,
    sectionLabel: `${slot.section.year} - ${slot.section.section_label}`,
    subjectName: slot.subject_offering.subject.name,
  };
}
