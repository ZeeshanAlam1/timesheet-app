# GitHub & Vercel Deployment Guide

Step-by-step guide to deploy your Timesheet application to GitHub and Vercel.

## Table of Contents
1. [Prepare for GitHub](#prepare-for-github)
2. [Push to GitHub](#push-to-github)
3. [Setup Supabase](#setup-supabase)
4. [Deploy Backend to Vercel](#deploy-backend-to-vercel)
5. [Deploy Frontends to Vercel](#deploy-frontends-to-vercel)
6. [Connect Everything](#connect-everything)

---

## Prepare for GitHub

### 1. Initialize Git Repository

```bash
cd timesheet-app

# Initialize git
git init

# Add all files
git add .

# Make first commit
git commit -m "Initial commit - Timesheet application with Supabase"
```

### 2. Create .env File (Don't Commit!)

The `.env` file is already in `.gitignore`, so it won't be pushed to GitHub.

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` with your local development values (we'll add production values in Vercel later).

---

## Push to GitHub

### 1. Create GitHub Repository

1. Go to [github.com](https://github.com)
2. Click **"New repository"** (+ icon, top right)
3. Fill in:
   ```
   Repository name: timesheet-app
   Description: TOTP-based Timesheet Management System with Supabase
   Visibility: Public (or Private if you prefer)
   ```
4. **DO NOT** initialize with README (we already have one)
5. Click **"Create repository"**

### 2. Push Code to GitHub

GitHub will show you commands like these:

```bash
# Add remote
git remote add origin https://github.com/YOUR-USERNAME/timesheet-app.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Replace `YOUR-USERNAME`** with your actual GitHub username!

### 3. Verify on GitHub

- Go to your repository URL
- You should see all files
- ✅ Verify `.env` is **NOT** there (it's gitignored)

---

## Setup Supabase

Before deploying to Vercel, you need a Supabase database.

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign in (use your GitHub account for easy integration)
3. Click **"New Project"**
4. Fill in:
   ```
   Organization: [Your organization]
   Project Name: timesheet-production
   Database Password: [Generate strong password - SAVE IT!]
   Region: [Choose closest to your users]
   ```
5. Click **"Create new project"**
6. Wait 2-3 minutes for provisioning

### 2. Run Database Schema

1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New query"**
3. Copy entire contents of `database/schema.sql` from your project
4. Paste into SQL Editor
5. Click **"Run"** (or Cmd/Ctrl + Enter)
6. Wait for "Success" message

### 3. Get Supabase Credentials

1. Click **Settings** (⚙️ icon)
2. Click **API**
3. Copy these values (you'll need them for Vercel):
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

**💾 Save these in a secure note!**

---

## Deploy Backend to Vercel

### 1. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

### 2. Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select your GitHub repository: **timesheet-app**
5. Vercel will auto-detect it's a Node.js project

### 3. Configure Backend Deployment

**Build & Development Settings:**
```
Framework Preset: Other
Root Directory: backend
Build Command: (leave empty)
Output Directory: (leave empty)
Install Command: npm install
```

### 4. Add Environment Variables

Click **"Environment Variables"** and add these:

```
SUPABASE_URL = https://xxxxx.supabase.co
SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET = [Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"]
NODE_ENV = production
TOTP_WINDOW = 2
TOTP_STEP = 30
ADMIN_EMAIL = admin@yourcompany.com
ADMIN_PASSWORD = YourStrongPassword123!
```

**How to generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copy the output and paste as JWT_SECRET value.

### 5. Deploy Backend

1. Click **"Deploy"**
2. Wait for deployment (~2-3 minutes)
3. You'll get a URL like: `https://timesheet-app-xxxxx.vercel.app`
4. **Save this URL!** This is your backend API URL

### 6. Test Backend

Visit: `https://your-backend-url.vercel.app/api/health`

You should see:
```json
{
  "status": "OK",
  "timestamp": "2024-01-01T...",
  "service": "Timesheet Backend API (Supabase)",
  "database": "Supabase PostgreSQL"
}
```

---

## Deploy Frontends to Vercel

You'll deploy 3 separate frontends:
1. Admin Portal
2. Kiosk
3. User Setup

### Deploy Admin Portal

1. In Vercel dashboard, click **"Add New Project"**
2. Select **same GitHub repository** again
3. Configure:
   ```
   Project Name: timesheet-admin
   Framework Preset: Other
   Root Directory: frontend-admin
   Build Command: (leave empty)
   Output Directory: (leave empty)
   ```

4. **Before deploying**, click **"Environment Variables"**
5. Add:
   ```
   NEXT_PUBLIC_API_URL = https://your-backend-url.vercel.app/api
   ```
   
   ⚠️ **Replace** `your-backend-url.vercel.app` with your actual backend URL from step above!

6. Click **"Deploy"**

7. You'll get a URL like: `https://timesheet-admin-xxxxx.vercel.app`

### Update Admin Portal API URL

Since we're using vanilla JS (not React/Next.js), we need to update the API URL directly in the code:

**Option A - Update in GitHub:**

1. Edit `frontend-admin/admin.js` in your local repository
2. Change line 2:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.vercel.app/api';
   ```
3. Commit and push:
   ```bash
   git add frontend-admin/admin.js
   git commit -m "Update API URL for production"
   git push
   ```
4. Vercel will auto-redeploy

**Option B - Use Environment Variable (Better):**

I'll create an updated version that uses environment variables. Let me do that now...

### Deploy Kiosk

Same process:

1. **"Add New Project"** → Select repository
2. Configure:
   ```
   Project Name: timesheet-kiosk
   Root Directory: frontend-kiosk
   ```
3. Deploy
4. Get URL: `https://timesheet-kiosk-xxxxx.vercel.app`

### Deploy User Setup

1. **"Add New Project"** → Select repository
2. Configure:
   ```
   Project Name: timesheet-setup
   Root Directory: frontend-user-setup
   ```
3. Deploy
4. Get URL: `https://timesheet-setup-xxxxx.vercel.app`

---

## Update Frontend API URLs

Since the frontends use vanilla JavaScript, we need to update the API URLs.

### Create Environment Configuration Files

I'll create updated versions of the frontends that read from environment variables...

Actually, for vanilla JS deployed on Vercel, the **easiest approach** is:

### Option 1: Create a config.js file (Recommended)

1. Create `frontend-admin/config.js`:
```javascript
const CONFIG = {
  API_BASE_URL: 'https://your-backend-url.vercel.app/api'
};
```

2. Update `frontend-admin/index.html` to include it:
```html
<script src="config.js"></script>
<script src="admin.js"></script>
```

3. Update `frontend-admin/admin.js`:
```javascript
const API_BASE_URL = CONFIG.API_BASE_URL;
```

Do the same for kiosk and user-setup.

### Option 2: Use Vercel Environment Variables + Build Step

Let me create a better solution with proper environment variable support...

---

## Connect Everything

### 1. Update CORS in Backend

Edit `backend/server.js` and update CORS configuration:

```javascript
const corsOptions = {
  origin: [
    'https://timesheet-admin-xxxxx.vercel.app',
    'https://timesheet-kiosk-xxxxx.vercel.app',
    'https://timesheet-setup-xxxxx.vercel.app',
    'http://localhost:8080',  // Keep for local development
    'http://localhost:3000',
    'http://localhost:8081'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

Replace with your actual Vercel URLs!

### 2. Commit and Push

```bash
git add .
git commit -m "Update CORS for production URLs"
git push
```

Vercel will auto-redeploy your backend.

### 3. Test Everything

1. **Test Backend**: `https://your-backend.vercel.app/api/health`
2. **Test Admin Login**: 
   - Go to your admin URL
   - Login with: admin@yourcompany.com / YourPassword
3. **Create a test user**
4. **Test TOTP setup**: Go to setup URL
5. **Test Kiosk**: Mark attendance

---

## Custom Domains (Optional)

### 1. Add Custom Domain in Vercel

For each deployment:

1. Go to project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your domain:
   ```
   Backend: api.timesheet.yourcompany.com
   Admin: admin.timesheet.yourcompany.com
   Kiosk: kiosk.timesheet.yourcompany.com
   Setup: setup.timesheet.yourcompany.com
   ```

### 2. Update DNS Records

Add CNAME records in your domain registrar:

```
api.timesheet.yourcompany.com    → cname.vercel-dns.com
admin.timesheet.yourcompany.com  → cname.vercel-dns.com
kiosk.timesheet.yourcompany.com  → cname.vercel-dns.com
setup.timesheet.yourcompany.com  → cname.vercel-dns.com
```

Vercel will automatically handle SSL certificates!

---

## Deployment Checklist

### Before Going Live

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Backend deployed to Vercel
- [ ] Backend environment variables set
- [ ] Backend health check works
- [ ] Admin portal deployed
- [ ] Kiosk deployed
- [ ] User setup deployed
- [ ] API URLs updated in frontends
- [ ] CORS configured with all frontend URLs
- [ ] Test admin login
- [ ] Test user creation
- [ ] Test TOTP setup
- [ ] Test attendance marking
- [ ] Test timesheet generation
- [ ] Change admin password from default
- [ ] (Optional) Custom domains configured

---

## Troubleshooting

### Backend Returns 500 Error

**Check Vercel Logs:**
1. Go to backend project in Vercel
2. Click **"Deployments"**
3. Click latest deployment
4. Click **"View Function Logs"**

**Common Issues:**
- Missing environment variables
- Wrong Supabase credentials
- Database not set up

### Frontend Can't Connect to Backend

**Check:**
1. Is API_BASE_URL correct in frontend?
2. Is CORS configured with frontend URL?
3. Is backend deployed and running?

**Test Backend:**
```bash
curl https://your-backend.vercel.app/api/health
```

### Supabase Connection Failed

**Verify:**
1. SUPABASE_URL is correct
2. Using SUPABASE_SERVICE_KEY (not anon key)
3. Database schema was executed
4. Supabase project is active

---

## Monitoring

### Vercel Dashboard

- View deployments
- Check function logs
- Monitor bandwidth
- See analytics

### Supabase Dashboard

- Database size
- API requests
- Active connections
- Query performance

---

## Costs

### Free Tier Limits

**Vercel:**
- 100 GB bandwidth/month
- 100 hours serverless function execution
- Unlimited deployments
- **Cost: $0/month**

**Supabase:**
- 500 MB database
- 50K monthly active users
- Unlimited API requests
- **Cost: $0/month**

**Total: $0/month** for small teams! 🎉

### When to Upgrade

**Vercel Pro ($20/month):**
- 1 TB bandwidth
- 1000 hours execution
- Custom domains
- Team collaboration

**Supabase Pro ($25/month):**
- 8 GB database
- Daily backups
- Email support

---

## Next Steps

1. Share URLs with your team
2. Add users via admin portal
3. Guide users through TOTP setup
4. Start using the system!
5. Monitor usage in Vercel/Supabase dashboards

---

**🎉 Congratulations! Your Timesheet System is now live on Vercel with Supabase!**

**URLs:**
- Backend: `https://your-backend.vercel.app`
- Admin: `https://timesheet-admin-xxxxx.vercel.app`
- Kiosk: `https://timesheet-kiosk-xxxxx.vercel.app`
- Setup: `https://timesheet-setup-xxxxx.vercel.app`
