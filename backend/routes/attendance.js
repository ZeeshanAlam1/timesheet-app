const express = require('express');
const router = express.Router();
const speakeasy = require('speakeasy');
const userService = require('../services/userService');
const attendanceService = require('../services/attendanceService');
const locationService = require('../services/locationService');

// Check-in or Check-out endpoint (TOTP-based)
router.post('/mark', async (req, res) => {
  try {
    const { employeeId, totpToken, locationId } = req.body;

    // Validate input
    if (!employeeId || !totpToken || !locationId) {
      return res.status(400).json({ 
        message: 'Employee ID, TOTP token, and location are required' 
      });
    }

    // Find user by employee ID
    const user = await userService.findByEmployeeId(employeeId);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found or inactive' });
    }

    // Check if TOTP is enabled
    if (!user.totp_enabled || !user.totp_secret) {
      return res.status(400).json({ 
        message: 'TOTP not enabled for this employee. Please contact admin.' 
      });
    }

    // Verify TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.totp_secret,
      encoding: 'base32',
      token: totpToken,
      window: parseInt(process.env.TOTP_WINDOW) || 2
    });

    if (!verified) {
      return res.status(401).json({ message: 'Invalid TOTP token' });
    }

    // Verify location
    const location = await locationService.findByTerminalId(locationId);
    if (!location) {
      return res.status(404).json({ message: 'Invalid or inactive location' });
    }

    // Get today's date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find attendance record for today
    let attendance = await attendanceService.findByUserAndDate(user.id, today);

    const currentTime = new Date();

    if (!attendance) {
      // First entry of the day - Check In
      attendance = await attendanceService.createCheckIn(user.id, location.name);

      return res.json({
        message: `Check-in successful at ${location.name}`,
        type: 'check-in',
        time: currentTime,
        location: location.name,
        employee: {
          name: user.name,
          employeeId: user.employee_id
        }
      });
    } else if (attendance.check_in_time && !attendance.check_out_time) {
      // Already checked in - this is Check Out
      attendance = await attendanceService.updateCheckOut(attendance.id, location.name);

      return res.json({
        message: `Check-out successful at ${location.name}`,
        type: 'check-out',
        time: currentTime,
        location: location.name,
        totalHours: parseFloat(attendance.total_hours),
        employee: {
          name: user.name,
          employeeId: user.employee_id
        }
      });
    } else {
      // Already checked out for the day
      return res.status(400).json({ 
        message: 'You have already completed check-in and check-out for today',
        checkInTime: attendance.check_in_time,
        checkOutTime: attendance.check_out_time,
        totalHours: parseFloat(attendance.total_hours)
      });
    }
  } catch (error) {
    console.error('Attendance marking error:', error);
    res.status(500).json({ message: 'Server error during attendance marking' });
  }
});

// Get attendance status for today (for kiosk display)
router.get('/status/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;

    const user = await userService.findByEmployeeId(employeeId);
    if (!user) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await attendanceService.findByUserAndDate(user.id, today);

    if (!attendance) {
      return res.json({
        status: 'not-checked-in',
        message: 'Ready for check-in',
        employee: {
          name: user.name,
          employeeId: user.employee_id
        }
      });
    } else if (attendance.check_in_time && !attendance.check_out_time) {
      return res.json({
        status: 'checked-in',
        message: 'Ready for check-out',
        checkInTime: attendance.check_in_time,
        checkInLocation: attendance.check_in_location,
        employee: {
          name: user.name,
          employeeId: user.employee_id
        }
      });
    } else {
      return res.json({
        status: 'completed',
        message: 'Attendance completed for today',
        checkInTime: attendance.check_in_time,
        checkOutTime: attendance.check_out_time,
        totalHours: parseFloat(attendance.total_hours),
        employee: {
          name: user.name,
          employeeId: user.employee_id
        }
      });
    }
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
