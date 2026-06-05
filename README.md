# Samayak · Admin Panel

**Academic Operations Platform** — Full-stack admin panel for managing departments, rooms, courses, faculty, and timetable PDF ingestion with live analytics.

Built for the Anugat AI engineering assignment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Font | Figtree (Samayak Design System) |
| Database | MongoDB Atlas (via Prisma ORM v6) |
| Cache / Queue | Upstash Redis + BullMQ |
| Auth | NextAuth.js v5 (credentials provider, JWT strategy) |
| Charts | Recharts |
| Container | Docker + Docker Compose |

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

Copy `.env.prod` to `.env` and fill in your credentials:

```env
DATABASE_URL=       # MongoDB Atlas connection string
REDIS_URL=          # Upstash Redis REST endpoint
UPSTASH_REDIS_TOKEN=# Upstash Redis token
NEXTAUTH_SECRET=    # Any random string
NEXTAUTH_URL=       # http://localhost:3000
```

### Seed the Database

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

---

## Feature Checklist

### 1. Dashboard / Analytics

- [ ] Room Utilisation % — per room and department-wide
- [ ] Probability of Finding an Empty Room — per time slot (I–IX)
- [ ] Under-Running Courses — flagged where scheduled slots < credit-hour requirement
- [ ] Average Empty Room-Hours per Day
- [ ] Metrics react to live data changes (new import, add room, etc.)
- [ ] Recharts visualisations (course-type pie chart, daily-slots bar chart)

### 2. Departments

- [ ] Add department manually (name + unique short code)
- [ ] Bulk import from Excel/CSV with per-row validation
- [ ] Searchable, paginated list
- [ ] Edit and delete with confirmation
- [ ] Delete warns if dependent records exist

### 3. Rooms

- [ ] Add room manually (number, department, capacity, type)
- [ ] Capacity required; missing capacity flagged
- [ ] Room type displayed clearly (badge: classroom / lab / other)
- [ ] Rooms unique within a department
- [ ] Bulk import from Excel/CSV
- [ ] Search, edit, delete
- [ ] Adding/removing a room updates dashboard analytics

### 4. Courses / Subjects

- [ ] Filter by branch and semester
- [ ] Add course (code, name, credits, type)
- [ ] Zero-credit subjects allowed but flagged
- [ ] Credits stored as basis for under-running metric
- [ ] Bulk import from Excel/CSV
- [ ] Search, edit, delete

### 5. Faculty & Users

- [ ] Import from Excel/CSV (name, email, role, department)
- [ ] Preview parsed rows before committing
- [ ] Handle duplicates gracefully (skip or merge)
- [ ] Roles: admin, coordinator, professor, HOD, dean — with visual distinction
- [ ] Searchable, paginated list
- [ ] Recoverable deletes (not instantly destructive)

### 6. Timetable PDF Ingestion

- [ ] File upload area accepting BIT Mesra format PDF
- [ ] Asynchronous processing (BullMQ queue)
- [ ] Live progress feedback (queued → parsing → integrating → done)
- [ ] Extract: department, branch, slots, courses, rooms, faculty
- [ ] Create new entities; match existing ones (no duplicates)
- [ ] Import summary: created, matched, unparsable rows with reasons
- [ ] Analytics auto-recompute on completion
- [ ] Format-aware parser — works for any department, not hardcoded to CSE
- [ ] Graceful degradation on partial/malformed PDFs
- [ ] Pending/incomplete state for partial imports

### 7. Authentication & Authorization

- [ ] NextAuth.js v5 with credentials provider
- [ ] JWT session strategy (Edge Runtime compatible)
- [ ] Demo login section on login page
- [ ] RBAC middleware — route protection per role
- [ ] 403 on unauthorized access
- [ ] Correlation ID on every request for tracing

### 8. API & Infrastructure

- [ ] All CRUD endpoints (departments, rooms, courses, faculty, timetables)
- [ ] `GET /api/health` — returns DB and Redis status
- [ ] PDF upload endpoint with format-aware parsing
- [ ] Pagination and search on list endpoints
- [ ] Docker Compose (MongoDB / Redis / app services)
- [ ] No mocked or hardcoded data
- [ ] TypeScript strict mode throughout

### 9. Design System Alignment

- [ ] Figtree typeface
- [ ] Samayak brand gradient (#256199 → #3DA1FF)
- [ ] Rounded geometry (radius: 0.75rem)
- [ ] Soft-blue palette
- [ ] Consistent button, card, and icon language
- [ ] Responsive layout with sidebar + header

### 10. Deployment

- [ ] Deployed and reachable without configuration
- [ ] Pre-seeded with CSE timetable data
- [ ] Demo login credentials on login page
- [ ] `.env.prod` template for Vercel deployment

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
| POST | `/api/timetables/upload` | PDF/TXT upload → parse → import |
| GET | `/api/health` | DB + Redis health |
| GET/POST | `/api/auth/[...nextauth]` | NextAuth v5 |
| GET | `/api/users` | Users placeholder |

---

## Seed Data

The dataset is 13 BIT Mesra CSE timetable files (Spring 2026) parsed from embedded SQL INSERT statements:

- **1 department** — CSE
- **10 branches** — CS, AIML, MCA, M.Tech across semesters
- **256 courses** — lecture, lab, tutorial, elective
- **28 rooms** — lecture halls and labs
- **23 timetables** — one per branch/section
- **717 time slots** — individual period assignments
- **3 faculty** — mapped to courses
- **1 admin user** — admin@samayak.com

---

## Design Decisions & Trade-offs

| Decision | Rationale |
|---|---|
| MongoDB vs PostgreSQL | Switched from PostgreSQL to MongoDB Atlas per requirement; Prisma v6 supports both |
| JWT session strategy | Required for Edge Runtime middleware to verify auth without database queries |
| Dynamic `import("crypto")` | Credentials provider uses SHA-256; dynamic import avoids Edge Runtime bundling errors |
| Manual relation joins | Prisma MongoDB does not support `@relation` includes; API routes manually `find` + merge |
| Lazy Redis connect | Avoids build-time connection errors when Redis is unavailable |
| Proxy (middleware) | Next.js 16 renamed middleware → proxy; both auth guard and correlation-ID injection |
| format-aware PDF parser | Parses SQL INSERT statements + ASCII grid; works for any department in BIT Mesra format |

---

## Deployment

### Docker (Production)

```bash
docker compose up --build
```

### Vercel (Serverless)

1. Connect GitHub repository
2. Set environment variables from `.env.prod`
3. Build command: `npx prisma generate && next build`
4. Deploy

---

## Built With

- Next.js 16 · TypeScript · Tailwind CSS v4 · shadcn/ui
- Prisma v6 · MongoDB Atlas · Upstash Redis
- NextAuth.js v5 · Recharts · BullMQ
- Figtree · Lucide Icons
- Docker · Docker Compose
