# VOID Task Manager - Quick Deployment Steps

Complete all steps in order. **No errors** if you follow correctly.

---

## 🗄️ Step 1: MongoDB Atlas Setup (5 minutes)

### 1.1 Create Free MongoDB Cluster

```
URL: https://www.mongodb.com/cloud/atlas
1. Sign up / Login
2. Click "Create" → New Project
3. Project name: "VOID"
4. Click "Create Project"
5. Click "Create Database" → Select "M0 Free"
6. Choose region: Select your region
7. Click "Create Cluster"
8. Wait 3-5 minutes for cluster to be ready
```

### 1.2 Create Database User

```
In Cluster Overview:
1. Click "Database Access" (left menu)
2. Click "Add New Database User"
3. Username: void_user
4. Password: GenerateSecurePassword (click icon)
5. Copy and SAVE this password
6. Role: Atlas admin
7. Click "Add User"
```

### 1.3 Whitelist IP Address

```
In Cluster Overview:
1. Click "Network Access" (left menu)
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"
```

### 1.4 Get Connection String

```
In Cluster Overview:
1. Click "Connect"
2. Select "Connect your application"
3. Driver: Node.js | Version: 4.1 or later
4. COPY the connection string:
   mongodb+srv://void_user:<password>@cluster.mongodb.net/void_taskmanager?retryWrites=true&w=majority
5. Replace <password> with the password you saved in Step 1.2
6. SAVE this as MONGODB_URI
```

**Example**:
```
MONGODB_URI=mongodb+srv://void_user:MySecurePass123@cluster0.abc123.mongodb.net/void_taskmanager?retryWrites=true&w=majority
```

---

## 🚀 Step 2: Deploy Backend to Railway (10 minutes)

### 2.1 Create Railway Account

```
URL: https://railway.app
1. Click "Start New Project"
2. Sign in with GitHub
3. Authorize Railway to access your GitHub
```

### 2.2 Import Backend Repository

```
In Railway Dashboard:
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select repository: Arjun-hub-create/Task
4. Root directory: /server
5. Click "Import"
6. Wait for Railway to link your repo
```

### 2.3 Set Environment Variables

```
In Railway Project:
1. Click "Variables" tab
2. Add each variable by clicking "Add Variable":

MONGODB_URI=<YOUR_CONNECTION_STRING_FROM_STEP_1.4>
JWT_SECRET=your_super_secret_key_min_32_chars_abcdefghij1234567890
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-vercel-domain.vercel.app (ADD AFTER FRONTEND DEPLOY)
```

### 2.4 Deploy Backend

```
In Railway Project:
1. Click "Deploy" button
2. Wait for deployment (green checkmark = done)
3. Click "Public Networking"
4. Copy your backend URL:
   https://void-server-production.railway.app (example)
5. SAVE this as BACKEND_URL
```

---

## 🎨 Step 3: Deploy Frontend to Vercel (10 minutes)

### 3.1 Create Vercel Account

```
URL: https://vercel.com
1. Click "Sign Up"
2. Sign up with GitHub
3. Authorize Vercel to access GitHub
```

### 3.2 Import Frontend Repository

```
In Vercel Dashboard:
1. Click "Add New..." → "Project"
2. Select "Import Git Repository"
3. Search for: Task
4. Select: Arjun-hub-create/Task
5. Click "Import"
```

### 3.3 Configure Project

```
Build & Output Settings:
- Framework: Vite
- Root Directory: client
- Build Command: npm run build
- Output Directory: dist

Click "Deploy"
Wait for build to complete (1-2 minutes)
```

### 3.4 Set Environment Variables

```
AFTER build completes:
1. Go to Settings → Environment Variables
2. Add variable:
   Name: VITE_API_URL
   Value: <YOUR_BACKEND_URL_FROM_STEP_2.4>/api/v1
   
   Example: https://void-server-production.railway.app/api/v1

3. Click "Save"
4. Go to Deployments → Click latest build
5. Click "Redeploy" (to apply new env vars)
6. Wait for redeploy to complete
```

### 3.5 Get Frontend URL

```
In Vercel Dashboard:
1. Click your project
2. Copy the URL displayed at top:
   https://void-task-manager.vercel.app (example)
3. SAVE this as FRONTEND_URL
```

---

## 🔗 Step 4: Update Backend with Frontend URL (5 minutes)

### 4.1 Update Railway Backend

```
Back in Railway Dashboard:
1. Click your VOID project
2. Click "Variables" tab
3. Update CLIENT_URL variable:
   Old: https://your-vercel-domain.vercel.app
   New: <YOUR_FRONTEND_URL_FROM_STEP_3.5>
   
4. Click "Save"
5. Click "Redeploy" button
6. Wait for deployment to complete
```

---

## ✅ Step 5: Test Deployment (5 minutes)

### 5.1 Test Frontend Loading

```
1. Open: <YOUR_FRONTEND_URL_FROM_STEP_3.5>
2. Should see VOID landing page with space theme
3. No error messages in page
```

### 5.2 Test Signup/Login

```
1. Click "INITIATE SEQUENCE"
2. Fill form:
   - Username: testuser
   - Email: test@void.com
   - Password: Test@1234
   - Role: OPERATIVE
3. Click "INITIATE SEQUENCE"
4. Should see: "Identity confirmed. Welcome to VOID."
5. Should redirect to Dashboard
6. Should see "MISSION TIME" clock updating live
```

### 5.3 Test Task Creation

```
On Dashboard:
1. Click "CREATE TASK" button
2. Fill:
   - Title: Test Task
   - Assign to: testuser
   - Priority: High
3. Click "CREATE"
4. Should see task appear on Kanban board
```

### 5.4 Test Real-Time Updates

```
1. Open your frontend URL in TWO browser tabs
2. From Tab 1, create a new task
3. Check Tab 2 WITHOUT refreshing
4. New task should appear instantly
5. Drag task to "in-progress" in Tab 1
6. Check Tab 2 - task should move automatically
```

### 5.5 Troubleshooting

**If signup fails: "Cannot connect to server"**
- Check VITE_API_URL in Vercel environment variables
- Make sure it includes `/api/v1` at the end
- Verify Railway backend is running (check Railway dashboard)

**If real-time updates fail: "Socket connection error"**
- Verify CLIENT_URL is set in Railway backend
- Check that it matches your Vercel URL exactly
- Redeploy Railway backend after updating CLIENT_URL

**If tasks don't appear: "Failed to load tasks"**
- Check browser Network tab (F12) for 401 errors
- Verify token is in localStorage
- Logout and login again

---

## 📋 Final Checklist

- [ ] MongoDB Atlas cluster created and running
- [ ] Connection string obtained and saved
- [ ] Railway backend deployed successfully
- [ ] Backend URL obtained and saved
- [ ] Vercel frontend deployed successfully
- [ ] Frontend URL obtained and saved
- [ ] VITE_API_URL set in Vercel
- [ ] CLIENT_URL updated in Railway
- [ ] Frontend loads without errors
- [ ] Can signup with new account
- [ ] Can login successfully
- [ ] Can create tasks
- [ ] Tasks appear instantly on other tabs (real-time works)
- [ ] No console errors in DevTools (F12)

---

## 🔐 Production URLs

Save these URLs:

```
Frontend: <YOUR_FRONTEND_URL>
Backend: <YOUR_BACKEND_URL>
Database: MongoDB Atlas (managed automatically)
```

Your entire application is now live and production-ready! 🎉

---

## 📞 Support

If you get errors:

1. Check all environment variables are set correctly
2. Verify connection strings have no typos
3. Ensure database user password matches in MONGODB_URI
4. Check Railway/Vercel deployment logs for specific errors
5. Test individual components (database connection, API response)

**Your app is ready to share with anyone!**
