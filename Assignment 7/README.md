# Support Ticket Triage Queue API - Assignment 7

This service implements an asynchronous background processing pattern for support ticket triage. When a customer submits a ticket, the API registers it and returns a `202 Accepted` status instantly in milliseconds instead of waiting for a slow AI model call to finish. A background worker then polls the pending queue and handles the OpenRouter classification asynchronously. Clients can regularly check the progress of the task using a status URL. This architecture guarantees high API throughput and keeps user interfaces fast and responsive since client requests are never blocked by heavy LLM operations.

---

## Setup Instructions

1. Open your terminal and navigate to the project directory:
   ```bash
   cd "Assignment 7"
   ```
2. Install all required dependencies:
   ```bash
   npm install
   ```
3. Copy the configuration template to create your environment variables file:
   ```bash
   cp .env.example .env
   ```
4. Open the `.env` file and input your OpenRouter API key:
   ```ini
   LLM_API_KEY=your-actual-api-key-here
   ```
5. Boot up the server and background worker:
   ```bash
   npm start
   ```

---

## Full Lifecycle Example

### 1. Submit a support ticket (Fast Accept)
Submit a support message to the triage endpoint:
```bash
curl -i -X POST http://localhost:3000/jobs/triage -H "Content-Type: application/json" -d '{"text": "My credit card transaction failed twice."}'
```
Expected Response (HTTP 202 Accepted):
```json
{
  "job_id": "f14f58b7-c60b-4078-a105-93e777a7dedc",
  "status": "pending",
  "status_url": "/jobs/f14f58b7-c60b-4078-a105-93e777a7dedc"
}
```

### 2. Poll for Job Status
Query the status endpoint immediately using the returned ID:
```bash
curl -i -X GET http://localhost:3000/jobs/f14f58b7-c60b-4078-a105-93e777a7dedc
```
Expected Response (HTTP 200 OK while processing):
```json
{
  "job_id": "f14f58b7-c60b-4078-a105-93e777a7dedc",
  "status": "processing",
  "attempts": 1,
  "created_at": "2026-08-12T23:22:16.398Z",
  "updated_at": "2026-08-12T23:22:16.851Z"
}
```

Wait a couple of seconds for the background classification to complete and query it again:
```bash
curl -i -X GET http://localhost:3000/jobs/f14f58b7-c60b-4078-a105-93e777a7dedc
```
Expected Response (HTTP 200 OK after completion):
```json
{
  "job_id": "f14f58b7-c60b-4078-a105-93e777a7dedc",
  "status": "done",
  "attempts": 1,
  "created_at": "2026-08-12T23:22:16.398Z",
  "updated_at": "2026-08-12T23:22:19.602Z",
  "result": {
    "category": "billing",
    "urgency": "normal",
    "suggested_team": "billing_ops",
    "confidence": 1.0,
    "reason": "Request to update billing information due to expired card."
  }
}
```

---

## Idempotency Guarantee

To prevent double-processing and save server resources, submissions are protected by an idempotency filter. The input text is trimmed, lowercased, and hashed using SHA-256. Submitting the exact same support ticket multiple times will always return the same `job_id` instead of creating redundant background tasks.

---

## Job-Level Retries & Permanent Failure Alerting

If a job fails to process (due to network drops, timeouts, or LLM output schemas failing Zod verification), the background worker automatically retries it. 
- Jobs are allowed up to **3 attempts** maximum.
- On attempts 1 and 2, status is reset to `pending` to poll again on subsequent ticks.
- If it fails on the 3rd attempt, the job status is set to `failed` and a structured notification is logged to stdout:
  `{"level":"alert","message":"job failed permanently","job_id":"...","attempts":3,"error":"..."}`

---

## In-Memory Store Limitations & Production Alternatives

Currently, all job states are stored in-memory using a native JavaScript `Map`. This is suitable for demonstration purposes, but all data is lost if the server crashes or restarts.

### Production Alternatives
To scale this service for production, we would replace the in-memory Map store with:
1. **Redis & BullMQ**: A highly reliable, production-ready distributed message queue for job scheduling, workers orchestration, rate-limiting, and lifecycle events tracking.
2. **Database Job Table**: An SQL or NoSQL database (like PostgreSQL or MongoDB) to persist job metadata, records, retry intervals, and audit history logs long-term.
