# VOID Task Manager

A production-ready, full-stack task management system with a space-themed UI, real-time updates via Socket.io, drag-and-drop Kanban board, and RBAC (Manager / User roles).

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), Socket.io, JWT (access + refresh tokens), bcryptjs, Helmet, Rate Limiting

**Frontend:** React 18, Vite, Tailwind CSS, Framer Motion, Zustand, @hello-pangea/dnd, React Hook Form + Zod, Socket.io Client

---

## Project Structure

```
void-task-manager/
├── server/          # Express API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
└── client/          # React SPA
    └── src/
        ├── components/
        ├── context/     # Zustand stores
        ├── hooks/
        ├── pages/
        ├── services/
        └── utils/
```

---

## Setup & Run

### 1. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

### 2. Environment variables

The `server/.env` file is pre-configured with your MongoDB credentials.
To customise, copy `server/.env.example` and edit as needed.

### 3. Run in development

**Terminal 1 — API Server:**
```bash
cd server
npm run dev
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open **http://localhost:5173**

---

## Features

- 🔐 JWT Auth with auto-refresh (access token 15m, refresh token 7d via httpOnly cookie)
- 👥 RBAC: **Manager** (create/edit/delete tasks, view all users) vs **User** (view/update own tasks)
- 📋 Kanban board with drag-and-drop across columns (todo → in-progress → review → completed)
- ⚡ Real-time updates via Socket.io (task created/updated/deleted instantly synced)
- 🎬 High-tech animations: orbit rings, star field, shooting stars, holographic shimmer, floating cards
- 📊 Dashboard with animated count-up stats
- 📜 Activity log with pagination and action filtering
- 🔔 Toast notifications (success/error/info/warning)
- 🛡️ Helmet, CORS, rate limiting (100 req/15min general, 10 req/15min auth)

---

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | /api/v1/auth/signup | Public |
| POST | /api/v1/auth/login | Public |
| POST | /api/v1/auth/logout | Public |
| POST | /api/v1/auth/refresh | Public |
| GET | /api/v1/auth/me | Protected |

### Tasks
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/tasks | Protected |
| GET | /api/v1/tasks/:id | Protected |
| POST | /api/v1/tasks | Manager |
| PUT | /api/v1/tasks/:id | Manager |
| PATCH | /api/v1/tasks/:id/status | Protected |
| PATCH | /api/v1/tasks/:id/order | Protected |
| DELETE | /api/v1/tasks/:id | Manager |

### Users
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/users | Manager |
| GET | /api/v1/users/:id | Protected |
| PATCH | /api/v1/users/:id | Protected |

### Activity
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | /api/v1/activity | Protected |
| GET | /api/v1/activity/task/:id | Protected |

---

## Roles

**Manager**
- Create, edit, delete any task
- Assign tasks to any user
- View all users and activity

**User**
- View own assigned tasks
- Update status of own tasks
- Mark tasks as complete

---

## Production Build

```bash
npm run build
npm run start
```

This will build the client app and start the Express API server. In production, the server will serve the React build from `client/dist`.
