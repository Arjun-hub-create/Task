# VOID Task Manager - Complete Architecture

## Overview

VOID is a full-stack task management application built with a space-themed interface. The system consists of two main parts:
- **Backend**: Node.js + Express API running on port 5000
- **Frontend**: React SPA with Vite running on port 5173

The entire application handles real-time task updates via Socket.io, manages user authentication with JWT tokens, and enforces role-based access control (RBAC) for managers and regular users.

---

## 1. Project Directory Structure

```
void-task-manager/
├── server/                    # Backend application
│   ├── config/               # Configuration modules
│   │   ├── db.js            # MongoDB connection
│   │   └── socket.js        # Socket.io initialization
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── taskController.js
│   │   ├── userController.js
│   │   └── activityController.js
│   ├── middleware/           # Express middlewares
│   │   ├── auth.js          # JWT verification
│   │   ├── errorHandler.js  # Error handling
│   │   ├── rbac.js          # Role-based access control
│   │   └── rateLimiter.js   # Rate limiting
│   ├── models/              # Mongoose schemas
│   │   ├── User.js
│   │   ├── Task.js
│   │   └── ActivityLog.js
│   ├── routes/              # API endpoints
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── userRoutes.js
│   │   └── activityRoutes.js
│   ├── utils/               # Utility functions
│   │   └── generateToken.js
│   ├── server.js            # Entry point
│   ├── .env                 # Environment variables
│   └── package.json
│
└── client/                   # Frontend application
    ├── src/
    │   ├── components/
    │   │   ├── ui/          # Reusable UI components
    │   │   ├── layout/      # Layout components (Navbar, Sidebar)
    │   │   ├── tasks/       # Task-specific components
    │   │   ├── dashboard/   # Dashboard components
    │   │   └── auth/        # Auth components
    │   ├── context/         # Zustand stores (state management)
    │   │   ├── AuthContext.jsx
    │   │   ├── TaskContext.jsx
    │   │   └── ThemeContext.jsx
    │   ├── hooks/           # Custom React hooks
    │   │   ├── useSocket.js
    │   │   └── useToast.js
    │   ├── pages/           # Page components
    │   │   ├── Landing.jsx
    │   │   ├── Login.jsx
    │   │   ├── Signup.jsx
    │   │   ├── Dashboard.jsx
    │   │   ├── Tasks.jsx
    │   │   └── ActivityLog.jsx
    │   ├── services/        # API clients
    │   │   ├── api.js       # Axios instance
    │   │   ├── authService.js
    │   │   └── taskService.js
    │   ├── utils/           # Helper functions
    │   │   ├── animations.js
    │   │   └── helpers.js
    │   ├── App.jsx          # Root component
    │   ├── main.jsx         # Entry point
    │   └── index.css        # Global styles
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 2. Authentication Flow

### 2.1 User Registration (Signup)

**Flow**: User → Frontend → Backend → Database → Frontend

1. **Frontend Entry** (`client/src/pages/Signup.jsx`)
   - User fills signup form with username, email, password, and selects role (OPERATIVE/COMMANDER)
   - Form validation using React Hook Form + Zod schemas
   - On submit, calls `useAuthStore.signup()` (line 27-35 in `AuthContext.jsx`)

2. **Frontend State Management** (`client/src/context/AuthContext.jsx`)
   - Zustand store handles signup logic (lines 27-35)
   - Calls `authService.signup()` from `client/src/services/authService.js` (line 5)
   - On success: stores token in localStorage and updates Zustand state
   - On error: displays toast notification

3. **API Request** (`client/src/services/api.js`)
   - Axios POST request to `/api/v1/auth/signup`
   - Request goes through axios interceptor (lines 9-18)
   - Attaches Bearer token in Authorization header if available

4. **Backend Controller** (`server/controllers/authController.js`)
   - Receives request at line 10 (`signup` function)
   - Validates input fields (lines 11-16)
   - Checks if email/username already exists in DB (lines 18-22)
   - Hashes password using bcryptjs (handled by Mongoose pre-hook in User model)
   - Creates user document in MongoDB with role assignment (lines 24-30)

5. **Token Generation** (`server/utils/generateToken.js`)
   - Generates access token (15 minutes validity)
   - Generates refresh token (7 days validity, stored in httpOnly cookie)
   - Returns both tokens to client

6. **Database** (`server/models/User.js`)
   - User schema validates: username (3-30 chars, unique), email (unique, valid format), password (min 6 chars)
   - Role field stores either "manager" or "user" (line 27)
   - Password automatically hashed before save by Mongoose pre-hook

7. **Response Back to Frontend**
   - Server sends back accessToken and user object (lines 36-45 in authController.js)
   - Frontend Zustand store saves token to localStorage
   - User redirected to `/dashboard`

---

### 2.2 User Login

**Flow**: Similar to signup but simpler

1. **Frontend** (`client/src/pages/Login.jsx`)
   - User enters email and password
   - Calls `useAuthStore.login()` (lines 12-21 in `AuthContext.jsx`)

2. **Backend** (`server/controllers/authController.js`)
   - Finds user by email (line 49 in `login` function)
   - Compares provided password with hashed password in DB (line 57)
   - If match, generates new tokens and returns them

3. **Token Storage**
   - Access token stored in browser localStorage
   - Refresh token stored as httpOnly cookie (can't be accessed by JavaScript)

---

### 2.3 Protected Routes & Middleware

**File**: `server/middleware/auth.js` (lines 3-31)

- Every protected endpoint uses `protect` middleware
- Middleware extracts Bearer token from Authorization header (lines 10-12)
- Verifies JWT signature using `process.env.JWT_SECRET`
- Fetches user from database and attaches to `req.user`
- If token invalid/expired, returns 401 error with code `TOKEN_EXPIRED`

**Frontend Protection** (`client/src/App.jsx`, lines 16-28)
- `ProtectedRoute` component checks `useAuthStore.isAuthenticated`
- If not authenticated, redirects to `/login`
- If authenticated, renders protected page

---

## 3. Database Models

### 3.1 User Model (`server/models/User.js`)

```
Schema fields:
- username (String, unique, 3-30 chars)
- email (String, unique, valid email format)
- password (String, min 6 chars, auto-hashed)
- role (String, enum: ['manager', 'user'], default: 'user')
- avatar (String, URL)
- avatarColor (String, hex color for avatar)
- isActive (Boolean, default: true)
- lastLogin (Date)
- createdAt (Date, auto-timestamp)
```

**Relationships**:
- Referenced by Task model in `createdBy` and `assignedTo` fields
- Referenced by ActivityLog in `userId` field

### 3.2 Task Model (`server/models/Task.js`)

```
Schema fields:
- title (String, max 100 chars, required)
- description (String, max 500 chars, default: '')
- status (String, enum: ['todo', 'in-progress', 'review', 'completed'], default: 'todo')
- priority (String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium')
- assignedTo (ObjectId ref to User, required)
- createdBy (ObjectId ref to User, required)
- dueDate (Date)
- tags (Array of Strings)
- attachments (Array of {name, url})
- completedAt (Date, set when task marked complete)
- order (Number, for drag-drop ordering)
- createdAt (Date, auto-timestamp)
- updatedAt (Date, auto-timestamp)
```

### 3.3 ActivityLog Model (`server/models/ActivityLog.js`)

```
Schema fields:
- userId (ObjectId ref to User)
- taskId (ObjectId ref to Task)
- action (String, one of: 'created', 'updated', 'deleted', 'status_changed', 'assigned')
- details (String, description of what changed)
- oldValue (Mixed)
- newValue (Mixed)
- createdAt (Date, auto-timestamp)
```

Logs every action a user takes for audit trail.

---

## 4. Task Management System

### 4.1 Task Creation (Manager Only)

**Flow**: 
1. Manager fills task form in dashboard
2. Form submitted to `useTaskStore.createTask()` (lines 32-39 in `TaskContext.jsx`)
3. Calls `taskService.create(data)` which POSTs to `/api/v1/tasks`

**Backend Processing** (`server/controllers/taskController.js`):
- `createTask` function handles POST request (around line 85)
- RBAC middleware `checkRole('manager')` ensures only managers can create (from `server/routes/taskRoutes.js` line 10)
- Creates task document with `assignedTo` and `createdBy` user references
- Creates activity log entry with action "created"
- Emits Socket.io event `task:created` to all connected clients

**Socket.io Broadcast** (`server/config/socket.js` lines 13-40):
- Server broadcasts `task:created` event
- All connected users receive update in real-time
- Frontend `useSocket` hook (client/src/hooks/useSocket.js) listens for event
- Calls `socketAddTask()` to update Zustand store (lines 24-25 in useSocket.js)

### 4.2 Task Status Update

**Flow**: User drags task across Kanban columns

1. **Frontend** (`client/src/components/tasks/TaskBoard.jsx`)
   - React drag-drop library handles drag interaction
   - On drop, calls `useTaskStore.updateStatus(taskId, newStatus)`

2. **Backend** (`server/controllers/taskController.js`):
   - PATCH `/api/v1/tasks/:id/status` endpoint
   - Updates `status` field in MongoDB
   - Sets `completedAt` timestamp if status is "completed"
   - Creates activity log with action "status_changed"
   - Broadcasts `task:status` event via Socket.io

3. **Real-time Update**:
   - Frontend socket listener catches event (line 38-40 in useSocket.js)
   - Updates Zustand store
   - Component re-renders with new task status

### 4.3 Task Fetching (RBAC-Aware)

**File**: `server/controllers/taskController.js`, `getTasks` function

- **Manager users**: Can see all tasks in workspace
- **Regular users**: Only see tasks assigned to them (line 28-31)
  - Query filter automatically adds: `filter.assignedTo = req.user._id`

**Frontend Flow**:
- Dashboard/Tasks page calls `useTaskStore.fetchTasks()` on mount
- Zustand store dispatches API request with filters
- Sets loading state, handles pagination
- Results stored in `tasks` array in Zustand

---

## 5. Role-Based Access Control (RBAC)

**File**: `server/middleware/rbac.js`

```
Two roles:
1. MANAGER (admin)
   - Create, update, delete any task
   - Assign tasks to any user
   - View all users and activity logs

2. USER (regular user)
   - View only own assigned tasks
   - Update status of own tasks
   - Cannot create/edit/delete tasks
```

**Implementation**:
- Every endpoint that requires a specific role uses `checkRole()` middleware
- Example in `server/routes/taskRoutes.js` line 10: `router.post('/', checkRole('manager'), createTask)`
- Middleware checks `req.user.role` against required role
- Returns 403 Forbidden if user lacks permission

---

## 6. Real-Time Updates with Socket.io

### 6.1 Socket.io Setup

**Server** (`server/config/socket.js`):
- Initializes Socket.io on HTTP server (line 5)
- Enables CORS with client URL from env variable (lines 7-11)
- Listens for client connections (line 13)

**Client** (`client/src/hooks/useSocket.js`):
- Initializes Socket.io client on component mount (lines 19-21)
- Connects to `window.location.origin` with websocket/polling fallback
- Emits `join:workspace` event with user ID (line 28)

### 6.2 Socket Events

**Server broadcasts these events**:
1. `task:created` - When new task created (emitted in taskController)
2. `task:updated` - When task details changed
3. `task:deleted` - When task deleted
4. `task:status` - When task status changes
5. `activity:new` - When new activity log created

**Client listens** (useSocket.js lines 30-50):
```javascript
socketInstance.on('task:created', (task) => socketAddTask(task))
socketInstance.on('task:updated', (task) => socketUpdateTask(task))
socketInstance.on('task:deleted', (data) => socketDeleteTask(data))
socketInstance.on('activity:new', (log) => socketAddActivity(log))
```

**Update Flow**:
1. One user creates/updates task
2. Backend broadcasts event to all connected sockets
3. Other users receive event through Socket.io
4. Frontend Zustand store updates without additional API call
5. UI re-renders instantly

---

## 7. State Management (Zustand)

### 7.1 Authentication Store (`client/src/context/AuthContext.jsx`)

```
State:
- user: Current logged-in user object
- token: Access token string
- isAuthenticated: Boolean flag
- isLoading: Loading state for requests
- error: Error messages

Actions:
- login(credentials): Authenticate user
- signup(data): Create new account
- logout(): Clear auth state
- fetchMe(): Validate token and refresh user data
- clearError(): Reset error messages
```

### 7.2 Task Store (`client/src/context/TaskContext.jsx`)

```
State:
- tasks: Array of task objects
- activity: Array of activity logs
- users: Array of users in workspace
- loading: Loading state
- filters: {status, priority, assignedTo, search}
- pagination: {page, totalPages, totalTasks}

Actions:
- fetchTasks(params): GET tasks with pagination/filters
- createTask(data): POST new task
- updateTask(id, data): PUT task details
- updateStatus(id, status): PATCH task status
- deleteTask(id): DELETE task
- socketAddTask(task): Add task from Socket event
- socketUpdateTask(task): Update task from Socket event
- socketDeleteTask({taskId}): Remove task from Socket event
- fetchActivity(params): Get activity logs
```

### 7.3 Theme/UI Store (`client/src/context/ThemeContext.jsx`)

```
State:
- theme: 'dark' or 'light'
- sidebarOpen: Boolean
- activeModal: Which modal is open
- toasts: Array of toast notifications
- themeFlash: Transition animation flag

Actions:
- toggleTheme(): Switch theme
- setSidebarOpen(val): Toggle sidebar
- openModal(modal): Open modal
- closeModal(): Close modal
- addToast(toast): Show notification
- toast.success/error/info/warning(): Shortcut methods
```

---

## 8. API Endpoints Reference

### Authentication Routes (`server/routes/authRoutes.js`)
```
POST /api/v1/auth/signup          - Register new user (public)
POST /api/v1/auth/login           - Login user (public)
POST /api/v1/auth/logout          - Logout user (public)
POST /api/v1/auth/refresh         - Refresh access token (public)
GET  /api/v1/auth/me              - Get current user (protected)
```

### Task Routes (`server/routes/taskRoutes.js`)
```
GET  /api/v1/tasks                - List tasks (protected, RBAC)
GET  /api/v1/tasks/:id            - Get single task (protected)
POST /api/v1/tasks                - Create task (protected, manager only)
PUT  /api/v1/tasks/:id            - Update task (protected, manager only)
PATCH /api/v1/tasks/:id/status    - Update status (protected)
PATCH /api/v1/tasks/:id/order     - Update task order (protected)
DELETE /api/v1/tasks/:id          - Delete task (protected, manager only)
```

### User Routes (`server/routes/userRoutes.js`)
```
GET  /api/v1/users                - List all users (protected, manager only)
GET  /api/v1/users/:id            - Get user profile (protected)
PATCH /api/v1/users/:id           - Update profile (protected)
```

### Activity Routes (`server/routes/activityRoutes.js`)
```
GET  /api/v1/activity             - Get activity logs (protected)
GET  /api/v1/activity/task/:id    - Get task activity (protected)
```

---

## 9. Frontend Navigation & Routing

**File**: `client/src/App.jsx`

```
/ (Landing)          - Public, marketing page
/login               - Public, login form
/signup              - Public, registration form
/dashboard           - Protected, user dashboard with stats
/tasks               - Protected, Kanban board
/activity            - Protected, activity log
```

**Route Protection** (`client/src/App.jsx`, lines 16-28):
- `ProtectedRoute` component checks authentication
- `PublicRoute` component prevents authenticated users accessing login/signup

---

## 10. Data Flow Examples

### Example 1: Creating and Broadcasting a Task

```
1. Manager clicks "Create Task" button in Dashboard
2. Opens TaskForm modal component
3. Fills: title, description, assignee, priority, due date
4. Clicks "CREATE"
5. Form calls: useTaskStore.createTask(formData)
6. Zustand action sends POST to /api/v1/tasks
7. Backend taskController.createTask receives request
8. Creates Task document in MongoDB
9. Creates ActivityLog entry with action "created"
10. Broadcasts Socket.io event: io.emit('task:created', task)
11. All connected clients receive task:created event
12. useSocket hook catches event (useSocket.js line 31)
13. Calls socketAddTask(task) in Zustand
14. Updates tasks array in state
15. TaskBoard component re-renders showing new task in "todo" column
16. Toast notification shows: "Task created successfully"
```

### Example 2: Real-Time Status Update

```
1. Any user sees Kanban board with task cards
2. Drags task from "todo" column to "in-progress"
3. Drop handler calls: updateStatus(taskId, 'in-progress')
4. Zustand sends PATCH to /api/v1/tasks/:id/status
5. Backend finds task by ID
6. Updates status field to 'in-progress'
7. Creates ActivityLog with action "status_changed"
8. Broadcasts Socket.io: task:status event
9. All users' clients receive the event
10. Frontend updates Zustand tasks array
11. TaskBoard re-renders with task moved to new column
12. Dashboard stats auto-update (in-progress count +1)
```

### Example 3: User-Only Task Filtering

```
1. Regular User logs in
2. Navigates to /tasks page
3. Components renders TaskBoard
4. useTaskStore.fetchTasks() called on mount
5. Zustand sends GET /api/v1/tasks
6. Backend taskController.getTasks receives request
7. Middleware already verified JWT (user authenticated)
8. Checks req.user.role === 'user' (line 28 in taskController.js)
9. Adds filter: {assignedTo: req.user._id}
10. Queries only tasks where assignedTo matches user ID
11. Returns filtered tasks to frontend
12. User only sees their assigned tasks on board
```

---

## 11. Key Technologies & Versions

### Backend
- Node.js runtime
- Express 4.18.2 - Web framework
- MongoDB 7.6.3 - Database via Mongoose
- Socket.io 4.6.2 - Real-time communication
- JWT - Authentication tokens
- bcryptjs - Password hashing
- Helmet - Security headers
- CORS - Cross-origin requests
- Rate Limiter - DDoS protection

### Frontend
- React 18.2.0 - UI library
- Vite 5.1.4 - Build tool
- React Router 6.22.0 - Client-side routing
- Zustand 4.5.1 - State management
- Tailwind CSS 3.4.1 - Styling
- Framer Motion 11.0.0 - Animations
- Socket.io Client 4.7.4 - Real-time updates
- React Hook Form 7.51.0 - Form handling
- Zod 3.22.4 - Schema validation
- @hello-pangea/dnd 16.5.0 - Drag and drop

---

## 12. Security Features

1. **Authentication**
   - JWT access tokens (15 min expiry)
   - Refresh tokens in httpOnly cookies (7 day expiry)
   - Password hashing with bcryptjs
   - Automatic token refresh on 401 response

2. **Authorization**
   - Role-based access control (Manager vs User)
   - Protected routes on frontend and backend
   - Activity logging for audit trail

3. **Network Security**
   - Helmet.js for security headers
   - CORS whitelist (only allowed client URL)
   - HTTPS in production (secure cookies)
   - Rate limiting on auth endpoints (10 req/15min)
   - Rate limiting on general endpoints (100 req/15min)

4. **Data Validation**
   - Frontend: React Hook Form + Zod schema validation
   - Backend: Mongoose schema validation
   - Input sanitization on all endpoints

---

## 13. Production Deployment

**Build & Start**:
```bash
npm run build     # Builds client to client/dist/
npm run start     # Runs: build + starts server in production mode
```

**Server in Production** (`server/server.js`):
- Serves built React app from `client/dist` (line 47)
- All requests not matching `/api/*` fallback to `index.html` (line 62-67)
- This enables client-side routing to work
- Environment variable `NODE_ENV=production` enables all optimizations

**Environment Variables Needed**:
```
MONGODB_URI       - MongoDB connection string
JWT_SECRET        - Secret key for signing tokens
NODE_ENV          - Set to 'production'
PORT              - Server port (default: 5000)
CLIENT_URL        - Frontend URL for CORS
```

---

## 14. Development Workflow

**Terminal 1 - Backend**:
```bash
cd server
npm run dev        # Starts with nodemon, auto-reloads on file changes
```

**Terminal 2 - Frontend**:
```bash
cd client
npm run dev        # Starts Vite dev server with HMR (hot reload)
```

**Or both together**:
```bash
npm run dev        # Runs via concurrently npm package (root directory)
```

Frontend available at: `http://localhost:5173`
Backend API at: `http://localhost:5000`

---

## 15. File Reference Guide

| File Path | Purpose | Key Lines |
|-----------|---------|-----------|
| `server/server.js` | Express app setup & Socket.io init | 1-85 |
| `server/config/db.js` | MongoDB connection | 1-70 |
| `server/config/socket.js` | Socket.io event handlers | 1-35 |
| `server/middleware/auth.js` | JWT verification | 3-31 |
| `server/middleware/rbac.js` | Role checking | 1-20 |
| `server/models/User.js` | User schema | 1-55 |
| `server/models/Task.js` | Task schema | 1-60 |
| `server/controllers/authController.js` | Auth logic | 10-100 |
| `server/controllers/taskController.js` | Task CRUD | 85-150 |
| `server/routes/authRoutes.js` | Auth endpoints | 1-12 |
| `server/routes/taskRoutes.js` | Task endpoints | 1-20 |
| `client/src/App.jsx` | Root component & routing | 1-91 |
| `client/src/main.jsx` | React entry point | 1-10 |
| `client/src/context/AuthContext.jsx` | Auth Zustand store | 1-60 |
| `client/src/context/TaskContext.jsx` | Task Zustand store | 1-100 |
| `client/src/hooks/useSocket.js` | Socket.io integration | 1-60 |
| `client/src/services/api.js` | Axios instance & interceptors | 1-75 |
| `client/src/pages/Dashboard.jsx` | Dashboard view | 1-100 |
| `client/src/pages/Tasks.jsx` | Task Kanban board | 1-50 |
| `client/src/components/layout/Navbar.jsx` | Top navigation bar | 1-50 |
| `client/src/components/tasks/TaskBoard.jsx` | Drag-drop Kanban | 1-150 |

---

## Summary

The VOID application follows a modern full-stack architecture with clear separation of concerns:

- **Backend** validates requests, enforces permissions, manages database, broadcasts updates
- **Frontend** provides reactive UI, manages local state, handles real-time updates
- **Socket.io** bridges the gap for instant data synchronization
- **Zustand** centralizes state management for predictable data flow
- **RBAC** ensures users only access what they're authorized to use

Every action from task creation to status updates flows through this system, with proper authentication, validation, and real-time synchronization ensuring all users stay in sync.
