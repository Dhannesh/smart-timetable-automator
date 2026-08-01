# Future Scope — Smart Timetable Automator

How this specific project could realistically evolve, grounded in what v1.0 actually is today: a single-department (2nd Year CSE, 6 sections) rule-based generator with a Groq-powered reassignment agent, built on React + Supabase.

## Next 3 Months — Solidify & Expand Within One College

- **Multi-department support:** extend `departments`/`sections` beyond CSE to cover other engineering branches (Mechanical, Civil, ECE) at the same institution — the schema already supports this (department_id foreign keys exist everywhere); this is primarily a UI/data-entry expansion, not a redesign.
- **Multi-year support:** extend beyond 2nd Year to 1st/3rd/4th Year sections — same schema, more `sections` rows and `subject_offerings`.
- **Peer-to-peer leave negotiation:** the workflow explicitly deferred on Day 1 — faculty directly requesting/accepting substitutions with each other before admin sign-off, rather than the current single-step "faculty marks leave → admin resolves via agent" flow.
- **Admin data-entry UI:** replace CSV/SQL-based master data seeding with a proper in-app UI for adding/editing faculty, subjects, rooms, and offerings — flagged as out-of-scope back on Day 4 to protect the build timeline, now a natural next step.
- **Mobile responsiveness pass:** the grid currently requires horizontal scrolling on small screens (a known, documented gap from Day 10's review) — a dedicated responsive redesign of `TimetableGrid` for phone-sized viewports.

## Next 6 Months — Real Institutional Deployment

- **Email/SMS notifications:** notify faculty when their timetable changes (currently silent — they'd only see it by checking the app).
- **Analytics dashboard:** faculty workload trends, room utilization rates, substitution frequency by faculty/subject — using the historical data already being generated in `timetable_slots` and `leave_requests`.
- **Automated testing suite:** unit tests for the generation engine (`generator.js`, `validate.js`) and integration tests for the agent pipeline — the project currently has zero automated tests, relying entirely on manual verification, which was appropriate for a 10-day solo sprint but not for a multi-institution product.
- **Proper multi-tenant architecture:** if deployed to more than one college, each institution needs isolated data (currently the schema assumes a single department's data with no tenant boundary).
- **Voice-driven agent interaction:** extend the text-based agent to accept voice input for the absence-reporting flow (aligns with the original PRD's "Future Scope" section from Day 1).

## Next 12 Months — Productization (aligned with the FacultyOS vision)

- **This project becomes the scheduling module of a broader academic-administration SaaS** (consistent with the FacultyOS direction already explored elsewhere in this body of work): timetabling, attendance, and documentation automation as one connected product for Indian engineering colleges.
- **Billing/subscription infrastructure** if pursued as a real SaaS product rather than a single-college deployment.
- **Migrate the AI agent to a more robust provider strategy:** given the real Day 7 lesson (Gemini's free tier proved unavailable mid-build), a production product at this stage would want either a paid, SLA-backed provider or a multi-provider fallback strategy rather than relying on any single free tier.
- **Formal onboarding/documentation for new institutions:** admin training materials, a proper setup wizard, and support processes — the kind of infrastructure that separates "a working demo" from "a product other people can actually adopt without the original builder's help."

## What This Roadmap Deliberately Avoids

Consistent with the discipline shown throughout the 10-day build (repeatedly protecting scope against generic templates that pushed for premature deployment or feature creep — see Days 6-9), this roadmap does not front-load ambitious features before the fundamentals (multi-department, testing, mobile) are solid. Scope discipline was the single most repeated lesson of this entire project; there's no reason for it to stop now.
