# NityaGeeta Postman & Newman API Testing Guide

This directory contains the official **Postman Collection (v2.1.0)** and **Environment** for NityaGeeta. It enables interactive manual testing in Postman Desktop and automated, headless CI execution via **Newman**.

---

## 📁 Files in this Directory

| File | Purpose |
| :--- | :--- |
| [`NityaGeeta_Collection.json`](./NityaGeeta_Collection.json) | Complete collection of REST API requests with automated JavaScript test assertions (`pm.test()`). |
| [`NityaGeeta_Environment.json`](./NityaGeeta_Environment.json) | Configurable variables (`backend_url`, `frontend_url`, `test_user_email`, `test_session_id`, `enable_live_email_dispatch`). |

---

## 🛡️ Preconditions & Test Data Isolation

Before running the suite, ensure the following prerequisites and isolation safeguards are understood:

1. **Test User Provisioning**:
   - The session save (`/api/v1/sessions/save`) and list (`/api/v1/sessions/list`) endpoints require an existing user account in the PostgreSQL database.
   - The collection includes a provisioning request (`POST /api/v1/auth/register`) in the *Authentication & Lookup* folder, and the *Save Session* request includes a pre-request script that automatically provisions the configured `test_user_email` (`qa_tester@nityageeta.internal`) if it does not already exist.
   - Ensure the FastAPI backend is connected to PostgreSQL (`DATABASE_URL` in `.env`) so user and session persistence assertions can succeed.

2. **Dynamic Session Isolation & Automatic Cleanup**:
   - To prevent test runs from colliding with or overwriting persistent conversations, each run generates a fresh UUID dynamic identifier (`{{$guid}}`) during the pre-request lifecycle.
   - At the conclusion of the *Conversation Sessions CRUD* folder, a `DELETE /api/v1/sessions/:id` cleanup request automatically purges the created test session and all its messages from PostgreSQL.

3. **Safe Outbound Dispatch (Email Guard)**:
   - To prevent automated test runs from dispatching real emails through configured production services (Resend, SendGrid, SMTP), the valid contact form test (`POST /api/contact - Valid Submission Contract`) is **guarded and skipped by default** (`enable_live_email_dispatch: "false"`).
   - All input validation and security guards (e.g. 400 bad email rejection, 403 proxy guard) continue to run fully in default test runs.
   - To execute the live submission test against an isolated mail sink (e.g. MailHog, Mailpit, or stub SMTP server), set `enable_live_email_dispatch` to `"true"` in `postman/NityaGeeta_Environment.json` or pass `--env-var "enable_live_email_dispatch=true"` in Newman.

---

## 🚀 1. Running in Postman Desktop

1. Open **Postman Desktop** (or web app).
2. Click **Import** (top left).
3. Select or drag-and-drop both files:
   - [`NityaGeeta_Collection.json`](./NityaGeeta_Collection.json)
   - [`NityaGeeta_Environment.json`](./NityaGeeta_Environment.json)
4. In the top-right environment dropdown, select **NityaGeeta Local Environment**.
5. Ensure your local servers are running:
   - FastAPI Backend: `http://localhost:8000` (run `python -m uvicorn api.main:app --port 8000`)
   - Next.js Frontend: `http://localhost:1870` (run `npm run dev` in `frontend/`)
6. Click **Run Collection** to execute all tests sequentially.

---

## ⚡ 2. Headless CLI Execution with Newman

You can run the entire collection headlessly from your terminal without installing Postman globally:

```bash
# Run with npx (no global install required)
npx --yes newman run postman/NityaGeeta_Collection.json -e postman/NityaGeeta_Environment.json
```

Or install Newman globally:
```bash
npm install -g newman
newman run postman/NityaGeeta_Collection.json -e postman/NityaGeeta_Environment.json
```

### Enabling Live Contact Dispatch against an Isolated Mail Sink (Optional)
```bash
npx --yes newman run postman/NityaGeeta_Collection.json -e postman/NityaGeeta_Environment.json --env-var "enable_live_email_dispatch=true"
```

### CLI HTML Reporter (`htmlextra`)
`newman-reporter-htmlextra` is a separate package and is **not** bundled with vanilla Newman. Install it alongside Newman or run it via bundled `npx`:

#### Option A: Run via `npx` (No global install required)
Use the `-p` flags so `npx` installs both Newman and the reporter into the same execution context:
```bash
npx --yes -p newman -p newman-reporter-htmlextra newman run postman/NityaGeeta_Collection.json -e postman/NityaGeeta_Environment.json -r cli,htmlextra --reporter-htmlextra-export postman/reports/report.html
```

#### Option B: Global Installation
Install both packages globally so Newman can resolve `htmlextra`:
```bash
npm install -g newman newman-reporter-htmlextra
newman run postman/NityaGeeta_Collection.json -e postman/NityaGeeta_Environment.json -r cli,htmlextra --reporter-htmlextra-export postman/reports/report.html
```

#### Option C: Local DevDependencies
Install both packages in `frontend/` or workspace root:
```bash
npm install --save-dev newman newman-reporter-htmlextra
npx newman run postman/NityaGeeta_Collection.json -e postman/NityaGeeta_Environment.json -r cli,htmlextra --reporter-htmlextra-export postman/reports/report.html
```

---

## 🔄 3. Two API Testing Approaches in NityaGeeta

| Feature | Python Test Suite (`QA/test_api_endpoints.py`) | Postman & Newman Suite (`postman/`) |
| :--- | :--- | :--- |
| **Runner** | `python QA/test_api_endpoints.py` (FastAPI TestClient) | `newman run ...` or Postman Desktop GUI |
| **In-Memory Testing** | Runs directly in-memory against FastAPI ASGI app without needing port 8000 listening. | Requires live HTTP server listening on port 8000 / 1870. |
| **CI Integration** | Executed in GitHub Actions Python workflow (`unittest/pytest`). | Can be added as a Node.js step in GitHub Actions. |
| **Developer UX** | Instant terminal output, zero external network dependency. | Interactive visual GUI, query parameter builders, request history. |
