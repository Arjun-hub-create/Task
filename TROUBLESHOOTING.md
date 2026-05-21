# Deployment Troubleshooting Guide

## Common Errors & Solutions

---

## 1. Frontend Issues

### Error: "Cannot reach backend"

**Symptoms**: 
- Signup/login fails with "Network error"
- Tasks page shows "Failed to load tasks"
- Network tab shows 0.0.0.0:5000 (localhost API)

**Causes**:
- VITE_API_URL not set in Vercel
- VITE_API_URL has wrong value
- Backend server not running on Railway

**Solutions**:

**Check 1**: Verify Vercel Environment Variable
```
1. Go to Vercel Dashboard → Your Project
2. Click "Settings" → "Environment Variables"
3. Look for: VITE_API_URL
4. Value should be: https://your-backend.railway.app/api/v1
5. Must include "/api/v1" at the end
6. If missing or wrong, update and click "Redeploy"
```

**Check 2**: Verify Backend is Running
```
1. Go to Railway Dashboard
2. Click your VOID project
3. Look for green checkmark = deployment successful
4. If red X = deployment failed, check logs
5. Logs should show: "🚀 VOID Server running on port 3000"
```

**Check 3**: Manual Test
```
1. Open browser console (F12)
2. Type: fetch('https://your-backend.railway.app/health')
3. Should return: {"status":"OK","service":"VOID Task Manager"}
4. If error, backend not responding
```

---

### Error: "CORS error: blocked by CORS policy"

**Symptoms**:
- Network tab shows red X on API requests
- Console shows: "Access-Control-Allow-Origin missing"

**Causes**:
- CLIENT_URL not set correctly in Railway backend
- CLIENT_URL doesn't match your Vercel URL exactly

**Solutions**:

**Check 1**: Verify CLIENT_URL in Railway
```
1. Railway Dashboard → Your Project
2. Click "Variables" tab
3. Find: CLIENT_URL
4. Value should be your exact Vercel URL:
   https://your-app-name.vercel.app
5. NO trailing slash
6. NO http (must be https)
7. If wrong, update and click "Redeploy"
```

**Check 2**: Wait for Railway to Deploy
```
1. After updating CLIENT_URL, Railway redeploys automatically
2. Wait for green checkmark (1-2 minutes)
3. Logs should show: "🚀 VOID Server running on port 3000"
4. Try again
```

---

### Error: "Real-time updates not working"

**Symptoms**:
- Can create tasks but they don't appear on other tabs
- Dragging tasks doesn't update other tabs
- No errors in console

**Causes**:
- Socket.io connection not established
- Backend not broadcasting events
- CLIENT_URL mismatch

**Solutions**:

**Check 1**: Verify Socket Connection
```
1. Open browser console (F12)
2. Type: socketInstance
3. Should see Socket object with "connected: true"
4. If "connected: false", Socket.io connection failed
```

**Check 2**: Check Network Tab
```
1. Open DevTools → Network → WS (WebSocket filter)
2. Should see connection to wss://your-backend.railway.app/socket.io/
3. If not present, socket.io not connecting
4. Check backend CLIENT_URL is correct
```

---

## 2. Backend Issues

### Error: "Database connection failed"

**Symptoms**:
- Railway logs show: "Failed to connect to MongoDB"
- Signup returns 500 error
- All API requests fail

**Causes**:
- MONGODB_URI is wrong
- MongoDB user password has special characters not URL-encoded
- MongoDB IP whitelist doesn't include Railway IP

**Solutions**:

**Check 1**: Verify MONGODB_URI Format
```
Correct: mongodb+srv://void_user:Password123@cluster.mongodb.net/void_taskmanager?retryWrites=true&w=majority
Wrong: mongodb+srv://void_user:Pass@word@cluster.mongodb.net/void_taskmanager
       (@ in password not URL-encoded)

If password has special characters:
- ! = %21
- @ = %40  
- # = %23
- $ = %24
- etc.

Use MongoDB Atlas to regenerate password with simple characters only
```

**Check 2**: Verify IP Whitelist
```
MongoDB Atlas:
1. Click "Network Access"
2. Should see entry: 0.0.0.0/0 (allows all IPs)
3. Or find Railway's static IP and whitelist it specifically
4. If missing, click "Add IP Address" → "Allow from Anywhere"
```

**Check 3**: Test Connection String
```
1. Go to MongoDB Atlas
2. Click "Databases"
3. Click "Connect" → "Connect via mongosh"
4. Copy command with your password
5. If it connects, MONGODB_URI format is correct
```

---

### Error: "JWT_SECRET not defined"

**Symptoms**:
- Railway logs show: "JWT_SECRET is not defined"
- Signup fails with 500 error
- Login fails with 500 error

**Causes**:
- JWT_SECRET not set in Railway Variables

**Solutions**:

```
1. Railway Dashboard → Your Project → Variables
2. Add variable:
   Name: JWT_SECRET
   Value: your_super_secret_key_here_minimum_32_characters
3. Click "Save"
4. Click "Redeploy"
```

---

### Error: "Port 3000 already in use"

**Symptoms**:
- Railway deployment fails
- Logs show: "EADDRINUSE: address already in use :::3000"

**Causes**:
- Another Railway process still running on port 3000
- Previous deployment not fully stopped

**Solutions**:

```
1. Go to Railway Dashboard
2. Click your VOID project
3. Click three dots (⋮) → "Restart"
4. Wait for deployment to restart
5. Should show green checkmark
```

---

## 3. MongoDB Issues

### Error: "Authentication failed"

**Symptoms**:
- MongoDB returns: "authentication failed"
- Can't connect despite correct URI

**Causes**:
- MongoDB user not created
- MongoDB user doesn't have access to database
- Password is wrong

**Solutions**:

```
1. MongoDB Atlas Dashboard
2. Click "Database Access"
3. Verify user "void_user" exists
4. If not, click "Add New Database User"
5. Username: void_user
6. Click "Auto Generate Secure Password"
7. Copy password
8. Update MONGODB_URI with new password in Railway
```

---

### Error: "Namespace not found"

**Symptoms**:
- MongoDB error: "E11000 duplicate key error"
- Or: "collection doesn't exist"

**Causes**:
- Database not created yet (happens automatically)
- Collection not initialized

**Solutions**:

```
This usually fixes itself after first successful API call.
1. Make sure signup works
2. This creates the User collection automatically
3. Creating first task creates Task collection
4. Should work after that
```

---

## 4. Vercel Issues

### Error: "Build failed"

**Symptoms**:
- Vercel shows red X on deployment
- Can't see live app

**Causes**:
- Missing dependencies in client/package.json
- Build command failed
- Syntax errors in code

**Solutions**:

**Check 1**: View Build Logs
```
1. Vercel Dashboard → Deployments
2. Click failed deployment
3. Click "Build Logs"
4. Look for error message
5. Common: "Module not found" or "Syntax error"
```

**Check 2**: Rebuild Locally
```
1. cd client
2. npm install
3. npm run build
4. If this fails locally, fix the error
5. git commit and push
6. Vercel auto-redeploys
```

---

### Error: "Environment variable not found"

**Symptoms**:
- Deployment succeeds but frontend shows "Cannot reach backend"
- Console shows undefined API URL

**Causes**:
- Environment variable set incorrectly
- Variable name wrong (must match code)
- Not redeployed after setting variable

**Solutions**:

```
1. Vercel Dashboard → Settings → Environment Variables
2. Check VITE_API_URL is spelled exactly right
3. Value should be complete URL with /api/v1
4. After updating, go to Deployments
5. Find latest deployment → Click "Redeploy"
6. Wait for build to complete
```

---

## 5. Railway Issues

### Error: "Deployment failed"

**Symptoms**:
- Railway shows red X
- No logs available

**Causes**:
- Git repository not properly connected
- Source directory wrong
- No server.js file

**Solutions**:

```
1. Railway Dashboard → Your Project
2. Click "Settings"
3. Verify "Root Directory" is: /server
4. Verify source is: GitHub (your repo)
5. Click "Redeploy"
```

---

### Error: "Public Networking not available"

**Symptoms**:
- Can't get Railway URL
- Public Networking shows "Add Domain"

**Causes**:
- Public networking not enabled
- Domain not configured

**Solutions**:

```
1. Railway Dashboard → Your Project
2. Click "Settings"
3. Look for "Public Networking" section
4. Click "Create Public URL"
5. Should generate URL automatically
6. Copy and save it
```

---

## 6. Testing Commands

### Test Database Connection
```bash
# From your local machine (requires MongoDB CLI)
mongosh "mongodb+srv://void_user:PASSWORD@cluster.mongodb.net/void_taskmanager"
```

### Test Backend Health
```bash
# Should return {"status":"OK",...}
curl https://your-backend.railway.app/health
```

### Test Frontend Assets
```bash
# Should return HTML page
curl https://your-frontend.vercel.app/
```

### Test API Endpoint
```bash
# Should return 400 (missing password)
curl -X POST https://your-backend.railway.app/api/v1/auth/login
```

---

## 7. Reset Everything

If everything is broken and you want to start over:

### Option 1: Reset Variables Only
```
1. Railway Dashboard → Your Project
2. Click "Variables"
3. Click "Raw editor"
4. Clear all variables
5. Add them again carefully
6. Click "Redeploy"
```

### Option 2: Full Redeploy
```
1. Railway: Click project → Settings → Danger Zone → "Destroy"
2. Vercel: Click project → Settings → Danger Zone → "Delete Project"
3. Repeat deployment steps from scratch
```

### Option 3: Database Reset
```
1. MongoDB Atlas → Databases
2. Click three dots (⋮) → "Drop Database"
3. Choose: "Drop the database"
4. Confirm
5. New empty database created on next API call
```

---

## 8. Checking Logs

### Railway Logs
```
1. Dashboard → Your Project
2. Click "Logs" tab
3. Scroll to find errors
4. Usually shows when deployment started/completed
```

### Vercel Logs
```
1. Dashboard → Deployments
2. Click the specific deployment
3. Click "Logs"
4. Shows build process
```

### Browser Console (F12)
```
1. Open DevTools (F12)
2. Console tab
3. Any JavaScript errors shown here
4. Network tab shows API request status
```

---

## 9. Common Typos

**Double-check these:**

| Variable | Common Mistake | Correct |
|----------|---|---|
| VITE_API_URL | http://... | https://... |
| VITE_API_URL | Missing /api/v1 | ...railway.app/api/v1 |
| MONGODB_URI | mongodb:// | mongodb+srv:// |
| MONGODB_URI | <password> | Your actual password |
| CLIENT_URL | With trailing / | No trailing / |
| JWT_SECRET | Too short | Min 32 characters |
| PORT | 5000 | 3000 (on Railway) |
| NODE_ENV | developement | production |

---

## Still Stuck?

1. Check all environment variables are exactly as specified
2. Make sure URLs have no trailing slashes
3. Verify usernames/passwords have no special characters (or are properly URL-encoded)
4. Check deployment logs for specific error messages
5. Try redeploying both Railway and Vercel
6. Check browser console (F12) for client-side errors
7. Check Railway logs for server-side errors

If all else fails, start with a clean MongoDB database and Railway redeploy.
