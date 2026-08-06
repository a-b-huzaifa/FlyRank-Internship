# Task API - Assignment 1

A simple, lightweight, and brutalist in-memory CRUD API for a to-do list application built using Node.js and Express.

## Install and Run

First, navigate to the `Assignment 1` directory:
```bash
cd "Assignment 1"
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

