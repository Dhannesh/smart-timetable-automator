# Project Log

## Day 1 — Product Discovery & Sprint Planning
- Ran product discovery interview from blank slate → selected project: Smart Timetable Auto-Generator with AI Reassignment Agent.
- Scoped to 1 department, 2nd Year, 6 sections, 20 faculty, 8 subjects/section, Mon-Fri, 8 periods/day.
- Key scoping decision: chose rule-based auto-generation as the "hero feature"; simplified the AI agent to admin-driven reassignment only (no peer-to-peer leave negotiation) to protect the 10-day timeline.
- Deliverables: PRD, Implementation Blueprint (Days 2-10), Pitch Deck.

## Day 2 — System Design
- Confirmed GitHub repository created and cloned locally (`smart-timetable-automator`), with `/docs`, `/src`, `/supabase` scaffolded.
- Finalized tech stack: React (JS, Vite) + Tailwind, Supabase (Postgres + Auth), Anthropic Claude API (`claude-sonnet-4-6`), Vercel hosting.
- Designed full system architecture (component diagram, generation data flow, AI agent data flow, request lifecycle) — see `ARCHITECTURE.md`.
- Designed complete database schema (7 tables, relationships, constraints) and validated it against every PRD functional requirement — see `SCHEMA.md`. Added one refinement: a `UNIQUE(faculty_id, day_of_week, period_number)` constraint as a database-level safety net against faculty double-booking.
- Designed all v1.0 API endpoints (auth, master data, timetable, AI agent, leave requests) — see `API.md`.
- Designed complete user flow, screen flow, and low-fidelity wireframes for Admin, Faculty, and Student roles — see `UI-WIREFRAMES.md`.
- Finalized project folder structure, with one addition (`/src/auth`) beyond Day 1's plan — see `PROJECT-STRUCTURE.md`.
- Day 3 readiness check: no scope creep, no timeline risk, Day 3 can begin implementation immediately against these design documents.
- Deliverables: ARCHITECTURE.md, SCHEMA.md, API.md, UI-WIREFRAMES.md, PROJECT-STRUCTURE.md, Implementation Blueprint Day 2 Addendum.
