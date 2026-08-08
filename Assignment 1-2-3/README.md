# Task API - Assignment 1

A simple, lightweight, and brutalist in-memory CRUD API for a to-do list application built using Node.js and Express.

## Install and Run

First, navigate to the `Assignment 1-2-3` directory:
```bash
cd "Assignment 1-2-3"
```

To install dependencies:
```bash
npm install
```

To run the server:
```bash
npm start
```
The application will start and listen on port **3000** (e.g., http://localhost:3000).

## Endpoints

| Method | Path | Description | Expected Status Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Returns JSON describing the API. | `200` |
| `GET` | `/health` | Returns the health status of the API. | `200` |
| `GET` | `/tasks` | Returns the full list of tasks. | `200` |
| `GET` | `/tasks/:id` | Returns a single task by ID. | `200` or `404` |
| `POST` | `/tasks` | Creates a new task (body requires `{"title": "string"}`). | `201` or `400` |
| `PUT` | `/tasks/:id` | Updates a task's title and/or done status. | `200`, `400`, or `404` |
| `DELETE` | `/tasks/:id` | Deletes a task. | `204` or `404` |

*Interactive Swagger API documentation is served at `/docs`.*

## Example curl Output (GET /tasks)

Below is an example of the command-line output for a successful request to fetch the list of tasks:

```http
$ curl -i http://localhost:3000/tasks

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 147
ETag: W/"93-gG58Jjj2AWXUq/mTKPJIvoPdwhk"
Date: Thu, 06 Aug 2026 08:14:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":1,"title":"Learn Express","done":true},{"id":2,"title":"Build Task API","done":false},{"id":3,"title":"Document with Swagger","done":false}]
```

## Swagger Documentation Screenshot

![Swagger UI Documentation](swagger_screenshot.png)

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
- It is created automatically in the root of the project folder (`Assignment 1-2-3`) upon the first startup.
- The `.gitignore` file has been updated to explicitly ignore `tasks.db`, preventing local databases from being pushed to version control.

## Install and Run

First, install dependencies (including the newly added `better-sqlite3` package):
```bash
npm install
```

Start the application:
```bash
npm start
```

## Example raw SQL Query (Manual Running)
If you open the `tasks.db` database using a CLI client or DB Browser for SQLite, you can manually run this query to view all tasks sorted by status:
```sql
SELECT id, title, done FROM tasks ORDER BY done ASC;
```

## Example curl Output (GET /tasks/2)
Below is the output for a successful request retrieving a seeded task from the SQLite database:
```http
$ curl -i http://localhost:3000/tasks/2

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 46
ETag: W/"2e-FUIvtQAz+AhbsnTuHAzGtbD4FCU"
Date: Fri, 07 Aug 2026 11:00:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":2,"title":"Build Task API","done":false}
```

## DB Browser Screenshot

*[Placeholder: Insert screenshot of the tasks database schema and data inside DB Browser for SQLite here]*
```
[DB Browser for SQLite Screenshot Placeholder]
```

---

# Postgres & Docker Compose Migration - Assignment 3

This section covers the migration from SQLite to PostgreSQL running in a Docker container, and how to orchestrate the entire stack.

## Environment Variables (.env)
- Before running, configure the database connection string in a `.env` file.
- You can copy `.env.example` to create `.env`:
  ```bash
  DATABASE_URL=postgres://postgres:dev@localhost:5432/tasks
  ```

## How to Run Everything (Docker Compose)
To download Postgres, compile the API, and start both services in the background:
```bash
docker compose up --build
```
*The database container will spin up first, wait until it is ready to receive requests, and then launch the Task API on port 3000.*

To stop the containers:
```bash
docker compose down
```
*The named volume `taskdata` ensures all your to-do lists remain persisted even after running `docker compose down`.*

## Example raw SQL Query (Manual Running)
You can run this query using a GUI (like pgAdmin or DBeaver) or CLI (like `psql`) inside the database container to inspect your tasks:
```sql
SELECT id, title, done FROM tasks ORDER BY id ASC;
```

## Example curl Output (GET /tasks/1)
Below is the output for a successful request retrieving a task from the Postgres database:
```http
$ curl -i http://localhost:3000/tasks/1

HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 45
ETag: W/"2d-fa5Vh2AgfjfscS5ZazeNq28w9Pk"
Date: Sat, 08 Aug 2026 12:00:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"id":1,"title":"Learn Express","done":true}
```

## Database Screenshot

*[Placeholder: Insert screenshot of the tasks database schema and data inside pgAdmin / DBeaver / psql here]*
```
[PostgreSQL Database Screenshot Placeholder]
```
