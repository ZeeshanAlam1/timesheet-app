const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const userService = require('../services/userService');
const { auth } = require('../middleware/auth');

// Login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Find user
    const user = await userService.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(401).json({ message: 'Account is inactive. Contact administrator.' });
    }

    // Verify password
    const isMatch = await userService.verifyPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        employeeId: user.employee_id,
        role: user.role,
        totpEnabled: user.totp_enabled
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Generate TOTP secret and QR code for user
router.post('/totp/setup', auth, async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `Timesheet App (${user.employee_id})`,
      issuer: 'Timesheet System'
    });

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    // Save secret to user (but don't enable yet)
    await userService.updateUser(user.id, { totpSecret: secret.base32 });

    res.json({
      secret: secret.base32,
      qrCode: qrCodeUrl,
      message: 'Scan this QR code with your authenticator app'
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    res.status(500).json({ message: 'Server error during TOTP setup' });
  }
});

// Verify TOTP and enable it
router.post('/totp/verify', auth, async (req, res) => {
  try {
    const { token } = req.body;
    const user = await userService.findById(req.user.id);

    if (!user.totp_secret) {
      return res.status(400).json({ message: 'TOTP not setup. Please setup first.' });
    }

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: token,
      window: parseInt(process.env.TOTP_WINDOW) || 2
    });

    if (!verified) {
      return res.status(400).json({ message: 'Invalid token. Please try again.' });
    }

    // Enable TOTP
    await userService.updateUser(user.id, { totpEnabled: true });

    res.json({
      message: 'TOTP enabled successfully',
      totpEnabled: true
    });
  } catch (error) {
    console.error('TOTP verification error:', error);
    res.status(500).json({ message: 'Server error during TOTP verification' });
  }
});

// Get current user info
router.get('/me', auth, async (req, res) => {
  try {
    const user = await userService.findById(req.user.id);

    // Format response (convert snake_case to camelCase)
    const formattedUser = {
      _id: user.id,
      employeeId: user.employee_id,
      name: user.name,
      email: user.email,
      role: user.role,
      reportingManager: user.manager ? {
        id: user.manager.id,
        name: user.manager.name,
        email: user.manager.email,
        employeeId: user.manager.employee_id
      } : null,
      department: user.department,
      position: user.position,
      totpEnabled: user.totp_enabled,
      isActive: user.is_active,
      createdAt: user.created_at
    };

    res.json(formattedUser);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
