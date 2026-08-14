# Task Summary PDF Report Generator - Assignment 9

An asynchronous background-job service for generating and downloading aggregated task metrics PDF reports. Users submit a report request which is accepted instantly with a `202 Accepted` response, while a background polling worker aggregates task statistics directly from PostgreSQL, renders a formatted PDF document to disk, and updates the in-memory job record with a download link and summary metrics once finished.

---

## Setup & Running Instructions

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Create or verify `.env` in the root of `Assignment 9`:
   ```env
   DATABASE_URL=postgres://postgres:dev@localhost:5433/tasks
   PORT=3000
   OUTPUT_DIR=./outputs
   ```

3. **Ensure PostgreSQL Database is Running**:
   Ensure the `tasks` table is populated in PostgreSQL (e.g. via Docker container or local instance).

4. **Start the service**:
   ```bash
   npm start
   ```
   The service will start the HTTP API on `http://localhost:3000` and automatically initiate the background worker loop.

---

## Full Lifecycle Example (cURL)

### Step 1: Submit Report Request (Fast Accept)
Submit an asynchronous task summary report generation request:
```bash
curl -X POST http://localhost:3000/reports/tasks-summary \
  -H "Content-Type: application/json"
```

**Immediate Response (202 Accepted)**:
```json
{
  "job_id": "420e37cf-559d-48e4-905b-05d6390d80b8",
  "status": "pending",
  "status_url": "/jobs/420e37cf-559d-48e4-905b-05d6390d80b8"
}
```

---

### Step 2: Poll Job Status
Query the status endpoint using the returned `job_id`:
```bash
curl http://localhost:3000/jobs/420e37cf-559d-48e4-905b-05d6390d80b8
```

**While Processing**:
```json
{
  "id": "420e37cf-559d-48e4-905b-05d6390d80b8",
  "type": "tasks-summary-report",
  "status": "processing",
  "input": { "text": "tasks-summary" },
  "result": null,
  "error": null,
  "attempts": 1,
  "created_at": "2026-08-14T20:34:45.565Z",
  "updated_at": "2026-08-14T20:34:46.513Z"
}
```

**When Done**:
```json
{
  "id": "420e37cf-559d-48e4-905b-05d6390d80b8",
  "type": "tasks-summary-report",
  "status": "done",
  "input": { "text": "tasks-summary" },
  "result": {
    "file_path": "outputs/420e37cf-559d-48e4-905b-05d6390d80b8.pdf",
    "download_url": "/reports/download/420e37cf-559d-48e4-905b-05d6390d80b8",
    "total_tasks": 3,
    "done_count": 1,
    "pending_count": 2,
    "completion_rate": 0.33,
    "generated_at": "2026-08-14T20:34:46.542Z"
  },
  "error": null,
  "attempts": 1,
  "created_at": "2026-08-14T20:34:45.565Z",
  "updated_at": "2026-08-14T20:34:46.577Z"
}
```

---

### Step 3: Download Generated PDF Report
Download and save the PDF file directly to disk:
```bash
curl -o report.pdf http://localhost:3000/reports/download/420e37cf-559d-48e4-905b-05d6390d80b8
```

---

## Idempotency Behavior

The report generation endpoint computes an idempotency key derived from the current calendar date (`tasks-summary-YYYY-MM-DD`). 
- When multiple requests are submitted on the same day, the service identifies the existing non-failed job (`pending`, `processing`, or `done`) and immediately returns the existing `job_id`.
- This avoids running redundant aggregation queries or spawning duplicate PDF generation jobs within the same day.

---

## Artifact-Handling Discipline

The job record stored in memory **never** embeds the PDF's binary buffer or a base64-encoded string. Instead, the worker writes the rendered file to the filesystem (`OUTPUT_DIR`) and attaches only a lightweight file reference (`file_path` and `download_url`) to the job's `result`.

**Why this discipline matters**:
- Large binary payloads degrade in-memory store performance, inflate API response payloads, and exhaust server heap memory when concurrent requests increase.
- Separation of metadata from artifact storage keeps status polling fast, predictable, and scalable.

---

## Current Limitations & Production Architecture

- **In-Memory Store**: Job records are maintained in a memory `Map`, which is reset whenever the server process restarts. In production, this would be replaced with a durable database table (e.g. PostgreSQL `jobs` table) or a distributed Redis queue (e.g. BullMQ).
- **Local Disk Storage**: Generated PDF files are saved to the local `./outputs` directory. In a horizontally-scaled multi-instance deployment, files would be written to cloud object storage (e.g. AWS S3, Google Cloud Storage, or Cloudflare R2) and served via signed URLs or CDN endpoints.
