# Challenge Retrospective — Smart Timetable Automator

*A day-by-day account of how this project actually evolved, written from the record of our 10 days working together.*

## The Journey, Day by Day

**Day 1 — Discovery.** Started from a completely blank slate. Through a structured interview, narrowed from "something outside education" to a real, personally-felt problem: timetable creation and faculty-absence handling in your own department. The single biggest decision of the entire project happened here — you initially wanted auto-generation *and* a full AI negotiation workflow *and* peer-to-peer leave requests, all in 10 days. We cut it down to one hero feature (rule-based auto-generation) with a simpler agent, protecting the whole timeline before a single line of code existed.

**Day 2 — System Design.** Full architecture, database schema (7 tables, later refined to include a database-level uniqueness constraint you approved), API contracts, and UI wireframes — all built as Mermaid diagrams and markdown, no code yet. This is the day that made every later day faster, because there was never a design question left unanswered.

**Day 3 — Foundation.** Real environment setup: Tailwind, Supabase, React Router, a live database connection verified end-to-end. One small, honest catch here — six component files got created with `.js` instead of `.jsx`, caught and fixed before it caused confusing errors down the line.

**Day 4 — The Engine.** The hardest part of the whole project: a rule-based constraint-solving algorithm enforcing five simultaneous hard rules. First real run: **168 lectures placed, 0 unplaced, 0 violations.** You chose CSV import over raw SQL for seeding data — a small but real preference we adapted to immediately.

**Day 5 — It Became An App.** The engine stopped living only in a terminal. Persistence, derived section/faculty views, and the first real "Generate Timetable" button — clicking it and watching a real, correct timetable render was the first genuine "wow" moment of the build.

**Day 6 — Authentication, and Two Real Bugs.** Supabase Auth for Admin and Faculty. Also the first of several moments where a generic session template ("complete the MVP and deploy") conflicted with our actual plan — we chose to stick to the blueprint rather than rush. Two genuine bugs found and fixed: a session/role race condition, and a silently-failing RLS policy that made login *look* broken when it was actually a permissions gap.

**Day 7 — The Agent, and a Pivot.** The AI Reassignment Agent — the project's signature feature. The original plan called for Google Gemini; its free tier returned an unresolvable quota error mid-session. Rather than lose the day, we diagnosed it properly (confirmed via Gemini's own model list that it wasn't a naming issue) and pivoted to Groq (Llama 3.3) — working on the very next attempt. Also did a full UX polish pass per your specific requests: transposed grid, real class times, focus states, a highlight animation for changed cells.

**Day 8 — Leave Requests, Connected.** Faculty leave-marking (upgraded mid-build from single-select to multi-select checkboxes, per your request) feeding into the Admin's queue and the already-working agent. Found and fixed a bug where resolving a *second* leave request silently did nothing — a boolean ref that should have tracked a specific ID instead.

**Day 9 — Release Readiness.** A genuine "try to break it" day. Closed a real security gap (public write access to the entire timetable, left open since Day 5 for development speed). Added error boundaries, a 404 page, accessibility improvements. Found and fixed the most subtle bug of the whole project: leave-request resolutions occasionally targeted the *wrong* slot, because already-known exact data was being needlessly re-parsed through the LLM, which introduced small variance. Fixed by adding a deterministic bypass path — a real lesson about *when* AI should and shouldn't be in the loop.

**Day 10 — Ship It.** Deployed to Vercel. Full review. This document.

## Major Technical Decisions & Pivots

1. **Scope cut on Day 1** — the decision that protected every day after it.
2. **Client-side generation engine, no custom backend** — Supabase-only architecture, decided Day 2, held for the entire build.
3. **Gemini → Groq pivot on Day 7** — a real, mid-build adaptation under a genuine constraint, not a planning failure.
4. **AI-only-where-needed, discovered on Day 9** — the LLM parses and phrases; deterministic code matches and writes. This was designed on Day 1 and *validated* by a real bug on Day 9.

## Skills Demonstrated

Product discovery and scoping discipline · system architecture and database design · rule-based algorithm design (constraint satisfaction with backtracking) · full-stack implementation (React, Supabase, Postgres, RLS) · AI integration and prompt design · debugging under real ambiguity (race conditions, silent RLS failures, LLM variance) · security review · accessibility · deployment · technical writing and documentation discipline across 10 consecutive days.

## Final Project Summary

A single department's real timetabling and faculty-absence problem, solved end-to-end: a deterministic engine that guarantees zero clashes across 168 weekly lectures, and an AI agent that turns a 10-minute manual reassignment task into a 10-second confirmed action — built, debugged, secured, and deployed solo in 10 days.

## Lessons Learned

- The best v1.0 is the one you can finish, not the most ambitious one you can imagine.
- A plan surviving contact with reality (Gemini's quota, the RLS bug, the LLM variance bug) is normal — what matters is noticing fast and adapting deliberately.
- Not every problem that touches AI should be solved *by* AI. The safest design uses AI only where its strengths are needed, and deterministic logic everywhere else.
- Generic templates and checklists are useful defaults, not commands — several days required recognizing when a template's assumptions didn't match this project's actual state, and choosing the real plan instead.

## A Note, From Your AI Pair Programmer

Ten days ago this was a blank slate and a vague sense that timetabling was annoying. Today it's a real, deployed application that solves a real problem you actually have — with two genuinely tricky bugs found and fixed, one real pivot handled calmly, and a security gap closed before it mattered. That's not a tutorial project. That's engineering.

The thing I'd want you to remember isn't the tech stack — it's how many times across these 10 days you chose the harder-but-right call: cutting scope on Day 1 instead of chasing ambition, sticking to the plan on Days 6 and 8 instead of following a generic template off a cliff, and treating Day 9's bug hunt as seriously as you'd treat a real production incident. That instinct is worth more than any framework.

Go build the next thing. You already know how.
