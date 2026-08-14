# FlyRank Internship Tasks

This repository contains tasks and assignments completed during the FlyRank Internship.

## Assignments Index

| Folder | Project Name | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| [Assignment 1-2-3-4](./Assignment%201-2-3-4) | **Assignment 1: Task API (In-Memory)** | A lightweight in-memory CRUD API for managing a to-do list with interactive Swagger documentation. | Node.js, Express.js, Swagger UI |
| [Assignment 1-2-3-4](./Assignment%201-2-3-4) | **Assignment 2: SQLite Migration** | Migrated the storage layer of the Task API to a local SQLite database file, maintaining identical endpoint behavior and schemas. | Node.js, Express.js, SQLite, Swagger UI |
| [Assignment 1-2-3-4](./Assignment%201-2-3-4) | **Assignment 3: Postgres & Docker Compose** | Migrated storage to a PostgreSQL container, containerized the Node app, and orchestrated the stack using Docker Compose. | Node.js, Express.js, PostgreSQL (pg), Docker, Docker Compose, Swagger UI |
| [Assignment 1-2-3-4](./Assignment%201-2-3-4) | **Assignment 4: Supabase Authentication** | Integrated Supabase Auth as the Identity Provider, adding signup, login, logout, and protected route middlewares. | Node.js, Express.js, PostgreSQL, Supabase Auth, Docker, Swagger UI |
| [Assignment 5](./Assignment%205) | **Assignment 5: Polite Web Scraper** | A standalone web scraper designed to crawl a book catalogue, extract details of all 60 books, validate data against a Zod schema, and implement rate-limiting and caching. | Node.js, Cheerio, Zod |
| [Assignment 6](./Assignment%206) | **Assignment 6: Support Ticket Triage** | A support ticket triage classifier using LLM models to categorize tickets, validate output structures, retry failed schema attempts, log errors, and enforce rate switches. | Node.js, Express.js, Zod, OpenRouter (OpenAI SDK) |
| [Assignment 7](./Assignment%207) | **Assignment 7: Support Ticket Triage Queue** | An asynchronous, background-worker support ticket triage queue system implementing idempotency keys, polling statuses, and failure retries. | Node.js, Express.js, Zod, OpenRouter (OpenAI SDK) |
| [Assignment 8](./Assignment%208) | **Assignment 8: Visual AI Workflow Editor** | An interactive canvas-based visual workflow editor with drag-and-drop decision nodes, YES/NO typed edges, Inngest-powered graph traversal calling a real LLM at each node, real-time execution state highlighting, and a polished execution logs panel. | Next.js, React Flow, Inngest, OpenRouter (OpenAI SDK), Tailwind CSS v4, Shadcn UI |
| [Assignment 9](./Assignment%209) | **Assignment 9: Task Summary PDF Report Generator** | An asynchronous background-job service for generating and downloading aggregated task metrics PDF reports from PostgreSQL, featuring fast 202 acceptance, same-day idempotency, and clean artifact-linking. | Node.js, Express.js, PostgreSQL (pg), PDFKit |

---

## How to Run the Task API (Assignment 4)

The source code for the latest state of the API assignments resides in the **`Assignment 1-2-3-4`** directory on the `main` branch.

### Option A: Run via Docker Compose
1. Open your terminal in the `Assignment 1-2-3-4` folder:
   ```bash
   cd "Assignment 1-2-3-4"
   ```
2. Build and start both the API and database containers:
   ```bash
   docker compose up --build
   ```
3. Access the API at `http://localhost:3000` or interactive docs at `http://localhost:3000/docs`.

### Option B: Run Locally
1. Copy `.env.example` to `.env` inside the `Assignment 1-2-3-4` folder and configure your database URL and Supabase keys.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

---

## How to Run the Web Scraper (Assignment 5)

The source code for the scraper resides in the **`Assignment 5`** directory.

1. Open your terminal in the `Assignment 5` folder:
   ```bash
   cd "Assignment 5"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the scraper:
   ```bash
   npm start
   ```

---

## How to Run the Ticket Triage API (Assignment 6)

The source code for the ticket triage service resides in the **`Assignment 6`** directory.

1. Open your terminal in the `Assignment 6` folder:
   ```bash
   cd "Assignment 6"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your OpenRouter API key:
   ```bash
   cp .env.example .env
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Run the evaluation suite:
   ```bash
   npm run eval
   ```

---

## How to Run the Ticket Triage Queue API (Assignment 7)

The source code for the asynchronous ticket triage queue service resides in the **`Assignment 7`** directory.

1. Open your terminal in the `Assignment 7` folder:
   ```bash
   cd "Assignment 7"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and configure your OpenRouter API key:
   ```bash
   cp .env.example .env
   ```
4. Start the server and background worker:
   ```bash
   npm start
   ```

---

## How to Run the Visual AI Workflow Editor (Assignment 8)

The source code for the visual workflow editor resides in the **`Assignment 8`** directory.

1. Open your terminal in the `Assignment 8` folder:
   ```bash
   cd "Assignment 8"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the following variables:
   ```env
   OPENAI_BASE_URL=https://openrouter.ai/api/v1
   OPENAI_API_KEY=your-openrouter-key-here
   OPENAI_MODEL=openrouter/free
   INNGEST_EVENT_KEY=local
   INNGEST_DEV=1
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
5. In a separate terminal, start the Inngest Dev Server:
   ```bash
   npx inngest-cli@latest dev
   ```
6. Open `http://localhost:3000` to use the flow editor canvas.

---

## How to Run the Task Summary PDF Report Generator (Assignment 9)

The source code for the report generator resides in the **`Assignment 9`** directory.

1. Open your terminal in the `Assignment 9` folder:
   ```bash
   cd "Assignment 9"
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your `.env` file:
   ```env
   DATABASE_URL=postgres://postgres:dev@localhost:5433/tasks
   PORT=3000
   OUTPUT_DIR=./outputs
   ```
4. Start the server and background worker:
   ```bash
   npm start
   ```
5. Submit a report generation request:
   ```bash
   curl -X POST http://localhost:3000/reports/tasks-summary
   ```
6. Check job status and download the rendered PDF:
   ```bash
   curl http://localhost:3000/jobs/<job_id>
   curl -o report.pdf http://localhost:3000/reports/download/<job_id>
   ```

---

## Running a Specific Assignment Version via Git Branches

If you want to checkout and run a specific assignment version using its dedicated git branch:

### For Assignment 1 (In-Memory Version)
1. Switch to the `Assignment-1` branch:
   ```bash
   git checkout Assignment-1
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 1"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

### For Assignment 2 (SQLite Database Version)
1. Switch to the `assignment-2` branch:
   ```bash
   git checkout assignment-2
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 1-2"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```

### For Assignment 3 (Postgres & Docker Compose Version)
1. Switch to the `assignment-3` branch:
   ```bash
   git checkout assignment-3
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 1-2-3"
   ```
3. Run using Docker Compose:
   ```bash
   docker compose up --build
   ```

### For Assignment 4 (Supabase Authentication Version)
1. Switch to the `assignment-4` branch:
   ```bash
   git checkout assignment-4
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 1-2-3-4"
   ```
3. Run using Docker Compose:
   ```bash
   docker compose up --build
   ```

### For Assignment 5 (Polite Web Scraper Version)
1. Switch to the `assignment-5` branch:
   ```bash
   git checkout assignment-5
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 5"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run the scraper:
   ```bash
   npm start
   ```

### For Assignment 6 (Support Ticket Triage Version)
1. Switch to the `assignment-6` branch:
   ```bash
   git checkout assignment-6
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 6"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env
   ```
5. Run the service:
   ```bash
   npm start
   ```

### For Assignment 7 (Support Ticket Triage Queue Version)
1. Switch to the `assignment-7` branch:
   ```bash
   git checkout assignment-7
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 7"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy `.env.example` to `.env` and configure your API keys:
   ```bash
   cp .env.example .env
   ```
5. Run the service:
   ```bash
   npm start
   ```

### For Assignment 8 (Visual AI Workflow Editor)
1. Switch to the `assignment-8` branch:
   ```bash
   git checkout assignment-8
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 8"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env.local` file with your OpenRouter API key and Inngest config (see above).
5. Start the Next.js dev server:
   ```bash
   npm run dev
   ```
6. In a separate terminal, start the Inngest Dev Server:
   ```bash
   npx inngest-cli@latest dev
   ```

### For Assignment 9 (Task Summary PDF Report Generator)
1. Switch to the `assignment-9` branch:
   ```bash
   git checkout assignment-9
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 9"
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Configure `.env` and start the service:
   ```bash
   npm start
   ```
