# PBL Program Intelligence & Grant Reporting Assistant

## 🚀 Live Demo

**🔗 [Live Link - PBL PROJECT](https://pbl-project-0lye.onrender.com/reporting)**

A web app that turns months of school-level Project-Based Learning (PBL) data into review-ready decisions, and turns those computed facts into grant-ready report sections.

The idea is simple: program and leadership teams should not have to read raw CSV rows before a monthly review. The app does the math for them — participation, evidence, attendance, risk, and month-over-month change — and then helps them write a grant report that only uses numbers the app actually computed.

> All data in this project is synthetic and for assessment use only. School codes, district and block names, finance units, writeups, images, and media records are not real.

---

## Table of Contents

1. [What the app does](#what-the-app-does)
2. [Tech stack](#tech-stack)
3. [Getting started (setup)](#getting-started-setup)
4. [Architecture overview](#architecture-overview)
5. [Data model](#data-model)
6. [How the metrics are calculated](#how-the-metrics-are-calculated)
7. [Risk logic](#risk-logic)
8. [AI workflow and fallback](#ai-workflow-and-fallback)
9. [Pages in the app](#pages-in-the-app)
10. [Assumptions](#assumptions)
11. [Limitations](#limitations)
12. [Production-readiness notes](#production-readiness-notes)
13. [Future improvements](#future-improvements)

---

## What the app does

- **Combines** the July, August, and September school response CSVs into one clean model.
- **Calculates** participation, evidence submission, enrollment, attendance, attendance rate, and month-over-month movement.
- **Classifies** schools, blocks, and districts into risk levels using fixed code rules (no AI).
- **Explains** why a geography is On Track, Behind, At Risk, or Critical.
- **Prioritises** which districts and blocks need follow-up first.
- **Prepares the review** with a structured summary, discussion points, and recommended actions.
- **Builds grant reports** from finance rows, performance metrics, milestones, and linked evidence — with a narrative that cites the exact facts it used.

The most important design rule: **everything important works without AI.** The AI layer only rewrites already-computed facts into nicer sentences. If the AI key is missing or the AI call fails, the app still gives you the same numbers and a deterministic summary.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS v4 |
| Language | TypeScript |
| Backend | Next.js server components + one API route |
| Data | Static CSV files read on the server |
| AI (optional) | Google Gemini 2.5 Flash, with a rule-based fallback |

There is no database. The CSVs are the source of data, read directly on the server at request time. See [Production-readiness notes](#production-readiness-notes) for how this would move to a real database.

---

## Getting started (setup)

### Prerequisites

- Node.js 18.18 or newer
- npm (comes with Node)

### Steps

1. Install dependencies:

   ```bash
   npm install
   ```

2. (Optional) Add an AI key. Create a file named `.env.local` in the project root:

   ```bash
   GEMINI_API_KEY=your_key_here
   ```

   If you skip this step, the app still runs fully. The AI assistant simply uses the built-in rule-based answer instead of calling Gemini.

3. Start the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

### Other commands

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # check code quality
```

### Where the data lives

```
data/
  primary-pbl/                 # the three monthly school CSVs
    PBL_School_Response_Data_July_2025.csv
    PBL_School_Response_Data_August_2025.csv
    PBL_School_Response_Data_September_2025.csv
  grant-reporting/             # the three grant CSVs
    01_Grant_Profile_and_Finance.csv
    02_Grant_Performance_and_Report_Material.csv
    03_Evidence_and_Media_Index.csv
public/evidence/               # synthetic evidence images
```

To use updated data, replace these CSV files (keep the same column headers) and restart the server. No import script is needed — the files are read directly.

---

## Architecture overview

The app follows one clear flow, in this exact order:

```
CSV files  ->  deterministic engine  ->  structured insights  ->  UI / report / (optional) AI narrative
```

The whole point is that business logic never depends on AI. The data is shaped and all numbers are computed in plain TypeScript first. The UI reads those results. AI only ever sees facts that were already computed.

### Folder structure

```
app/
  layout.tsx              # shell: sidebar + header
  page.tsx                # Dashboard (overview)
  analytics/page.tsx      # filterable Monthly Review Dashboard
  review/page.tsx         # Monthly Review Summary (review-meeting prep)
  reporting/page.tsx      # Grant Reporting Assistant
  gallery/page.tsx        # Evidence Gallery
  assistant/page.tsx      # AI chat (client component)
  api/assistant/route.ts  # AI endpoint with deterministic fallback
  components/
    Sidebar.tsx
    Header.tsx
    CopyButton.tsx        # copy-ready export button
lib/
  csv.ts                  # small CSV parser (handles quotes/commas)
  program-intelligence.ts # the deterministic engine (all metrics + risk + reports)
```

### Key idea: one engine file

`lib/program-intelligence.ts` is the brain. It reads the CSVs once, maps them into typed records, and exposes simple functions like `getProgramReview()`, `getGrantReport()`, and `getSchoolRecordsForMonth()`. Every page calls these functions instead of doing its own math. This keeps the logic in one place and easy to explain.

---

## Data model

### School record (from the monthly PBL CSVs)

Each row is one school's response for one month. After parsing, it becomes a typed `PblRecord`:

| Field | Meaning |
|-------|---------|
| `month` | Reporting month (July / August / September 2025) |
| `school`, `schoolCode` | School name and synthetic code |
| `district`, `block` | Geography labels |
| `conducted` | Was PBL conducted this month? (yes/no) |
| `evidenceSubmitted` | Was evidence submitted? (yes/no) |
| `classes`, `subject` | Which classes and subject the teacher reported |
| `enrollment`, `attendance`, `attendanceRate` | Derived totals from the source file |
| `classBreakdown` | Per-class (6, 7, 8) enrollment + Science/Math attendance |

The `classBreakdown` is important. The app reads the raw per-class, per-subject columns directly, so a **Grade** or **Subject** filter actually changes the numbers — not just which rows are shown.

### Grant data (from the grant CSVs)

- **`GrantFinanceRow`** — budget line, approved units, utilized units, utilization rate.
- **`GrantPerformanceRow`** — completion rate, evidence rate, attendance, milestone summary, report status, due dates, draft report text.
- **`EvidenceRecord`** — evidence/media assets (title, caption, type, district, image path).

Grants are linked to schools through `district` and `reportingMonth`, and evidence is linked to grants through `grantId` + `reportingMonth`.

---

## How the metrics are calculated

All percentages are rounded to one decimal place.

| Metric | Formula |
|--------|---------|
| Participation rate | participating schools ÷ total schools |
| Evidence rate | schools that submitted evidence ÷ participating schools |
| Attendance rate | total attendance ÷ (total enrollment × number of subject sessions) |
| Month-over-month | current month value − previous month value |

A few notes:

- **Attendance rate** accounts for sessions. If you look at both Science and Math, the denominator counts two sessions per student. If you filter to just one subject, it counts one. This keeps the rate fair when you narrow the view.
- **Grade and Subject filters** recompute from the raw per-class columns, so the numbers genuinely change.
- **Month-over-month** compares the selected month against the one before it. July has no previous month, so it shows no movement.

These calculations live in `buildMetrics()` and `recordMetrics()` inside the engine.

---

## Risk logic

Risk is classified by code using fixed thresholds, exactly as suggested in the brief. This is in `classifyRisk()`:

| Status | Attendance rate |
|--------|-----------------|
| On Track | 75% and above |
| Behind | 60% to below 75% |
| At Risk | 35% to below 60% |
| Critical | below 35% |

The same function is applied everywhere — individual schools, blocks, districts, and grant performance — so the meaning of a risk label is always consistent. Because it is plain code, it works with or without AI, and it is easy to demo live.

"Priority geographies" in the review are simply the lowest-scoring districts and blocks on attendance, because those need follow-up first.

---

## AI workflow and fallback

AI is **optional at runtime**. The flow is:

```
deterministic calculations  ->  structured insights  ->  AI rewrites them into a narrative
```

The app never sends raw CSV rows to the AI. It only sends already-computed facts (metrics, top/bottom districts, risk status, grant facts). This avoids hallucinated numbers and keeps the AI grounded.

### How it works

The `/api/assistant` route:

1. Builds the full deterministic review using `getProgramReview()` / `getGrantReport()`.
2. If `GEMINI_API_KEY` is set, it sends those facts to Gemini with strict instructions: only use the provided data, never invent schools or numbers, return JSON with an `answer`, `facts`, and `references`.
3. If the key is missing **or** the AI call fails (with retries for rate limits), it falls back to `getAssistantResponse()` — a rule-based generator that answers from the same computed facts.

The `/api/grant-narrative` route follows the same pattern for the Grant Reporting page:

1. Builds the grant facts via `getGrantReport()`.
2. If `GEMINI_API_KEY` is set, it asks Gemini to write a 2-4 sentence professional donor-report narrative using only the provided source facts.
3. If the key is missing or the call fails, it returns the deterministic template narrative immediately.
4. The narrative on the page is labeled **"AI-generated"** or **"Deterministic summary"** honestly, based on what was actually used.

### The guardrail

Every fact-based feature works without AI:

- Dashboard metrics
- Risk classification
- Priority gaps
- Grant fact summaries and the grant narrative

The grant report and the monthly review summary are assembled deterministically. The AI assistant is the only place that calls the model, and even it degrades gracefully to a rule-based answer. The narrative always shows its **source facts** next to it, so a reader can tell computed facts apart from generated text.

---

## Pages in the app

| Page | What it does |
|------|--------------|
| **Dashboard** (`/`) | High-level overview: KPI cards, trend, risk distribution, top schools. |
| **School Analytics** (`/analytics`) | The main review dashboard. Filter by month, district, block, grade, subject. Shows the full KPI set, month-over-month movement, high- and low-performing districts/blocks, and a detailed school table. |
| **Review Summary** (`/review`) | Review-meeting prep: achievements, month-over-month changes, risks, priority geographies, discussion points, and recommended actions. Has a copy-ready export. |
| **Grant Reporting** (`/reporting`) | Pick a grant and month. See finance, performance, milestones, narrative with source facts, and linked evidence. Copy the whole section as report-ready text. |
| **Evidence Gallery** (`/gallery`) | Browse and filter evidence images by grant, month, and type. |
| **AI Assistant** (`/assistant`) | Ask questions in plain language. Answers are grounded in the CSV data, with source facts shown. |

---

## Assumptions

The brief said to document assumptions and move on where data is ambiguous. Here are mine:

- **Attendance rate is the main health signal.** Risk status is based on attendance rate, since it is the most consistent derived field across schools.
- **Evidence rate is measured against participating schools**, not all schools, because a school that did not run PBL cannot submit evidence.
- **Months are ordered July → August → September 2025.** Month-over-month always compares to the previous month in that order.
- **Sessions per subject:** each subject (Science, Math) is treated as one attendance session per student when computing attendance rate.
- **Grants link to the program data by district and reporting month**, since the grant CSVs are summarised at that level.
- **Evidence images** are served from `public/evidence/` using the file name from the media index CSV.
- The numbers shown are only as accurate as the synthetic CSVs provided.

### Why per-class numeric columns are ground truth for Grade/Subject filtering

The CSV has two ways to know which grades a school taught: a free-text field ("In which class/classes did you conduct the PBL project?") and six numeric columns (Class 6/7/8 × Science/Math enrollment and attendance). These two do not always agree. For example, a row can have the text "Classes 7 and 8" yet still carry real, non-zero numbers in the Class 6 Science and Math attendance columns.

The app uses the numeric columns as ground truth. When a user selects Grade = Class 6, the metric calculation narrows to the Class 6 enrollment and attendance numbers for every school — it does not drop schools whose text field does not mention Class 6. This is the correct behaviour: the numeric columns are what the teachers actually entered; the text field is an unreliable summary.

This is the function `recordMetrics()` in `lib/program-intelligence.ts`, and it is what `gradesToInclude()` and `subjectsToInclude()` control. `filterPblRecords()` intentionally filters only on month, district, and block — it does not filter rows by grade or subject text.

---

## Limitations

- **No database.** Data is read from static CSVs on the server. This is fine for the assessment but not for many concurrent users or live data updates.
- **CSVs are read at request time** in development. For real scale this should be cached or moved into a database.
- **No authentication.** Anyone who can reach the app can see everything. A real deployment needs login and role-based access (program staff vs leadership vs donors).
- **AI output is not stored or audited.** Each answer is generated fresh; there is no history or approval workflow.
- **DOCX export is not implemented.** The brief lists it as optional. PDF export via jsPDF is implemented on the Grant Reporting and Review Summary pages.
- **The icon font** is loaded via a `<link>` tag, which Next flags as a warning. It works fine but could be migrated to `next/font`.
- **Tests are not included.** The logic is structured to be testable (pure functions in one file), but no test suite is written yet.

---

## Production-readiness notes

If this went to production, the plan would be:

- **Move data into a database** (PostgreSQL or Supabase). Keep the same typed model and the same engine functions, but read from tables instead of CSV files. An import script would load each monthly CSV into a `school_responses` table.
- **Add authentication and roles** so donors only see grant data, and program staff see school detail.
- **Cache the computed review** per month/filter combination instead of recomputing on every request.
- **Put the AI call behind a queue with timeouts and logging**, and store generated narratives with the facts they were based on for auditing.
- **Validate AI output** against the computed facts before showing it (reject any number not present in the source facts).
- **Add monitoring** for failed AI calls and slow requests.
- **Security:** keep the API key server-side only (already the case), add rate limiting on the assistant route, and never send personal student data to the model.

---

## Future improvements

- Surface **recommended actions** as their own tracked board (owner, due date, status) that can be updated.
- Real **PDF / DOCX export** of the grant report and review summary.
- **Charts over time** (line charts across the three months) instead of single-month snapshots.
- **Grade and subject filters** on the review and reporting pages too, not just analytics.
- **Saved reviews**, so a leadership meeting can reopen exactly what was discussed last month.
- A small **test suite** for the metric and risk functions.
- Validate and store AI narratives with their source facts for full traceability.

---

### A note on the data

This project uses only synthetic data provided for the assessment. None of the school codes, districts, finance numbers, writeups, images, or media records represent real people, schools, or organisations.
