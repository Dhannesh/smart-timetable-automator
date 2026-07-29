# Smart Timetable Automator

A rule-based timetable auto-generation engine for a college department, paired with an AI agent that resolves faculty-absence disruptions through natural-language requests.

Built as a 10-day capstone project for the **AB Talks 60-Day Claude AI Mastery Challenge**.

---

## 🎯 Problem

Creating a department timetable manually — assigning faculty, subjects, and rooms across many sections while avoiding clashes — is slow and error-prone. Once published, handling real-world disruptions (like a faculty member's sudden absence) requires manually checking every colleague's schedule and workload to find a valid substitute.

## ✅ Solution

- **One-click auto-generation** — instantly produces a clash-free weekly timetable for all sections at once, using a deterministic, rule-based engine with backtracking (no ML uncertainty in the core schedule).
- **AI Reassignment Agent** — type a plain-English request like _"Dr. Sharma is absent Monday period 1"_, and the agent parses it, checks faculty load and clashes, proposes a valid substitute, and updates the timetable once confirmed.
- **Faculty Leave Requests** — faculty can mark themselves absent for one or more classes; requests land directly on the Admin's queue, one click away from resolution via the same AI agent.
- **Human-in-the-loop by design** — the AI never applies a change automatically; every suggestion requires admin confirmation.

---

## 👥 Roles & Access

| Role                    | Access                             | What they can do                                                               |
| ----------------------- | ---------------------------------- | ------------------------------------------------------------------------------ |
| **Admin / Coordinator** | Full secure login                  | Generate the timetable, run the AI agent, manage leave requests                |
| **Faculty**             | Login required                     | View own timetable by default, browse other faculty, mark leave (multi-select) |
| **Student**             | No login (Year + Section dropdown) | View their section's timetable                                                 |

---

## 📦 v1.0 Scope

- 1 department, **2nd Year**, **6 sections**
- **20 faculty members**, **8 subjects per section**
- Monday–Friday, **8 periods/day**, with real class times displayed

**Hard scheduling rules enforced:**

- No faculty double-booked across any section
- Each subject's fixed weekly lecture count is met exactly
- No subject repeated on the same day for a section
- Subjects requiring a specific lab/room only scheduled in that lab/room
- No faculty exceeds their configured max periods/day

**Explicitly out of scope for v1.0:**

- Mobile app (web-only)
- Multi-department / multi-year support
- Peer-to-peer leave negotiation between faculty
- Email/SMS notifications

---

## 🛠 Tech Stack

- **Frontend:** React (JS, via Vite) + Tailwind CSS
- **Backend & Data:** Supabase (Postgres + Auth), with Row Level Security enforced
- **AI Agent Layer:** [Groq API](https://console.groq.com) (Llama 3.3 70B Versatile) — free tier. Parses natural-language requests into structured actions; substitute-finding logic itself stays fully rule-based (non-AI) for reliability.
- **Hosting:** Vercel (free tier)

> **Note:** the original plan specified Google Gemini for the AI layer, but its free tier was unavailable on the tested project (quota restrictions). Groq was used instead — genuinely free, and works reliably for this use case.

---

## 🗂 Project Structure
/src
/engine → rule-based generation engine (with backtracking), availability matrices, validation
/services → Supabase data access, Groq agent service, substitute-finding, leave requests
/components → TimetableGrid, AgentRequestBox, LeaveRequestsList, MarkLeaveForm, ErrorBoundary, etc.
/pages → AdminDashboard, FacultyDashboard, StudentView, login pages, NotFound
/auth → Supabase Auth context, protected routes
/hooks → shared data-loading hook (useAsyncData)
/supabase
schema.sql → full database schema
/public
favicon.svg

---

## 🚀 Getting Started (local development)

1. Clone the repository and install dependencies:
npm install
2. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor.
3. Create a `.env.local` file in the project root:
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=your-groq-api-key

Get a free Groq API key at [console.groq.com](https://console.groq.com).
4. Set up master data (departments, sections, subjects, rooms, faculty, subject offerings) via the Supabase Table Editor's CSV import, or your own SQL inserts.
5. Create Admin and Faculty accounts via Supabase Authentication → Users, then link them to `admin_users`/`faculty` rows via `auth_user_id` (see `SETUP.md` for full details).
6. Run the dev server:
npm run dev

---

## 🧪 Core Flows to Try

1. **Generate:** Log in as Admin → click "Generate Timetable" → see all 6 sections populate instantly.
2. **Reassign:** Type an absence request (e.g. *"Dr. Sharma is absent Monday period 1"*) → confirm the proposed substitute → see the timetable update live.
3. **Leave:** Log in as Faculty → select one or more classes to mark absent → check they appear on the Admin's Leave Requests list → resolve via the agent.
4. **Student view:** Open the app with no login → select Year 2 + a section → view the timetable.

---

## 🔭 Future Scope

- Multi-department, multi-year rollout
- Peer-to-peer leave negotiation workflow (faculty-to-faculty requests with accept/reject)
- Email/SMS notifications
- Native mobile app
- Analytics dashboard (workload trends, room utilization, substitution frequency)
- Voice-driven agent interaction

---

## 📄 License

MIT — see [LICENSE](./LICENSE).

## 👤 Author

**Dhaneshwar Kumar** — ABTalks (@aabtalks)
Built as part of the 60-Day Claude AI Mastery Challenge.

---

*Built with Claude as part of the AB Talks 60-Day Claude AI Challenge.*