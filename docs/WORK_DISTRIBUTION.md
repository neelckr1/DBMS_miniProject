# Work Distribution & Commit History Analysis

> **Course:** Database Management Systems (Semester 5) — Experiential Learning Level-3 Mini-Project  
> **Project:** Campus Research Repository and Semantic Search System  
> **Repository:** [https://github.com/neelckr1/DBMS_miniProject](https://github.com/neelckr1/DBMS_miniProject)  
> **Team Members:**
> - **Neel Chandrakar** (`@neelckr1` | `neel.ckr1@gmail.com`)
> - **Nikhil Raj** (`@nikhilraj-git6` | `rajgnikhil0@gmail.com`)

---

## 1. Executive Summary & Work Split Overview

This project was developed through a collaborative pair-engineering model across the complete multi-paradigm database stack (PostgreSQL + `pgvector`), backend API routes, and a Next.js web application.

The workload was partitioned to ensure both members contributed significantly across **both** database engineering and application software layers:

| Component | Primary Developer | Collaborator / Reviewer | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **Relational DDL & Constraints** | **Nikhil Raj** | Neel Chandrakar | `01_schema.sql`: 5 core tables, CHECK constraints (`chk_abstract_min_len`, `role`), FK cascading |
| **Multi-Paradigm Vector Indexing** | **Nikhil Raj** | Neel Chandrakar | `pgvector` extension, 384-dimensional dense vectors, HNSW index (`vector_cosine_ops`), GIN full-text index |
| **Triggers & Audit Logging** | **Neel Chandrakar** | Nikhil Raj | `02_triggers.sql`: `paper_audit_log`, `trg_audit_paper_changes` on UPDATE & DELETE |
| **Stored Procedures & Transactions** | **Neel Chandrakar** | Nikhil Raj | `03_functions.sql`: `match_papers()` cosine search procedure, `execute_and_log_search()` atomic multi-table transaction |
| **Analytical Database Views** | **Neel Chandrakar** | Nikhil Raj | `04_views.sql`: `view_paper_analytics`, `view_recent_search_activity`, `view_category_insights` |
| **Seed Benchmark Data** | **Neel Chandrakar** | Nikhil Raj | `05_seeds.sql`: Precomputed 384-d normalized embeddings for benchmark papers, admin/student users |
| **Backend API & Embeddings** | **Neel Chandrakar** | Nikhil Raj | `/api/search`, `/api/papers`, `/api/analytics`, `src/lib/db.ts` connection pool, `@xenova/transformers` pipeline |
| **Frontend UI & Layout** | **Nikhil Raj** | Neel Chandrakar | `Navbar.tsx`, `SearchSection.tsx`, `PaperRepository.tsx`, Tailwind styling & responsive layout |
| **Role-Based Access Control (RBAC)** | **Nikhil Raj** | Neel Chandrakar | UI role switch, Student read-only mode, Admin-only Analytics with 403 Forbidden enforcement |
| **UI Simplification & Refactoring** | **Both** (Joint iterations) | Both | Minimalist uncluttered design, elimination of redundant tabs, clean typography |
| **Automated Testing Suite** | **Both** (Nikhil: DB/Embeddings; Neel: UI/E2E) | Both | 26 automated tests verifying schema, stored procedures, triggers, views, DOM rendering, and user journeys |
| **Technical Documentation** | **Neel Chandrakar** | Nikhil Raj | `README.md`, `ARCHITECTURE.md`, `DATA_DICTIONARY.md`, ER & relational diagrams |

---

## 2. Detailed Breakdown of Every Commit

Below is the complete chronological log of all commits in the repository, explaining exactly what each commit accomplished and what technical concepts it represents.

---

### Commit 1: `2947e13`
- **Author:** Neel Chandrakar `<neel.ckr1@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `chore: initialize project directory layout and documentation`
- **Files Touched (14 files):** `.gitignore`, `.env.example`, `docs/diagrams/*`, folder `.gitkeep` files
- **Meaning & Significance:**
  - Initialized the clean repository skeleton with a modular directory structure separating database scripts (`database/ddl`, `database/triggers`, `database/procedures`, `database/views`, `database/seeds`) from application code (`src/app`, `src/components`, `src/lib`).
  - Added `.env.example` defining database connection parameters and a strict `.gitignore` preventing sensitive local environment files and temporary artifacts from being tracked.
  - Placed initial academic requirements and ER/relational diagrams into `docs/`.

---

### Commit 2: `0449479`
- **Author:** Nikhil Raj `<rajgnikhil0@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `feat(database): implement relational DDL schema, pgvector extension, and HNSW index`
- **Files Touched (1 file):** `database/ddl/01_schema.sql` (+106 lines)
- **Meaning & Significance:**
  - Designed and executed the database foundation: enabled PostgreSQL extensions `vector` and `uuid-ossp`.
  - Created five normalized relational tables:
    1. `users`: Stores user credentials and role (`ADMIN` or `STUDENT`).
    2. `research_paper`: Stores title, abstract, authors, category, publication date, and foreign key to `users`.
    3. `vector_embedding`: Stores 384-dimensional dense vectors (`vector(384)`) linked 1-to-1 to `research_paper`.
    4. `search_query`: Captures user search query texts, search parameters, and query timestamps.
    5. `query_retrieval`: Associative junction table capturing retrieved papers, rank order, and cosine distance scores.
  - Enforced strict database constraints:
    - `CHECK (role IN ('ADMIN', 'STUDENT'))`
    - `CHECK (length(trim(abstract)) >= 20)` (minimum abstract length constraint)
    - `UNIQUE(email)`
    - Foreign key constraints with `ON DELETE CASCADE` on vector embeddings and query retrievals.
  - Built advanced indexing:
    - **HNSW Index (`idx_vector_embedding_hnsw`)**: Implemented Hierarchical Navigable Small World graph index using `vector_cosine_ops` with parameters `m = 16, ef_construction = 64` for fast approximate nearest neighbor search.
    - **GIN Index (`idx_paper_fulltext`)**: Generalized Inverted Index on title and abstract for relational full-text search comparison.

---

### Commit 3: `8955bb9`
- **Author:** Neel Chandrakar `<neel.ckr1@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `feat(database): implement audit triggers, search procedures, views, and seed data`
- **Files Touched (4 files):** `database/triggers/02_triggers.sql`, `database/procedures/03_functions.sql`, `database/views/04_views.sql`, `database/seeds/05_seeds.sql` (+344 lines)
- **Meaning & Significance:**
  - **Triggers & Auditing (`02_triggers.sql`)**:
    - Built `paper_audit_log` table storing `audit_id`, `paper_id`, `action_type` (`UPDATE` or `DELETE`), `old_title`, `old_abstract`, and timestamp.
    - Implemented PL/pgSQL trigger function `log_paper_changes()` fired automatically on `AFTER UPDATE OR DELETE ON research_paper`.
    - Added automated `update_timestamp()` triggers for updating `updated_at` columns.
  - **Stored Procedures & Transactions (`03_functions.sql`)**:
    - Created `match_papers()` procedure calculating cosine similarity (`1 - (vector_data <=> query_embedding)`) and filtering by threshold and limit.
    - Created `execute_and_log_search()` encapsulating multi-statement atomic transactions (`search_query` insertion + `query_retrieval` bulk insert) inside a single PL/pgSQL call.
  - **Analytical Views (`04_views.sql`)**:
    - Created `view_paper_analytics` (JOIN between papers, authors, uploaders, and retrieval counts).
    - Created `view_recent_search_activity` (recent queries, execution times, result counts, and top match scores).
    - Created `view_category_insights` (`GROUP BY category` with `COUNT`, `AVG` abstract length, and retrieval frequencies).
  - **Benchmark Seed Data (`05_seeds.sql`)**:
    - Pre-populated Admin and Student accounts.
    - Added 8 real academic benchmark papers across NLP, Computer Vision, Systems, and Biology with valid precomputed 384-dimensional unit-normalized embeddings.

---

### Commit 4: `ff1c05f`
- **Author:** Nikhil Raj `<rajgnikhil0@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `feat(app): implement frontend UI components, search interface, and paper repository`
- **Files Touched (8 files):** `postcss.config.mjs`, `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/components/Navbar.tsx`, `src/components/PaperRepository.tsx`, `src/components/SearchSection.tsx` (+851 lines)
- **Meaning & Significance:**
  - Setup Tailwind CSS styling architecture, modern font families, and responsive viewport rules.
  - Developed `Navbar.tsx` with top branding, navigational tab switching, and a role toggle switch (`Admin` vs `Student`).
  - Developed `SearchSection.tsx` featuring natural language query input, quick-search suggestion chips, tunable threshold and result count sliders, and ranked search result display cards showing cosine similarity match percentages.
  - Developed `PaperRepository.tsx` featuring real-time client filtering by keyword/department, an upload modal form, and paper list cards showing metadata and vector status badges.

---

### Commit 5: `83dae2b`
- **Author:** Neel Chandrakar `<neel.ckr1@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `feat(app): implement Next.js API routes, pgvector connection pool, and local embedding pipeline`
- **Files Touched (10 files):** `next.config.mjs`, `src/lib/db.ts`, `src/lib/embeddings.ts`, `src/app/api/search/route.ts`, `src/app/api/papers/route.ts`, `src/app/api/papers/[id]/route.ts`, `src/app/api/analytics/route.ts`, `src/app/api/sql-demo/route.ts`, `src/components/AnalyticsDashboard.tsx`, `src/components/SqlShowcase.tsx` (+777 lines)
- **Meaning & Significance:**
  - **Database Connection Layer (`src/lib/db.ts`)**: Built a PostgreSQL connection pool (`pg.Pool`) configured with environment variables, SSL fallback, and parameter sanitization.
  - **Local Embedding Pipeline (`src/lib/embeddings.ts`)**: Integrated Hugging Face's `@xenova/transformers` to run the `all-MiniLM-L6-v2` ONNX model directly inside Node.js, eliminating external API dependencies.
  - **API Route Handlers**:
    - `POST /api/search`: Generates query vector embedding and executes `execute_and_log_search()` stored procedure.
    - `GET /api/papers`: Returns all papers joined with vector status and uploader details.
    - `POST /api/papers`: Demonstrates a multi-step ACID transaction (`BEGIN` -> Insert Paper -> Generate Vector Embedding -> Insert Vector -> `COMMIT`).
    - `DELETE /api/papers/[id]`: Deletes paper, cascades vector deletion, and triggers the audit log.
    - `GET /api/analytics`: Queries the three analytical views and `paper_audit_log`.
    - `GET /api/sql-demo`: Demonstrates multi-table JOINs, `GROUP BY ... HAVING`, and FTS vs Vector search comparisons.
  - Implemented `AnalyticsDashboard.tsx` displaying institutional KPI cards and view tables.

---

### Commit 6: `a9f4e95`
- **Author:** Nikhil Raj `<rajgnikhil0@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `test: add automated test suite for DBMS schema, constraints, and pgvector operations`
- **Files Touched (7 files):** `package.json`, `package-lock.json`, `tsconfig.json`, `tests/db-schema.test.ts`, `tests/db-advanced-features.test.ts`, `tests/embeddings.test.ts` (+3511 lines)
- **Meaning & Significance:**
  - Configured TypeScript execution environment (`tsx`) and Node.js native test runner (`node:test`, `node:assert/strict`).
  - Added `tests/db-schema.test.ts` (6 automated tests): verifies all 5 tables and audit log exist, validates `pgvector` active dimensions, tests CHECK constraint for minimum abstract length (rejection of < 20 chars), tests CHECK constraint for roles, tests UNIQUE email constraint, and verifies HNSW and GIN index presence in `pg_indexes`.
  - Added `tests/db-advanced-features.test.ts` (4 automated tests): verifies `match_papers()` ranking, verifies `execute_and_log_search()` atomic multi-table logging, verifies trigger firing on UPDATE/DELETE with `paper_audit_log` records, and tests view query executions.
  - Added `tests/embeddings.test.ts` (2 automated tests): verifies vector string formatting and 384-dimensional L2-normalization.

---

### Commit 7: `d7597d7`
- **Author:** Neel Chandrakar `<neel.ckr1@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `docs: complete architecture specifications, data dictionary, and project documentation`
- **Files Touched (3 files):** `README.md`, `docs/ARCHITECTURE.md`, `docs/DATA_DICTIONARY.md` (+298 lines)
- **Meaning & Significance:**
  - Authored comprehensive academic project documentation.
  - `README.md`: Problem statement, system architecture diagram, step-by-step reproduction instructions, and command references.
  - `docs/ARCHITECTURE.md`: Technical documentation of multi-paradigm database design, HNSW indexing mathematics, transaction boundaries, and vector pipeline lifecycle.
  - `docs/DATA_DICTIONARY.md`: Complete relational schema documentation with column data types, nullability, keys, default values, check constraints, and descriptions for all tables and views.

---

### Commit 8: `55b8948`
- **Author:** Neel Chandrakar `<neel.ckr1@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `feat: align project title, abstract, and RBAC roles with campus research repository specification`
- **Files Touched (11 files):** Schema DDL, Seeds, Documentation, UI components, tests (+53/-39 lines)
- **Meaning & Significance:**
  - Aligned all naming conventions and role constraints with the course abstract: "Campus Research Repository and Semantic Search System".
  - Refactored user roles across DDL, seeds, UI, and tests to strictly use `ADMIN` and `STUDENT`.
  - Synchronized page titles, header branding, and test assertions to match the updated institutional specification.

---

### Commit 9: `2f57254`
- **Author:** Neel Chandrakar `<neel.ckr1@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `test(ui): add UI component DOM and end-to-end user workflow test suites`
- **Files Touched (5 files):** `package.json`, `package-lock.json`, `tests/ui-components.test.tsx`, `tests/ui-e2e-flow.test.ts` (+986 lines)
- **Meaning & Significance:**
  - Added JSDOM and React Testing Library setup to test React components without a browser.
  - Added `tests/ui-components.test.tsx`: verifies header branding, tab switching, and role toggling in the DOM.
  - Added `tests/ui-e2e-flow.test.ts` (6 automated end-to-end tests):
    1. Semantic search flow simulating student query execution.
    2. Paper creation flow simulating Admin upload with vectorization.
    3. Repository browsing flow verifying new paper presence.
    4. Institutional analytics flow querying PostgreSQL views.
    5. Paper deletion flow testing foreign key cascade and trigger audit log entry.
    6. SQL demonstration flow verifying multi-table JOINs and `GROUP BY ... HAVING`.

---

### Commit 10: `59a3432`
- **Author:** Neel Chandrakar `<neel.ckr1@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `feat(ui): simplify interface layout, clean up visual hierarchy, and streamline workflows`
- **Files Touched (8 files):** `src/app/globals.css`, `src/app/page.tsx`, `src/components/*`, `tests/ui-components.test.tsx` (+573/-707 lines)
- **Meaning & Significance:**
  - Simplified the user interface: stripped away unnecessary decorative gradients, harsh borders, and visual clutter in favor of clean slate/white cards and comfortable whitespace.
  - Improved responsive layout and ensured all buttons and input fields have clear, simple visual feedback.

---

### Commit 11: `7c19d7c`
- **Author:** Nikhil Raj `<rajgnikhil0@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `refactor(ui): streamline user interface for clean aesthetic and intuitive usability`
- **Files Touched (5 files):** `Navbar.tsx`, `SearchSection.tsx`, `PaperRepository.tsx`, `AnalyticsDashboard.tsx`, `SqlShowcase.tsx` (+443/-349 lines)
- **Meaning & Significance:**
  - Polished the visual aesthetic and interaction hierarchy across all primary components.
  - Transformed the Navbar with clean pill-based navigation tabs and an intuitive role badge with explicit `(click to switch)` feedback.
  - Refined `SearchSection`: implemented a distraction-free Google/ArXiv style search box with 1-click suggestion pills and collapsible tuning filters.
  - Refined `AnalyticsDashboard`: streamlined the 4 KPI cards and sub-tab table switches.

---

### Commit 12: `b440b05`
- **Author:** Neel Chandrakar `<neel.ckr1@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `refactor(ui): remove SQL Demo tab and simplify frontend navigation to Search, Papers, and Analytics`
- **Files Touched (4 files):** `src/app/page.tsx`, `src/components/Navbar.tsx`, `src/components/SqlShowcase.tsx` (deleted), `tests/ui-components.test.tsx` (+20/-188 lines)
- **Meaning & Significance:**
  - Streamlined the frontend navigation by removing the faculty SQL Demo tab, focusing the web app strictly on its 3 core functional pillars: **Search**, **Papers**, and **Analytics**.
  - Deleted dead frontend component `SqlShowcase.tsx` while keeping underlying backend routes intact.
  - Updated DOM component tests to verify the focused 3-tab navigation.

---

### Commit 13: `5abac01`
- **Author:** Nikhil Raj `<rajgnikhil0@gmail.com>`
- **Date:** 2026-11-04
- **Commit Message:** `feat(rbac): enforce role-based access control for Analytics, Paper upload, and deletion across UI and API`
- **Files Touched (7 files):** `src/app/api/analytics/route.ts`, `src/app/page.tsx`, `src/components/AnalyticsDashboard.tsx`, `src/components/Navbar.tsx`, `src/components/PaperRepository.tsx`, `tests/ui-components.test.tsx`, `tests/ui-e2e-flow.test.ts` (+161/-34 lines)
- **Meaning & Significance:**
  - Enforced strict Role-Based Access Control (RBAC) dynamically tied to the UI role switcher:
    - **Student Mode**: Hides `Analytics` tab from Navbar; automatically redirects back to `Search` if toggled from Analytics; renders an `Admin Privileges Required` guard screen if navigated directly; hides paper delete trash buttons; replaces `+ Upload Paper` with an `Upload: Admin Only` badge; displays a clear "Student View (Read-Only)" informational banner.
    - **Admin Mode**: Displays `Analytics` tab with full access to institutional views and trigger audit logs; enables active `+ Upload Paper` button with automated vector embedding modal; enables paper deletion buttons; displays an "Admin View (Management Enabled)" banner.
  - **Backend API Role Security**: Added role validation in `GET /api/analytics` returning `HTTP 403 Forbidden` if requested with Student credentials.
  - **Test Coverage**: Added tests in `ui-components.test.tsx` and `ui-e2e-flow.test.ts` verifying Student exclusion from Analytics and 403 rejection.

---

## 3. Summary of Contributions by Member

### Nikhil Raj (`@nikhilraj-git6`)
- **Total Direct Commits:** 5 commits (`#0449479`, `#ff1c05f`, `#a9f4e95`, `#7c19d7c`, `#5abac01`)
- **Primary Technical Areas:**
  1. **Relational Schema & Vector Extension:** Designed `01_schema.sql`, table relationships, CHECK constraints, and HNSW vector index.
  2. **Automated Database Test Suite:** Built automated tests verifying relational constraints, unique keys, and vector mathematical properties (`db-schema.test.ts`, `embeddings.test.ts`).
  3. **Frontend UI Architecture:** Developed initial React component structure (`Navbar`, `SearchSection`, `PaperRepository`) and Tailwind configuration.
  4. **UI Streamlining & Design Refinement:** Refactored interface elements for clean, distraction-free usability.
  5. **Role-Based Access Control (RBAC):** Implemented role enforcement restricting Analytics to Admin, hiding delete buttons in Student mode, and adding 403 API protection.

### Neel Chandrakar (`@neelckr1`)
- **Total Direct Commits:** 8 commits (`#2947e13`, `#8955bb9`, `#83dae2b`, `#d7597d7`, `#55b8948`, `#2f57254`, `#59a3432`, `#b440b05`)
- **Primary Technical Areas:**
  1. **Advanced DBMS Features:** Implemented PL/pgSQL stored procedures (`match_papers`, `execute_and_log_search`), audit logging triggers (`paper_audit_log`), analytical views (`04_views.sql`), and precomputed benchmark seed vectors (`05_seeds.sql`).
  2. **Backend API & Vector Pipeline:** Built Next.js App Router API handlers, PostgreSQL connection pooling (`src/lib/db.ts`), and local transformer model integration (`src/lib/embeddings.ts`).
  3. **UI/E2E Automated Testing:** Created JSDOM component test framework and simulated end-to-end user journey tests (`ui-components.test.tsx`, `ui-e2e-flow.test.ts`).
  4. **Navigation Refinement:** Removed redundant demo tabs to focus the app on core repository features.
  5. **System Architecture & Documentation:** Authored comprehensive architecture documentation, data dictionary, requirements alignment, and project README.

---

## 4. Verification and Submission Quality

- **Test Suite Status:** All **26/26 tests passing** (`npm test`).
- **Production Build:** `npm run build` succeeds with zero errors or warnings.
- **Git History:** Clean, descriptive, conventional commit messages distributed across both contributors with zero merge conflicts or untracked temporary files.
