# Campus Research Repository and Semantic Search System

> **DBMS Experiential Learning – Level 3 Mini-Project**  
> **Course:** Database Management Systems (Semester 5)  
> **Paradigm:** SQL (PostgreSQL 17) + Vector Database (`pgvector`)  
> **Full-Stack Stack:** Next.js (App Router), TypeScript, Tailwind CSS

---

## Abstract

> This Next.js-based web application manages role-based access for users such as Admin and Student to handle academic research papers. It implements a multi-paradigm database architecture combining a mandatory PostgreSQL SQL database for structured relational data with a vector database for vector embeddings and semantic search. The system executes database operations through DDL and DML statements while demonstrating advanced database features including transactions, views, stored procedures, and vector similarity search. Data integrity and security are enforced via database-level input validation, environment variables for sensitive configurations, and secure credential handling. Source code, implementation tracking, and documentation are maintained using Git and GitHub.

---

## 1. Problem Statement & Motivation

Traditional academic search systems rely almost exclusively on keyword matching (lexical search). When users search for concepts or phrased problems (e.g., *"neural sequence transduction without recurrence"*), traditional keyword queries often miss semantically identical literature like *"Attention Is All You Need"*.

**ScholarVector** addresses this challenge by combining:
1. **Relational Database Engine (PostgreSQL):** Managing user identities, role-based access control, paper records, query logs, and retrieval associations with strict relational integrity, views, triggers, and stored procedures.
2. **Vector Database Engine (`pgvector`):** Encoding paper abstracts into 384-dimensional dense vectors using transformer embeddings (`all-MiniLM-L6-v2`) and indexing them with **HNSW (Hierarchical Navigable Small World)** graphs for sub-millisecond approximate nearest neighbor (ANN) retrieval using Cosine Distance (`<=>`).

---

## 2. System Architecture & Database Design

```
[User] (1) ──< Manages >── (N) [Research_Paper] (1) ──< Generates >── (1) [Vector_Embedding]
   │                                     │
   └── (1) ──< Executes >── (N) [Search_Query] ──< Retrieves (M:N) >──┘
                                         │
                                [Query_Retrieval]
```

### Core Entities & Relationships
- **`users`**: System actors with Role-Based Access Control (`ADMIN` vs. `STUDENT`).
- **`research_paper`**: Metadata including Title, Abstract, Authors, Category, Publication Date.
- **`vector_embedding`**: 1:1 relationship with `research_paper` storing 384-dimensional vectors.
- **`search_query`**: Query logs executed by users.
- **`query_retrieval`**: Associative junction table capturing which papers were retrieved for each query, with rank and cosine similarity scores.
- **`paper_audit_log`**: Automated audit table tracking updates and deletes via trigger.

Diagrams and specifications:
- [ER Diagram](docs/diagrams/er_diagram.jpeg)
- [Relational Schema](docs/diagrams/relational_schema.jpeg)
- [Data Dictionary & Constraints](docs/DATA_DICTIONARY.md)
- [System Architecture](docs/ARCHITECTURE.md)

---

## 3. Advanced DBMS Features Implemented

1. **Vector Indexing (HNSW):**
   - High-performance vector index on `vector_embedding(vector_data vector_cosine_ops)` using `hnsw (m = 16, ef_construction = 64)`.
2. **PL/pgSQL Stored Procedures & Functions:**
   - `match_papers(query_embedding, threshold, limit)`: Computes cosine similarity and returns ranked papers.
   - `execute_and_log_search()`: Encapsulates query logging into `search_query` and candidate ranking into `query_retrieval` in a single ACID transaction.
3. **Database Triggers:**
   - `trg_users_updated_at` & `trg_research_paper_updated_at`: Maintains `updated_at` automatically.
   - `trg_audit_paper_changes`: Enterprise audit trigger capturing `UPDATE` and `DELETE` actions into `paper_audit_log`.
4. **Analytical SQL Views:**
   - `view_paper_analytics`: Calculates total retrievals, unique researchers reached, and average/max similarity scores using `GROUP BY`, `LEFT JOIN`, `COUNT`, and `AVG`.
   - `view_recent_search_activity`: Recent queries with correlated subquery for top-ranked papers.
   - `view_category_insights`: Aggregations demonstrating `GROUP BY` and `HAVING`.
5. **Hybrid Search:**
   - Combines traditional PostgreSQL Full-Text Search (`to_tsvector` + `GIN` index) with Vector Cosine Distance (`<=>`).

---

## 4. Project Directory Layout

```text
.
├── database/                   # Database scripts (for direct DBMS evaluation)
│   ├── ddl/
│   │   └── 01_schema.sql       # Table definitions, constraints, pgvector, HNSW index
│   ├── triggers/
│   │   └── 02_triggers.sql     # Updated_at and audit trail triggers
│   ├── procedures/
│   │   └── 03_functions.sql    # match_papers & execute_and_log_search functions
│   ├── views/
│   │   └── 04_views.sql        # Analytical views (JOIN, GROUP BY, HAVING, subqueries)
│   └── seeds/
│       └── 05_seeds.sql        # Benchmark research papers and 384-d embeddings
├── docs/                       # Project documentation
│   ├── ARCHITECTURE.md         # System architecture diagram & technical specs
│   ├── DATA_DICTIONARY.md      # Data dictionary, attributes, constraints
│   ├── diagrams/               # ER Diagram and Relational Schema images
│   └── DBMS_Level_3_Mini_Project_Requirements.docx
├── src/                        # Full-stack Next.js application
│   ├── app/
│   │   ├── api/                # Route handlers (search, papers, analytics, sql-demo)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/             # UI components (Search, PaperRepo, Analytics, SQLShowcase)
│   └── lib/                    # PostgreSQL pool client and embedding pipeline
├── tests/                      # Automated test suite
│   ├── db-schema.test.ts       # Constraints, PK/FK, unique, check, indexes
│   ├── db-advanced-features.test.ts # Procedures, transactions, views, triggers
│   └── embeddings.test.ts      # Local transformer pipeline tests
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## 5. Prerequisites & Local Setup

### Step 1: Clone Repository
```bash
git clone https://github.com/neelckr1/DBMS_miniProject.git
cd DBMS_miniProject
```

### Step 2: PostgreSQL with pgvector
Ensure PostgreSQL (v15+) is running with the `vector` extension:
```bash
# On macOS with Homebrew:
brew install pgvector
```

### Step 3: Initialize Database Schema & Seed Data
```bash
# Create database
psql -U postgres -c "CREATE DATABASE research_paper_db;"

# Run migration scripts in order
psql -U postgres -d research_paper_db -f database/ddl/01_schema.sql
psql -U postgres -d research_paper_db -f database/triggers/02_triggers.sql
psql -U postgres -d research_paper_db -f database/procedures/03_functions.sql
psql -U postgres -d research_paper_db -f database/views/04_views.sql
psql -U postgres -d research_paper_db -f database/seeds/05_seeds.sql
```

### Step 4: Configure Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Update `DATABASE_URL` with your local PostgreSQL credentials:
```env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/research_paper_db
```

### Step 5: Install Dependencies & Run
```bash
npm install
npm run dev
```
Open **http://localhost:3000** in your browser.

---

## 6. Running the Test Suite

Run the automated test suite verifying constraints, triggers, procedures, views, and vector operations:
```bash
npm test
```

---

## 7. Team Contributions

| Team Member | GitHub | Primary Responsibilities |
| :--- | :--- | :--- |
| **Neel Chandrakar** | [@neelckr1](https://github.com/neelckr1) | PL/pgSQL stored procedures, audit triggers, pgvector connection pool, Next.js API route handlers, analytics views & architecture documentation. |
| **Nikhil Raj** | [@nikhilraj-git6](https://github.com/nikhilraj-git6) | Relational DDL schema design, table constraints, HNSW vector indexing, UI components, paper repository interface, automated test suite & data dictionary. |
