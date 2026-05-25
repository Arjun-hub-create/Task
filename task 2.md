# VOID Task Manager

## Project Overview

VOID Task Manager is a full-stack task tracking application built for collaboration and clean task management. The backend provides secured REST APIs, and the frontend is a React/Vite dashboard. The system supports manager and user roles, task CRUD operations, live updates, and activity logging.

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose
- Frontend: React, Vite, Tailwind CSS
- Real-time: Socket.io
- Security: JWT, Helmet, CORS, rate limiting
- Deployment: Vercel support for frontend and backend

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/void-task-manager.git
   cd void-task-manager
   ```
2. Install dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. Create environment files:
   - `server/.env`
   - `client/.env` (if needed for local override)
4. Start the app locally:
   ```bash
   cd ..
   npm run dev
   ```

## Run Commands

- Install both app dependencies: `npm run install:all`
- Start frontend and backend together: `npm run dev`
- Start backend only: `npm run dev:server`
- Start frontend only: `npm run dev:client`
- Build the frontend: `npm run build`
- Start production mode: `npm run start`

## Environment Variables

Create a `.env` file in the `server` folder with the following values:

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/void_taskmanager
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
BCRYPT_SALT_ROUNDS=12
MONGODB_RETRY_ATTEMPTS=5
MONGODB_RETRY_DELAY_MS=2000
```

> If you use MongoDB Atlas, set `MONGODB_URI` to your Atlas connection string.

## Deployment Info

- The backend is configured to serve a production build of the frontend when `NODE_ENV=production`.
- For Vercel deployment, the backend can be deployed as a serverless function or standard Node service if the project is split into separate services.
- Make sure environment variables are configured in the hosting provider.

## Sample Login Credentials

This repository does not ship with seeded users. Use the sign-up endpoint to create an account.

Example sign-up payload for a manager:

```json
{
  "username": "astroadmin",
  "email": "manager@example.com",
  "password": "Password123",
  "role": "manager"
}
```

Example login payload:

```json
{
  "email": "manager@example.com",
  "password": "Password123"
}
```

## API Documentation

### Base URL

- Local development: `http://localhost:5000/api/v1`

### Authentication Endpoints

#### POST /auth/signup

Create a new user account.

- Body:
  - `username` (string, required)
  - `email` (string, required)
  - `password` (string, required)
  - `role` (string, optional, `user` or `manager`)

Sample request:

```json
{
  "username": "astroadmin",
  "email": "manager@example.com",
  "password": "Password123",
  "role": "manager"
}
```

Sample response:

```json
{
  "success": true,
  "message": "Account created successfully.",
  "accessToken": "...",
  "user": {
    "_id": "...",
    "username": "astroadmin",
    "email": "manager@example.com",
    "role": "manager",
    "avatarColor": "#00F5FF",
    "createdAt": "2026-05-25T00:00:00.000Z"
  }
}
```

Status codes:
- `201` Created
- `400` Validation error or missing fields
- `409` Duplicate email/username

#### POST /auth/login

Login and receive an access token.

- Body:
  - `email` (string, required)
  - `password` (string, required)

Sample response:

```json
{
  "success": true,
  "message": "Login successful.",
  "accessToken": "...",
  "user": {
    "_id": "...",
    "username": "astroadmin",
    "email": "manager@example.com",
    "role": "manager",
    "avatarColor": "#00F5FF",
    "lastLogin": "2026-05-25T00:00:00.000Z"
  }
}
```

Status codes:
- `200` OK
- `400` Missing email or password
- `401` Invalid credentials or deactivated account

#### POST /auth/logout

Clear the refresh token cookie.

Sample response:

```json
{
  "success": true,
  "message": "Logged out successfully."
}
```

#### POST /auth/refresh

Refresh the access token using the refresh cookie.

Status codes:
- `200` OK
- `401` No token or invalid token

#### GET /auth/me

Returns the current authenticated user.

Requires authentication header: `Authorization: Bearer <token>`.

Sample response:

```json
{
  "success": true,
  "user": {
    "_id": "...",
    "username": "astroadmin",
    "email": "manager@example.com",
    "role": "manager",
    "avatarColor": "#00F5FF",
    "lastLogin": "2026-05-25T00:00:00.000Z",
    "createdAt": "2026-05-25T00:00:00.000Z"
  }
}
```

### Task Endpoints

All `/tasks` routes require authentication. Manager-only routes are protected with role checks.

#### GET /tasks

Retrieve a paginated list of tasks.

Query parameters:
- `page` (number, optional)
- `limit` (number, optional)
- `status` (string, optional)
- `priority` (string, optional)
- `assignedTo` (user ID, optional)
- `search` (string, optional)
- `sortBy` (string, optional, defaults to `order`)
- `order` (string, optional, `asc` or `desc`)

Sample response:

```json
{
  "success": true,
  "tasks": [
    {
      "_id": "...",
      "title": "Launch prep",
      "description": "Finalize briefing",
      "status": "todo",
      "priority": "high",
      "assignedTo": {
        "_id": "...",
        "username": "crewuser",
        "email": "crew@example.com"
      },
      "createdBy": {
        "_id": "...",
        "username": "astroadmin"
      }
    }
  ],
  "currentPage": 1,
  "totalPages": 1,
  "totalTasks": 1,
  "hasNextPage": false,
  "hasPrevPage": false
}
```

Status codes:
- `200` OK
- `401` Unauthorized

#### GET /tasks/:id

Get one task by ID.

Sample response:

```json
{
  "success": true,
  "task": {
    "_id": "...",
    "title": "Launch prep",
    "description": "Finalize briefing",
    "status": "todo",
    "priority": "high",
    "assignedTo": { "_id": "...", "username": "crewuser" },
    "createdBy": { "_id": "...", "username": "astroadmin" }
  }
}
```

Status codes:
- `200` OK
- `403` Access denied for regular users on unassigned tasks
- `404` Not found

#### POST /tasks

Create a new task (manager only).

- Body:
  - `title` (string, required)
  - `description` (string, optional)
  - `status` (string, optional, default `todo`)
  - `priority` (string, optional, default `medium`)
  - `assignedTo` (user ID, required)
  - `dueDate` (ISO string, optional)
  - `tags` (array of strings, optional)

Sample request:

```json
{
  "title": "Check fuel levels",
  "description": "Confirm fuel status before launch",
  "priority": "high",
  "assignedTo": "648abc123def456ghi789jkl",
  "dueDate": "2026-06-01T12:00:00.000Z",
  "tags": ["launch", "critical"]
}
```

Sample response:

```json
{
  "success": true,
  "task": {
    "_id": "...",
    "title": "Check fuel levels",
    "status": "todo",
    "priority": "high",
    "assignedTo": { "_id": "...", "username": "crewuser" },
    "createdBy": { "_id": "...", "username": "astroadmin" }
  }
}
```

Status codes:
- `201` Created
- `400` Missing title or assignedTo
- `403` Forbidden for non-manager users

#### PUT /tasks/:id

Update a task completely (manager only).

Body fields are the same as POST /tasks.

Status codes:
- `200` OK
- `400` Validation error
- `403` Forbidden
- `404` Not found

#### PATCH /tasks/:id/status

Update only the task status.

- Body:
  - `status` (string, required, one of `todo`, `in-progress`, `review`, `completed`)

Status codes:
- `200` OK
- `400` Invalid status
- `403` Forbidden for unauthorized updates
- `404` Not found

#### PATCH /tasks/:id/order

Update task order and optionally task status.

- Body:
  - `order` (number, required)
  - `status` (string, optional)

Status codes:
- `200` OK
- `404` Not found

#### DELETE /tasks/:id

Delete a task (manager only).

Status codes:
- `200` OK
- `403` Forbidden
- `404` Not found

## Field Reference

Common task fields:
- `title` - task title
- `description` - task details
- `status` - current progress stage
- `priority` - priority level
- `assignedTo` - user ID of the assigned teammate
- `createdBy` - user who created the task
- `dueDate` - due date
- `tags` - task labels
- `order` - list position used for sorting

User fields:
- `username`
- `email`
- `password`
- `role` (`user` or `manager`)

## Notes for a New Intern

- Use the `server` folder for backend work and the `client` folder for the React UI.
- The backend listens on `5000` by default and the frontend on `5173`.
- The app does not include seeded credentials, so first sign up or add a user in the database.
- Manager role is required for task creation, updates, and deletion.

---

## Helpful Quick Guide

1. Install dependencies.
2. Create `server/.env` with MongoDB and JWT secrets.
3. Start `npm run dev`.
4. Sign up a manager account.
5. Use the dashboard or Postman to call task APIs.

Good luck, and welcome to VOID Task Manager! 👩‍🚀👨‍🚀
