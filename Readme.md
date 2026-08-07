# FlyRank Internship Tasks

This repository contains tasks and assignments completed during the FlyRank Internship.

## Assignments Index

| Folder | Project Name | Description | Tech Stack |
| :--- | :--- | :--- | :--- |
| [Assignment 1-2](./Assignment%201-2) | **Assignment 1: Task API (In-Memory)** | A lightweight in-memory CRUD API for managing a to-do list with interactive Swagger documentation. | Node.js, Express.js, Swagger UI |
| [Assignment 1-2](./Assignment%201-2) | **Assignment 2: SQLite Migration** | Migrated the storage layer of the Task API to a local SQLite database file, maintaining identical endpoint behavior and schemas. | Node.js, Express.js, SQLite (better-sqlite3), Swagger UI |

---

### How to Run Assignments

The source code for both assignments resides in the **`Assignment 1-2`** directory (with Assignment 2 representing the persistent database version of the API).

To run the application:
1. Open your terminal in the [Assignment 1-2](./Assignment%201-2) folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Access the API at `http://localhost:3000` or interactive docs at `http://localhost:3000/docs`.
