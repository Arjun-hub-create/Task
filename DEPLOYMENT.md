# VOID Task Manager - Deployment Guide

## Overview

The VOID Task Manager is a full-stack application. For optimal deployment on Vercel:
- **Frontend** → Deploy to Vercel (React SPA)
- **Backend** → Deploy to Railway.app or similar Node.js platform (supports Socket.io)

Both platforms are free and work seamlessly together.

---

## Prerequisites

1. GitHub account (code already pushed ✓)
2. Vercel account (free at vercel.com)
3. Railway account (free at railway.app)
4. MongoDB Atlas account (free tier available at mongodb.com)

---

## Part 1: Database Setup (MongoDB Atlas)

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up or login
3. Create a new project named "VOID"
4. Create a free M0 cluster
5. Choose region closest to you
6. Create database user:
   - Username: `void_user`
   - Password: Generate strong password, save it
7. Add IP whitelist: Click "0.0.0.0/0" (allows all IPs, acceptable for demo)
8. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy connection string: `mongodb+srv://void_user:PASSWORD@cluster.mongodb.net/void_taskmanager?retryWrites=true&w=majority`
   - Replace `PASSWORD` with your user password

**Important**: Save this connection string - you'll need it for backend environment variables.

---

## Part 2: Backend Deployment on Railway

### Step 1: Connect Railway to GitHub

1. Go to https://railway.app
2. Click "Start New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select repository: `Arjun-hub-create/Task`
6. Select root directory: `/server`

### Step 2: Configure Environment Variables in Railway

Railway automatically creates these variables. You must set:

1. Click "Variables" tab in your Railway project
2. Add these variables:

```
MONGODB_URI=mongodb+srv://void_user:PASSWORD@cluster.mongodb.net/void_taskmanager?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_here_12345678
NODE_ENV=production
PORT=3000
CLIENT_URL=https://your-frontend-domain.vercel.app
```

**Get these values**:
- `MONGODB_URI`: From MongoDB Atlas (Part 1)
- `JWT_SECRET`: Generate random string (min 32 characters)
- `CLIENT_URL`: You'll get this after deploying frontend (Part 3)

### Step 3: Deploy Backend

1. In Railway dashboard, click "Deploy"
2. Wait for deployment to complete (takes 2-3 minutes)
3. Get your backend URL:
   - Click "Public Networking"
   - Copy the generated URL (example: `https://void-server.railway.app`)
   - This is your `BACKEND_URL`

**Save this URL** - you'll need it for frontend deployment.

---

## Part 3: Frontend Deployment on Vercel

### Step 1: Import Project to Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Select "Import Git Repository"
4. Select: `Arjun-hub-create/Task`
5. Click "Import"

### Step 2: Configure Build Settings

Vercel should auto-detect React + Vite, but verify:

```
Framework: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

### Step 3: Set Environment Variables

1. Go to "Settings" → "Environment Variables"
2. Add:

```
VITE_API_URL=https://your-backend-url.railway.app/api/v1
```

Replace `your-backend-url` with your Railway backend URL from Part 2.

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (takes 1-2 minutes)
3. You'll get a Vercel URL: `https://your-app-name.vercel.app`

**Save this URL** - it's your production frontend.

---

## Part 4: Update Backend Client URL

After frontend is deployed:

1. Go back to Railway dashboard
2. Click your VOID project
3. Update `CLIENT_URL` variable to: `https://your-app-name.vercel.app`
4. Click "Redeploy"

This ensures CORS is properly configured.

---

## Testing the Deployment

### 1. Test Frontend

1. Open: `https://your-app-name.vercel.app`
2. Should see VOID landing page with space theme
3. Test signup/login flow

### 2. Test API Connection

1. In browser DevTools (F12), go to Network tab
2. Try login - should see POST request to `/auth/login` succeeding
3. Check Application tab - should see `void_access_token` in localStorage

### 3. Test Real-Time Updates (Socket.io)

1. Log in from two different browser tabs
2. From one tab, create a task
3. Should see task appear instantly in other tab without page refresh

### 4. Troubleshooting

**Error: "Cannot reach backend"**
- Check VITE_API_URL environment variable is set correctly
- Verify Railway backend is running (check Railway dashboard)
- Check CORS is allowing your Vercel domain

**Error: "Socket connection failed"**
- Socket.io uses same backend URL
- Ensure Client_URL is set in Railway backend
- Socket.io defaults to same origin in production

**Error: "Database connection failed"**
- Verify MONGODB_URI is correct in Railway
- Check MongoDB Atlas IP whitelist includes "0.0.0.0/0"
- Test connection string in MongoDB Atlas console

---

## Production Checklist

- [ ] MongoDB Atlas cluster running
- [ ] Railway backend deployed with all env variables
- [ ] Vercel frontend deployed with VITE_API_URL set
- [ ] Backend CLIENT_URL updated with Vercel domain
- [ ] Login/signup working
- [ ] Can create and see tasks in real-time
- [ ] Can drag tasks across Kanban columns
- [ ] Real-time updates working (test from 2 tabs)
- [ ] Activity log showing all actions
- [ ] Theme switching works
- [ ] No console errors in DevTools

---

## Production URLs Reference

After deployment, you'll have:

```
Frontend: https://your-app-name.vercel.app
Backend: https://void-server.railway.app
Database: MongoDB Atlas (managed by MONGODB_URI)
```

All three communicate via HTTPS with proper CORS and Socket.io WebSocket support.

---

## Monitoring & Logs

### Vercel
- View logs: Dashboard → Project → Deployments → Click build → Logs
- Monitor performance: Dashboard → Project → Analytics

### Railway
- View logs: Dashboard → Project → Logs tab
- Monitor resource usage: Dashboard → Project → Metrics

### MongoDB Atlas
- View connection activity: Atlas Dashboard → Databases → Activity
- Monitor cluster performance: Atlas Dashboard → Metrics

---

## Scaling & Limits

**Free Tier Limits**:
- Vercel: 100GB bandwidth/month, unlimited deployments
- Railway: $5/month free credits
- MongoDB Atlas: 512MB storage, 100 connections

For production with more users:
- Upgrade Railway to paid tier ($7+/month)
- Upgrade MongoDB to M2 cluster ($10+/month)
- Vercel Pro ($20/month) for advanced features

---

## Important Security Notes

1. **Never commit `.env` files** - Environment variables are secret
2. **Rotate JWT_SECRET regularly** in production
3. **Use strong MongoDB password**
4. **Enable MongoDB IP whitelist** - Should be more restrictive than "0.0.0.0/0" in production
5. **Use HTTPS only** - Both Vercel and Railway force HTTPS
6. **Monitor activity logs** regularly for suspicious access

---

## Redeploying After Code Changes

### Push to GitHub
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

### Frontend (Auto-redeploy)
- Vercel automatically rebuilds when you push to `main` branch
- Check Vercel dashboard for deployment status

### Backend (Manual redeploy)
1. Go to Railway dashboard
2. Click your project
3. Click "Redeploy" or push changes to trigger auto-redeploy if configured

---

## Questions?

Refer to:
- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com
- Express.js Docs: https://expressjs.com
- React Docs: https://react.dev
