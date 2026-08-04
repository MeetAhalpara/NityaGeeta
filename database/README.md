# Database Layer & Infrastructure (`/database`)

The `database/` directory manages connection lifecycle, database schemas, repository abstraction patterns, and connection health diagnostics across NityaGeeta's 3 specialized databases: **PostgreSQL (Neon Cloud)**, **Redis (Local Docker)**, and **Weaviate Cloud**.

---

## Directory Structure & Module Breakdown

```
database/
├── connection.py                      # Connection factories & diagnostic runner
├── models.py                          # SQL schema definitions & DDL setup
├── test_connections.py                # Connection test suite
├── migrations/                        # SQL migration scripts
└── repositories/
    ├── conversation_repository.py    # CRUD operations for sessions & messages
    ├── memory_repository.py          # Redis caching repository
    └── user_repository.py            # User session & email mapping repository
```

---

## Detailed File Specifications

### 1. `database/connection.py` — Database Connection Manager & Diagnostics
* **Role**: Provides singleton connection factories and diagnostic health checks for all 3 databases.
* **Key Functions**:
  * `get_db_connection()`: Establishes a serverless PostgreSQL connection to **Neon Cloud** using `psycopg2` with `RealDictCursor`.
  * `get_redis_client()`: Returns a shared, singleton Redis client connected to local Docker on `redis://localhost:1870`.
  * `get_weaviate_client()`: Connects to **Weaviate Cloud** using the official Weaviate v4 Python SDK via API key authentication (`AuthApiKey`).
  * `test_postgres_connection()`, `test_redis_connection()`, `test_weaviate_connection()`: Diagnostic methods that run SELECT version queries, PING tests, and cluster readiness checks.

### 2. `database/models.py` — SQL Schema & Table DDL Definitions
* **Role**: Defines the core SQL database schemas and table creation scripts for Neon PostgreSQL.
* **Key Tables**:
  * `sessions`: Stores conversation thread metadata (`session_id` UUID, `user_email`, `title`, `created_at`, `updated_at`).
  * `messages`: Stores individual chat messages (`message_id`, `session_id`, `sender`, `text`, `winning_model`, `best_score`, `citations`, `timestamp`).

### 3. `database/repositories/conversation_repository.py` — Session & Message Persistence
* **Role**: Implements the Repository Pattern for saving and querying chat logs.
* **Key Operations**:
  * `save_session(...)`: Atomically upserts session records and appends messages to PostgreSQL.
  * `get_session_messages(session_id)`: Fetches complete message history for a given thread.
  * `get_user_sessions(email)`: Retrieves all active chat threads for a signed-in user email.

### 4. `database/repositories/memory_repository.py` — Redis Micro-Caching
* **Role**: Interfaces with the local Redis container for sub-millisecond query caching.
* **Key Operations**:
  * `cache_response(query_hash, data, ttl=3600)`: Stores pre-computed RAG answers in RAM to prevent redundant LLM API calls.
  * `get_cached_response(query_hash)`: Fetches cached responses (<1ms lookup).

### 5. `database/repositories/user_repository.py` — User Profile & Session Mapping
* **Role**: Maps authenticated Google OAuth email sessions to user workspace preferences.

---

## Tri-Database Summary Matrix

| Database | Host Environment | Primary Purpose | Connection Protocol / Driver |
| :--- | :--- | :--- | :--- |
| **PostgreSQL** | Neon Cloud | Permanent chat thread & session persistence | `psycopg2-binary` (SQL over TLS) |
| **Redis** | Local Docker (`:1870`) | In-memory query caching (<1ms) & rate limiting | `redis-py` (TCP Connection) |
| **Weaviate** | Weaviate Cloud | Vector semantic concept search across 700 Shlokas | `weaviate-client` v4 (HTTPS/gRPC) |

---

## Running Connection Diagnostics

Run the standalone connection diagnostic runner to verify all 3 database connections:

```bash
# Activate virtual environment
source .venv/bin/activate  # Windows: .venv\Scripts\activate

# Execute database connection diagnostic test
python -m database.connection
```

Expected diagnostic output:
```text
============================================================
    NITYAGEETA - Database Connection Diagnostics
============================================================
[POSTGRES] PASS - PostgreSQL 16...
[REDIS] PASS
[WEAVIATE] PASS - Ready: True

============================================================
  PostgreSQL : PASS
  Redis      : PASS
  Weaviate   : PASS
============================================================
```
