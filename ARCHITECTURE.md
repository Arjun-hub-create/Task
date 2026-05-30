# VOID Task Manager - Architecture Document

## 1. Project Overview
VOID is a space-themed full-stack task management application. The solution is split into:
- **Backend**: Node.js + Express + MongoDB + Socket.io
- **Frontend**: React + Vite + Zustand + Socket.io client

The system is designed around three operational layers:
1. **Entry layer**: HTTP server startup, middleware, static hosting, and route registration.
2. **Core business layer**: authentication, authorization, task CRUD, user management, activity logging.
3. **Realtime sync layer**: Socket.io server broadcast + client listeners + Zustand state updates.

---


## 2. Folder Structure and Responsibilities

### Backend (`server/`)
- `server/server.js` — Express boot, middleware, route mounting, Socket.io initialization, health endpoint, production fallback.
- `server/config/` — DB connection and Socket.io server setup.
- `server/controllers/` — business logic for auth, tasks, users, and activity logs.
- `server/middleware/` — JWT auth, role checks, rate limiting, and error handling.
- `server/models/` — MongoDB schemas and password hashing logic.
- `server/routes/` — endpoint registration and RBAC attachment.
- `server/utils/` — JWT token helpers.

### Frontend (`client/src/`)
- `client/src/main.jsx` — React entry point.
- `client/src/App.jsx` — router, route guards, Socket initialization, auth bootstrap.
- `client/src/context/` — Zustand stores for auth, tasks, and UI state.
- `client/src/hooks/useSocket.js` — Socket.io client lifecycle and event subscriptions.
- `client/src/pages/` — login, signup, dashboard, task board, activity log.
- `client/src/components/` — reusable UI, dashboard widgets, task UI, layout.
- `client/src/services/` — Axios and service wrappers for API communication.
- `client/src/utils/` — helper functions and animation presets.

---

## 3. Execution Sequence (Complete Working Flow)


### 3.1 Backend boot sequence
1. `server/server.js` loads environment variables and initializes Express, HTTP server, and Socket.io.
   - `initSocket(httpServer)` at `server/server.js:24` starts the WebSocket layer.
   - `connectDB()` at `server/server.js:27` connects MongoDB.
2. Middleware stack is attached in order:
   - CORS: `server/server.js:31`
   - JSON parsing: `server/server.js:37`
   - URL-encoded parsing: `server/server.js:38`
   - cookie parsing: `server/server.js:39`
3. Route registration happens at `server/server.js:59-62`:
   - `/api/v1/auth` → auth routes
   - `/api/v1/tasks` → task routes
   - `/api/v1/users` → user routes
   - `/api/v1/activity` → activity routes
4. Health endpoint `/health` is exposed at `server/server.js:54`.
5. In production, the server serves the compiled frontend from `client/dist` and falls back for SPA routes at `server/server.js:65-74`.
6. The HTTP server starts listening on the configured port at `server/server.js:83`.

### 3.2 Frontend boot sequence
1. `client/src/main.jsx:6` mounts React into the DOM using `ReactDOM.createRoot`.
2. `client/src/App.jsx` is the root application file.
   - `ProtectedRoute` and `PublicRoute` are defined at `client/src/App.jsx:17-27`.
   - `SocketInit` is mounted at `client/src/App.jsx:29` and `client/src/App.jsx:83`.
   - `AppRoutes` mounts all route definitions at `client/src/App.jsx:35-48`.
3. On app load, `AppInit` checks `localStorage` for `void_access_token` and calls `fetchMe()` if a token exists at `client/src/App.jsx:53-58`.
4. The frontend uses `Vite` dev proxy rules from `client/vite.config.js` so `/api` and `/socket.io` proxy to the backend during development.


### 3.3 Authentication sequence
1. The user opens the login or signup pages:
   - `client/src/pages/Login.jsx:31` calls `login(data)` from Zustand.
   - `client/src/pages/Signup.jsx:37` calls `signup({ ...data, role })`.
2. The Zustand auth store in `client/src/context/AuthContext.jsx:4-62` controls login, signup, logout, and token validation.
   - On successful login or signup, `localStorage.setItem('void_access_token', accessToken)` is executed at `client/src/context/AuthContext.jsx:16` and `client/src/context/AuthContext.jsx:31`.
   - The store updates `user`, `token`, and `isAuthenticated` states at `client/src/context/AuthContext.jsx:17` and `client/src/context/AuthContext.jsx:32`.
3. All API calls go through `client/src/services/authService.js` and `client/src/services/api.js`.
   - `client/src/services/api.js:12` creates the Axios instance.
   - Request interceptor attaches `Bearer` token at `client/src/services/api.js:19-25`.
   - Response interceptor handles `401` refresh and token rotation at `client/src/services/api.js:43-75`.
4. Backend auth controller handles registration and login:
   - `server/controllers/authController.js:13` starts signup flow.
   - `server/controllers/authController.js:57` starts login flow.
   - `server/controllers/authController.js:34` and `server/controllers/authController.js:77` generate tokens and set the refresh cookie.
   - `server/controllers/authController.js:106` validates refresh token using `jwt.verify(...)`.
5. Tokens are generated by `server/utils/generateToken.js`:
   - access token signed with `jwt.sign(..., process.env.JWT_SECRET, ...)` at `server/utils/generateToken.js:3-7`.
   - refresh token signed with `jwt.sign(..., process.env.JWT_REFRESH_SECRET, ...)` at `server/utils/generateToken.js:9-13`.
6. Password hashing uses bcrypt inside the user schema:
   - `server/models/User.js:4` defines the schema.
   - `server/models/User.js:55` runs `bcrypt.hash(...)` before save.
   - `server/models/User.js:62` exposes `comparePassword()` for login.
7. The JWT guard verifies access tokens on every secure request:
   - `server/middleware/auth.js:4` runs `protect()`.
   - `server/middleware/auth.js:16` verifies the token using `jwt.verify(token, process.env.JWT_SECRET)`.
   - `server/middleware/auth.js:20-33` attaches the authenticated user and returns structured errors.
8. Role checks are enforced with RBAC middleware:
   - `server/middleware/rbac.js:1` exports `checkRole()`.
   - `server/routes/taskRoutes.js:19-23` locks create/update/delete routes to managers.
   - `server/routes/userRoutes.js:9` restricts user listing to managers.


### 3.4 Task lifecycle sequence
1. The task board page loads and fetches data:
   - `client/src/pages/Tasks.jsx:12-17` loads tasks and users.
   - `client/src/pages/Dashboard.jsx:15-21` loads tasks, activity, and user summaries.
2. The task store in `client/src/context/TaskContext.jsx:4-116` manages task state, activity, and filters.
   - `fetchTasks()` uses `taskService.getAll()` at `client/src/context/TaskContext.jsx:13-25`.
   - `createTask()` calls `taskService.create()` at `client/src/context/TaskContext.jsx:31-39`.
   - `updateStatus()` calls `taskService.updateStatus()` at `client/src/context/TaskContext.jsx:53-61`.
3. The task creation form is rendered by `client/src/components/tasks/TaskForm.jsx`.
   - `TaskForm` uses React Hook Form / Zod schema at `client/src/components/tasks/TaskForm.jsx:12-23`.
   - On submit it builds the payload and calls `createTask()` or `updateTask()` at `client/src/components/tasks/TaskForm.jsx:50-67`.
4. Drag-and-drop status change happens in `client/src/components/tasks/TaskBoard.jsx`.
   - `handleDragEnd()` starts at `client/src/components/tasks/TaskBoard.jsx:35`.
   - It optimistically updates via `socketUpdateTask(...)` at `client/src/components/tasks/TaskBoard.jsx:45`.
   - The backend update is sent through `taskService.updateOrder()` at `client/src/components/tasks/TaskBoard.jsx:48`.
5. Backend task controller handles the business logic:
   - `server/controllers/taskController.js:28-29` filters tasks for normal users so they only see assigned tasks.
   - `server/controllers/taskController.js:46-47` counts and fetches tasks.
   - `server/controllers/taskController.js:91` begins task creation.
   - `server/controllers/taskController.js:100` calculates order.
   - `server/controllers/taskController.js:103` saves the task.
   - `server/controllers/taskController.js:120` creates an activity log.
   - `server/controllers/taskController.js:130` broadcasts `task:created`.
   - `server/controllers/taskController.js:190` handles status updates.
   - `server/controllers/taskController.js:210` updates the database and activity trail.
   - `server/controllers/taskController.js:233` broadcasts `task:status`.
   - `server/controllers/taskController.js:278` deletes tasks.
   - `server/controllers/taskController.js:290` broadcasts `task:deleted`.


### 3.5 Activity and user management sequence
1. Activity logs are stored with `server/models/ActivityLog.js:3` and retrieved by `server/controllers/activityController.js:4`.
2. User listing is managed by `server/controllers/userController.js:4` and protected by RBAC.
3. The activity page uses `client/src/pages/ActivityLog.jsx:20-38` to fetch and display logs.


### 3.6 Realtime synchronization sequence
1. Socket.io server is created in `server/config/socket.js:1-35`.
   - `new Server(httpServer, ...)` at `server/config/socket.js:6` initializes WebSocket.
   - `io.on('connection', ...)` at `server/config/socket.js:14` handles each client connection.
   - `socket.on('join:workspace', ...)` at `server/config/socket.js:17` joins the shared workspace room.
2. The client creates its Socket.io instance in `client/src/hooks/useSocket.js:8-60`.
   - `socketInstance = io(socketUrl, ...)` at `client/src/hooks/useSocket.js:20` connects to backend.
   - `socketInstance.emit('join:workspace', user._id)` at `client/src/hooks/useSocket.js:27` registers the user.
   - `socketInstance.on('task:created', ...)` at `client/src/hooks/useSocket.js:30` pushes new tasks into local state.
   - `socketInstance.on('task:updated', ...)` and `socketInstance.on('task:status', ...)` at `client/src/hooks/useSocket.js:35` and `client/src/hooks/useSocket.js:43` update live task rows.
   - `socketInstance.on('task:deleted', ...)` at `client/src/hooks/useSocket.js:39` removes deleted tasks.
   - `socketInstance.on('activity:new', ...)` at `client/src/hooks/useSocket.js:47` appends live activity logs.
3. Because the backend uses `io.to('workspace').emit(...)` in task controller functions, any task change instantly updates all connected clients.

---

## 4. Frontend-to-Backend Bridge Details

### API bridge
- `client/src/services/api.js:4` determines the base URL.
- `client/src/services/api.js:19` attaches bearer tokens to every request.
- `client/src/services/api.js:43` refreshes expired tokens using `/auth/refresh`.
- `client/src/services/authService.js:3-7` exposes signup/login/logout/me wrappers.
- `client/src/services/taskService.js:3-17` exposes task, activity, and user APIs.


### Dev proxy and production connection
- `client/vite.config.js` proxies `/api` and `/socket.io` to the backend during development.
- `server/server.js:31-39` allows the frontend origin through CORS, enabling browser communication.


### Connection establishment (backend ↔ frontend)
- The backend establishes the API and realtime server in `server/server.js` by creating the HTTP server, initializing Socket.io at `server/server.js:23-27`, and registering `/api/v1/*` routes at `server/server.js:58-62`.
- The Socket.io server itself is created in `server/config/socket.js` with `new Server(httpServer, ...)` at `server/config/socket.js:5-12`, then listens for `connection` and `join:workspace` events at `server/config/socket.js:14-20`.
- The frontend forwards browser requests to the backend during local development through the Vite proxy in `client/vite.config.js:6-17`, where `/api` and `/socket.io` point to `http://localhost:5000`.
- HTTP communication is created by Axios in `client/src/services/api.js:12-16`, with the base URL chosen in `client/src/services/api.js:4-10`, bearer token attachment in `client/src/services/api.js:18-29`, and refresh handling in `client/src/services/api.js:31-85`.
- Realtime browser connections are opened in `client/src/hooks/useSocket.js:16-23` via `io(socketUrl, ...)`, and the app mounts that socket initializer through `client/src/App.jsx:27-31` and `client/src/App.jsx:79-86`.

---

## 5. Route Responsibilities

### Auth routes (`server/routes/authRoutes.js`)
- `POST /api/v1/auth/signup` → register user, hash password, return accessToken + refresh cookie.
- `POST /api/v1/auth/login` → validate credentials, return accessToken.
- `POST /api/v1/auth/logout` → clear refresh cookie.
- `POST /api/v1/auth/refresh` → rotate access token from refresh cookie.
- `GET /api/v1/auth/me` → return current authenticated user.

### Task routes (`server/routes/taskRoutes.js`)
- `GET /api/v1/tasks` → list tasks (normal users see only their assigned tasks).
- `GET /api/v1/tasks/:id` → fetch single task.
- `POST /api/v1/tasks` → create task (manager only).
- `PUT /api/v1/tasks/:id` → update task (manager only).
- `PATCH /api/v1/tasks/:id/status` → update status.
- `PATCH /api/v1/tasks/:id/order` → reorder task in drag-drop board.
- `DELETE /api/v1/tasks/:id` → delete task (manager only).

### User routes (`server/routes/userRoutes.js`)
- `GET /api/v1/users` → list all active users (manager only).
- `GET /api/v1/users/:id` → fetch one user profile.
- `PATCH /api/v1/users/:id` → update own or managed profile.

### Activity routes (`server/routes/activityRoutes.js`)
- `GET /api/v1/activity` → fetch filtered activity logs.
- `GET /api/v1/activity/task/:id` → fetch activity for a specific task.

---

## 6. Main Code Points Summary

| Area | Main file | Important line / behavior |
|---|---|---|
| Backend startup | `server/server.js` | initializes Socket.io at `24`, connects DB at `27`, mounts routes at `59-62`, starts server at `83` |
| JWT signing | `server/utils/generateToken.js` | access token at `3-7`, refresh token at `9-13` |
| JWT verification | `server/middleware/auth.js` | verifies token at `16`, attaches user at `20-33` |
| Password hashing | `server/models/User.js` | `bcrypt.hash()` at `55`, `comparePassword()` at `62` |
| Socket.io server | `server/config/socket.js` | server init at `6`, connection handler at `14`, workspace join at `17` |
| Auth controller | `server/controllers/authController.js` | signup `13`, login `57`, refresh `106` |
| Task controller | `server/controllers/taskController.js` | create at `91-134`, status update at `190-233`, delete at `274-290` |
| Frontend boot | `client/src/main.jsx` and `client/src/App.jsx` | React mount at `main.jsx:6`, guards and socket init in `App.jsx` |
| Zustand auth state | `client/src/context/AuthContext.jsx` | login/signup token persistence at `16`, `31`, fetchMe at `51` |
| Zustand task state | `client/src/context/TaskContext.jsx` | task CRUD and live updates at `13-67`, socket handlers at `73-87` |
| Socket client | `client/src/hooks/useSocket.js` | connection at `20`, workspace join at `27`, event listeners at `30-47` |
| Frontend API layer | `client/src/services/api.js` | request intercept at `19`, refresh logic at `43-75` |
| Task board UI | `client/src/components/tasks/TaskBoard.jsx` | drag-and-drop at `35`, live status sync at `45-48` |
| Task form | `client/src/components/tasks/TaskForm.jsx` | submit payload and create/update at `50-67` |

---

## 7. Feature Behavior Summary

- **Signup / login**: credentials are validated on the client, sent through Axios, hashed with bcrypt on the server, and tokens are issued. Refresh tokens are stored in a secure cookie while the access token stays in browser storage.
- **Protected routes**: secure API routes require JWT verification; role-specific routes check manager permissions.
- **Task management**: managers can create, update, delete, and assign tasks; normal users only see and update their own assigned tasks.
- **Realtime updates**: the backend broadcasts task changes over Socket.io; all connected clients update instantly without reload.
- **Activity feed**: every task create/update/status/delete generates an activity log visible in the dashboard and activity page.
- **Frontend state**: Zustand stores keep auth, task, and UI data synchronized across pages and socket events.

---

## 8. End-to-End Example

### Creating a task
1. Manager opens the task form in `client/src/components/tasks/TaskForm.jsx` and submits the data.
2. `createTask()` in `client/src/context/TaskContext.jsx` sends the POST request through `taskService.create()`.
3. `server/controllers/taskController.js:91-134` validates, saves the task, records activity, and emits `task:created`.
4. Connected clients receive `task:created` through `client/src/hooks/useSocket.js`, and the Zustand task store updates instantly.

### Updating task status
1. User drags a task card in `client/src/components/tasks/TaskBoard.jsx:35`.
2. The board optimistically updates and sends `taskService.updateOrder()`.
3. Backend `server/controllers/taskController.js:190-233` updates the task and emits `task:status`.
4. All connected users see the updated board immediately.

### Logging in
1. User enters credentials on `client/src/pages/Login.jsx`.
2. Zustand `login()` sends the request through Axios.
3. Backend `server/controllers/authController.js:57` checks password via `bcrypt.compare()` and returns tokens.
4. Frontend stores the token and protects routes until logout.

---

## 9. Final Notes

This project is built as a connected full-stack system where:
- Express handles HTTP, auth, validation, and business rules.
- MongoDB stores users, tasks, and activity logs.
- Socket.io keeps all clients in sync in real time.
- React + Zustand provides a responsive UI with persistent auth state.

The main integration points are the Axios bridge in `client/src/services/api.js`, the Socket client in `client/src/hooks/useSocket.js`, and the route / controller wiring in `server/server.js`, `server/routes/*`, and `server/controllers/*`.
