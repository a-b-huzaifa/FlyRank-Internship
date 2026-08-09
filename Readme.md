# FlyRank Internship Tasks - Assignment 2
This repository contains tasks and assignments completed during the FlyRank Internship up to Assignment 2.
## Assignments Index
* **Assignment 1: Task API (In-Memory)**: A lightweight in-memory CRUD API for managing a to-do list.
* **Assignment 2: SQLite Migration**: Migrated the storage layer of the Task API to a local SQLite database file, maintaining identical endpoint behavior and schemas.
---
# In-Memory Task API - Assignment 1
A simple, lightweight, and brutalist in-memory CRUD API for a to-do list application built using Node.js and Express. (See endpoints below).
---
# SQLite Migration - Assignment 2
This section details the migration of the storage layer from an in-memory JavaScript array to a real SQLite database.
## Why SQLite was chosen
- **Zero Configuration**: No need to install and manage a database server like MySQL or PostgreSQL; SQLite uses a single serverless file.
- **Performance**: High-speed, robust relational database engine with excellent read performance.
- **Development Ease**: The `better-sqlite3` library provides a synchronous execution API, which matches Node's synchronous execution model nicely without needing complex async/await boilerplate across all routes.
- **Reliability**: Supports ACID compliance, ensuring tasks are safely stored and transactions are handled robustly.
## Database File & Git-Ignore
- The database file is named **`tasks.db`**.
- It is created automatically in the root of the project folder (`Assignment 1-2`) upon the first startup.
- The `.gitignore` file has been updated to explicitly ignore `tasks.db`, preventing local databases from being pushed to version control.
## Install and Run
1. Open your terminal in the root folder:
   ```bash
   cd "Assignment 1-2"
