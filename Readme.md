# FlyRank Internship Tasks - Assignment 4
This repository contains tasks and assignments completed during the FlyRank Internship up to Assignment 4.
## Assignments Index
* **Assignment 1: Task API (In-Memory)**: A lightweight in-memory CRUD API for managing a to-do list.
* **Assignment 2: SQLite Migration**: Migrated the storage layer of the Task API to a SQLite database file.
* **Assignment 3: Postgres & Docker Compose**: Migrated storage to a PostgreSQL container.
* **Assignment 4: Supabase Authentication**: Integrated Supabase Auth as the Identity Provider, adding signup, login, logout, and protected route middlewares.
---
# Supabase Authentication - Assignment 4
This section covers the integration of Supabase Auth as the Identity Provider for the Task API.
## Required Environment Variables (.env)
Create a `.env` file in the `Assignment 1-2-3-4` directory with these configurations:
```ini
DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
SUPABASE_URL=https://your-supabase-project-id.supabase.co
SUPABASE_KEY=your-supabase-anon-key-here
PORT=3000
```

# How to Run the Project
## Option A: Run via Docker Compose (Recommended)
1. Make sure Docker Desktop is running.
2. Open your terminal in the Assignment 1-2-3 folder:
   ```bash
   cd "Assignment 1-2-3"
   ```
3. Build and start both the API and database containers
   ```bash
   docker compose up --build
   ```
## Option B: Run Locally
1. Make sure you have a running PostgreSQL database instance on your machine.
2. Open your terminal in the Assignment 1-2-3 folder:
   ```bash
   cd "Assignment 1-2-3"
   ```
3. cd "Assignment 1-2-3"
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm start
   ```
5. Access the API at http://localhost:3000 or the interactive Swagger docs at http://localhost:3000/docs.


