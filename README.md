# 🕐 Timesheet Management System

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ZeeshanAlam1/timesheet-app)
[![Supabase](https://img.shields.io/badge/Database-Supabase-green)](https://supabase.com)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A modern, secure attendance tracking system using **TOTP (Time-based One-Time Password)** authentication with **Supabase** as the database backend.

## ✨ Features

- 🔐 **TOTP Authentication** - Works with Microsoft Authenticator, Google Authenticator, Authy
- ⏰ **Check-In/Check-Out** - Simple kiosk interface for marking attendance  
- 📊 **Admin Dashboard** - Comprehensive user and timesheet management
- 📍 **Location Tracking** - Support for multiple office locations
- 👥 **Reporting Hierarchy** - Manager assignments and team views
- 📈 **Monthly Reports** - Detailed timesheets with statistics
- 💾 **Free Database** - Uses Supabase's free tier (500MB database)
- 🚀 **One-Click Deploy** - Deploy to Vercel in minutes

## 🎯 Tech Stack

- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Authentication**: JWT + TOTP (Speakeasy)
- **Frontend**: Vanilla JavaScript
- **Hosting**: Vercel
- **Cost**: $0/month (free tier)

## 📸 Screenshots

### Admin Dashboard
Modern admin portal for managing users and viewing timesheets.

### Kiosk Interface
Clean, easy-to-use interface for employees to mark attendance.

### TOTP Setup
Simple QR code-based setup with any authenticator app.

## 🚀 Quick Deploy

### 1. Fork This Repository

Click the **"Fork"** button at the top right of this page.

### 2. Setup Supabase

1. Create account at [supabase.com](https://supabase.com)
2. Create new project
3. Run the SQL schema from `database/schema.sql`
4. Get your credentials (Project URL, anon key, service_role key)

### 3. Deploy to Vercel

Click the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/ZeeshanAlam1/timesheet-app)

Add these environment variables in Vercel:

```env
SUPABASE_URL=your-supabase-project-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-role-key
JWT_SECRET=generate-with-crypto-randomBytes
NODE_ENV=production
ADMIN_EMAIL=admin@yourcompany.com
ADMIN_PASSWORD=YourStrongPassword123
```

### 4. Update Frontend URLs

After backend is deployed:

1. Edit `config.js` in each frontend folder
2. Update `API_BASE_URL` with your Vercel backend URL
3. Commit and push changes
4. Deploy each frontend to Vercel

**Detailed guide**: See [GITHUB_VERCEL_DEPLOYMENT.md](GITHUB_VERCEL_DEPLOYMENT.md)

## 💻 Local Development

### Prerequisites

- Node.js 16+
- Supabase account (free)

### Setup

```bash
# Clone repository
git clone https://github.com/ZeeshanAlam1/timesheet-app.git
cd timesheet-app

# Run setup script
./setup.sh

# Setup Supabase (follow SUPABASE_SETUP.md)

# Configure backend
cd backend
cp .env.example .env
# Edit .env with your Supabase credentials

# Install dependencies
npm install

# Start backend
npm start

# In separate terminals, serve frontends:
cd frontend-admin && python3 -m http.server 8080
cd frontend-kiosk && python3 -m http.server 3000
cd frontend-user-setup && python3 -m http.server 8081
```

Default admin login:
- **Email**: admin@timesheet.com
- **Password**: Admin@123

## 📚 Documentation

- **[README.md](README.md)** - Complete setup guide
- **[SUPABASE_SETUP.md](SUPABASE_SETUP.md)** - Step-by-step Supabase configuration
- **[GITHUB_VERCEL_DEPLOYMENT.md](GITHUB_VERCEL_DEPLOYMENT.md)** - Deploy to GitHub + Vercel
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - API reference
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide

## 🏗️ Project Structure

```
timesheet-app/
├── backend/              # Node.js/Express API
│   ├── config/          # Supabase configuration
│   ├── services/        # Business logic layer
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth middleware
│   └── server.js        # Main server file
├── frontend-admin/       # Admin dashboard
├── frontend-kiosk/       # Check-in/out kiosk
├── frontend-user-setup/  # TOTP setup page
└── database/            # SQL schema
```

## 🔒 Security

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication  
- ✅ TOTP two-factor verification
- ✅ Row Level Security in Supabase
- ✅ Environment variable configuration
- ✅ CORS protection
- ✅ Input validation

## 🌍 Use Cases

Perfect for:
- Small to medium businesses
- Startups
- Remote teams
- Co-working spaces
- Schools and universities
- Any organization needing simple attendance tracking

## 💰 Cost

### Free Tier (Small Teams)
- **Supabase**: Free (500MB, 50K users)
- **Vercel**: Free (100GB bandwidth)
- **Total**: $0/month

### Paid Tier (Growing Teams)
- **Supabase Pro**: $25/month (8GB, 100K users)
- **Vercel Pro**: $20/month (1TB bandwidth)
- **Total**: $45/month

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Amazing database platform
- [Vercel](https://vercel.com) - Excellent hosting platform
- [Speakeasy](https://github.com/speakeasyjs/speakeasy) - TOTP implementation
- All contributors and users

## 📧 Support

- **Documentation**: Check the docs folder
- **Issues**: Open an issue on GitHub
- **Questions**: Start a discussion

## 🗺️ Roadmap

- [ ] Email notifications
- [ ] SMS alerts  
- [ ] Mobile apps (React Native)
- [ ] Biometric integration
- [ ] Leave management
- [ ] Overtime calculations
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Advanced analytics

---

**Built with ❤️ using Node.js, Supabase, and modern web technologies**

⭐ Star this repo if you find it helpful!
