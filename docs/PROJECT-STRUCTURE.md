# Project Structure — Smart Timetable Auto-Generator

Status: Finalized Day 2. This is the folder structure Day 2's scaffold step (Blueprint) will create, and every subsequent day builds into.

## Full Structure

```
smart-timetable-automator/
├── docs/
│   ├── PRD_Timetable_Automator.docx
│   ├── Implementation_Blueprint_Days2-10.docx
│   ├── Pitch_Deck_Timetable_Automator.pptx
│   ├── ARCHITECTURE.md
│   ├── SCHEMA.md
│   ├── API.md
│   ├── UI-WIREFRAMES.md
│   ├── PROJECT-STRUCTURE.md
│   └── PROJECT-LOG.md
│
├── supabase/
│   ├── schema.sql              — full table definitions + constraints
│   └── seed.sql                — seed data (20 faculty, 8 subjects, 6 sections, rooms)
│
├── src/
│   ├── engine/
│   │   ├── generator.js        — core rule-based generation algorithm
│   │   ├── availability.js     — faculty/room availability matrices
│   │   ├── validate.js         — post-generation & post-update validation pass
│   │   ├── constants.js        — day/period constants, named indices
│   │   └── testGenerator.js    — standalone console test harness
│   │
│   ├── services/
│   │   ├── supabaseClient.js   — initialized Supabase client
│   │   ├── timetableService.js — getSectionTimetable, getFacultyTimetable, generate+persist
│   │   ├── agentService.js     — Claude API call + JSON parsing/validation
│   │   ├── substituteService.js— findSubstituteCandidates, ranking logic
│   │   └── leaveService.js     — leave request CRUD
│   │
│   ├── components/
│   │   ├── TimetableGrid.jsx        — reusable day x period grid
│   │   ├── AgentRequestBox.jsx      — text input + confirmation modal
│   │   ├── LeaveRequestsList.jsx    — admin's pending leave list
│   │   ├── MarkLeaveForm.jsx        — faculty leave-marking form
│   │   ├── RecentChangesPanel.jsx   — admin's recent agent-driven changes
│   │   └── Navbar.jsx               — role-aware top navigation
│   │
│   ├── pages/
│   │   ├── AdminLogin.jsx
│   │   ├── AdminDashboard.jsx
│   │   ├── FacultyLogin.jsx
│   │   ├── FacultyDashboard.jsx
│   │   └── StudentView.jsx
│   │
│   ├── auth/
│   │   └── AuthContext.jsx     — Supabase Auth session context + protected-route logic
│   │
│   ├── router.jsx              — react-router-dom route definitions
│   ├── App.jsx                 — top-level app shell
│   └── main.jsx                — Vite entry point
│
├── .env.local                  — Supabase + Anthropic API keys (gitignored)
├── .gitignore
├── tailwind.config.js
├── vite.config.js
├── package.json
└── README.md
```

---

## Folder Responsibilities

| Folder | Responsibility |
|---|---|
| `/docs` | All planning and design artifacts — PRD, Blueprint, Pitch Deck, and today's technical docs. Nothing executable lives here. |
| `/supabase` | The database's source of truth as SQL — schema and seed data, version-controlled so the database can be recreated from scratch if needed. |
| `/src/engine` | The "hero feature" — pure JS, framework-agnostic, independently testable. No React or Supabase imports here except where it fetches master data; kept separate so the core algorithm is never tangled with UI code. |
| `/src/services` | All data-access and external-API logic (Supabase queries, Claude API calls). Components never call Supabase or Claude directly — they call a service function. This keeps components simple and makes swapping/mocking a data source easy if ever needed. |
| `/src/components` | Reusable, presentational UI pieces used across multiple pages. |
| `/src/pages` | Route-level screens, one per role/screen from the UI-WIREFRAMES doc. |
| `/src/auth` | Authentication state and route protection, isolated from business logic. |

## Why This Structure

- **Engine isolation** (`/src/engine`) directly supports the Day 3 plan: the generation algorithm must be testable via a standalone script (`testGenerator.js`) before any UI exists. Mixing it into components would make that impossible.
- **Services layer** keeps every Supabase/Claude call in one predictable place — when Day 9's RLS lockdown happens, there's exactly one place per data type to check, not scattered calls across components.
- **Pages vs. components** separation matches the three-role structure already locked in the PRD — one page per role/screen, reusable pieces (like `TimetableGrid`) shared across them.
- **Docs folder** keeps every planning artifact alongside the code in the same repo, so a fresh AI session on any future day can be pointed at `/docs` for full context without hunting elsewhere.

This structure requires no changes to the Day 1 Implementation Blueprint — it matches the files and folders already listed there, with the addition of the `/src/auth` folder (needed for Day 5's login work) and today's `/docs` additions.
