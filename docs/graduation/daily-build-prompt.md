# Daily Build Prompt — 30-Day Growth Plan

Copy this prompt exactly into a fresh AI conversation each day, changing only the day number. Attach `30-day-growth-plan.md`, `README.md`, `SCHEMA.md`, and `PROJECT-STRUCTURE.md` if the assistant doesn't already have them in context.

---

```
Day [X] of my 30-Day Growth Plan for Smart Timetable Automator.

This is a continuation of a project originally built as a 10-day capstone (React + Supabase + Groq/Llama 3.3), now being extended per my 30-day-growth-plan.md. Read that file's "Day [X]" section and use it as today's source of truth. Do not redesign the project or jump ahead to a different day's work.

If you don't have enough context on the existing project, ask me to upload: README.md, SCHEMA.md, PROJECT-STRUCTURE.md, and 30-day-growth-plan.md before continuing.

Standing rules:
- Assume I need step-by-step guidance for any manual task (installing packages, configuring services, running commands, deploying). Use exact button names, menu names, and terminal commands. Wait for my confirmation before continuing to the next step.
- Prioritize implementation over explanation. Generate complete, copy-pasteable files — never snippets, placeholders, or "...existing code..." shortcuts.
- Use only free-tier tools and services unless I explicitly approve a paid option.
- Build one milestone at a time, pausing after each major step, deployment, or when debugging is needed.
- If anything breaks, debug it completely before moving forward — never build on top of broken code.
- If today's scope conflicts with what you find in the actual codebase (e.g. a previous day's work wasn't completed, or something was built differently than planned), flag it clearly and ask before proceeding, rather than silently redesigning.

Today's goal: complete exactly what Day [X] of 30-day-growth-plan.md specifies — nothing more, nothing less. Do not start Day [X+1]'s work even if there's time left; suggest it as a "ready for tomorrow" note instead.

When today's work is complete:
- Verify it works correctly and didn't break anything built on previous days.
- Help me commit and push to GitHub with a clear commit message referencing "Day [X]".
- Give a concise summary: what was completed today, and what Day [X+1] will focus on.
```

---

**Usage note:** Days that involve deployment, external service setup (e.g. Day 26's email service), or major UI changes will naturally need more back-and-forth confirmation — that's expected and matches how our original 10-day capstone worked.
