# Deployment Guide (Supabase Edition)

This guide covers deploying the TOTP-based Timesheet System using Supabase as the database.

## Table of Contents
1. [Supabase Setup](#supabase-setup)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Security Hardening](#security-hardening)
5. [Monitoring](#monitoring)

---

## Supabase Setup

### 1. Production Supabase Project

**Create Production Project:**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. **Important**: Choose appropriate region for production
4. Use a **strong database password** (save in password manager)
5. Wait for project setup to complete

**Database Setup:**
1. Go to SQL Editor in Supabase dashboard
2. Create new query
3. Copy and paste entire `database/schema.sql` file
4. Execute the query
5. Verify all tables are created in Table Editor

### 2. Get Production Credentials

Navigate to: Project Settings → API

Copy these values:
```
Project URL: https://your-project.supabase.co
anon public key: eyJhbG...
service_role key: eyJhbG... (KEEP SECRET!)
```

### 3. Database Backups

Supabase Pro+ includes automatic backups.

For Free tier, setup manual backups:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link project
supabase link --project-ref your-project-ref

# Dump database (run weekly)
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" > backup_$(date +%Y%m%d).sql
```

---

## Backend Deployment

### Option 1: Railway (Recommended)

**Railway** offers free tier with automatic deployments.

1. **Install Railway CLI:**
```bash
npm install -g @railway/cli
```

2. **Login:**
```bash
railway login
```

3. **Initialize project:**
```bash
cd backend
railway init
```

4. **Set environment variables:**
```bash
railway variables set SUPABASE_URL=https://your-project.supabase.co
railway variables set SUPABASE_ANON_KEY=your-anon-key
railway variables set SUPABASE_SERVICE_KEY=your-service-key
railway variables set JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
railway variables set NODE_ENV=production
railway variables set ADMIN_EMAIL=admin@yourcompany.com
railway variables set ADMIN_PASSWORD=YourStrongPassword123!
```

5. **Deploy:**
```bash
railway up
```

6. **Get your backend URL:**
```bash
railway domain
```

### Option 2: Render

**Render** also offers free tier.

1. Go to [render.com](https://render.com)
2. Create new **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && npm start`
   - **Environment Variables**: Add all from `.env`
5. Deploy

### Option 3: Self-Hosted (VPS)

**For Ubuntu 20.04+ Server:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Clone/upload your code
cd /var/www
sudo mkdir timesheet-backend
cd timesheet-backend
# Upload your backend files

# Install dependencies
npm install --production

# Create .env
sudo nano .env
```

**.env for Production:**
```env
PORT=5000
NODE_ENV=production

SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

JWT_SECRET=your-generated-secret-here
TOTP_WINDOW=2
TOTP_STEP=30

ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourStrongPassword123!
```

**PM2 Setup:**
```bash
# Start with PM2
pm2 start server.js --name timesheet-backend

# Save PM2 config
pm2 save

# Auto-start on boot
pm2 startup
```

**Nginx Configuration:**

Create `/etc/nginx/sites-available/timesheet-api`:
```nginx
server {
    listen 80;
    server_name api.timesheet.yourcompany.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/timesheet-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.timesheet.yourcompany.com
```

---

## Frontend Deployment

### Option 1: Netlify (Recommended for Static Sites)

**Admin Portal:**

1. Update API URL in `frontend-admin/admin.js`:
```javascript
const API_BASE_URL = 'https://api.timesheet.yourcompany.com/api';
```

2. Deploy:
```bash
cd frontend-admin
netlify deploy --prod
```

**Repeat for Kiosk and User Setup**

### Option 2: Vercel

```bash
cd frontend-admin
vercel --prod
```

### Option 3: GitHub Pages

Create `frontend-admin/.github/workflows/deploy.yml`:
```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend-admin
```

### Option 4: Self-Hosted

```bash
# Copy files
sudo mkdir -p /var/www/timesheet-admin
sudo mkdir -p /var/www/timesheet-kiosk
sudo mkdir -p /var/www/timesheet-setup

# Upload files
# Update API URLs in .js files

# Nginx config for each
sudo nano /etc/nginx/sites-available/timesheet-admin
```

```nginx
server {
    listen 80;
    server_name admin.timesheet.yourcompany.com;
    root /var/www/timesheet-admin;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable and get SSL:
```bash
sudo ln -s /etc/nginx/sites-available/timesheet-admin /etc/nginx/sites-enabled/
sudo certbot --nginx -d admin.timesheet.yourcompany.com
```

---

## Security Hardening

### 1. Supabase Security

**Row Level Security (RLS):**
Already configured in schema.sql, but verify:
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

**Service Role Key:**
- Never expose in frontend
- Store securely in environment variables
- Rotate regularly

**Database Password:**
- Use password manager
- Minimum 20 characters
- Include special characters

### 2. Backend Security

**Environment Variables:**
```bash
# Never commit .env
echo ".env" >> .gitignore
```

**Rate Limiting:**
```bash
npm install express-rate-limit
```

Update `server.js`:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

app.use('/api/auth/login', authLimiter);
```

**Helmet for Security Headers:**
```bash
npm install helmet
```

```javascript
const helmet = require('helmet');
app.use(helmet());
```

**CORS Configuration:**
```javascript
const corsOptions = {
  origin: [
    'https://admin.timesheet.yourcompany.com',
    'https://kiosk.timesheet.yourcompany.com'
  ],
  credentials: true
};

app.use(cors(corsOptions));
```

### 3. Supabase Dashboard Security

1. Enable 2FA on Supabase account
2. Restrict database access by IP if possible
3. Monitor API logs regularly
4. Set up alerts for suspicious activity

---

## Monitoring

### 1. Supabase Dashboard

Monitor in real-time:
- **Database**: Connection stats, query performance
- **Logs**: API requests, errors
- **API**: Usage statistics
- **Reports**: Weekly email summaries

**Setup Alerts:**
1. Go to Project Settings → Alerts
2. Configure email notifications for:
   - Database space > 80%
   - High API error rate
   - Unusual activity

### 2. Backend Monitoring

**PM2 Monitoring (if self-hosted):**
```bash
pm2 monit
pm2 logs
```

**Application Logs:**
```bash
# View logs
pm2 logs timesheet-backend

# Save logs
pm2 logs timesheet-backend > logs.txt
```

### 3. Uptime Monitoring

Use external services:
- [UptimeRobot](https://uptimerobot.com) - Free
- [Pingdom](https://pingdom.com)
- [StatusCake](https://statuscake.com)

Setup monitors for:
- Backend health: `https://api.yourapp.com/api/health`
- Admin portal: `https://admin.yourapp.com`
- Kiosk: `https://kiosk.yourapp.com`

### 4. Error Tracking

**Sentry (Recommended):**
```bash
npm install @sentry/node
```

```javascript
const Sentry = require('@sentry/node');

Sentry.init({ 
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV 
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

---

## Backup Strategy

### Automated Supabase Backups

**With Supabase Pro ($25/month):**
- Automatic daily backups
- Point-in-time recovery
- 7-day retention

**Free Tier Manual Backups:**

Create weekly backup script:
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/supabase"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Export database
pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" \
  > "$BACKUP_DIR/backup_$DATE.sql"

# Compress
gzip "$BACKUP_DIR/backup_$DATE.sql"

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_$DATE.sql.gz"
```

Schedule with cron:
```bash
sudo crontab -e
# Add:
0 2 * * 0 /path/to/backup-script.sh
```

---

## Performance Optimization

### 1. Database Indexes

Already included in schema.sql:
```sql
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
```

### 2. Supabase Connection Pooling

Supabase automatically handles connection pooling.

For high traffic, consider:
- Upgrading to Pro tier
- Implementing caching (Redis)
- Using CDN for frontends

### 3. Frontend Optimization

- Enable gzip compression (Nginx)
- Use CDN (Cloudflare)
- Minify CSS/JS
- Lazy load images

---

## Cost Optimization

### Supabase Tiers

**Free Tier** (Perfect for small teams):
- 500 MB database
- 50K MAUs
- Unlimited API requests
- Cost: $0

**Pro Tier** ($25/month):
- 8 GB database
- 100K MAUs
- Daily backups
- Email support

**When to Upgrade:**
- Database > 400 MB
- Users > 40K MAUs
- Need daily backups
- Require faster support

### Backend Hosting Costs

**Railway Free Tier:**
- $5 credit/month
- Perfect for testing

**Render Free Tier:**
- 750 hours/month
- Spins down after inactivity

**Self-hosted VPS:**
- DigitalOcean: $4/month
- Linode: $5/month
- Vultr: $2.50/month

### Total Monthly Cost Estimate

**Small Team (< 50 users):**
- Supabase: Free
- Backend: Free (Railway/Render)
- Frontend: Free (Netlify/Vercel)
- **Total: $0/month**

**Medium Team (100-500 users):**
- Supabase: $25/month
- Backend: $7/month (Railway Hobby)
- Frontend: Free
- **Total: $32/month**

---

## Troubleshooting

### Supabase Connection Issues

```bash
# Test connection
curl -X GET 'https://your-project.supabase.co/rest/v1/' \
  -H "apikey: your-anon-key"
```

### Check Logs

```bash
# Backend logs (PM2)
pm2 logs timesheet-backend --lines 100

# Backend logs (Railway)
railway logs

# Backend logs (Render)
# Check dashboard
```

### Database Issues

```sql
-- Check active connections
SELECT * FROM pg_stat_activity;

-- Check table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## Post-Deployment Checklist

- [ ] Supabase project created and configured
- [ ] Database schema executed successfully
- [ ] Backend deployed and accessible
- [ ] Frontends deployed and accessible
- [ ] Environment variables set correctly
- [ ] Admin password changed
- [ ] SSL certificates installed
- [ ] CORS configured for production domains
- [ ] Rate limiting enabled
- [ ] Monitoring setup (uptime, errors)
- [ ] Backup strategy implemented
- [ ] Security headers configured
- [ ] Test TOTP setup flow
- [ ] Test attendance marking
- [ ] Test timesheet generation
- [ ] Documentation provided to admins

---

## Support & Maintenance

### Regular Tasks

**Daily:**
- Monitor Supabase dashboard
- Check error logs

**Weekly:**
- Review user feedback
- Check database size
- Backup database (if free tier)

**Monthly:**
- Review Supabase usage
- Update dependencies
- Security audit

**Quarterly:**
- Review and rotate secrets
- Performance optimization
- User access audit

---

**Congratulations! Your Timesheet System is now deployed on Supabase and ready for production use.**

For questions or issues, refer to:
- Supabase docs: https://supabase.com/docs
- This deployment guide
- API documentation
