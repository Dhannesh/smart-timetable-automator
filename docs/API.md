# API Design — Smart Timetable Auto-Generator

Status: Finalized Day 2. No implementation yet — this is the contract Days 4–8 will build against.

## Note on Architecture

Since the backend is Supabase, most "endpoints" here are **Supabase client calls** (via `@supabase/supabase-js`), not custom REST routes. They're documented in endpoint style anyway so the contract is unambiguous regardless of exact client syntax. The one true custom "endpoint" is the call to the Anthropic API for the agent's parsing step.

---

## 1. Authentication

### `POST /auth/admin/login`
- **Purpose:** Admin/Coordinator login
- **Request:** `{ email, password }`
- **Response:** `{ session, user }` (Supabase Auth session object)
- **Validation:** email format, non-empty password
- **Auth:** none required to call; this *is* the auth step
- **Error cases:** invalid credentials (401), account not found (404)

### `POST /auth/faculty/login`
- **Purpose:** Faculty login
- **Request:** `{ email, password }`
- **Response:** `{ session, user }`
- **Validation:** email format, non-empty password
- **Auth:** none required to call
- **Error cases:** invalid credentials (401), account not found (404)

### `POST /auth/logout`
- **Purpose:** End the current session (Admin or Faculty)
- **Request:** none (uses current session)
- **Response:** `{ success: true }`
- **Auth:** requires an active session

---

## 2. Master Data (read-only, used mainly by the generation engine and dropdowns)

### `GET /faculty`
- **Purpose:** List all faculty (for dropdowns, generation engine, agent validation)
- **Request:** none
- **Response:** `[{ id, name, department_id, max_periods_per_day }]`
- **Validation:** n/a
- **Auth:** public read
- **Error cases:** none expected (empty array if no data)

### `GET /subjects`
- **Purpose:** List all subjects
- **Response:** `[{ id, name, code }]`
- **Auth:** public read

### `GET /sections`
- **Purpose:** List all sections (for student dropdown, admin views)
- **Response:** `[{ id, year, section_label, department_id }]`
- **Auth:** public read

### `GET /rooms`
- **Purpose:** List all rooms/labs
- **Response:** `[{ id, name, room_type }]`
- **Auth:** public read

### `GET /subject-offerings`
- **Purpose:** Full rule set the generation engine needs (section+subject+faculty+lecture count+room requirement)
- **Response:** `[{ id, section_id, subject_id, faculty_id, weekly_lecture_count, required_room_id }]`
- **Auth:** public read

---

## 3. Timetable

### `GET /timetable-slots?section_id={id}`
- **Purpose:** Fetch a section's full weekly timetable (used by Admin, Student views)
- **Request:** query param `section_id`
- **Response:** `[{ id, day_of_week, period_number, subject_offering_id, faculty_id, room_id }]` joined with subject/faculty/room names for display
- **Validation:** `section_id` must be a valid UUID
- **Auth:** public read
- **Error cases:** invalid/unknown section_id → empty array (not an error, just no data)

### `GET /timetable-slots?faculty_id={id}`
- **Purpose:** Fetch a specific faculty member's derived personal timetable (used by Faculty dashboard)
- **Request:** query param `faculty_id`
- **Response:** same shape as above, filtered by faculty
- **Auth:** requires faculty login (any logged-in faculty can view any other faculty's — per PRD FR-11)
- **Error cases:** invalid faculty_id → empty array

### `POST /timetable/generate`
- **Purpose:** Run the full generation engine and persist the result for all 6 sections at once
- **Request:** none (engine internally fetches all needed master data)
- **Response:** `{ success: true, sectionsGenerated: 6, unplacedLectures: 0 }`
- **Validation:** confirms master data (faculty, subject_offerings, sections, rooms) is present and non-empty before running
- **Auth:** Admin only
- **Error cases:** validation failure after generation (409 — "generated timetable failed validation, no changes persisted"), missing master data (422)

### `PATCH /timetable-slots/{id}`
- **Purpose:** Update a single slot's assigned faculty (used by the AI agent's confirmed reassignment)
- **Request:** `{ faculty_id: newFacultyId }`
- **Response:** updated slot row
- **Validation:** new faculty must not already be booked at that day/period (re-checked server-side via the unique constraint as a safety net); slot must exist
- **Auth:** Admin only
- **Error cases:** conflict if new faculty already booked (409, caught by the `UNIQUE(faculty_id, day_of_week, period_number)` constraint), slot not found (404)

---

## 4. AI Reassignment Agent

### `POST /agent/parse-request`
- **Purpose:** Send Admin's plain-English absence description to Claude and get back a structured action
- **Request:** `{ message: "Ms. Sharma is absent Monday period 3" }`
- **Response:** `{ facultyName, day, period, sectionId, subjectId }` (parsed JSON)
- **Validation:** strip markdown fences defensively; confirm response is valid JSON matching the expected schema before returning it to the UI
- **Auth:** Admin only
- **Error cases:** Claude returns unparseable output (422 — "couldn't understand the request, please rephrase"), API timeout/failure (503)

### `POST /agent/find-substitute`
- **Purpose:** Given a validated absence action, find and rank substitute candidates
- **Request:** `{ day, period, sectionId, subjectId }`
- **Response:** `{ proposedFacultyId, proposedFacultyName, reason: "lowest current load" }` or `{ proposedFacultyId: null, reason: "no available substitute found" }`
- **Validation:** confirms the day/period/section actually has an existing slot to reassign
- **Auth:** Admin only
- **Error cases:** no valid candidates found (200 with `proposedFacultyId: null` — this is a valid, expected outcome, not a server error)

### `POST /agent/confirm-reassignment`
- **Purpose:** Apply the admin-confirmed substitute to the timetable
- **Request:** `{ slotId, newFacultyId, relatedLeaveRequestId? }`
- **Response:** `{ success: true, updatedSlot }`
- **Validation:** re-runs the full validation pass (Day 4's validate.js) after the write; rolls back if a clash is somehow introduced
- **Auth:** Admin only
- **Error cases:** validation failure post-write (409, with automatic rollback), slot or faculty not found (404)

---

## 5. Leave Requests

### `POST /leave-requests`
- **Purpose:** Faculty marks themselves on leave for a day/period
- **Request:** `{ faculty_id, day_of_week, period_number }`
- **Response:** created `leave_requests` row, `status: 'pending'`
- **Validation:** faculty must be logged in as themselves (can't mark another faculty's leave); day/period must correspond to an existing slot for that faculty
- **Auth:** Faculty only (self)
- **Error cases:** faculty has no slot at that day/period (422 — nothing to mark absent), duplicate pending request for same slot (409)

### `GET /leave-requests?status=pending`
- **Purpose:** Admin's Leave Requests list
- **Response:** `[{ id, faculty_id, faculty_name, day_of_week, period_number, created_at }]`
- **Auth:** Admin only

### `PATCH /leave-requests/{id}`
- **Purpose:** Mark a leave request as handled (called automatically after a successful `/agent/confirm-reassignment` tied to this request)
- **Request:** `{ status: 'handled', resolved_by_admin_id }`
- **Response:** updated row
- **Auth:** Admin only
- **Error cases:** request not found (404), already handled (409)

---

## 6. Summary Table

| Endpoint | Method | Auth | Used By |
|---|---|---|---|
| /auth/admin/login | POST | none | Admin login screen |
| /auth/faculty/login | POST | none | Faculty login screen |
| /auth/logout | POST | session | Navbar |
| /faculty | GET | public | Dropdowns, engine, agent |
| /subjects | GET | public | Engine |
| /sections | GET | public | Student dropdown, Admin |
| /rooms | GET | public | Engine |
| /subject-offerings | GET | public | Engine |
| /timetable-slots?section_id | GET | public | Admin, Student views |
| /timetable-slots?faculty_id | GET | faculty | Faculty dashboard |
| /timetable/generate | POST | admin | Admin "Generate" button |
| /timetable-slots/{id} | PATCH | admin | Agent confirmed update |
| /agent/parse-request | POST | admin | Agent request box |
| /agent/find-substitute | POST | admin | Agent request box |
| /agent/confirm-reassignment | POST | admin | Agent request box |
| /leave-requests | POST | faculty | Mark Leave form |
| /leave-requests?status=pending | GET | admin | Leave Requests list |
| /leave-requests/{id} | PATCH | admin | Resolve via Agent flow |

This covers every functional requirement (FR-1 through FR-15) from the PRD. No endpoints are missing, and none are extraneous to v1.0 scope.
