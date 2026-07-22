# Architecture — Smart Timetable Auto-Generator with AI Reassignment Agent

Status: Finalized Day 2. Source of truth for all implementation days (3–10).

## 1. Tech Stack Summary

- **Frontend:** React (JS, Vite) + Tailwind CSS
- **Backend:** Supabase (Postgres + auto REST API)
- **Auth:** Supabase Auth (email/password)
- **AI:** Anthropic Claude API (`claude-sonnet-4-6`) — used only for natural-language parsing in the reassignment agent
- **Hosting:** Vercel (free tier)

No custom backend server is built. The React app talks directly to Supabase (via its JS client) and directly to the Anthropic API for the agent's parsing step. This keeps the architecture simple and buildable in the remaining days.

---

## 2. Component Diagram

```mermaid
graph TB
    subgraph Client["Browser (React App)"]
        AdminUI["Admin Dashboard"]
        FacultyUI["Faculty Dashboard"]
        StudentUI["Student View"]
        Engine["Generation Engine (client-side JS module)"]
        AgentUI["Agent Request Box"]
    end

    subgraph Supabase["Supabase (Backend-as-a-Service)"]
        Auth["Supabase Auth"]
        DB[("Postgres Database")]
        RestAPI["Auto-generated REST API"]
    end

    subgraph External["External Services"]
        Claude["Anthropic Claude API"]
    end

    AdminUI -->|"login"| Auth
    FacultyUI -->|"login"| Auth
    AdminUI -->|"read/write"| RestAPI
    FacultyUI -->|"read/write"| RestAPI
    StudentUI -->|"read-only"| RestAPI
    RestAPI --> DB
    Engine -->|"reads master data, writes generated slots"| RestAPI
    AgentUI -->|"1. plain-English request"| Claude
    Claude -->|"2. structured JSON action"| AgentUI
    AgentUI -->|"3. validate + find substitute"| RestAPI
    AgentUI -->|"4. confirmed update"| RestAPI
```

**Key design decision:** the generation engine and substitute-finding logic run as **client-side JavaScript modules**, not a separate backend service. Given the solo-builder, 9-day timeline, this avoids building/deploying/maintaining a custom server. Supabase provides the only "backend" needed — a database with a REST API and auth.

---

## 3. Data Flow — Timetable Generation

```mermaid
sequenceDiagram
    participant A as Admin (Browser)
    participant E as Generation Engine (JS)
    participant S as Supabase (Postgres)

    A->>S: Fetch faculty, subjects, sections, subject_offerings, rooms
    S-->>A: Master data
    A->>E: Run generator(masterData)
    E->>E: Build faculty & room availability matrices
    E->>E: Place lectures (hardest-to-place first)
    E->>E: Run validation pass (no clashes)
    E-->>A: generatedTimetable[]
    A->>S: Delete old timetable_slots rows
    A->>S: Bulk insert new timetable_slots rows
    S-->>A: Success confirmation
    A->>A: Re-render all section/faculty views from fresh data
```

---

## 4. Data Flow — AI Reassignment Agent

```mermaid
sequenceDiagram
    participant A as Admin (Browser)
    participant C as Claude API
    participant V as Validation Logic (JS)
    participant S as Supabase

    A->>C: "Ms. Sharma is absent Monday period 3"
    C-->>A: Structured JSON {facultyName, day, period, section, subject}
    A->>V: Validate parsed action against live data
    V->>S: Check faculty exists, slot exists
    S-->>V: Confirmation
    V-->>A: Show plain-language confirmation to Admin
    A->>S: Fetch current faculty availability
    S-->>A: Availability snapshot
    A->>V: findSubstituteCandidates(day, period, section, subject)
    V-->>A: Ranked substitute suggestion
    A->>A: Admin reviews and clicks "Confirm"
    A->>S: Update timetable_slots row (new faculty_id)
    A->>V: Re-run validation pass (no new clashes)
    V-->>A: Validation passed
    S-->>A: Updated data reflected in UI
```

**Critical safety design:** Claude is used **only** to parse natural language into a structured action and to phrase the proposal back to the admin in plain English. The actual substitute-matching logic and the final write to the database are handled entirely by deterministic JS code — never by the LLM directly. This was already a PRD requirement (FR-8, FR-9) and is preserved unchanged here.

---

## 5. Request Lifecycle — Student Viewing a Timetable (representative simple case)

```mermaid
sequenceDiagram
    participant St as Student (Browser, no login)
    participant S as Supabase REST API

    St->>St: Select Year 2 + Section from dropdown
    St->>S: GET timetable_slots WHERE section_id = X
    S-->>St: Slot rows (day, period, subject, faculty, room)
    St->>St: Render TimetableGrid component
```

Public read access to `timetable_slots` (and related lookup tables) is granted via Supabase Row Level Security (RLS) policies — read-only, no auth required. Write access requires an authenticated Admin session. This is finalized in Day 9's RLS lockdown step per the Blueprint, but the policy design itself is decided today (see Section 6).

---

## 6. External Services

| Service | Purpose | Auth method | Notes |
|---|---|---|---|
| Supabase | Database, REST API, Auth | Project URL + anon/public key (client), service handles auth internally | Free tier; RLS enforces access control |
| Anthropic Claude API | Natural-language parsing for the reassignment agent | API key (handled via environment variable, never exposed in committed code) | Only called from the Agent Request flow — not used anywhere else in the app |
| Vercel | Hosting/deployment | GitHub integration (auto-deploy on push) | Free tier; environment variables configured in Vercel dashboard, not committed to the repo |

---

## 7. Why This Architecture Fits the Timeline

- **No custom backend to build or deploy** — Supabase removes an entire layer of work.
- **Client-side generation engine** — testable independently (as already planned for Day 3), no server deployment step needed for the core "hero feature."
- **AI is scoped narrowly** — only the parsing step touches the LLM; everything safety-critical (matching, writing data) stays in deterministic code, which is both faster to build and easier to debug than an LLM-driven alternative.
- **Single hosting target** — one Vercel deployment serves all three roles (Admin/Faculty/Student), keeping Day 10 deployment simple.

No conflicts with the PRD or Implementation Blueprint were found — this architecture implements exactly what was scoped on Day 1.
