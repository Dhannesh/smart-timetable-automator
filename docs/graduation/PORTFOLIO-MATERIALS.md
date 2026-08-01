# Portfolio Materials — Smart Timetable Automator

## Project Description (short, for a portfolio card/list)

**Smart Timetable Automator** — A rule-based timetable auto-generation engine for a college department, paired with an AI reassignment agent that resolves faculty-absence disruptions through natural language. Built solo in 10 days: React, Supabase, Groq (Llama 3.3). Handles 168 lectures/week across 6 sections with zero scheduling conflicts, and lets an admin resolve a faculty absence in under 10 seconds via plain English.

## Project Description (long, for a portfolio detail page)

Engineering colleges typically build faculty timetables by hand — a slow, error-prone process that gets worse the moment reality intervenes: a sudden faculty absence forces manual cross-checking of every colleague's schedule and workload to find a valid substitute.

Smart Timetable Automator solves both halves of this problem. A deterministic, rule-based constraint-solving engine (with backtracking) generates a complete, clash-free weekly timetable for an entire department — 6 sections, 20 faculty, 48 subject-offerings, 168 lectures — in a single click, enforcing five hard scheduling rules simultaneously (no faculty double-booking, exact lecture counts, no same-day subject repeats, lab/room requirements, daily load limits).

On top of that, an AI-powered reassignment agent lets an administrator type a plain-English request like *"Dr. Sharma is absent Monday period 1"* — the agent parses it, validates it against the live database, finds a genuinely available substitute ranked by current workload, and applies the change only after explicit human confirmation. Faculty can also self-report absences via a multi-select leave form that feeds directly into the same admin-confirmed pipeline.

The project was built end-to-end over a real 10-day sprint: product discovery, system design, database and API design, iterative implementation, a mid-build pivot when the originally planned AI provider's free tier proved unavailable, a full security and reliability hardening pass, and public deployment.

## Resume Bullet Points

- Designed and built a full-stack timetable automation system (React, Supabase, Groq/Llama 3.3) solving real scheduling constraints for 6 sections, 20 faculty, and 168 weekly lectures with zero clash conflicts.
- Implemented a rule-based constraint-solving algorithm with backtracking to guarantee zero scheduling conflicts across 5 simultaneous hard constraints (faculty availability, room requirements, daily load limits, and more).
- Built an AI-powered natural-language agent (Groq/Llama 3.3) that parses plain-English absence reports into structured actions, validated against live data before any change is applied — with human-in-the-loop confirmation by design.
- Diagnosed and fixed a production-impacting bug where LLM-based re-parsing of already-known data caused intermittent misassignment; resolved by introducing a deterministic bypass path, improving both reliability and latency.
- Performed a full security and release-readiness review: identified and closed an open public-write database vulnerability, added error boundaries, accessibility improvements, and production error handling before public launch.
- Managed the full software development lifecycle solo over a 10-day sprint: requirements, system architecture, database/API design, implementation, QA, and deployment (Vercel + Supabase).

## Interview Talking Points

**"Tell me about a challenging bug you fixed."**
Walk through the Day 9 leave-request bug: the agent worked correctly for typed requests, but resolving a leave request (which already had exact structured data — faculty ID, day, period) was still being routed through the LLM as free text. The LLM's output had small variance even at temperature 0, occasionally extracting a slightly wrong day/period. The fix — adding `validateAbsenceActionDirect()` to bypass the LLM entirely when exact data is already known — is a good example of understanding *when* to use AI versus when deterministic logic is strictly better.

**"Tell me about a time you had to change your plan."**
Two real examples from this project: (1) Day 1's original idea (auto-generate + full AI agent + peer-to-peer leave negotiation) was scoped down to a single hero feature to protect a hard 10-day deadline. (2) Day 7's planned AI provider (Google Gemini) hit an unresolvable free-tier quota restriction mid-build; rather than lose a day fighting it, pivoted to Groq and had it working within the same session.

**"How do you approach security in a project like this?"**
Point to Day 9: RLS policies that were intentionally left open during early development (for speed) were identified and properly locked down before public launch — a deliberate, documented trade-off rather than an oversight, with a clear before/after.

**"How do you handle scope creep?"**
Multiple real instances across the 10-day build where session templates asked for work outside the planned scope for that day (Days 6, 7, 8, 9 all had this) — each time, flagged the mismatch explicitly and made a deliberate call rather than silently expanding scope or blindly following a generic template over the actual project plan.

## Short Demo Script (2-3 minutes)

1. **Open the deployed app** — show the Student view first: "Anyone can check a section's timetable instantly, no login needed." Select a section, show the grid with real subjects, faculty, and times.
2. **Log in as Admin** — "Watch this: one click generates a complete, clash-free timetable for the entire department." Click Generate, point out the "0 unplaced" result.
3. **The AI agent** — "Now here's the interesting part." Type: *"Dr. Sharma is absent Monday period 1"*. Show the parsed confirmation, the proposed substitute, and reasoning ("lowest current load"). Click Confirm — show the grid update live with a highlighted cell.
4. **Faculty leave flow** — "Faculty can also self-report." Briefly show the multi-select leave form and how it lands on the Admin's queue, one click from resolution via the same agent.
5. **Close** — "Built solo in 10 days: React, Supabase, and Groq's free-tier Llama model — real requirements, real debugging, real deployment."
