// Standalone console test harness. Run with: node src/engine/testGenerator.js
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";
import { generateTimetable } from "./generator.js";
import {
  validateTimetable,
  validateNoSameDaySubjectRepeat,
  printValidationSummary,
} from "./validate.js";
import { DAYS } from "./constants.js";
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Make sure .env.local exists.",
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  console.log("Fetching master data from Supabase...\n");

  const { data: subjectOfferings, error: err1 } = await supabase
    .from("subject_offerings")
    .select("*");
  const { data: faculty, error: err2 } = await supabase
    .from("faculty")
    .select("*");
  const { data: rooms, error: err3 } = await supabase.from("rooms").select("*");

  if (err1 || err2 || err3) {
    console.error("❌ Error fetching data:", err1 || err2 || err3);
    process.exit(1);
  }

  console.log(
    `Loaded: ${subjectOfferings.length} subject offerings, ${faculty.length} faculty, ${rooms.length} rooms\n`,
  );

  const totalLecturesExpected = subjectOfferings.reduce(
    (sum, o) => sum + o.weekly_lecture_count,
    0,
  );

  console.log("Running generation engine...\n");
  const { slots, unplaced } = generateTimetable({
    subjectOfferings,
    faculty,
    rooms,
  });

  console.log("=== GENERATION SUMMARY ===");
  console.log(`Total lectures expected: ${totalLecturesExpected}`);
  console.log(`Total lectures placed:   ${slots.length}`);
  console.log(`Unplaced lectures:       ${unplaced.length}`);

  if (unplaced.length > 0) {
    console.log("\nUnplaced lecture details:");
    unplaced.forEach((u) => console.log("   -", JSON.stringify(u)));
  }

  console.log("\n=== VALIDATION ===");
  const result = validateTimetable(slots);
  const offeringIdToSubjectId = new Map(
    subjectOfferings.map((o) => [o.id, o.subject_id]),
  );
  const sameDayViolations = validateNoSameDaySubjectRepeat(
    slots,
    offeringIdToSubjectId,
  );
  printValidationSummary(result, sameDayViolations);

  console.log("\n=== SAMPLE: Section A, Monday ===");
  const sectionAId = "a1000000-0000-0000-0000-000000000001";
  const mondaySlots = slots
    .filter((s) => s.section_id === sectionAId && s.day_of_week === 0)
    .sort((a, b) => a.period_number - b.period_number);
  console.table(
    mondaySlots.map((s) => ({
      period: s.period_number,
      faculty: s.faculty_id.slice(0, 8),
      room: s.room_id ? s.room_id.slice(0, 8) : "-",
    })),
  );
}

run();
