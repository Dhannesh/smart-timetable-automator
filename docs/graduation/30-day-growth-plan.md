# 30-Day Growth Plan — Smart Timetable Automator

A realistic, one-milestone-per-day roadmap taking this v1.0 MVP toward the "Next 3 Months" goals from `future-scope.md`. Each day assumes ~1-2 focused hours and builds on the previous day. Adjust pacing as needed — consistency matters more than speed.

## Week 1: Automated Testing Foundation (the biggest honest gap from Day 10's review)
- **Day 1:** Set up Vitest; write your first unit test for `validate.js`'s clash-detection logic.
- **Day 2:** Unit tests for `generator.js` — verify hard rules (no double-booking, lecture counts) against small synthetic datasets.
- **Day 3:** Unit tests for `availability.js` matrix functions.
- **Day 4:** Integration test: full `generateAndPersistTimetable()` flow against a Supabase test project.
- **Day 5:** Unit tests for `agentService.js`'s parsing/validation logic (mock the Groq API call).
- **Day 6:** Unit tests for `substituteService.js` ranking logic.
- **Day 7:** Set up GitHub Actions to run the test suite on every push. Review week 1: is coverage meaningful, not just high?

## Week 2: Admin Data-Entry UI (replace CSV/SQL seeding)
- **Day 8:** Design + build a simple "Add Faculty" form (name, max periods/day) writing to Supabase.
- **Day 9:** "Add Subject" and "Add Room" forms.
- **Day 10:** "Add Section" form (year, section label, department).
- **Day 11:** "Add Subject Offering" form — the most complex one (section + subject + faculty + lecture count + optional room).
- **Day 12:** A simple data table view listing all faculty/subjects/rooms with edit/delete actions.
- **Day 13:** Validation + error handling across all new forms (duplicate detection, required fields).
- **Day 14:** Full test pass: recreate this week's seed data entirely through the new UI, no SQL/CSV.

## Week 3: Multi-Year Support (extend beyond 2nd Year)
- **Day 15:** Update `sections` data model usage to support multiple years cleanly in dropdowns/UI (schema already supports it).
- **Day 16:** Seed a second year's worth of sections/subjects/offerings (via your new Week 2 UI).
- **Day 17:** Update the generation engine's section-iteration logic to confirm it correctly handles cross-year faculty (a faculty member teaching both 2nd and 3rd year).
- **Day 18:** Update Student view's year dropdown to be dynamic (not hardcoded to "2nd Year").
- **Day 19:** Full regression test: generate across two years simultaneously, verify zero cross-year faculty clashes.
- **Day 20:** UI polish pass for the now-larger section/year dropdowns (search/filter if the list gets long).
- **Day 21:** Update documentation (`README.md`, `SCHEMA.md`) to reflect multi-year support as shipped, not just planned.

## Week 4: Mobile Responsiveness + Notifications Foundation
- **Day 22:** Audit every screen on an actual phone-sized viewport; list every broken/awkward element.
- **Day 23:** Responsive redesign of `TimetableGrid` for small screens (e.g. a day-by-day accordion view instead of a wide table).
- **Day 24:** Responsive pass on Admin/Faculty dashboards (stacked layouts on mobile).
- **Day 25:** Responsive pass on login pages and the agent request box.
- **Day 26:** Set up a free email-sending service (e.g. Resend's free tier) and send a test email from the app.
- **Day 27:** Wire up an email notification when a faculty member's timetable slot changes due to a reassignment.
- **Day 28:** Wire up an email notification to the admin when a new leave request is submitted.
- **Day 29:** Full end-to-end test: mobile responsiveness + email notifications together, on a real phone.
- **Day 30:** Final review day — update `future-scope.md` with what's now done vs. still pending, write a short retrospective on this 30-day sprint, and decide the next 30-day focus (multi-department support is the natural next choice per the original roadmap).

## How to Use This Plan

Each day, open a fresh AI conversation and use `daily-build-prompt.md` (generated alongside this file), changing only the day number. The prompt references this growth plan as its source of truth, the same way our 10-day capstone blueprint worked.
