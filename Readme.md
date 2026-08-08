# FlyRank Internship Tasks

This repository contains tasks and assignments completed during the FlyRank Internship.

## Assignments Index

| Folder | Project Name | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| [Assignment 1-2-3](./Assignment%201-2-3) | **Assignment 1: Task API (In-Memory)** | A lightweight in-memory CRUD API for managing a to-do list with interactive Swagger documentation. | Node.js, Express.js, Swagger UI |
| [Assignment 1-2-3](./Assignment%201-2-3) | **Assignment 2: SQLite Migration** | Migrated the storage layer of the Task API to a local SQLite database file, maintaining identical endpoint behavior and schemas. | Node.js, Express.js, SQLite, Swagger UI |
| [Assignment 1-2-3](./Assignment%201-2-3) | **Assignment 3: Postgres & Docker Compose** | Migrated storage to a PostgreSQL container, containerized the Node app, and orchestrated the stack using Docker Compose. | Node.js, Express.js, PostgreSQL (pg), Docker, Docker Compose, Swagger UI |

---

### How to Run Assignments

The source code for the latest state of the assignments resides in the **`Assignment 1-2-3`** directory on the `main` branch (with Assignment 3 representing the fully dockerized Postgres version of the API).

#### To run via Docker Compose (Assignment 3 - Recommended)
1. Open your terminal in the [Assignment 1-2-3](./Assignment%201-2-3) folder.
2. Build and start both the API and database containers:
   ```bash
   docker compose up --build
   ```
3. Access the API at `http://localhost:3000` or interactive docs at `http://localhost:3000/docs`.

#### To run locally (with local Postgres instance)
1. Copy `.env.example` to `.env` and configure your database URL.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```

---

### Running a Specific Assignment Version via Git Branches

If you want to checkout and run a specific assignment version using its dedicated git branch:

#### For Assignment 1 (In-Memory Version)
1. Switch to the `Assignment-1` branch:
   ```bash
   git checkout Assignment-1
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 1"
   ```
3. Install and start:
   ```bash
   npm install
   npm start
   ```

#### For Assignment 2 (SQLite Database Version)
1. Switch to the `assignment-2` branch:
   ```bash
   git checkout assignment-2
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 1-2"
   ```
3. Install and start:
   ```bash
   npm install
   npm start
   ```

#### For Assignment 3 (Postgres & Docker Compose Version)
1. Switch to the `main` (or `assignment-3`) branch:
   ```bash
   git checkout main
   ```
2. Navigate to the folder:
   ```bash
   cd "Assignment 1-2-3"
   ```
3. Run using Docker Compose:
   ```bash
   docker compose up --build
   ```

