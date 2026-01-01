# Quick Reference Guide

## 📋 Pre-Deployment Checklist

- [ ] Created `.env` file in backend folder
- [ ] Have Supabase account ready
- [ ] Have GitHub account ready  
- [ ] Have Vercel account ready

## 🚀 Step-by-Step Deployment

### 1️⃣ Setup Supabase (5 minutes)

```
1. Go to supabase.com
2. Create new project: "timesheet-production"
3. Save database password!
4. Go to SQL Editor
5. Copy/paste database/schema.sql
6. Click "Run"
7. Go to Settings → API
8. Copy: Project URL, anon key, service_role key
```

### 2️⃣ Push to GitHub (2 minutes)

```bash
cd timesheet-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR-USERNAME/timesheet-app.git
git push -u origin main
```

### 3️⃣ Deploy Backend (5 minutes)

```
1. Go to vercel.com
2. Import GitHub repository
3. Root Directory: backend
4. Add Environment Variables:
   - SUPABASE_URL
   - SUPABASE_ANON_KEY
   - SUPABASE_SERVICE_KEY
   - JWT_SECRET (generate with crypto)
   - NODE_ENV=production
   - ADMIN_EMAIL
   - ADMIN_PASSWORD
5. Deploy
6. Save backend URL!
```

### 4️⃣ Update Frontend Config (3 minutes)

```bash
# Edit these files locally:
frontend-admin/config.js
frontend-kiosk/config.js
frontend-user-setup/config.js

# Change:
API_BASE_URL: 'https://your-backend-url.vercel.app/api'

# Commit and push:
git add .
git commit -m "Update API URLs"
git push
```

### 5️⃣ Deploy Frontends (5 minutes each)

**Admin Portal:**
```
1. Vercel → New Project → Same repo
2. Project Name: timesheet-admin
3. Root Directory: frontend-admin
4. Deploy
5. Save URL
```

**Kiosk:**
```
1. Vercel → New Project → Same repo
2. Project Name: timesheet-kiosk
3. Root Directory: frontend-kiosk
4. Deploy
5. Save URL
```

**User Setup:**
```
1. Vercel → New Project → Same repo  
2. Project Name: timesheet-setup
3. Root Directory: frontend-user-setup
4. Deploy
5. Save URL
```

### 6️⃣ Update CORS (2 minutes)

```javascript
// Edit backend/server.js locally

const corsOptions = {
  origin: [
    'https://timesheet-admin-xxxxx.vercel.app',
    'https://timesheet-kiosk-xxxxx.vercel.app',
    'https://timesheet-setup-xxxxx.vercel.app'
  ]
};

// Commit and push
git add backend/server.js
git commit -m "Update CORS"
git push
```

## 🔑 Environment Variables Reference

### Backend (.env or Vercel)

```env
# Required
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=<64-char-hex-string>
NODE_ENV=production

# Optional
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourStrongPassword123
TOTP_WINDOW=2
TOTP_STEP=30
```

### Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 📍 Your URLs After Deployment

```
Backend:    https://timesheet-app-xxxxx.vercel.app
Admin:      https://timesheet-admin-xxxxx.vercel.app
Kiosk:      https://timesheet-kiosk-xxxxx.vercel.app
User Setup: https://timesheet-setup-xxxxx.vercel.app
```

## ✅ Testing Checklist

```
1. [ ] Test backend health: /api/health
2. [ ] Login to admin portal
3. [ ] Create a test user
4. [ ] Setup TOTP for test user
5. [ ] Mark attendance at kiosk
6. [ ] Generate timesheet report
7. [ ] Verify data in Supabase
```

## 🔧 Common Issues & Solutions

### "Connection to Supabase failed"
```
✓ Check SUPABASE_URL is correct
✓ Using SERVICE_KEY (not anon key)
✓ Database schema was executed
✓ Supabase project is active
```

### "CORS error"
```
✓ Frontend URL added to CORS in backend
✓ Backend redeployed after CORS update
✓ Using correct backend URL in frontend
```

### "Invalid token"
```
✓ JWT_SECRET is same across all instances
✓ Token not expired
✓ Correct format: "Bearer <token>"
```

### "Module not found"
```
✓ npm install was run
✓ package.json exists
✓ Correct working directory
```

## 📊 Monitoring

### Vercel Dashboard
- Deployments tab → View logs
- Analytics → Traffic stats
- Settings → Environment variables

### Supabase Dashboard  
- Table Editor → View data
- Database → Connection stats
- API → Usage metrics
- Logs → Request logs

## 🎯 Next Steps After Deployment

1. **Change admin password** immediately
2. **Add real users** via admin portal
3. **Setup TOTP** for each user
4. **Test full workflow** with test users
5. **Add custom domains** (optional)
6. **Setup monitoring** alerts
7. **Create backups** strategy

## 💡 Pro Tips

- Use strong, unique passwords
- Enable 2FA on Supabase and Vercel
- Monitor usage regularly
- Keep dependencies updated
- Test before deploying changes
- Use Git branches for features
- Document customizations

## 📞 Getting Help

**Documentation:**
- README.md - Full setup guide
- GITHUB_VERCEL_DEPLOYMENT.md - Detailed deployment
- SUPABASE_SETUP.md - Database setup
- API_DOCUMENTATION.md - API reference

**Support:**
- GitHub Issues - Report bugs
- Discussions - Ask questions
- Supabase Docs - Database help
- Vercel Docs - Hosting help

---

**Total Setup Time: ~30 minutes**

**Cost: $0/month** (free tier)

**Result: Production-ready timesheet system!** 🎉
