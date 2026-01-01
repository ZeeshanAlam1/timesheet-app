const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const { supabase, testConnection } = require('./config/supabase');
const authRoutes = require('./routes/auth');
const attendanceRoutes = require('./routes/attendance');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database connection test
testConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date(),
    service: 'Timesheet Backend API (Supabase)',
    database: 'Supabase PostgreSQL'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize default admin user
const initializeAdmin = async () => {
  try {
    // Check if any admin exists
    const { data: existingAdmins, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1);

    if (checkError) {
      console.error('Error checking for admin:', checkError);
      return;
    }

    if (existingAdmins && existingAdmins.length > 0) {
      console.log('✓ Admin user already exists');
      return;
    }

    // Create default admin
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(
      process.env.ADMIN_PASSWORD || 'Admin@123', 
      salt
    );

    const { data: admin, error: createError } = await supabase
      .from('users')
      .insert([{
        employee_id: 'ADMIN001',
        name: 'System Administrator',
        email: process.env.ADMIN_EMAIL || 'admin@timesheet.com',
        password_hash: passwordHash,
        role: 'admin',
        department: 'IT',
        position: 'System Administrator',
        is_active: true
      }])
      .select()
      .single();

    if (createError) {
      console.error('Error creating admin:', createError);
      return;
    }

    console.log('✓ Default admin user created');
    console.log('  Email:', process.env.ADMIN_EMAIL || 'admin@timesheet.com');
    console.log('  Password:', process.env.ADMIN_PASSWORD || 'Admin@123');
    console.log('  ⚠ Please change the default password after first login!');
  } catch (error) {
    console.error('Error initializing admin:', error);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   Timesheet Backend Server (Supabase)         ║
║   Port: ${PORT}                                   ║
║   Environment: ${process.env.NODE_ENV || 'development'}                  ║
║   Database: Supabase PostgreSQL               ║
║   Status: Running ✓                           ║
╚═══════════════════════════════════════════════╝
  `);

  // Initialize admin after server starts
  await initializeAdmin();
});

module.exports = app;
