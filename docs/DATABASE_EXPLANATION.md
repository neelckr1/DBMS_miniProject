# Database Architecture & Table-by-Table Technical Guide

> **Project:** Campus Research Repository and Semantic Search System  
> **Course:** Database Management Systems (Semester 5) — Experiential Learning Level-3  
> **Paradigms:** Relational Database (PostgreSQL 17) + Vector Database (`pgvector` 0.8.7)  
> **Host / Database:** `localhost:5432` / `research_paper_db`

---

## 1. High-Level Architecture: How the Multi-Paradigm Database Works

This system implements a **multi-paradigm database architecture**. Rather than running two separate databases (a traditional SQL database for user and paper records and an external vector database like Pinecone, Milvus, or Qdrant for embeddings), it unifies both paradigms within **PostgreSQL 17** using the **`pgvector`** extension.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               POSTGRESQL 17 ENGINE                                     │
│                                                                                        │
│  ┌───────────────────────────────┐               ┌──────────────────────────────────┐  │
│  │   RELATIONAL / SQL ENGINE     │               │      VECTOR DATABASE ENGINE      │  │
│  │                               │               │            (pgvector)            │  │
│  │ • users (RBAC: Admin/Student) │               │ • vector_embedding (vector(384)) │  │
│  │ • research_paper (Metadata)   │◄─────────────►│ • HNSW Index (Cosine Ops)        │  │
│  │ • search_query (Logs)         │  1:1 Cascade  │ • Cosine Distance Operator (<=>) │  │
│  │ • query_retrieval (Junction)  │               │ • Sub-millisecond ANN Retrieval  │  │
│  │ • paper_audit_log (Triggers)  │               └──────────────────────────────────┘  │
│  │ • Analytical SQL Views        │                                                     │
│  └───────────────────────────────┘                                                     │
│               ▲                                                                        │
│               │ ACID Transaction & Stored Procedure Execution                          │
│               ▼                                                                        │
│  ┌──────────────────────────────────────────────────────────────────────────────────┐  │
│  │                PL/pgSQL STORED PROCEDURES, TRIGGERS & CONSTRAINTS                │  │
│  │ • match_papers()                • execute_and_log_search() (Atomic Transaction)   │  │
│  │ • trg_audit_paper_changes       • chk_abstract_min_len (>= 20 chars)             │  │
│  └──────────────────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### Why a Multi-Paradigm Engine?

1. **ACID Transaction Guarantees Across Modalities**:
   When an Admin uploads a paper, the paper record and its high-dimensional vector embedding are inserted within a single atomic transaction (`BEGIN` ... `COMMIT`). If vectorization or relational insertion fails, the entire transaction rolls back—preventing "ghost" papers without embeddings or orphaned vectors without metadata.
2. **Referential Integrity & Cascading Operations**:
   The vector table uses a foreign key with `ON DELETE CASCADE`. If a paper is deleted, PostgreSQL automatically removes its vector embedding in the same operation without manual synchronizer scripts.
3. **Single Connection Pool**:
   The entire application connects to one database port (`5432`), avoiding network overhead, multiple client libraries, or split-brain inconsistencies between two database systems.

---

## 2. End-to-End System Workflows

### A. Research Paper Upload & Vectorization Workflow (Admin Only)

```
[Admin Submits Form]
         │
         ▼
[Compute Local Embedding] ──> (@xenova/transformers runs all-MiniLM-L6-v2 in Node.js)
         │                     Outputs: 384-dimensional unit-normalized float array
         ▼
[PostgreSQL BEGIN]
         │
         ├─► INSERT INTO research_paper (title, abstract, authors, category, user_id)
         │   └── Evaluates CHECK constraint: length(trim(abstract)) >= 20
         │
         ├─► INSERT INTO vector_embedding (paper_id, model_version, vector_data)
         │   └── Stores vector(384) in HNSW index graph
         │
[PostgreSQL COMMIT]
```

### B. Semantic Search & Atomic Telemetry Workflow (Student or Admin)

```
[User Natural Language Query: "attention mechanisms in transformers"]
         │
         ▼
[Generate Query Embedding] ──> Converts query into 384-dimensional vector
         │
         ▼
[Call PL/pgSQL Procedure: execute_and_log_search()]
         │
         ├─► 1. INSERT INTO search_query (user_id, query_text, timestamp)
         │      Captures query text and attributing user (ID: 1 for Admin, 2 for Student)
         │
         ├─► 2. HNSW Index Vector Search
         │      Traverses HNSW graph using Cosine Distance: (vector_data <=> query_embedding)
         │      Computes Cosine Similarity: 1 - (vector_data <=> query_embedding)
         │      Filters by similarity threshold (e.g. >= 0.1) and LIMIT (e.g. 5)
         │
         ├─► 3. Bulk INSERT INTO query_retrieval (query_id, paper_id, similarity_score, rank_order)
         │      Records exact search ranking and relevance scores for institutional analytics
         │
         ▼
[Returns Ranked Results Set to Frontend UI]
```

### C. Paper Modification, Deletion & Audit Trail Workflow

```
[Admin Updates or Deletes a Research Paper]
         │
         ▼
[Trigger trg_audit_paper_changes Fires (AFTER UPDATE OR DELETE)]
         │
         ├─► If UPDATE: Captures OLD.title, NEW.title, OLD.paper_id, changed_by_user_id
         │              Inserts into paper_audit_log with action_type = 'UPDATE'
         │
         └─► If DELETE: Captures OLD.title, OLD.paper_id, changed_by_user_id
                        Inserts into paper_audit_log with action_type = 'DELETE'
                        Foreign key ON DELETE CASCADE automatically removes:
                        • vector_embedding row
                        • query_retrieval associative rows
```

---

## 3. Table-by-Table Detailed Reference

The database contains **5 primary relational tables** and **1 enterprise audit log table**:

```
1. users                 (System actors with Role-Based Access Control)
2. research_paper        (Structured paper metadata and textual abstracts)
3. vector_embedding      (384-dimensional dense vectors linked 1:1 to papers)
4. search_query          (User search history and execution telemetry)
5. query_retrieval       (Junction table associating queries with ranked retrieved papers)
6. paper_audit_log       (Immutable trigger-generated audit trail for data governance)
```

---

### TABLE 1: `users`

Represents system actors authenticated in the campus portal with Role-Based Access Control (RBAC).

#### Schema Definition:
```sql
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'STUDENT' CHECK (role IN ('ADMIN', 'STUDENT')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Details:
| Column Name | SQL Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `user_id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing unique user identifier. |
| `email` | `VARCHAR(255)` | `UNIQUE`, `NOT NULL` | Institutional email address; prevents duplicate registrations. |
| `password_hash` | `VARCHAR(255)` | `NOT NULL` | Secure salted password hash (e.g. bcrypt). |
| `full_name` | `VARCHAR(150)` | `NOT NULL` | Full legal or display name of the researcher or student. |
| `role` | `VARCHAR(50)` | `NOT NULL`, `DEFAULT 'STUDENT'`, `CHECK (role IN ('ADMIN', 'STUDENT'))` | Access level; strictly controls UI permissions and API security. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Account registration timestamp. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Automatically maintained by `trg_users_updated_at`. |

#### Sample Row:
```sql
user_id | email              | password_hash | full_name                             | role    
--------+--------------------+---------------+---------------------------------------+---------
1       | admin@campus.edu   | $2a$10$...    | Dr. Neel Chandrakar (Admin / Faculty) | ADMIN   
2       | student@campus.edu | $2a$10$...    | Aarav Sharma (Student)                | STUDENT 
```

---

### TABLE 2: `research_paper`

Stores structured academic metadata, authors, categorization, and the complete text abstract of each research publication.

#### Schema Definition:
```sql
CREATE TABLE research_paper (
    paper_id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    abstract TEXT NOT NULL,
    authors VARCHAR(300),
    category VARCHAR(100),
    publication_date DATE,
    upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_abstract_min_len CHECK (length(trim(abstract)) >= 20)
);
```

#### Column Details:
| Column Name | SQL Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `paper_id` | `SERIAL` | `PRIMARY KEY` | Unique research paper identifier. |
| `title` | `VARCHAR(500)` | `NOT NULL` | Full title of the paper or thesis. |
| `abstract` | `TEXT` | `NOT NULL`, `CHECK (length(trim(abstract)) >= 20)` | Full text abstract. Enforces >= 20 non-whitespace characters. |
| `authors` | `VARCHAR(300)` | Nullable | Comma-delimited author list (e.g., "Vaswani et al."). |
| `category` | `VARCHAR(100)` | Nullable | Academic field (e.g., 'Natural Language Processing', 'Computer Vision'). |
| `publication_date` | `DATE` | Nullable | Official publication date. |
| `upload_date` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | When the paper was uploaded into the campus repository. |
| `user_id` | `INT` | `REFERENCES users(user_id) ON DELETE SET NULL` | ID of the faculty/admin user who uploaded the paper. |
| `updated_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Automatically maintained by `trg_research_paper_updated_at`. |

#### Constraints & Integrity Rules:
- **`chk_abstract_min_len`**: Rejects shallow/empty submissions having fewer than 20 characters of abstract text.
- **`ON DELETE SET NULL` on `user_id`**: If an Admin user account is deleted, the paper remains preserved in the institutional repository.

---

### TABLE 3: `vector_embedding`

Stores the 384-dimensional dense mathematical vector embeddings generated from paper abstracts for vector similarity search.

#### Schema Definition:
```sql
CREATE TABLE vector_embedding (
    embedding_id SERIAL PRIMARY KEY,
    paper_id INT UNIQUE NOT NULL REFERENCES research_paper(paper_id) ON DELETE CASCADE,
    model_version VARCHAR(100) NOT NULL DEFAULT 'all-MiniLM-L6-v2',
    vector_data vector(384) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Details:
| Column Name | SQL Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `embedding_id` | `SERIAL` | `PRIMARY KEY` | Unique embedding identifier. |
| `paper_id` | `INT` | `UNIQUE`, `NOT NULL`, `REFERENCES research_paper(paper_id) ON DELETE CASCADE` | 1:1 foreign key link to `research_paper`. |
| `model_version` | `VARCHAR(100)` | `NOT NULL`, `DEFAULT 'all-MiniLM-L6-v2'` | The transformer model used to produce the dense vector. |
| `vector_data` | `vector(384)` | `NOT NULL` | 384-dimensional array of 32-bit floating-point numbers. |
| `created_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Generation timestamp. |

#### Constraints & Integrity Rules:
- **`UNIQUE(paper_id)`**: Strictly enforces a **1:1 relationship** between a paper and its active semantic vector representation.
- **`ON DELETE CASCADE`**: When a paper is removed from `research_paper`, PostgreSQL automatically deletes its corresponding vector embedding.

---

### TABLE 4: `search_query`

Logs every natural language search executed in the application for auditing, retrieval analysis, and frequency metrics.

#### Schema Definition:
```sql
CREATE TABLE search_query (
    query_id SERIAL PRIMARY KEY,
    query_text TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id INT REFERENCES users(user_id) ON DELETE SET NULL
);
```

#### Column Details:
| Column Name | SQL Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `query_id` | `SERIAL` | `PRIMARY KEY` | Auto-incrementing unique query session identifier. |
| `query_text` | `TEXT` | `NOT NULL` | The raw text input entered by the user. |
| `timestamp` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Wall-clock execution timestamp. |
| `user_id` | `INT` | `REFERENCES users(user_id) ON DELETE SET NULL` | ID of the user executing the query (`1` = Admin, `2` = Student). |

---

### TABLE 5: `query_retrieval`

An associative junction table modeling the **many-to-many (M:N) relationship** between `search_query` and `research_paper`. For every search query, this table records the top retrieved papers, their exact rank order, and their cosine similarity score.

#### Schema Definition:
```sql
CREATE TABLE query_retrieval (
    query_id INT NOT NULL REFERENCES search_query(query_id) ON DELETE CASCADE,
    paper_id INT NOT NULL REFERENCES research_paper(paper_id) ON DELETE CASCADE,
    similarity_score DOUBLE PRECISION NOT NULL CHECK (similarity_score >= -1.0 AND similarity_score <= 1.0),
    rank_order INT NOT NULL CHECK (rank_order > 0),
    retrieved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (query_id, paper_id)
);
```

#### Column Details:
| Column Name | SQL Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `query_id` | `INT` | Composite `PRIMARY KEY`, `REFERENCES search_query(query_id) ON DELETE CASCADE` | Link to the executing search query. |
| `paper_id` | `INT` | Composite `PRIMARY KEY`, `REFERENCES research_paper(paper_id) ON DELETE CASCADE` | Link to the retrieved research paper. |
| `similarity_score` | `DOUBLE PRECISION` | `NOT NULL`, `CHECK (similarity_score >= -1.0 AND <= 1.0)` | Calculated cosine similarity score ($1 - \text{distance}$). |
| `rank_order` | `INT` | `NOT NULL`, `CHECK (rank_order > 0)` | Position in the result set (`1` = Top match, `2` = Second, etc.). |
| `retrieved_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Retrieval timestamp. |

#### Constraints & Integrity Rules:
- **`PRIMARY KEY (query_id, paper_id)`**: Guarantees that a paper cannot appear multiple times within the same search query result set.
- **`CHECK (similarity_score BETWEEN -1.0 AND 1.0)`**: Validates mathematical boundaries of cosine similarity.
- **`CHECK (rank_order > 0)`**: Enforces positive ordinal ranking.

---

### TABLE 6: `paper_audit_log`

An immutable enterprise audit trail created by automated database triggers to track modifications and deletions.

#### Schema Definition:
```sql
CREATE TABLE paper_audit_log (
    audit_id SERIAL PRIMARY KEY,
    paper_id INT NOT NULL,
    action_type VARCHAR(10) NOT NULL CHECK (action_type IN ('UPDATE', 'DELETE')),
    old_title VARCHAR(500),
    new_title VARCHAR(500),
    changed_by_user_id INT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### Column Details:
| Column Name | SQL Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `audit_id` | `SERIAL` | `PRIMARY KEY` | Unique audit log entry identifier. |
| `paper_id` | `INT` | `NOT NULL` | ID of the paper that was modified or deleted. |
| `action_type` | `VARCHAR(10)` | `NOT NULL`, `CHECK (action_type IN ('UPDATE', 'DELETE'))` | Event type recorded by the trigger. |
| `old_title` | `VARCHAR(500)` | Nullable | Title prior to modification or deletion. |
| `new_title` | `VARCHAR(500)` | Nullable | Title after update (`NULL` for deletions). |
| `changed_by_user_id` | `INT` | Nullable | User ID responsible for triggering the change. |
| `changed_at` | `TIMESTAMPTZ` | `DEFAULT CURRENT_TIMESTAMP` | Exact timestamp when the trigger executed. |

---

## 4. Advanced Database Features

### 1. Vector Indexing: HNSW vs GIN vs B-Tree

| Index Name | Target Table & Column | Method / Type | Parameters / Details | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **`idx_vector_embedding_hnsw`** | `vector_embedding(vector_data)` | **`hnsw`** | `vector_cosine_ops`, `m = 16`, `ef_construction = 64` | Sub-millisecond vector similarity search using hierarchical skip-graphs |
| **`idx_paper_fulltext`** | `research_paper(title, abstract)` | **`gin`** | `to_tsvector('english', title \|\| ' ' \|\| abstract)` | Full-text lexical search for keyword comparison |
| `idx_research_paper_user_id` | `research_paper(user_id)` | `btree` | Standard B-Tree | Fast JOIN resolution between users and papers |
| `idx_research_paper_category` | `research_paper(category)` | `btree` | Standard B-Tree | Fast filtering by department / academic domain |
| `idx_search_query_timestamp` | `search_query(timestamp DESC)` | `btree` | Descending B-Tree | Fast retrieval of recent search activity logs |
| `idx_query_retrieval_paper_id` | `query_retrieval(paper_id)` | `btree` | Standard B-Tree | Fast aggregation of paper retrieval statistics |

#### How HNSW Indexing Works:
The **Hierarchical Navigable Small World (HNSW)** index organizes 384-dimensional vectors into multi-layer proximity graphs:
- Top layers have long-range edges for coarse, fast routing across vector space.
- Bottom layers have dense, short-range edges for high-precision nearest neighbor candidate selection.
- **Cosine Distance Metric (`<=>`)**: Computes angular distance between vectors:
  $$\text{Cosine Distance}(u, v) = 1 - \frac{u \cdot v}{\|u\|_2 \|v\|_2}$$
  Because all vectors in this system are unit L2-normalized upon creation ($\|u\|_2 = 1$), this reduces to a fast dot product: $1 - (u \cdot v)$.

---

### 2. Stored Procedures & Transaction Functions

#### Procedure 1: `match_papers(query_embedding, match_threshold, match_count)`
- **Language**: `plpgsql`
- **Purpose**: Returns ranked papers exceeding a similarity threshold.
- **Mechanism**:
  ```sql
  SELECT 
      rp.paper_id, rp.title, rp.abstract, rp.authors, rp.category, rp.publication_date,
      (1 - (ve.vector_data <=> query_embedding))::DOUBLE PRECISION AS similarity_score
  FROM vector_embedding ve
  JOIN research_paper rp ON rp.paper_id = ve.paper_id
  WHERE (1 - (ve.vector_data <=> query_embedding)) >= match_threshold
  ORDER BY ve.vector_data <=> query_embedding ASC
  LIMIT match_count;
  ```

#### Procedure 2: `execute_and_log_search(p_user_id, p_query_text, p_query_embedding, p_match_count, p_match_threshold)`
- **Language**: `plpgsql`
- **Purpose**: Implements an **ACID multi-table transaction** in a single database function call:
  1. Inserts into `search_query` and obtains the generated `new_query_id`.
  2. Executes vector search using the HNSW index against `vector_embedding`.
  3. Bulk inserts the retrieved results into `query_retrieval` with computed ranks and similarity scores.
  4. Returns the result set to the client.

---

### 3. Database Triggers

#### Trigger 1: `trg_audit_paper_changes`
- **Table**: `research_paper`
- **Event**: `AFTER UPDATE OR DELETE ON research_paper FOR EACH ROW`
- **Function**: `log_paper_changes()`
- **Mechanism**:
  - On `UPDATE`: Inserts an audit row capturing old and new titles.
  - On `DELETE`: Inserts an audit row capturing deleted paper details.

#### Trigger 2: `trg_users_updated_at` & `trg_research_paper_updated_at`
- **Table**: `users`, `research_paper`
- **Event**: `BEFORE UPDATE ON ... FOR EACH ROW`
- **Function**: `set_updated_at_column()`
- **Mechanism**: Automatically sets `NEW.updated_at = CURRENT_TIMESTAMP`.

---

### 4. Analytical Views

#### View 1: `view_paper_analytics`
- **Definition**: Complex 4-table `LEFT JOIN` (`research_paper`, `users`, `query_retrieval`, `search_query`) with `GROUP BY`.
- **Columns**: `paper_id`, `title`, `category`, `upload_date`, `uploaded_by`, `total_retrievals`, `unique_researchers_reached`, `avg_similarity_score`, `max_similarity_score`, `last_retrieved_at`.
- **Purpose**: Provides faculty with institutional metrics on which research papers are retrieved most frequently and their average relevance scores.

#### View 2: `view_recent_search_activity`
- **Definition**: Correlates search queries with executing user accounts and uses a correlated subquery to extract the `#1 Top Matched Paper` for each search query.
- **Columns**: `query_id`, `query_text`, `query_time`, `user_id`, `user_name`, `user_role`, `papers_matched`, `avg_similarity`, `top_matched_paper`.
- **Purpose**: Displays live search telemetry and researcher interests in the institutional dashboard.

#### View 3: `view_category_insights`
- **Definition**: Aggregation using `GROUP BY category` and `HAVING COUNT(DISTINCT rp.paper_id) > 0`.
- **Columns**: `category`, `total_papers`, `total_retrievals`, `category_avg_relevance`.
- **Purpose**: Demonstrates analytical grouping and ranking across academic departments (e.g., Computer Vision, NLP, Distributed Systems, Computational Biology).

---

## 5. Summary Table of Database Schema & Cardinality

| Parent Table | Relationship | Child Table | Cardinality | Foreign Key Constraint |
| :--- | :---: | :--- | :---: | :--- |
| `users` | ──< Uploads >── | `research_paper` | 1 : N | `REFERENCES users(user_id) ON DELETE SET NULL` |
| `research_paper` | ──< Represents >── | `vector_embedding` | **1 : 1** | `REFERENCES research_paper(paper_id) ON DELETE CASCADE` |
| `users` | ──< Executes >── | `search_query` | 1 : N | `REFERENCES users(user_id) ON DELETE SET NULL` |
| `search_query` | ──< Discovers >── | `query_retrieval` | 1 : N | `REFERENCES search_query(query_id) ON DELETE CASCADE` |
| `research_paper` | ──< Included In >── | `query_retrieval` | 1 : N | `REFERENCES research_paper(paper_id) ON DELETE CASCADE` |
| `research_paper` | ──< Audited By >── | `paper_audit_log` | 1 : N | Trigger-managed decoupled audit log |
