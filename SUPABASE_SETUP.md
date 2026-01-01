# Supabase Setup Guide

Step-by-step visual guide to set up your Supabase database.

## Step 1: Create Supabase Account

1. Go to [supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with:
   - GitHub (recommended)
   - Google
   - Email

## Step 2: Create New Project

1. After login, click **"New Project"**
2. Fill in details:
   ```
   Organization: [Your organization name]
   Project Name: timesheet-app
   Database Password: [Generate a strong password - SAVE THIS!]
   Region: [Choose closest to your location]
   ```
3. Click **"Create new project"**
4. Wait 2-3 minutes for provisioning

## Step 3: Get Your Credentials

1. Once project is ready, click **Settings** (⚙️ icon in sidebar)
2. Click **API** in the left menu
3. You'll see:

   ```
   Project URL
   https://abcdefghijklmnop.supabase.co
   
   API Keys
   anon public: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (secret!)
   ```

4. **Copy these values** - you'll need them!

## Step 4: Setup Database Schema

1. In Supabase dashboard, click **SQL Editor** in sidebar
2. Click **New query** button (top right)
3. Open the file `database/schema.sql` from your project
4. **Select all** the SQL code (Cmd/Ctrl + A)
5. **Copy** (Cmd/Ctrl + C)
6. **Paste** into Supabase SQL Editor (Cmd/Ctrl + V)
7. Click **Run** button (or press Cmd/Ctrl + Enter)
8. Wait for execution (~5-10 seconds)
9. You should see: **"Success. No rows returned"**

## Step 5: Verify Tables Created

1. Click **Table Editor** in sidebar
2. You should see 3 tables:
   - `users`
   - `attendance`
   - `locations`
3. Click on each table to view structure

## Step 6: Check Sample Data

1. In Table Editor, click **locations** table
2. You should see 2 sample locations:
   - Main Office (TERMINAL-001)
   - Branch Office (TERMINAL-002)

## Step 7: Configure Backend

1. Open your project folder
2. Navigate to `backend/.env`
3. Update with your Supabase credentials:

   ```env
   SUPABASE_URL=https://abcdefghijklmnop.supabase.co
   SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

4. Generate JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

5. Add to `.env`:
   ```env
   JWT_SECRET=<generated-secret-here>
   ```

## Step 8: Start Backend

```bash
cd backend
npm install
npm start
```

You should see:
```
✓ Supabase connected successfully
✓ Default admin user created
  Email: admin@timesheet.com
  Password: Admin@123
```

## Step 9: Verify in Supabase

1. Go back to Supabase dashboard
2. Click **Table Editor** → **users**
3. You should see 1 user:
   - employee_id: ADMIN001
   - email: admin@timesheet.com
   - role: admin

## Step 10: Test Login

1. Open Admin Portal: http://localhost:8080
2. Login with:
   - Email: `admin@timesheet.com`
   - Password: `Admin@123`
3. **Success!** You're in!

---

## Common Issues

### "Connection refused"
- **Check**: Is SUPABASE_URL correct?
- **Check**: Did you use SERVICE_KEY (not anon key)?
- **Solution**: Verify credentials in Supabase dashboard

### "Schema already exists"
- **Cause**: SQL script was run multiple times
- **Solution**: It's fine! The script is idempotent (safe to run multiple times)

### "No admin user created"
- **Check**: Look in Supabase Table Editor → users
- **Cause**: User might already exist from previous run
- **Solution**: Try logging in with existing credentials

### "Cannot find module @supabase/supabase-js"
- **Solution**: Run `npm install` in backend folder

---

## Supabase Dashboard Overview

### 📊 Table Editor
- View and edit data
- Create/modify tables
- See real-time changes

### 💾 SQL Editor
- Write custom queries
- Run migrations
- Create functions

### 📈 Database
- Connection stats
- Performance metrics
- Query analytics

### 🔌 API
- REST API documentation
- GraphQL (if enabled)
- Realtime subscriptions

### 🔒 Authentication
- User management
- Social OAuth providers
- Email templates

### 📁 Storage
- File uploads
- Image transformations
- CDN

### ⚙️ Settings
- API keys
- Database connection
- Project settings
- Billing

---

## Next Steps

1. ✅ Supabase setup complete
2. ✅ Backend connected
3. ✅ Admin user created

**Now you can:**
- Add employees via Admin Portal
- Setup TOTP for users
- Start marking attendance
- Generate timesheets

---

## Security Reminders

⚠️ **NEVER share your:**
- Database password
- service_role key
- JWT secret

⚠️ **DO:**
- Use environment variables
- Enable 2FA on Supabase account
- Change admin password
- Keep credentials in password manager

---

## Support

**Supabase Issues:**
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [Supabase GitHub](https://github.com/supabase/supabase)

**Application Issues:**
- Check README.md
- Review API_DOCUMENTATION.md
- See DEPLOYMENT.md

---

**🎉 Congratulations! Your Supabase database is ready!**
