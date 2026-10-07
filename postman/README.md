# NityaGeeta Postman & Newman API Testing Guide

This directory contains the official **Postman Collection (v2.1.0)** and **Environment** for NityaGeeta. It enables interactive manual testing in Postman Desktop and automated, headless CI execution via **Newman**.

---

## 📁 Files in this Directory

| File | Purpose |
| :--- | :--- |
| [`NityaGeeta_Collection.json`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/postman/NityaGeeta_Collection.json) | Complete collection of REST API requests with automated JavaScript test assertions (`pm.test()`). |
| [`NityaGeeta_Environment.json`](file:///c:/Users/Meeta/OneDrive%20-%20Algonquin%20College/Subjects/6/Entrepreneurship/NityaGeeta/postman/NityaGeeta_Environment.json) | Configurable variables (`backend_url`, `frontend_url`, `test_user_email`, `test_session_id`). |

---

## 🚀 1. Running in Postman Desktop

1. Open **Postman Desktop** (or web app).
2. Click **Import** (top left).
3. Select or drag-and-drop both files:
   - `postman/NityaGeeta_Collection.json`
   - `postman/NityaGeeta_Environment.json`
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

### CLI HTML Reporter (Optional)
Generate an HTML test report:
```bash
npx --yes newman run postman/NityaGeeta_Collection.json -e postman/NityaGeeta_Environment.json -r cli,htmlextra
```

---

## 🔄 3. Two API Testing Approaches in NityaGeeta

| Feature | Python Test Suite (`QA/test_api_endpoints.py`) | Postman & Newman Suite (`postman/`) |
| :--- | :--- | :--- |
| **Runner** | `python QA/test_api_endpoints.py` (FastAPI TestClient) | `newman run ...` or Postman Desktop GUI |
| **In-Memory Testing** | Runs directly in-memory against FastAPI ASGI app without needing port 8000 listening. | Requires live HTTP server listening on port 8000 / 1870. |
| **CI Integration** | Executed in GitHub Actions Python workflow (`unittest/pytest`). | Can be added as a Node.js step in GitHub Actions. |
| **Developer UX** | Instant terminal output, zero external network dependency. | Interactive visual GUI, query parameter builders, request history. |
