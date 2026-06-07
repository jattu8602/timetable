# Samayak · Admin Panel

**Academic Operations Platform** — Full-stack admin panel for managing departments, rooms, courses, faculty, and timetable PDF ingestion with live analytics.

Built for the Anugat AI engineering assignment.

---

## Tech Stack: Spec vs Actual

| Layer | Specified (Document) | Implemented | Match |
|---|---|---|---|
| Framework | Next.js (App Router) | Next.js 16 (App Router, Turbopack) | ✅ |
| Language | TypeScript (strict) | TypeScript (strict) | ✅ |
| Styling | Tailwind + shadcn/ui | Tailwind v4 + shadcn/ui | ✅ |
| Font | Figtree | Figtree (via `next/font`) | ✅ |
| **Database** | **PostgreSQL** | **PostgreSQL (NeonDB serverless)** | ✅ |
| ORM | Prisma | Prisma v6 | ✅ |
| **Cache** | **Redis** | **Upstash Redis (TCP protocol via `rediss://`)** | ✅ |
| **Job Queue** | **BullMQ** | **Wired & Active (Runs in background via Next.js instrumentation)** | ✅ |
| Auth | NextAuth.js (credentials, JWT) | NextAuth.js v5 (credentials, JWT) | ✅ |
| Charts | Recharts | Recharts | ✅ |
| Container | Docker + Compose | Full stack orchestration ready for local build | ✅ |
| RBAC | Role-based middleware | proxy.ts with role check + 403 | ✅ |
| Correlation IDs | End-to-end tracing | Injected in proxy.ts | ✅ |
| PDF OCR | — | OCR.space + OpenAI gpt-4o-mini | ✅ |
| PDF text | — | pdf-parse (text PDFs) | ✅ |


---

## Live Demo

**URL:** _[deployed link]_

**Demo Login:** `admin@samayak.com` / `admin123`

---

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Copy `.env` template:

```env
DATABASE_URL=           # NeonDB PostgreSQL connection string
REDIS_URL=              # Upstash Redis REST endpoint
UPSTASH_REDIS_TOKEN=    # Upstash Redis token
OCR_SPACE_API_KEY=      # OCR.space API key
OPENAI_API_KEY=         # OpenAI API key (for structuring OCR text)
NEXTAUTH_SECRET=        # Any random string
NEXTAUTH_URL=           # http://localhost:3000
AUTH_SECRET=            # Same as NEXTAUTH_SECRET
```

### Seed the Database

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

## Feature Checklist

### 1. Dashboard / Analytics

- [x] Room Utilisation % — per room and department-wide
- [x] Probability of Finding an Empty Room — per time slot (I–IX)
- [x] Under-Running Courses — flagged where scheduled slots < credit-hour requirement
- [x] Average Empty Room-Hours per Day
- [x] Metrics react to live data changes (new import, add room, etc.)
- [x] Recharts visualisations (course-type pie chart, daily-slots bar chart)

### 2. Departments

- [x] Add department manually (name + unique short code)
- [x] Bulk import from Excel/CSV with per-row validation
- [x] Searchable, paginated list
- [x] Edit and delete with confirmation
- [x] Delete warns if dependent records exist

### 3. Rooms

- [x] Add room manually (number, department, capacity, type)
- [x] Capacity required; missing capacity flagged
- [x] Room type displayed clearly (badge: classroom / lab / other)
- [x] Rooms unique within a department
- [x] Bulk import from Excel/CSV
- [x] Search, edit, delete
- [x] Adding/removing a room updates dashboard analytics

### 4. Courses / Subjects

- [x] Filter by branch and semester
- [x] Add course (code, name, credits, type)
- [x] Zero-credit subjects allowed but flagged
- [x] Credits stored as basis for under-running metric
- [x] Bulk import from Excel/CSV
- [x] Search, edit, delete

### 5. Faculty & Users

- [x] Import from Excel/CSV (name, email, role, department)
- [x] Preview parsed rows before committing
- [x] Handle duplicates gracefully (skip or merge)
- [x] Roles: admin, coordinator, professor, HOD, dean — with visual distinction
- [x] Searchable, paginated list
- [x] Recoverable deletes (not instantly destructive)

### 6. Timetable PDF Ingestion

- [x] File upload area accepting BIT Mesra format PDF
- [x] Asynchronous processing (BullMQ queue)
- [x] Live progress feedback (queued → parsing → integrating → done)
- [x] Extract: department, branch, slots, courses, rooms, faculty
- [x] Create new entities; match existing ones (no duplicates)
- [x] Import summary: created, matched, unparsable rows with reasons
- [x] Analytics auto-recompute on completion
- [x] Format-aware parser — works for any department, not hardcoded to CSE
- [x] Graceful degradation on partial/malformed PDFs
- [x] Pending/incomplete state for partial imports

### 7. Authentication & Authorization

- [x] NextAuth.js v5 with credentials provider
- [x] JWT session strategy (Edge Runtime compatible)
- [x] Demo login section on login page
- [x] RBAC middleware — role protection per role
- [x] 403 on unauthorized access
- [x] Correlation ID on every request for tracing

### 8. API & Infrastructure

- [x] All CRUD endpoints (departments, rooms, courses, faculty, timetables)
- [x] `GET /api/health` — returns DB and Redis status
- [x] PDF upload endpoint with format-aware parsing
- [x] Pagination and search on list endpoints
- [x] Docker Compose (PostgreSQL / Redis / app services)
- [x] No mocked or hardcoded data
- [x] TypeScript strict mode throughout

### 9. Design System Alignment

- [x] Figtree typeface
- [x] Samayak brand gradient (#256199 → #3DA1FF)
- [x] Rounded geometry (radius: 0.75rem)
- [x] Soft-blue palette
- [x] Consistent button, card, and icon language
- [x] Responsive layout with sidebar + header

### 10. Deployment

- [ ] Deployed and reachable without configuration
- [x] Pre-seeded with CSE timetable data
- [x] Demo login credentials on login page
- [x] `.env.prod` template for Vercel deployment

---

## Pages

| Route | Page |
|---|---|
| `/login` | Sign in with demo credentials |
| `/` | Dashboard with live analytics + Recharts |
| `/departments` | CRUD: departments & branches |
| `/rooms` | CRUD: lecture rooms & labs |
| `/courses` | CRUD: courses scoped by branch/semester |
| `/faculty` | CRUD: faculty & users with roles |
| `/timetable` | PDF upload + grid view |
| `/api/health` | Health check (DB + Redis) |

---

## API Routes

| Method | Route | Description |
|---|---|---|
| GET/POST/PUT/DELETE | `/api/departments` | Departments CRUD |
| GET/POST/PUT/DELETE | `/api/rooms` | Rooms CRUD |
| GET/POST/PUT/DELETE | `/api/courses` | Courses CRUD |
| GET/POST/PUT/DELETE | `/api/faculty` | Faculty CRUD |
| GET | `/api/branches` | Branches list |
| GET/DELETE | `/api/timetables` | Timetable list / delete |
| GET | `/api/timetables/[id]` | Timetable detail with slots |
| POST | `/api/timetables/upload` | PDF/TXT upload → OCR → OpenAI → import |
| GET | `/api/health` | DB + Redis health |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth v5 |
| GET | `/api/users` | Users placeholder |

---

## Seed Data

13 BIT Mesra CSE timetable files (Spring 2026) seeded into NeonDB:

- **1 department** — CSE
- **5 branches** — CS, AIML, MCA, M.Tech
- **141 courses** — lecture, lab, tutorial, elective
- **15 rooms** — lecture halls and labs
- **13 timetables** — one per branch/section
- **411 time slots** — individual period assignments
- **3 faculty** — mapped to courses
- **1 admin user** — admin@samayak.com / admin123

---

## Design Decisions & Trade-offs

| Decision | Rationale |
|---|---|
| PostgreSQL (NeonDB) over MongoDB | Spec prescribes PostgreSQL with foreign keys; NeonDB is serverless Postgres |
| JWT session strategy | Required for Edge Runtime middleware to verify auth without database queries |
| Dynamic `import("crypto")` | Credentials provider uses SHA-256; avoids Edge Runtime bundling errors |
| OCR.space + OpenAI instead of pure pdf-parse | Scanned PDFs need OCR; OpenAI gpt-4o-mini structures raw OCR text into clean timetable data |
| pdfjs-dist legacy build | Legacy build avoids DOMMatrix dependency missing in Node.js; handles page rendering for OCR |
| Upstash Redis (REST) over ioredis | Works in serverless/Edge; no TCP connection needed |
| Proxy (middleware) | Next.js 16 renamed middleware → proxy; auth guard + correlation IDs |
| Format-aware PDF parser | Parses SQL INSERT statements + ASCII grid; works for any BIT Mesra department |
| No Docker for dev | Using cloud NeonDB + Upstash; Docker config kept for production reference |

---

## OCR Pipeline

```
PDF Upload
  → pdf-parse (text extraction — free, instant)
  → if no timetable text found:
    → pdfjs-dist renders each page as PNG
    → OCR.space API extracts text per page
    → OpenAI gpt-4o-mini structures raw OCR into ParsedTimetable JSON
  → splitTimetable creates courses, slots, rooms, faculty in DB
  → response
```

---

## Deployment

### Vercel (Serverless)

1. Connect GitHub repository
2. Set environment variables from `.env.prod`
3. Build command: `npx prisma generate && next build`
4. Deploy

### Docker Setup (Local Offline Stack)

To run the entire stack locally in containerized mode (including local PostgreSQL, local Redis, the Next.js app, and the background queue worker):

1. Update your `.env` variables to connect to the internal Docker network services:
   ```env
   # PostgreSQL container connection string
   DATABASE_URL="postgresql://samayak:samayak_secret@postgres:5432/samayak?sslmode=disable"
   
   # Redis container connection string (TCP protocol for BullMQ)
   REDIS_URL="redis://redis:6379"
   
   # External API Keys (Required for OCR PDF ingestion)
   MISTRAL_API_KEY="your-mistral-api-key"
   OCR_SPACE_API_KEY="your-ocr-space-api-key"
   OPENAI_API_KEY="your-openai-api-key"
   ```

2. Run the compose environment:
   ```bash
   docker compose up --build
   ```

3. Initialize the database schema and seed the CSE timetable data inside the running app container:
   ```bash
   # Generate database tables
   docker compose exec app npx prisma db push
   # Seed CSE timetable data and admin user credentials
   docker compose exec app npx tsx prisma/seed.ts
   ```

4. The application is now fully running and accessible at [http://localhost:3000](http://localhost:3000).

---

## Built With

- Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui
- Prisma v6 · PostgreSQL (NeonDB / local Docker) · Upstash Redis / local Redis (BullMQ support)
- NextAuth.js v5 · Recharts
- OCR.space · OpenAI gpt-4o-mini · Mistral OCR
- pdfjs-dist · @napi-rs/canvas
- Figtree · Lucide Icons
- Docker · Docker Compose

